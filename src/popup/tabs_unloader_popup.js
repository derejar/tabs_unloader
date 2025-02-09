/**
 * @external Document
 * @description Represents any web page loaded in the browser and serves as an entry
 * point into the web page's content, which is the DOM tree
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document MDN}
 */

/**
 * @external HTMLElement
 * @description Represents any HTML element.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement MDN}
 */

/**
 * @event DOMContentLoaded
 * @description The DOMContentLoaded event fires when the HTML document has been
 * completely parsed, and all deferred scripts have downloaded and executed.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event MDN}
 * @memberof external:Document
 */

/**
 * @event submit
 * @description Fired when a "form" is submitted.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event MDN}
 * @memberof external:HTMLElement
 */

/**
 * @event change
 * @description Fired for "input", "select", and "textarea" elements when the user modifies the element's value
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event MDN}
 * @memberof external:HTMLElement
 */

/**
 * @event click
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event MDN}
 * @memberof external:HTMLElement
 */

/**
 * @typedef Event
 * @description The Event interface represents an event which takes place on an EventTarget
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event MDN}
 * @memberof external:HTMLElement
 */

/**
 * @typedef SubmitEvent
 * @description The SubmitEvent interface defines the object used to represent an HTML form's submit event.
 * The child of {@linkcode external:HTMLEvent.Event}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent MDN}
 * @memberof external:HTMLElement
 */

/**
 * @typedef PointerEvent
 * @description The PointerEvent interface represents the state of a DOM event produced by a pointer such as
 * the geometry of the contact point, the device type that generated the event, the amount of pressure that
 * was applied on the contact surface, etc
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent MDN}
 * @memberof external:HTMLElement
 */



/**
 * @module tabs_unloader_popup
 * @description An extension's popup intended to provide user with simple extension configuration menu
 */

/**
 * @description Updates tabs counter value on the page
 */
function updateActiveTabsCounter()
{
    getLoadedTabs().then(function(tabs){
        let tabsActive = document.querySelector(".tabs_active");
        tabsActive.value = tabs.length;
    });
}

/**
 * @description Collects all options' values from the storage and shows them on the page
 * @listens external:Document.event:DOMContentLoaded
 */
function restoreOptions()
{
    getAllVariablesValuesAsMap().then(function(variables){
        let elements = document.querySelectorAll(".option.input");
        elements[0].setAttribute("value", variables.get(LOADED_TABS_LIMIT));
        if(variables.get(INCLUDE_MARKED_TABS_IN_LIMIT))
            elements[1].setAttribute("checked", "");
        if(variables.get(ALLOW_PINNED_TABS_UNLOADING))
        {
            elements[2].setAttribute("checked", "");
            elements[3].setAttribute("disabled", "");
        }
        if(variables.get(INCLUDE_PINNED_TABS_IN_LIMIT))
            elements[3].setAttribute("checked", "");
    });
    updateActiveTabsCounter();
    setInterval(updateActiveTabsCounter, 1000);
}

/**
 * @description Collects all options' values from the page and saves them in the storage
 * @param {external:HTMLElement.SubmitEvent} event - [UNUSED]
 * @listens external:HTMLElement.event:submit
 */
function saveOptions(event)
{
    const elements = document.querySelectorAll(".option.input");
    saveVariableValue(LOADED_TABS_LIMIT, elements[0].value);
    saveVariableValue(INCLUDE_MARKED_TABS_IN_LIMIT, elements[1].checked);
    saveVariableValue(ALLOW_PINNED_TABS_UNLOADING, elements[2].checked);
    saveVariableValue(INCLUDE_PINNED_TABS_IN_LIMIT, elements[3].checked);
    updateActiveTabsCounter();
}

/**
 * @description Toggles availability of the option "Include pinned tabs in limit" based on option "Allow pinned tabs unloading"
 * @param {external:HTMLElement.Event} event
 * @listens external:HTMLElement.event:change
 */
function toggleIncludePinnedTabsOptionAvailability(event)
{
    if(event.currentTarget.checked)
        document.querySelector(".include_pinned_tabs").setAttribute("disabled", "");
    else
        document.querySelector(".include_pinned_tabs").removeAttribute("disabled");
}

/**
 * @description Opens new tab with the page shows the list of the marked tabs right after active tab
 * @see {@link module:marked_tabs_page}
 * @param {external:HTMLElement.PointerEvent} event - [UNUSED]
 * @listens external:HTMLElement.event:click
 */
function openMarkedTabsPage(event)
{
    getCurrentTab().then(function(currentTab){
        createNewTab({
            active: true,
            url: "/src/marked_tabs_page/marked_tabs_page.html",
            index: currentTab.index + 1
        });
    }).catch(onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector(".settings").addEventListener("submit", saveOptions);
document.querySelector(".allow_pinned_unloading").addEventListener("change", toggleIncludePinnedTabsOptionAvailability);
document.querySelector(".marked_tabs_list_button").addEventListener("click", openMarkedTabsPage);

