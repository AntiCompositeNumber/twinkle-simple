import { WarnCore, obj_entries, warningLevel, warning, getPref } from './core';

export class Warn extends WarnCore {
	footerlinks = {
		'User talk page warnings': 'Template:User_talk_page_warnings#Warnings_and_notices',
		'Twinkle help': 'WP:TW/DOC#warn',
	};

	warningLevels: Record<
		string,
		{
			label: string;
			summaryPrefix?: string;
			selected: (pref: number) => boolean;
			visible?: () => boolean;
		}
	> = {
		level1: {
			label: '1: General note',
			selected: (pref) => pref === 1,
		},
		level2: {
			label: '2: Caution',
			selected: (pref) => pref === 2,
		},
		level3: {
			label: '3: Warning',
			selected: (pref) => pref === 3,
		},
		level4: {
			label: '4: Final warning',
			selected: (pref) => pref === 4,
		},
		level4im: {
			label: '4im: Only warning',
			selected: (pref) => pref === 5,
		},
		singlenotice: {
			label: 'Single-issue notices',
			selected: (pref) => pref === 6,
		},
		singlewarn: {
			label: 'Single-issue warnings',
			selected: (pref) => pref === 7,
		},
		block: {
			label: 'Blocking',
			selected: (pref) => pref === 8,
			visible: () => Morebits.userIsInGroup('sysop'),
		},
		custom: {
			label: 'Custom warnings',
			selected: (pref) => pref === 9,
			visible: () => !!getPref('customWarningList')?.length,
		},
	};

	processWarnings() {
		type MessageConfig = {
			label: string;
			summary: string;
			heading?: string;
			suppressArticleInSummary?: true;
		};
		type MessagesType = {
			levels: Record<string, Record<string, MessageConfig>>;
			singlenotice: Record<string, MessageConfig>;
			singlewarn: Record<string, MessageConfig>;
			block: Record<string, MessageConfig>;
		};

		const messages: MessagesType = {
			levels: {
				level1: {
					'uw-vandalism1': {
						label: 'Vandalism',
						summary: 'General note: Unhelpful changes',
					},
					'uw-test1': {
						label: 'Editing tests',
						summary: 'General note: Editing tests',
					},
					'uw-delete1': {
						label: 'Removal of content, blanking',
						summary: 'General note: Removal of content, blanking',
					},
					'uw-create1': {
						label: 'Creating inappropriate pages',
						summary: 'General note: Creating inappropriate pages',
					},
					'uw-advert1': {
						label: 'Using Wikipedia for advertising or promotion',
						summary: 'General note: Using Wikipedia for advertising or promotion',
					},
					'uw-copyright1': {
						label: 'Copyright violation',
						summary: 'General note: Violating copyright',
					},
					'uw-error1': {
						label: 'Deliberately adding wrong information',
						summary: 'General note: Adding wrong information',
					},
					'uw-biog1': {
						label: 'Adding unreferenced controversial information about living persons',
						summary:
							'General note: Adding unreferenced controversial information about living persons',
					},
					'uw-mos1': {
						label: 'Manual of style',
						summary: 'General note: Formatting, date, language, etc (Manual of style)',
					},
					'uw-move1': {
						label: 'Page moves against naming conventions or consensus',
						summary: 'General note: Page moves against naming conventions or consensus',
					},
					'uw-npov1': {
						label: 'Not adhering to neutral point of view',
						summary: 'General note: Not adhering to neutral point of view',
					},
					'uw-tpv1': {
						label: "Changing others' talk page comments",
						summary: "General note: Changing others' talk page comments",
					},
					'uw-qd': {
						label: 'Removing quick-deletion templates',
						summary: 'General note: Removing quick-deletion templates',
					},
					'uw-npa1': {
						label: 'Personal attack directed at another editor',
						summary: 'General note: Personal attack directed at another editor',
					},
					'uw-agf1': {
						label: 'Not assuming good faith',
						summary: 'General note: Not assuming good faith',
					},
					'uw-unsourced1': {
						label: 'Addition of unsourced or improperly cited material',
						summary: 'General note: Addition of unsourced or improperly cited material',
					},
				},
				level2: {
					'uw-vandalism2': {
						label: 'Vandalism',
						summary: 'Caution: Vandalism',
					},
					'uw-test2': {
						label: 'Editing tests',
						summary: 'Caution: Editing tests',
					},
					'uw-delete2': {
						label: 'Removal of content, blanking',
						summary: 'Caution: Removal of content, blanking',
					},
					'uw-create2': {
						label: 'Creating inappropriate pages',
						summary: 'Caution: Creating inappropriate pages',
					},
					'uw-advert2': {
						label: 'Using Wikipedia for advertising or promotion',
						summary: 'Caution: Using Wikipedia for advertising or promotion',
					},
					'uw-copyright2': {
						label: 'Copyright violation',
						summary: 'Caution: Violating copyright',
					},
					'uw-npov2': {
						label: 'Not adhering to neutral point of view',
						summary: 'Caution: Not adhering to neutral point of view',
					},
					'uw-error2': {
						label: 'Deliberately adding wrong information',
						summary: 'Caution: Adding wrong information',
					},
					'uw-biog2': {
						label: 'Adding unreferenced controversial information about living persons',
						summary: 'Caution: Adding unreferenced controversial information about living persons',
					},
					'uw-mos2': {
						label: 'Manual of style',
						summary: 'Caution: Formatting, date, language, etc (Manual of style)',
					},
					'uw-move2': {
						label: 'Page moves against naming conventions or consensus',
						summary: 'Caution: Page moves against naming conventions or consensus',
					},
					'uw-tpv2': {
						label: "Changing others' talk page comments",
						summary: "Caution: Changing others' talk page comments",
					},
					'uw-npa2': {
						label: 'Personal attack directed at another editor',
						summary: 'Caution: Personal attack directed at another editor',
					},
					'uw-agf2': {
						label: 'Not assuming good faith',
						summary: 'Caution: Not assuming good faith',
					},
					'uw-unsourced2': {
						label: 'Addition of unsourced or improperly cited material',
						summary: 'Caution: Addition of unsourced or improperly cited material',
					},
				},
				level3: {
					'uw-vandalism3': {
						label: 'Vandalism',
						summary: 'Warning: Vandalism',
					},
					'uw-test3': {
						label: 'Editing tests',
						summary: 'Warning: Editing tests',
					},
					'uw-delete3': {
						label: 'Removal of content, blanking',
						summary: 'Warning: Removal of content, blanking',
					},
					'uw-create3': {
						label: 'Creating inappropriate pages',
						summary: 'Warning: Creating inappropriate pages',
					},
					'uw-advert3': {
						label: 'Using Wikipedia for advertising or promotion',
						summary: 'Warning: Using Wikipedia for advertising or promotion',
					},
					'uw-npov3': {
						label: 'Not adhering to neutral point of view',
						summary: 'Warning: Not adhering to neutral point of view',
					},
					'uw-error3': {
						label: 'Deliberately adding wrong information',
						summary: 'Warning: Adding wrong information',
					},
					'uw-biog3': {
						label:
							'Adding unreferenced controversial or defamatory information about living persons',
						summary: 'Warning: Adding unreferenced controversial information about living persons',
					},
					'uw-mos3': {
						label: 'Manual of style',
						summary: 'Warning: Formatting, date, language, etc (Manual of style)',
					},
					'uw-move3': {
						label: 'Page moves against naming conventions or consensus',
						summary: 'Warning: Page moves against naming conventions or consensus',
					},
					'uw-tpv3': {
						label: "Changing others' talk page comments",
						summary: "Warning: Changing others' talk page comments",
					},
					'uw-npa3': {
						label: 'Personal attack directed at another editor',
						summary: 'Warning: Personal attack directed at another editor',
					},
					'uw-agf3': {
						label: 'Not assuming good faith',
						summary: 'Warning: Not assuming good faith',
					},
				},
				level4: {
					'uw-generic4': {
						label: 'Generic warning (for template series missing level 4)',
						summary: 'Final warning notice',
					},
					'uw-vandalism4': {
						label: 'Vandalism',
						summary: 'Final warning: Vandalism',
					},
					'uw-test4': {
						label: 'Editing tests',
						summary: 'Final warning: Editing tests',
					},
					'uw-delete4': {
						label: 'Removal of content, blanking',
						summary: 'Final warning: Removal of content, blanking',
					},
					'uw-create4': {
						label: 'Creating inappropriate pages',
						summary: 'Final warning: Creating inappropriate pages',
					},
					'uw-advert4': {
						label: 'Using Wikipedia for advertising or promotion',
						summary: 'Final warning: Using Wikipedia for advertising or promotion',
					},
					'uw-npov4': {
						label: 'Not adhering to neutral point of view',
						summary: 'Final warning: Not adhering to neutral point of view',
					},
					'uw-error4': {
						label: 'Deliberately adding wrong information',
						summary: 'Final Warning: Adding wrong information',
					},
					'uw-biog4': {
						label: 'Adding unreferenced defamatory information about living persons',
						summary:
							'Final warning: Adding unreferenced controversial information about living persons',
					},
					'uw-mos4': {
						label: 'Manual of style',
						summary: 'Final warning: Formatting, date, language, etc (Manual of style)',
					},
					'uw-move4': {
						label: 'Page moves against naming conventions or consensus',
						summary: 'Final warning: Page moves against naming conventions or consensus',
					},
					'uw-npa4': {
						label: 'Personal attack directed at another editor',
						summary: 'Final warning: Personal attack directed at another editor',
					},
				},
				level4im: {
					'uw-vandalism4im': {
						label: 'Vandalism',
						summary: 'Only warning: Vandalism',
					},
					'uw-delete4im': {
						label: 'Removal of content, blanking',
						summary: 'Only warning: Removal of content, blanking',
					},
					'uw-create4im': {
						label: 'Creating inappropriate pages',
						summary: 'Only warning: Creating inappropriate pages',
					},
					'uw-biog4im': {
						label: 'Adding unreferenced defamatory information about living persons',
						summary:
							'Only warning: Adding unreferenced controversial information about living persons',
					},
					'uw-move4im': {
						label: 'Page moves against naming conventions or consensus',
						summary: 'Only warning: Page moves against naming conventions or consensus',
					},
					'uw-npa4im': {
						label: 'Personal attack directed at another editor',
						summary: 'Only warning: Personal attack directed at another editor',
					},
				},
			},
			singlenotice: {
				'uw-badcat': {
					label: 'Adding incorrect categories',
					summary: 'Notice: Adding incorrect categories',
				},
				'uw-bite': {
					label: '"Biting" newcomers',
					summary: 'Notice: "Biting" newcomers',
				},
				'uw-coi': {
					label: 'Possible conflict of interest',
					summary: 'Notice: Possible conflict of interest',
				},
				'uw-encopypaste': {
					label: 'Direct copying of article from English Wikipedia',
					summary: 'Notice: Direct copying of article from English Wikipedia',
				},
				'uw-encopyright': {
					label: 'Not giving attribution for content from another Wikipedia',
					summary: 'Notice: Reusing content from English Wikipedia without attribution',
				},
				'uw-emptycat': {
					label: 'Category created does not contain enough pages',
					summary: 'Notice: Creating empty categories',
				},
				'uw-joke': {
					label: 'Using improper humor',
					summary: 'Notice: Using improper humor',
				},
				'uw-lang': {
					label: 'Changing between types of English without a good reason',
					summary: 'Notice: Unnecessarily changing between British and American English',
				},
				'uw-newarticle': {
					label: 'Tips on creating new articles',
					summary: 'Notice: How to make your articles better',
				},
				'uw-notenglish': {
					label: 'Changes not in English',
					summary: 'Notice: Please edit in English',
				},
				'uw-otherweb': {
					label: 'Use "Other websites", not "External links"',
					summary: 'Notice: Use "Other websites", not "External links"',
				},
				'uw-sandbox': {
					label: 'Removing the sandbox header',
					summary: 'Notice: Do not remove sandbox header',
				},
				'uw-selfrevert': {
					label: 'Undoing recent test',
					summary: 'Notice: Undoing recent test',
				},
				'uw-simple': {
					label: 'Not making changes in simple English',
					summary: 'Notice: Not making changes in simple English',
				},
				'uw-spellcheck': {
					label: 'Review spelling, etc.',
					summary: 'Notice: Review spelling, etc.',
				},
				'uw-subst': {
					label: 'Remember to subst: templates',
					summary: 'Notice: Remember to subst: templates',
				},
				'uw-tilde': {
					label: 'Not signing posts',
					summary: 'Notice: Not signing posts',
				},
				'uw-upload': {
					label: 'Image uploads not allowed in Simple English Wikipedia',
					summary: 'Notice: Image uploads not allowed in Simple English Wikipedia',
				},
				'uw-warn': {
					label: 'Use user warn templates',
					summary: 'Notice: Use user warn templates',
				},
			},
			singlewarn: {
				'uw-3rr': {
					label: 'Edit warring',
					summary: 'Warning: Involved in edit war',
				},
				'uw-attack': {
					label: 'Creating attack pages',
					summary: 'Warning: Creating attack pages',
				},
				'uw-cyberbully': {
					label: 'Cyberbullying',
					summary: 'Warning: Cyberbullying',
				},
				'uw-disruption': {
					label: 'Project disruption',
					summary: 'Warning: Project disruption',
				},
				'uw-longterm': {
					label: 'Long term abuse',
					summary: 'Warning: Long term abuse',
				},
				'uw-qd': {
					label: 'Removing quick deletion templates from articles',
					summary: 'Warning: Removing quick deletion templates from articles',
				},
				'uw-spam': {
					label: 'Adding spam links',
					summary: 'Warning: Adding spam links',
				},
				'uw-userpage': {
					label: 'Userpage or subpage is against policy',
					summary: 'Warning: Userpage or subpage is against policy',
				},
			},
			block: {
				'uw-block1': {
					label: 'Block level 1',
					summary: 'You have been temporarily blocked',
					//reasonParam: true,
				},
				'uw-block2': {
					label: 'Block level 2',
					summary: 'You have been blocked',
					//reasonParam: true,
				},
				'uw-block3': {
					label: 'Block level 3',
					summary: 'You have been indefinitely blocked',
					//reasonParam: true,
				},
				'UsernameBlocked': {
					label: 'Username block',
					summary:
						'You have been blocked for violation of the [[Wikipedia:Username|username policy]]',
					//reasonParam: true,
				},
				'UsernameHardBlocked': {
					label: 'Username hard block',
					summary:
						'You have been blocked for a blatant violation of the [[Wikipedia:Username|username policy]]',
					//reasonParam: true,
				},
				'Blocked proxy': {
					label: 'Blocked proxy',
					summary: 'You have been blocked because this IP is an [[open proxy]]',
				},
				'Uw-spamblock': {
					label: 'Spam block',
					summary: 'You have been blocked for [[Wikipedia:Spam|advertising or promotion]]',
				},
				'Cyberbully block': {
					label: 'Cyberbully block',
					summary: 'You have been blocked for [[Wikipedia:Cyberbullying|cyberbullying]]',
				},
				'Talkpage-revoked': {
					label: 'Talk-page access removed',
					summary: 'Your ability to change this [[Wikipedia:Talk page|talk page]] has been removed',
				},
			},
		};

		let groupObject: warningLevel['list'] = {
			'Common warnings': [],
			'Behavior in articles': [],
			'Promotions and spam': [],
			'Behavior towards other editors': [],
			'Removal of deletion tags': [],
			'Other': [],
		};

		let groups: Record<string, warningLevel> = {
			level1: { label: '1: General note', list: $.extend(true, {}, groupObject) },
			level2: { label: '2: Caution', list: $.extend(true, {}, groupObject) },
			level3: { label: '3: Warning', list: $.extend(true, {}, groupObject) },
			level4: { label: '4: Final warning', list: $.extend(true, {}, groupObject) },
			level4im: { label: '4im: Only warning', list: $.extend(true, {}, groupObject) },
		};

		groups.singlenotice = {
			label: 'Singe-issue notices',
			list: obj_entries(messages.singlenotice).map(([name, data]) => {
				return $.extend(
					{
						template: name,
					},
					data
				);
			}),
		};
		groups.singlewarn = {
			label: 'Single-issue warnings',
			list: obj_entries(messages.singlewarn).map(([name, data]) => {
				return $.extend(
					{
						template: name,
					},
					data
				);
			}),
		};
		groups.block = {
			label: 'Blocking',
			list: obj_entries(messages.block).map(([name, data]) => {
				return $.extend(
					{
						template: name,
					},
					data
				);
			}),
		};

		for (let [templateName, templateLevels] of obj_entries(messages.levels)) {
			for (let [level, templateData] of obj_entries(templateLevels)) {
				groups[level].list = $.extend(
					{
						template: templateName + level.slice('level'.length),
					},
					templateData
				);
			}
		}

		this.warnings = groups;
	}

	getWarningWikitext(templateName, article, reason, isCustom) {
		var text = '{{subst:' + templateName;

		// add linked article for user warnings
		if (article) {
			// c&pmove has the source as the first parameter
			if (templateName === 'uw-c&pmove') {
				text += '|to=' + article;
			} else {
				text += '|1=' + article;
			}
		}
		if (reason && !isCustom) {
			// add extra message
			if (
				templateName === 'uw-csd' ||
				templateName === 'uw-probation' ||
				templateName === 'uw-userspacenoindex' ||
				templateName === 'uw-userpage'
			) {
				text += "|3=''" + reason + "''";
			} else {
				text += "|2=''" + reason + "''";
			}
		}
		text += '}}';

		if (reason && isCustom) {
			// we assume that custom warnings lack a {{{2}}} parameter
			text += " ''" + reason + "''";
		}

		return text + ' ~~~~';
	}

	validateInputs(params) {
		if (params.sub_group === 'uw-username' && !params.article) {
			return 'You must supply a reason for the {{uw-username}} template.';
		}
	}

	getHistoryRegex(): RegExp {
		return /<!--\s?Template:([uU]w-.*?)\s?-->.*?(\d{1,2}:\d{1,2}, \d{1,2} \w+ \d{4} \(UTC\))/g;
	}

	getInputConfig(template: string) {
		let input = super.getInputConfig(template);

		// Tags that don't take a linked article, but something else (often a username).
		// The value of each tag is the label next to the input field
		switch (template) {
			case 'uw-agf-sock':
				input.label = 'Optional username of other account (without User:) ';
				input.className = 'userInput';
				break;
			case 'uw-bite':
				input.label = "Username of 'bitten' user (without User:) ";
				input.className = 'userInput';
				break;
			case 'uw-socksuspect':
				input.label = 'Username of sock master, if known (without User:) ';
				input.className = 'userInput';
				break;
			case 'uw-username':
				input.label = 'Username violates policy because... ';
				break;
			case 'uw-aiv':
				input.label = 'Optional username that was reported (without User:) ';
				input.className = 'userInput';
				break;
			// no default
		}

		return input;
	}

	customiseSummaryWithInput(summary: string, input: string, messageData: warning) {
		// these templates require a username
		if (['uw-agf-sock', 'uw-socksuspect', 'uw-aiv'].includes(messageData.template)) {
			return summary + ' of [[:User:' + input + ']]';
		}
		return super.customiseSummaryWithInput(summary, input, messageData);
	}

	perWarningNotices(template): JQuery {
		switch (template) {
			case 'uw-username':
				return $(
					"<div style='color: red;' id='tw-warn-red-notice'>{{uw-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
						"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
						'{{uw-username}} should only be used in edge cases in order to engage in discussion with the user.</div>'
				);
			case 'uw-coi-username':
				return $(
					"<div style='color: red;' id='tw-warn-red-notice'>{{uw-coi-username}} should <b>not</b> be used for <b>blatant</b> username policy violations. " +
						"Blatant violations should be reported directly to UAA (via Twinkle's ARV tab). " +
						'{{uw-coi-username}} should only be used in edge cases in order to engage in discussion with the user.</div>'
				);
			default:
				return $();
		}
	}
}
