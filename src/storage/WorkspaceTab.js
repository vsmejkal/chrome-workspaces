const WorkspaceTab = {
	create(tabInfo) {
		const workspaceTab = {
			title: tabInfo.title?.slice(0, 40),
			url: tabInfo.url ?? tabInfo.pendingUrl
		}
		if (tabInfo.pinned) {
			workspaceTab.pinned = true
		}
		if (tabInfo.active) {
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
