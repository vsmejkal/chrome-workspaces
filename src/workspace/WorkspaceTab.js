/**
 * @typedef {Object} WorkspaceTab
 * @property {?string} title
 * @property {?string} url
 * @property {?boolean} pinned
 * @property {?boolean} active
 */

const WorkspaceTab = {
	/**
	 * Create a new workspace tab from a browser tab.
	 * @param tab Browser tab
	 * @returns {WorkspaceTab}
	 */
	create(tab) {
		const workspaceTab = {
			title: tab.title?.slice(0, 40),
			url: tab.url ?? tab.pendingUrl
		}
		if (tab.pinned) {
			workspaceTab.pinned = true
		}
		if (tab.active) {
			workspaceTab.active = true
		}

		return workspaceTab
	},

	/**
	 * Create workspace tabs from given browser window. 
	 * @param windowId Window ID
	 * @returns {WorkspaceTab[]}
	 */
	async createAllFromWindow(windowId) {
		const tabs = await chrome.tabs.query({ windowId })

		return tabs.map(WorkspaceTab.create)
	},

	/**
	 * Create empty workspace tab.
	 * @returns {WorkspaceTab}
	 */
	createEmpty() {
		return WorkspaceTab.create({
			url: "chrome://newtab/"
		})
	}
}

export default WorkspaceTab
