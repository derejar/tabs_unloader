/**
 * @module utilities
 * @description A module consists of auxiliary function mainly as wrappers around raw browser's API
 */

/** Count of tabs allowed to be loaded into memory */
const LOADED_TABS_LIMIT                 = "loadedTabsLimit";
/** Should marked tabs be included into tabs limit or not */
const INCLUDE_MARKED_TABS_IN_LIMIT      = "includeExcludedTabsInLimit";
/** Is unloading pinned tabs from the memory allowed */
const ALLOW_PINNED_TABS_UNLOADING       = "allowPinnedTabsUnloading";
/** Should pinned tabs be included into tabs limit or not. Option avaliable only if pinned tabs forbidden to be unloaded */
const INCLUDE_PINNED_TABS_IN_LIMIT      = "includePinnedTabsInLimit";

/** The name for tab's mark state to be stored */
const MARKED_TAB_VALUE_NAME = "isMarked";

/**
 * @description Simple auxiliary function to log errors happened in promises
 * @param {any} error - The value that the promise was rejected with
 */
function onError(error)
{
    console.log(error);
}

/**
 * @description Collects all extension's options from the storage and represents them as {@linkcode Map}
 * @returns {Promise<Map<string, any>>} All options provided by extension represented as {@linkcode Map}
 */
function getAllVariablesValuesAsMap()
{
    const resultPromise = new Promise(function(resolve){
        browser.storage.local.get(null).then(function(result){
            resolve(new Map(Object.entries(result)));
        });
    });
    return resultPromise;
}

/**
 * @description Collects all tabs loaded into memory from current browser window
 * @returns {Promise<external:tabs.Tab[]>} An array of tabs loaded into memory contained in current browser window
 */
function getLoadedTabs()
{
    return browser.tabs.query({
        currentWindow: true,
        discarded:     false,
    });
}

/**
 * @description Collects all tabs from current browser window
 * @returns {Promise<external:tabs.Tab[]>} An array of all tabs from current browser window
 */
function getAllTabs()
{
    return browser.tabs.query({
        currentWindow: true,
    });
}

/**
 * @description Gets active tab in current browser window if exists
 * @returns {Promise<external:tabs.Tab>} Active tab in current browser window
 */
function getCurrentTab()
{
    const resultPromise = new Promise(async function(resolve, reject){
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true
        });
        if(tabs.length)
            resolve(tabs[0]);
        else
            reject("No active tab in current browser window!");
    });
    return resultPromise;
}

/**
 * @description Saves extension's option into local storage under the name with assigned value
 * @param {string} name - An extension's option name under that the value should be stored
 * @param {any} value - A value that should be assigned to provided extension's option name
 * @returns {Promise} A Promise that is fulfilled with no arguments if the operation succeeds
 */
function saveVariableValue(name, value)
{
    return browser.storage.local.set({[name]: value});
}

/**
 * @description Checks if provided tab is marked as forbidden to be unloaded
 * @param {external:tabs.Tab} - Tabs that should be checked
 * @returns {Promise<bool>} true if tab is marked as forbidden to be unloaded, false otherwise
 */
function isTabMarked(tab)
{
    const resultPromise = new Promise(function(resolve){
        browser.sessions.getTabValue(tab.id, MARKED_TAB_VALUE_NAME).then(function(value){
            resolve(value !== undefined);
        });
    });
    return resultPromise;
}

/**
 * @description Collects all tabs marked as forbidden to be unloaded in current browser window
 * @returns {Promise<external:tabs.Tab[]>} An array of tabs marked as forbidden to be unloaded in current browser window
 */
function getAllMarkedTabs()
{
    const resultPromise = new Promise(async function(resolve){
        let tabs = await getAllTabs();
        let markedTabs = new Array();
        for(let tab of tabs)
            if(await isTabMarked(tab))
                markedTabs.push(tab);
        resolve(markedTabs);
    });
    return resultPromise;
}

/**
 * @description Creates new tab based on provided properties
 * @param {Object} createProperties - {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create#createproperties MDN}
 * @return {Promise<external:tabs.Tab>} Created tab
 */
function createNewTab(createProperties)
{
    return browser.tabs.create(createProperties);
}

/**
 * @description Updates tab's properties based on provided properties
 * @param {external:tabs.Tab} tab - Tab to be updated
 * @param {Object} updateProperties - {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/update#updateproperties MDN}
 * @return {Promise<external:tabs.Tab>} Object containing details about the updated tab
 */
function updateTab(tab, updateProperties)
{
    return browser.tabs.update(tab.id, updateProperties);
}

/**
 * @description Marks provided tab as forbidden to be unloaded from memory by extension
 * @param {external:tabs.Tab} - Tab to be marked as forbidden to be unloaded from memory by extension
 * @returns {Promise} A Promise that will be resolved with no arguments if the call succeeded
 */
function markTab(tab)
{
    return browser.sessions.setTabValue(tab.id, MARKED_TAB_VALUE_NAME, "true");
}

/**
 * @description Unmarks provided tab as forbidden to be unloaded from memory by extension
 * @param {external:tabs.Tab} - Tab to be unmarked as forbidden to be unloaded from memory by extension
 * @returns {Promise} A Promise that will be resolved no arguments if the item was successfully removed
 */
function unmarkTab(tab)
{
    return browser.sessions.removeTabValue(tab.id, MARKED_TAB_VALUE_NAME);
}

/**
 * @description Unloads provided tab from the memory
 * @param {external:tabs.Tab} - Tab to be unloaded from the memory
 * @returns {Promise} A Promise that will be fulfilled with no arguments when tab have been unloaded successfully
 */
function discardTab(tab)
{
    return browser.tabs.discard(tab.id);
}
