
/**
 * @external tabs
 * @description Interact with the browser's tab system
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs MDN}
 */

/**
 * @typedef Tab
 * @description Contains information about a tab
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab MDN}
 * @memberof external:tabs
 */

/**
 * @typedef {Object} ChangeInfo
 * @description Lists the changes to the state of the tab that is updated
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated#changeinfo MDN}
 * @memberof external:tabs
 */

/**
 * @event onUpdated
 * @description Fired when a tab is updated
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated MDN}
 * @memberof external:tabs
 */

/**
 * @event onCreated
 * @description Fired when a tab is created
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onCreated MDN}
 * @memberof external:tabs
 */

/**
 * @external storage
 * @description Enables extensions to store and retrieve data, and listen for changes to stored items
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage MDN}
 */

/**
 * @event onChange
 * @description Fired when an extension changes data in any way in storage
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged MDN}
 * @memberof external:storage
 */

/**
 * @typedef StorageChange
 * @description An object representing a change to a storage area
 * @property {any} oldValue - The old value of the item, if there was an old value
 * @property {any} newValue - The new value of the item, if there is a new value
 * @memberof external:storage
 */



/**
 * @module tabs_unloader
 * @description Main module of the extension. Manages tabs and unloads oldest tabs when it's necessary
 */

/**
 * @description Calls {@linkcode module:tabs_unloader~unloadTabsIfNecessary} when new tab loaded into RAM
 * @listens external:tabs.event:onUpdated
 * @param {number} tabId - [UNUSED] The ID of the updated tab
 * @param {external:tabs.ChangeInfo} changeInfo - Properties of the tab that changed
 * @param {external:tabs.Tab} tab - [UNUSED] The new state of the tab
 */
function onUpdatedHandleLoadedTab(tabId, changeInfo, tab)
{
    if(changeInfo.discarded)
        return;
    unloadTabsIfNecessary();
}


/**
 * @description By default new tab refers to about:newtab. That function creates listener for tab's URL state and calls the function
 * {@linkcode module:tabs_unloader~unloadTabsIfNecessary} after the URL is changed
 * @listens external:tabs.event:onCreated
 * @param {external:tabs.Tab} tab - Details of the tab that was created
 */
function handleCreatedTab(tab)
{
    const handleUrlUpdate = function(tabId, changeInfo, tab_){
        if(tab.id !== tabId || !changeInfo.url)
            return;
        unloadTabsIfNecessary();
        browser.tabs.onUpdated.removeListener(handleUrlUpdate);
    };
    browser.tabs.onUpdated.addListener(handleUrlUpdate, {properties: ["url"]});
}

/**
 * @description Calls {@linkcode module:tabs_unloader~unloadTabsIfNecessary} when extension's options are changed.
 * The condition exists to prevent multiple calls to function.
 * @listens external:storage:event.onChanged
 * @param {Object} changes - object. Object describing the change. The name of each property is the name of each key.
 * The value of each key is a {@linkcode external:storage.StorageChange} object describing the change to that item.
 * @param {string} areaName - [UNUSED] The name of the storage area ("sync", "local", or "managed") to which the changes were made.
 */
function onTabsLimitChanged(changes, areaName)
{
    const changedItems = Object.keys(changes);
    if(changedItems.includes(LOADED_TABS_LIMIT))
        unloadTabsIfNecessary();
}

/**
 * @typedef {Object} FilterTabResult
 * @property {number} tabsRemoved - Count of tabs removed from the array as forbidden to be unloaded
 * @property {external:tabs.Tab[]} filteredTabs - Array of tabs allowed to be unloaded from the memory
 */

/**
 * @description Removes tabs from the array that shouldn't be unloaded from the memory
 * @param {external:tabs.Tab[]} tabs - Array of tabs loaded into memory
 * @returns {Promise<FilterTabResult>} Result of tabs filtering
*/
function filterTabs(tabs)
{
    const resultPromise = new Promise(async function(resolve){
        let result = {
            tabsRemoved: 0,
            filteredTabs: new Array()
        };
        const values = await getAllVariablesValuesAsMap();
        for(const tab of tabs)
        {
            const isMarked = await isTabMarked(tab);
            const isTabIncludedInLimit = (
                ( isMarked &&  values.get(INCLUDE_MARKED_TABS_IN_LIMIT) ) ||
                ( tab.pinned  && !values.get(ALLOW_PINNED_TABS_UNLOADING) &&
                                  values.get(INCLUDE_PINNED_TABS_IN_LIMIT) )
            );
            if(isTabIncludedInLimit)
                ++result.tabsRemoved;
            else
                result.filteredTabs.push(tab);
        }
        resolve(result);
    });
    return resultPromise;
};

/**
 * @description Unloads oldest tabs from the memory to fit into tabs limit
 */
function unloadTabsIfNecessary()
{
    getLoadedTabs().then(async function(tabs){
        const values = await getAllVariablesValuesAsMap();
        let result = await filterTabs(tabs);
        let tabsLimit = values.get(LOADED_TABS_LIMIT) - result.tabsRemoved;
        result.filteredTabs.sort(function(a, b){ return b.lastAccessed - a.lastAccessed; });
        for(let i = tabsLimit; i < result.filteredTabs.length; ++i)
        {
            let isMarked = await isTabMarked(result.filteredTabs[i]);
            if(!isMarked)
                discardTab(result.filteredTabs[i]);
        }
    }).catch(onError);
}

browser.tabs.onUpdated.addListener(onUpdatedHandleLoadedTab, {properties: ["discarded"]});
browser.tabs.onCreated.addListener(handleCreatedTab);
browser.storage.local.onChanged.addListener(onTabsLimitChanged);
