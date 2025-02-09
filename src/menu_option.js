/**
 * @external menu
 * @description Add items to the browser's menu system
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus MDN}
 */

/**
 * @event onClicked
 * @description Fired when a menu item is clicked
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onClicked MDN}
 * @memberof external:menu
 */

/**
 * @typedef {Object} OnClickData
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/OnClickData MDN}
 * @memberof external:menu
 */

/**
 * @event onHidden
 * @description Fired when the browser hides a menu
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onHidden MDN}
 * @memberof external:menu
 */

/**
 * @event onShown
 * @description Fired when the browser shows a menu
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onShown MDN}
 * @memberof external:menu
 */



/**
 * @module menu_option
 * @description Creates and manages an option in browser context menu
 */

/**@description ID for an option that will be created in browser's context menu */
const MARK_TAB_OPTION_ID = "exclude_tab_option_id";

/**
 * @description Creates new option in browser's context menu that shows on RMB click on tab in tabs bar
 * @returns {(number|string)} The ID of the newly created item.
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/create MDN}
 */
function createExcludeTabMenuOption()
{
    return browser.menus.create({
        id: MARK_TAB_OPTION_ID,
        checked: false,
        contexts: ["tab"],
        title: "Mark as not unloadable",
        type: "checkbox",
    });
}

/**
 * @description Toggles tab's state - marks (or unmarks) tab as not allowed to be unloaded from the memory
 * @listens external:menu.event:onClicked
 * @param {external:menu.OnClickData} info -Information about the item clicked and the context where the click happened
 * @param {external:tabs.Tab} tab - The details of the tab where the click took place
 */
function toggleTabMark(info, tab)
{
    if(info.menuItemId !== MARK_TAB_OPTION_ID)
        return;
    if(info.checked)
        markTab(tab);
    else
        unmarkTab(tab);
}

/**
 * @description Checks if tab is marked and sets the option in browser's context menu as checked if it is at the moment menu should be shown
 * @listens external:menu.event:onShown
 * @param {Object} info - {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onShown#info MDN}
 * @param {external:tabs.Tab} tab - The details of the tab where the click took place
 */
function showMarkTabOption(info, tab)
{
    if(!info.menuIds.includes(MARK_TAB_OPTION_ID) || !tab)
        return;
    isTabMarked(tab).then(function(isExcluded){
        browser.menus.update(MARK_TAB_OPTION_ID, {
            checked: isExcluded
        });
        browser.menus.refresh();
    });
}

/**
 * @description Unsets the option in browser's context menu at the moment menu is hidden
 * @listens external:menu.event:onHidden
 */
function hideMarkTabOption()
{
    browser.menus.update(MARK_TAB_OPTION_ID, {
        checked: false
    });
}

browser.menus.onClicked.addListener(toggleTabMark);
browser.menus.onShown.addListener(showMarkTabOption);
browser.menus.onHidden.addListener(hideMarkTabOption);
