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
