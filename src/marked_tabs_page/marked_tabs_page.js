/**
 * @module marked_tabs_page
 * @description A set of function for dynamically generation of HTML page intended to provide user with control of all marked tabs
 */

/**
 * @description Creates button based on provided button's properties
 * @param {Object} properties - Button's properties
 * @param {String[]} properties.classList - An array of classes assigns to button
 * @param {String} properties.textContent - A text shows on the button
 * @param {Function} properties.clickHandler - A function listens for {@codelink external:HTMLElement.event.click} event
 */
function createButton(properties)
{
    const button = document.createElement("button");
    button.classList.add(properties.classList);
    button.textContent = properties.textContent;
    button.addEventListener('click', properties.clickHandler);
    return button;
}

/**
 * @description Creates table header
 * @param {String[]} columnNames - Columns names
 */
function createTableHeader(columnNames)
{
    const resultPromise = new Promise(function(resolve){
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");
        for(const columnName of columnNames)
        {
            const th = document.createElement("th");
            th.appendChild(document.createTextNode(columnName));
            th.setAttribute("scope", "col");
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        resolve(thead);
    });
    return resultPromise;
}

/**
 * @description Creates a row in the table
 * @param {external:tabs.Tab} tab - A tab row creates for
 */
function createTableBodyRow(tab)
{
    const resultPromise = new Promise(function(resolve){
        const row = document.createElement("tr");
        const tabName = document.createElement("td");
        tabName.appendChild(document.createTextNode(tab.title));
        row.appendChild(tabName);

        const tabURL = document.createElement("td");
        tabURL.appendChild(document.createTextNode(tab.url));
        row.appendChild(tabURL);

        const unmarkButtonProperties = {
            classList: ["unmark_button"],
            textContent: "Unmark",
            clickHandler: function(){
                unmarkTab(tab);
                row.parentElement.removeChild(row);
            }
        };
        const unmarkTabCell = document.createElement("td");
        unmarkTabCell.appendChild(createButton(unmarkButtonProperties));
        row.appendChild(unmarkTabCell);

        const showButtonProperties = {
            classList: ["show_button"],
            textContent: "Show",
            clickHandler: function(){
                updateTab(tab, {active: true});
            }
        };
        showTabCell = document.createElement("td");
        showTabCell.appendChild(createButton(showButtonProperties));
        row.appendChild(showTabCell);
        resolve(row);
    });
    return resultPromise;
}

/**
 * @description Collects all marked tabs in current browser window and creates a body for the table based on them
 */
function createTableBody()
{
    const resultPromise = new Promise(function(resolve){
        getAllMarkedTabs().then(async function(markedTabs){
            const tableBody = document.createElement("tbody");
            for(let markedTab of markedTabs)
            {
                const row = await createTableBodyRow(markedTab);
                tableBody.appendChild(row);
            }
            resolve(tableBody);
        });
    });
    return resultPromise;
}

/**
 * @description Creates table consists of all marked tabs in current browser window with ability to unmark tabs and to view tabs
 * @listens external:Document.event:DOMContentLoaded
 */
async function createTable()
{
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.appendChild(document.createTextNode("List of tabs marked as not unloadable"));
    table.appendChild(caption);
    table.appendChild(await createTableHeader(["Tab's name", "URL", "Unmark", "Show tab"]));
    table.appendChild(await createTableBody());
    document.body.appendChild(table);
}


document.addEventListener("DOMContentLoaded", createTable);
