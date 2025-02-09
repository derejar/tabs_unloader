# Tabs Unloader
## Description
A firefox extension designed to improve user's internet surfing experience by producing additional options to browser memory management. User can set up limit of tabs allowed to be loaded into memory simultaneously. When tabs limit is exceeded then extension automatically unloads oldest tabs from the memory until tabs count fits into limit. For the user's convenience, extension provides ability to mark important tabs through browser context menu (opened by right mouse button click on tab in tabs bar) that gurantees they won't be unloaded by extension.  \

Additionally extension provides special page where user can review all tabs they marked and unmark them if necessary.  \

User can control how the extension unloads tabs by using popup hidden under extension's miniature in browser's toolbar. Popup can be opened by left click on the icon.

These options are available:
* **Tabs limit** - Every time count of tabs loaded into memory will exceed this number, oldest tabs will be unloaded to satisfy the limit.
* **Include marked tabs in limit** - If this option is checked, then marked tabs are included into limit user sets in previous options. For example, if user sets tabs limit to 10, has 2 tabs marked and checks this option then maximum 10 tabs can be loaded into memory simultaneously. But if he unchecks the option, then 12 tabs can be loaded into memory in total.
* **Allow pinned tabs unloading** - If this option in unchecked, then pinned tabs have the same behaviour as marked tabs.
* **Include pinned tabs in limit** - The idea is the same as for "Include marked tabs in limit", but for pinned tabs. If previous option is checked, then this option is inactive (it still appears in the popup, but has no any effect).

## Bug report / Feedback
If you experience any problems, encounter any bug or just want to give some feedback, you're highly appreciated to do so. You can do it by creating new issue [here](https://github.com/derejar/tabs_unloader/issues/new?template=Blank+issue) (you need to have a github account).

## Documentation
Documentation can be found [here](https://derejar.github.io/tabs_unloader/).

## TODO
- [ ] Migrate to Manifest V3
- [ ] Add the compatibility with other browsers
- [ ] Upgrade extension's graphics
- [ ] Migrate to event-based architecture 

