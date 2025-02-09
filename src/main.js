/**
 * @external runtime
 * @description This module provides information about extension and the environment it's running in.
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime MDN}
 */


/**
 * @event onInstalled
 * @description Fired when the extension is first installed, when the extension is updated to a new version, and when the browser is updated to a new version
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onInstalled MDN}
 * @memberof external:runtime
 */

/**
 * @module main
 * @description Sets extension's basic configuration on the moment of installation
 */

/**
 * @description Sets default variables values on extension installation and unloads tabs if they count exceeds limit
 * @listens external:runtime.event:onInstalled
 * @param {Object} details - {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onInstalled#details MDN}
 */
function onExtensionInstallation(details)
{
    if(details.reason == "install")
    {
        createExcludeTabMenuOption();
        saveVariableValue(LOADED_TABS_LIMIT, 25);
        saveVariableValue(INCLUDE_MARKED_TABS_IN_LIMIT, true);
        saveVariableValue(ALLOW_PINNED_TABS_UNLOADING, false);
        saveVariableValue(INCLUDE_PINNED_TABS_IN_LIMIT, false);
        unloadTabsIfNecessary();
    }
}

browser.runtime.onInstalled.addListener(onExtensionInstallation);

