import { Twinkle, init, SiteConfig } from './core';
import messages from './messages.json';
import mwMessageList from './mw-messages';

// import modules
import { Xfd } from './xfd';
import { Fluff } from './fluff';
import { Speedy } from './speedy';

// no customisation; import directly from core
import { DiffCore as Diff } from './core';

// register some globals for debugging, as per twinkle v2
import './globals';

// Check if account is experienced enough to use Twinkle
if (!Morebits.userIsInGroup('autoconfirmed') && !Morebits.userIsInGroup('confirmed')) {
	throw new Error('Twinkle: forbidden!');
}

Twinkle.userAgent = `Twinkle (${mw.config.get('wgWikiID')})`;

Twinkle.summaryAd = ' ([[WP:TW|TW]])';

Twinkle.changeTags = '';

Twinkle.messageOverrides = messages;

Twinkle.extraMwMessages = mwMessageList;

// List of module classes enabled
Twinkle.registeredModules = [Xfd, Fluff, Diff, Speedy];

/**
 * Adjust the following configurations if necessary
 * Check the documentation for each property here:
 * https://twinkle.toolforge.org/core-docs/modules/siteconfig.html
 */

SiteConfig.permalinkSpecialPageName = 'Special:PermanentLink';

SiteConfig.botUsernameRegex = /bot\b/i;

SiteConfig.flaggedRevsNamespaces = [];

SiteConfig.redirectTagAliases = ['#REDIRECT'];

// Go!
init();
