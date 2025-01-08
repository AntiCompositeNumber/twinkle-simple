import { SpeedyCore, criterion, criteriaSubgroup, Page, Twinkle, getPref } from './core';
import { obj_entries, makeArray } from './utils';

let moreDetails: criteriaSubgroup = {
	name: 'more_details',
	parameter: '2',
	type: 'input',
	label: 'You can enter more details here.',
	size: 60,
};

export class Speedy extends SpeedyCore {
	portletName = 'QD'
	portletTooltip = Morebits.userIsSysop
		? 'Delete page according to WP:QD'
		: 'Request quick deletion according to WP:QD';

	windowTitle = 'Choose criteria for quick deletion';
	footerlinks = {
		'Quick deletion policy': 'Wikipedia:Deletion policy#Quick deletion',
		'Twinkle help': 'WP:TW/DOC#speedy',
	};

	addMenu() {
		this.portletName = 'QD';
		super.addMenu();
	}

	preprocessParamInputs() {
		let params = this.params; // shortcut reference
		if (params.banned_user) {
			params.banned_user = params.banned_user.replace(/^\s*User:/i, '');
		}
		if (params.redundantimage_filename) {
			params.redundantimage_filename = new mw.Title(params.redundantimage_filename, 6).toText();
		}
		if (params.commons_filename && params.commons_filename !== Morebits.pageNameNorm) {
			params.commons_filename = new mw.Title(params.commons_filename, 6).toText();
		}
	}

	validateInputs(): string | void {
		let input = this.params;
		let csd = new Set(input.csd); // optimise look-ups
		if (
			csd.has('db') &&
			(!input.reason_1 || !input.reason_1.replace(/^\s*/, '').replace(/\s*$/, ''))
		) {
			return 'You must specify a reason. Aborted by user.';
		}
	}

	criteriaLists: Array<{
		label: string;
		visible: (self: Speedy) => boolean;
		list: Array<criterion>;
	}> = [
		{
			label: 'Custom rationale',
			visible: (self) => !self.mode.isMultiple,
			list: [
				{
					label:
						'Custom rationale' +
						(Morebits.userIsInGroup('sysop')
							? ' (custom deletion reason)'
							: ' using {' + '{QD|reason}}'),
					value: 'reason',
					code: 'db',
					tooltip: 'You can enter an custom reason.',
					subgroup: [
						{
							name: 'reason_1',
							parameter: '1',
							utparam: '2',
							type: 'input',
							label: 'This page can be quickly deleted because:',
							size: 60,
						},
					],
					hideWhenMultiple: true,
				},
			],
		},
		{
			label: 'Talk pages',
			// show on talk pages, but not user talk pages
			visible: (self) => self.namespace % 2 === 1 && self.namespace !== 3,
			list: [
				{
					label: 'G8: Talk pages with no page belonging to it',
					value: 'talk',
					code: 'g8',
					subgroup: [moreDetails],
					tooltip:
						'This does not include any page that is useful to the project - for example user talk pages, talk page archives, and talk pages for files that exist on Wikimedia Commons.',
				},
			],
		},
		{
			label: 'Files',
			visible: (self) => !self.isRedirect && [6, 7].includes(self.namespace),
			list: [
				{
					label: 'F1: Not allowed',
					value: 'prohibitedimage',
					code: 'f1',
					subgroup: [moreDetails],
					tooltip:
						'Most media uploads are not allowed on Simple English Wikipedia. They should be uploaded to Wikimedia Commons instead. There are a few exceptions to this rule. Firstly, all spoken articles should be uploaded here, as they are for local use. Secondly, there are some logos that Commons does not accept, but are needed here, for example Image:Wiki.png, which is used as the Wikipedia logo.',
				},
			],
		},
		{
			label: 'Articles',
			visible: (self) => !self.isRedirect && [0, 1].includes(self.namespace),
			list: [
				{
					label: 'A1: Little or no meaning',
					value: 'nocontext',
					code: 'a1',
					subgroup: [moreDetails],
					tooltip:
						'Is very short and providing little or no meaning (e.g., "He is a funny man that has created Factory and the Hacienda. And, by the way, his wife is great."). Having a small amount of content is not a reason to delete if it has useful information.',
				},
				{
					label: 'A2: No content',
					value: 'nocontent',
					code: 'a2',
					subgroup: [moreDetails],
					tooltip:
						'Has no content. This includes any article consisting only of links (including hyperlinks, category tags and "see also" sections), a rephrasing of the title, and/or attempts to correspond with the person or group named by its title. This does not include disambiguation pages.',
				},
				{
					label: 'A3: Article that exists on another Wikimedia project',
					value: 'transwiki',
					code: 'a3',
					subgroup: [moreDetails],
					tooltip:
						'Has been copied and pasted from another Wikipedia: Any article or section from an article that has been copied and pasted with little or no change.',
				},
				{
					label:
						'A4: People, groups, companies, products, services or websites that do not claim to be notable.',
					value: 'notability',
					code: 'a4',
					subgroup: [moreDetails],
					tooltip:
						'An article about a real person, group of people, band, club, company, product, service or or web content that does not say why it is important. If not everyone agrees that the subject is not notable or there has been a previous RfD, the article may not be quickly deleted, and should be discussed at RfD instead.',
				},
				{
					label: 'A5: Not written in English',
					value: 'foreign',
					code: 'a5',
					subgroup: [moreDetails],
					tooltip:
						'Any article that is not written in English. An article that is written in any other languages but English.',
				},
				{
					label: 'A6: Obvious hoax',
					value: 'hoax',
					code: 'a6',
					subgroup: [moreDetails],
					tooltip: 'Is an obvious hoax. An article that is surely fake or impossible.',
				},
			],
		},
		{
			label: 'Categories',
			visible: (self) => !self.isRedirect && [14, 15].includes(self.namespace),
			list: [
				{
					label: 'C1: Empty categories',
					value: 'catempty',
					code: 'c1',
					subgroup: [moreDetails],
					tooltip:
						"(with no articles or subcategories for at least four days) whose only content includes links to parent categories. However, this can not be used on categories still being discussed on WP:RfD, or disambiguation categories. If the category wasn't newly made, it is possible that it used to have articles, and more inspection is needed.",
				},
				{
					label: 'C2: Quick renaming',
					value: 'catqr',
					code: 'c2',
					subgroup: [moreDetails],
					tooltip: 'Empty categories that have already been renamed.',
				},
				{
					label: 'C3: Template categories',
					value: 'catfd',
					code: 'c3',
					subgroup: [moreDetails],
					tooltip:
						'If a category contains articles from only one template (such as Category:Cleanup needed from {{cleanup}}) and the template is deleted after being discussed, the category can also be deleted without being discussed.',
				},
			],
		},
		{
			label: 'User pages',
			visible: (self) => [2, 3].includes(self.namespace),
			list: [
				{
					label: 'U1: User request',
					value: 'userreq',
					code: 'u1',
					subgroup: [moreDetails],
					tooltip: 'User pages can be deleted if its user wants to, but there are some exceptions.',
				},
				{
					label: 'U2: Nonexistent user',
					value: 'nouser',
					code: 'u2',
					subgroup: [moreDetails],
					tooltip:
						'User pages of users that do not exist. Administrators should check Special:Contributions and Special:DeletedContributions.',
				},
			],
		},
		{
			label: 'Templates',
			visible: (self) => !self.isRedirect && [10, 11].includes(self.namespace),
			list: [
				{
					label:
						'T2: They are deprecated or replaced by a newer template and are completely unused and not linked to.',
					value: 't2',
					code: 't2',
					subgroup: [moreDetails],
					tooltip:
						'For any template that should not be deleted quickly, use Wikipedia:Requests for deletion.',
				},
			],
		},
		{
			label: 'General criteria',
			visible: () => true,
			list: [
				{
					label: 'G1: Nonsense',
					value: 'nonsense',
					code: 'g1',
					subgroup: [moreDetails],
					tooltip:
						'All of the text is nonsense. Nonsense includes content that does not make sense or is not meaningful. However, this does not include bad writing, bad words, vandalism, things that are fake or impossible, or parts which are not in English.',
				},
				{
					label: 'G2: Test page',
					value: 'test',
					code: 'g2',
					subgroup: [moreDetails],
					tooltip: 'It is a test page, such as "Can I really create a page here?".',
				},
				{
					label: 'G3: Complete vandalism',
					value: 'vandalism',
					code: 'g3',
					subgroup: [moreDetails],
					tooltip: 'The content is completely vandalism.',
				},
				{
					label: 'G4: Recreation of deleted material already deleted at RfD',
					value: 'repost',
					code: 'g4',
					subgroup: [moreDetails],
					tooltip:
						'Creation of content that is already deleted. It includes an identical or similar copy, with any title, of a page that was deleted, after being discussed in Requests for deletion, unless it was undeleted due to another discussion or was recreated in the user space. Before deleting again, the Administrator should be sure that the content is similar and not just a new article on the same subject. This rule cannot be used if the content had already been quickly deleted before.',
				},
				{
					label: 'G6: History merge',
					value: 'histmerge',
					code: 'g6',
					subgroup: [moreDetails],
					tooltip:
						'Pages created by banned or blocked users in violation of their ban or block, and which have no substantial edits by others',
					hideWhenMultiple: true,
				},
				{
					label: 'G6: Move',
					value: 'move',
					code: 'g6',
					subgroup: [moreDetails],
					tooltip: 'Making way for an uncontroversial move like reversing a redirect',
					hideWhenMultiple: true,
				},
				{
					label: 'G6: RfD',
					value: 'afd',
					code: 'g6',
					subgroup: [moreDetails],
					tooltip: 'An admin has closed a RfD as "delete".',
					hideWhenMultiple: true,
				},
				{
					label: 'G6: Housekeeping',
					value: 'g6',
					code: 'g6',
					subgroup: [moreDetails],
					tooltip: 'Other non-controversial "housekeeping" tasks',
				},
				{
					label: 'G7: Author requests deletion, or author blanked',
					value: 'author',
					code: 'g7',
					subgroup: [moreDetails],
					tooltip:
						'Any page whose original author wants deletion, can be quickly deleted, but only if most of the page was written by that author and was created as a mistake. If the author blanks the page, this can mean that he or she wants it deleted.',
				},
				{
					label: 'G8: Pages dependent on a non-existent or deleted page',
					value: 'talk',
					code: 'g8',
					subgroup: [moreDetails],
					tooltip:
						"... can be deleted, unless they contain discussion on deletion that can't be found anywhere else. Subpages of a talk page can only be deleted under this rule if their top-level page does not exist. This also applies to broken redirects. However, this cannot be used on user talk pages or talk pages of images on Commons.",
				},
				{
					label: 'G8: Subpages with no parent page',
					value: 'subpage',
					code: 'g8',
					subgroup: [moreDetails],
					tooltip:
						'This excludes any page that is useful to the project, and in particular: deletion discussions that are not logged elsewhere, user and user talk pages, talk page archives, plausible redirects that can be changed to valid targets, and file pages or talk pages for files that exist on Wikimedia Commons.',
					hideWhenMultiple: true,
					hideInNamespaces: [0, 6, 8], // hide in main, file, and mediawiki-spaces
				},
				{
					label: 'G10: Attack page',
					value: 'attack',
					redactContents: true,
					code: 'g10',
					subgroup: [moreDetails],
					tooltip:
						'Pages that were only created to insult a person or thing (such as "John Q. Doe is dumb"). This includes articles on a living person that is insult and without sources, where there is no NPOV version in the edit history to revert to.',
				},
				{
					label: 'G11: Obvious advertising',
					value: 'spam',
					code: 'g11',
					subgroup: [moreDetails],
					tooltip:
						"Pages which were created only to say good things about a company, item, group or service and which would need to be written again so that they can sound like an encyclopedia. However, simply having a company, item, group or service as its subject does not mean that an article can be deleted because of this rule: an article that is obvious advertising should have content that shouldn't be in an encyclopedia. If a page has already gone through RfD or QD and was not deleted, it should not be quickly deleted using this rule.",
				},
				{
					label: 'G12: Obviously breaking copyright law',
					value: 'copyvio',
					code: 'g12',
					tooltip:
						"Obviously breaking copyright law like a page which is 1) Copied from another website which does not have a license that can be used with Wikipedia; 2) Containing no content in the page history that is worth being saved. 3) Made by one person instead of being created on wiki and then copied by another website such as one of the many Wikipedia mirror websites. 4) Added by someone who doesn't tell if he got permission to do so or not, or if his claim has a large chance of not being true;",
					subgroup: [
						{
							name: 'copyvio_url',
							parameter: 'url',
							utparam: 'url',
							type: 'input',
							label: 'URL (if available): ',
							tooltip: 'Please enter the URL if available, including the "http://"',
							size: 60,
						},
					],
				},
			],
		},
		{
			label: 'Redirects',
			visible: (self) => self.isRedirect,
			list: [
				{
					label: 'R1: Redirects to a non-existent page.',
					value: 'redirnone',
					code: 'r1',
					subgroup: [moreDetails],
					tooltip: 'Redirects to a non-existent page.',
				},
				{
					label:
						'R2: Redirects from mainspace to any other namespace except the Category:, Template:, Wikipedia:, Help: and Portal: namespaces',
					value: 'rediruser',
					code: 'r2',
					subgroup: [moreDetails],
					tooltip:
						'(this does not include the Wikipedia shortcut pseudo-namespaces). If this was the result of a page move, consider waiting a day or two before deleting the redirect',
				},
				{
					label: 'R3: Redirects as a result of an implausible typo that were recently created',
					value: 'redirtypo',
					code: 'r3',
					subgroup: [moreDetails],
					tooltip:
						'However, redirects from common misspellings or misnomers are generally useful, as are redirects in other languages',
				},
			],
		},
	];

	checkPage() {
		// XXX: This entire method had to be copied from speedyCore to change a few strings
		let pageobj = new Page(mw.config.get('wgPageName'), 'Tagging page');
		pageobj.setChangeTags(Twinkle.changeTags);
		return pageobj.load().then(() => {
			let statelem = pageobj.getStatusElement();

			if (!pageobj.exists()) {
				statelem.error("It seems that the page doesn't exist; perhaps it has already been deleted");
				return $.Deferred().reject();
			}

			let text = pageobj.getPageText();

			statelem.status('Checking for tags on the page...');

			// check for existing speedy deletion tags
			let tag = /(?:\{\{\s*(qd|qd-multiple|db|delete|db-.*?)(?:\s*\||\s*\}\}))/.exec( text );
			// This won't make use of the db-multiple template but it probably should
			if (
				tag &&
				!confirm(
					'The page already has the QD-related template {{' +
						tag[1] +
						'}} on it.  Do you want to add another QD template?'
				)
			) {
				return $.Deferred().reject();
			}

			// check for existing XFD tags
			let xfd = /(?:\{\{([rsaiftcm]fd|md1|proposed deletion)[^{}]*?\}\})/i.exec(text);
			if (
				xfd &&
				!confirm(
					'The deletion-related template {{' +
						xfd[1] +
						'}} was found on the page. Do you still want to add a QD template?'
				)
			) {
				return $.Deferred().reject();
			}

			return pageobj;
		});
	}

	getTaggingCode() {
		let params = this.params;
		let code = '';

		if (params.normalizeds.length > 1) {
			code = '{{QD-multiple';
			params.normalizeds.forEach((norm, idx) => {
				code += '|' + norm.toUpperCase();
				obj_entries(params.templateParams[idx]).forEach(([param, value]) => {
					// skip numeric parameters - {{db-multiple}} doesn't understand them
					if (!parseInt(param, 10)) {
						code += '|' + param + '=' + value;
					}
				});
			});
			code += '}}';
		} else {
			code = '{{qd|' + params.normalizeds[0]
			obj_entries(params.templateParams[0]).forEach(([param, value]) => {
				code += '|' + param + '=' + value;
			});
			code += "|editor=" + mw.config.get("wgUserName") + "|date=~~~~~";
			code += '}}';
		}

		return code;
	}

	getUserNotificationText() {
		let params = this.params;
		let notifytext = '';
		// special cases: "db" and "db-multiple"
		if (params.normalizeds.length > 1) {
			notifytext = "\n{{subst:QD-notice-multiple|page=" + Morebits.pageNameNorm;
			params.normalizeds.forEach(function (norm, idx) {
				notifytext += '|' + (idx + 2) + '=' + norm.toUpperCase();
			});
		} else {
			notifytext = "\n{{subst:QD-notice|page=" + Morebits.pageNameNorm + "|cat=" + params.normalizeds[0];
		}

		this.getUserTalkParameters();
		obj_entries(params.utparams).forEach(([key, value]) => {
			notifytext += '|' + key + '=' + value;
		});
		notifytext += (params.welcomeuser ? '' : '|nowelcome=yes') + '}} ~~~~';
		return notifytext;
	}

	tagPage(pageobj: Page) {
		// XXX: This entire method had to be copied from speedyCore to change a few strings
		let params = this.params;
		let text = pageobj.getPageText();
		let code = this.getTaggingCode();

		if (params.requestsalt) {
			code = '{{salt}}\n' + code;
		}

		// Post on talk if it is not possible to tag
		if (
			!pageobj.canEdit() ||
			['wikitext', 'Scribunto', 'javascript', 'css', 'sanitized-css'].indexOf(pageobj.getContentModel()) === -1
		) {
			// Attempt to place on talk page
			let talkName = new mw.Title(pageobj.getPageName()).getTalkPage().toText();

			if (talkName === pageobj.getPageName()) {
				pageobj.getStatusElement().error('Page protected and nowhere to add an edit request, aborting');
				return $.Deferred().reject();
			}

			pageobj.getStatusElement().warn('Unable to edit page, placing tag on talk page');

			let talk_page = new Page(talkName, 'Automatically placing tag on talk page');
			talk_page.setNewSectionTitle(pageobj.getPageName() + ' nominated for QD, request deletion');
			talk_page.setNewSectionText(
				code + '\n\nI was unable to tag ' + pageobj.getPageName() + ' so please delete it. ~~~~'
			);
			talk_page.setCreateOption('recreate');
			talk_page.setFollowRedirect(true);
			talk_page.setWatchlist(params.watch);
			talk_page.setChangeTags(Twinkle.changeTags);
			return talk_page.newSection();
		}

		// Remove tags that become superfluous with this action
		if (mw.config.get('wgNamespaceNumber') === 6) {
			// remove "move to Commons" tag - deletion-tagged files cannot be moved to Commons
			text = text.replace(
				/\{\{(mtc|(copy |move )?to ?commons|move to wikimedia commons|copy to wikimedia commons)[^}]*\}\}/gi,
				''
			);
		}

		// Wrap SD template in noinclude tags if we are in template space.
		// Won't work with userboxes in userspace, or any other transcluded page outside template space
		if (mw.config.get('wgNamespaceNumber') === 10) {
			// Template:
			code = '<noinclude>' + code + '</noinclude>';
		}

		if (mw.config.get('wgPageContentModel') === 'Scribunto') {
			// Scribunto isn't parsed like wikitext, so CSD templates on modules need special handling to work
			let equals = '';
			while (code.indexOf(']' + equals + ']') !== -1) {
				equals += '=';
			}
			code = "require('Module:Module wikitext')._addText([" + equals + '[' + code + ']' + equals + ']);';
		} else if (['javascript', 'css', 'sanitized-css'].indexOf(mw.config.get('wgPageContentModel')) !== -1) {
			// Likewise for JS/CSS pages
			code = '/* ' + code + ' */';
		}

		// Generate edit summary for edit
		let editsummary;
		if (params.normalizeds[0] === 'db') {
			editsummary = 'Requesting [[WP:CSD|speedy deletion]] with rationale "' + params.templateParams[0]['1'] + '".';
		} else if (params.normalizeds[0] === "histmerge") {
			editsummary = "Requesting history merge with [[" + params.templateParams[0]["1"] + "]] ([[WP:QD#G6|QD G6]]).";
		} else {
			let criteriaText = params.normalizeds
				.map((norm) => {
					return '[[WP:QD' + norm.toUpperCase() + '|QD ' + norm.toUpperCase() + ']]';
				})
				.join(', ');
			editsummary = 'Requesting quick deletion (' + criteriaText + ').';
		}

		// Blank attack pages
		if (params.redactContents) {
			text = code;
		} else {
			text = this.insertTagText(code, text);
		}

		pageobj.setPageText(text);
		pageobj.setEditSummary(editsummary);
		pageobj.setWatchlist(params.watch);
		return pageobj.save();
	}

	addToLog() {
		let params = this.params;
		let shouldLog =
			getPref('logSpeedyNominations') &&
			params.normalizeds.some(function (norm) {
				return getPref('noLogOnSpeedyNomination').indexOf(norm) === -1;
			});
		if (!shouldLog) {
			return $.Deferred().resolve();
		}

		let usl = new Morebits.userspaceLogger(getPref('speedyLogPageName'));
		usl.initialText =
			"This is a log of all [[WP:QD|quick deletion]] nominations made by this user using [[WP:TW|Twinkle]]'s QD module.\n\n" +
			'If you no longer wish to keep this log, you can turn it off using the [[Wikipedia:Twinkle/Preferences|preferences panel]], and ' +
			'nominate this page for speedy deletion under [[WP:QD#U1|CSD U1]].' +
			(Morebits.userIsSysop ? '\n\nThis log does not track outright quick deletions made using Twinkle.' : '');

		let extraInfo = '';

		// If a logged file is deleted but exists on commons, the wikilink will be blue, so provide a link to the log
		let fileLogLink =
			mw.config.get('wgNamespaceNumber') === 6
				? ' ([{{fullurl:Special:Log|page=' + mw.util.wikiUrlencode(mw.config.get('wgPageName')) + '}} log])'
				: '';

		let editsummary = 'Logging quick deletion nomination of [[' + Morebits.pageNameNorm + "]].";

		let appendText = '# [[:' + Morebits.pageNameNorm;

		if (!params.redactContents) {
			// no article name in log for attack page taggings
			appendText += ']]' + fileLogLink + ': ';
			editsummary += ' of [[:' + Morebits.pageNameNorm + ']].';
		} else {
			appendText += '|This]] attack page' + fileLogLink + ': ';
			editsummary += ' of an attack page.';
		}

		if (params.normalizeds.length > 1) {
			let criteriaText = params.normalizeds
				.map((norm) => {
					return '[[WP:QD#' + norm.toUpperCase() + '|' + norm.toUpperCase() + ']]';
				})
				.join(', ');
			appendText += 'multiple criteria (' + criteriaText + ')';
		} else if (params.normalizeds[0] === 'db') {
			appendText += '{{tl|QD}}';
		} else {
			appendText +=
				'[[WP:QD#' +
				params.normalizeds[0].toUpperCase() +
				'|QD ' +
				params.normalizeds[0].toUpperCase() +
				']] ({{tl|db-' +
				params.csd[0] +
				'}})';
		}

		// Treat custom rationale individually
		if (params.normalizeds[0] === 'db') {
			extraInfo += ` {Custom rationale: ${params.templateParams[0]['1']}}`;
		} else {
			params.csd.forEach((crit: string) => {
				let critObject = this.flatObject[crit];
				let critCode = critObject.code.toUpperCase();
				let subgroups = makeArray(critObject.subgroup);
				subgroups.forEach((subgroup) => {
					let value = params[subgroup.name];
					if (!value || !subgroup.parameter) {
						// no value was entered, or it's a hidden field or something
						return;
					}
					if (subgroup.log) {
						value = Morebits.string.safeReplace(subgroup.log, /\$1/g, value);
					} else if (subgroup.log === null) {
						// logging is disabled
						return;
					}
					extraInfo += ` {${critCode} ${subgroup.parameter}: ${value}}`;
				});
			});
		}

		if (params.requestsalt) {
			appendText += '; requested creation protection ([[WP:SALT|salting]])';
		}
		if (extraInfo) {
			appendText += '; additional information:' + extraInfo;
		}
		if (params.initialContrib) {
			appendText += '; notified {{user|1=' + params.initialContrib + '}}';
		}
		appendText += ' ~~~~~\n';

		usl.changeTags = Twinkle.changeTags;
		return usl.log(appendText, editsummary);
	}
}
