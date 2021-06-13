const WorkspaceTab = {
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

	createEmpty() {
		return WorkspaceTab.create({
			url: "chrome://newtab/"
		})
	}
}

export default WorkspaceTab
