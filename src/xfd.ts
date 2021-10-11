import { getPref, Page, Api, PreferenceGroup, Preference, Config } from './core';
import { addNs, makeTemplate, obj_entries, stripNs } from './utils';
import { XfdCore, XfdMode } from './core';

class Rfd extends XfdMode {
	static venueCode = 'RfD';
	static venueLabel = 'Nominate for deletion (RfD)';

	static isDefaultChoice() {
		return true;
	}

	getMenuTooltip(): string {
		return 'Nominate for deletion';
	}

	getFieldsetLabel() {
		return 'Requests for deletion';
	}

	discussionPagePrefix = 'Wikipedia:Requests for deletion/Requests/' + new Date().getUTCFullYear();

	generateFieldset(): Morebits.quickForm.element {
		this.fieldset = super.generateFieldset();
		this.fieldset.append({
			type: 'checkbox',
			list: [
				{
					label: 'Wrap deletion tag with &lt;noinclude&gt;',
					value: 'noinclude',
					name: 'noinclude',
					tooltip:
						"Will wrap the deletion tag in &lt;noinclude&gt; tags, so that it won't transclude. This option is not normally required.",
				},
			],
		});
		this.appendReasonArea();
		return this.fieldset;
	}

	preprocessParams() {
		this.params.userspaceOwner = mw.config.get('wgRelevantUserName');
	}

	evaluate() {
		super.evaluate();
		this.tm.add(this.determineDiscussionPage, []);
		this.tm.add(this.tagPage, [this.determineDiscussionPage]);
		this.tm.add(this.addToList, [this.determineDiscussionPage]);
		this.tm.add(this.createDiscussionPage, [this.determineDiscussionPage], this.printReasonText);
		this.tm.add(this.fetchCreatorInfo, []);
		this.tm.add(this.notifyCreator, [this.fetchCreatorInfo]);
		this.tm.execute().then(() => this.redirectToDiscussion());
	}

	checkPage() {
		var pageobj = new Page(mw.config.get('wgPageName'), 'Adding deletion tag to article');
		pageobj.setFollowRedirect(true); // should never be needed, but if the article is moved, we would want to follow the redirect
		return pageobj.load().then(() => {
			var text = pageobj.getPageText();
			var statelem = pageobj.getStatusElement();

			this.params.articleLoadTime = pageobj.getLoadTime();

			if (!pageobj.exists()) {
				statelem.error("It seems that the page doesn't exist; perhaps it has already been deleted");
				return $.Deferred().reject(); // Cancel future operations
			}

			// Check for existing RfD tag, for the benefit of new page patrollers
			var textNoAfd = text.replace(
				/\{\{\s*(Requests for deletion\/dated|RfDM)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/g,
				''
			);
			if (text !== textNoAfd) {
				if (
					confirm(
						'An RfD tag was found on this article. Maybe someone beat you to it.  \nClick OK to replace the current RfD tag (not recommended), or Cancel to abandon your nomination.'
					)
				) {
					pageobj.setPageText(textNoAfd);
				} else {
					statelem.error('Article already tagged with RfD tag, and you chose to abort');
					window.location.reload();
					return $.Deferred().reject(); // Cancel future operations
				}
			}
			return pageobj;
		});
	}

	tagPage(pageobj) {
		let params = this.params;

		params.tagText =
			(params.noinclude ? '<noinclude>{{' : '{{') +
			('RfD|1=' + params.reason) +
			(params.noinclude ? '</noinclude>}}\n' : '}}\n');

		if (pageobj.canEdit()) {
			var text = pageobj.getPageText();

			// Then, test if there are speedy deletion-related templates on the article.
			var textNoSd = text.replace(
				/\{\{\s*(db(-\w*)?|qd|delete|(?:hang|hold)[- ]?on)\s*(\|(?:\{\{[^{}]*\}\}|[^{}])*)?\}\}\s*/gi,
				''
			);
			if (
				text !== textNoSd &&
				confirm('A quick deletion tag was found on this page. Should it be removed?')
			) {
				text = textNoSd;
			}

			// Insert tag after short description or any hatnotes
			var wikipage = new Morebits.wikitext.page(text);
			text = params.tagText + text;

			pageobj.setPageText(text);
			pageobj.setEditSummary('Nominated for deletion; see [[:' + params.discussionpage + ']].');
			pageobj.setWatchlist(getPref('xfdWatchPage'));
			pageobj.setCreateOption('nocreate');
			return pageobj.save();
		} else {
			return this.autoEditRequest(pageobj);
		}
	}

	createDiscussionPage() {
		let params = this.params;
		let pageobj = new Page(params.discussionpage, 'Creating article deletion discussion page');
		return pageobj.load().then(() => {
			pageobj.setPageText(this.getDiscussionWikitext());
			pageobj.setEditSummary(
				'Creating deletion discussion page for [[:' + Morebits.pageNameNorm + ']].'
			);
			pageobj.setWatchlist(getPref('xfdWatchDiscussion'));
			pageobj.setCreateOption('createonly');
			return pageobj.save();
		});
	}

	getDiscussionWikitext(): string {
		return makeTemplate('subst:RfD/Preload/Template', {
			deletereason: Morebits.string.formatReasonText(this.params.reason, false),
		});
	}

	addToList() {
		let params = this.params;
		let pageobj = new Page('Wikipedia:Requests for deletion', "Adding discussion to today's list");
		pageobj.setPageSection(2);
		pageobj.setFollowRedirect(true);
		return pageobj.load().then(() => {
			var text = pageobj.getPageText();
			var statelem = pageobj.getStatusElement();

			var date = new Morebits.date(pageobj.getLoadTime());
			var date_header_regex = /(<!-- Add new entries to the TOP of the following list -->\n+)/;
			var added_data = '{{' + params.discussionpage + params.numbering + '}}';

			if (date_header_regex.test(text)) {
				// we have a section already
				statelem.info("Found today's section, proceeding to add new entry");
				text = text.replace(date_header_regex, '$1\n' + added_data);
			} else {
				statelem.error('failed to find target spot for the discussion');
				return;
			}

			pageobj.setPageText(text);
			pageobj.setEditSummary('Adding [[:' + params.discussionpage + ']].');
			pageobj.setWatchlist(getPref('xfdWatchList'));
			pageobj.setCreateOption('recreate');
			return pageobj.save();
		});
	}

	getNotifyText(): string {
		let params = this.params;
		let text =
			'{{subst:RFDNote|1=' +
			Morebits.pageNameNorm +
			'|2=' +
			Morebits.pageNameNorm +
			(params.numbering !== '' ? '|order=&#32;' + params.numbering : '') +
			'}} ~~~~';
		return text;
	}

	getNotifyEditSummary(): string {
		return (
			'Notification: listing at [[WP:RfD|requests for deletion]] of [[' +
			Morebits.pageNameNorm +
			']].'
		);
	}
}

XfdCore.modeList = [Rfd];

export class Xfd extends XfdCore {
	portletName = 'RfD';
	windowTitle = "Nominate for deletion (RfD)";

	addMenu() {
		this.portletName = 'RfD';
		super.addMenu()
	}
	footerlinks = {
		'Deletion policy': 'Wikipedia:Deletion policy',
		'About deletion discussions': 'WP:RFD',
		'Twinkle help': 'WP:TW/DOC#xfd',
	};

	static userPreferences() {
		const prefs = super.userPreferences() as PreferenceGroup;
		prefs.title = 'Requests for deletion';
		// Hide XfD log prefs, not implemented
		prefs.preferences = prefs.preferences.filter((pref) => {
			pref.name !== 'logXfdNominations' && pref.name !== 'xfdLogPageName';
		});
		return prefs;
	}
}
