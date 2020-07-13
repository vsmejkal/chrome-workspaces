import Workspace from "../data/Workspace.js"
import WorkspaceList from "../data/WorkspaceList.js"
import OpenWorkspaces from "../data/OpenWorkspaces.js"
import WorkspaceTab from "../data/WorkspaceTab.js"
import OpenTabs from "../data/OpenTabs.js"
import ListView from "./view/ListView.js"
import DetailView from "./view/DetailView.js";

init().then(render)


async function init() {
	let items = await WorkspaceList.getIds()

	if (items.length === 0) {
		await createInitialWorkspaces();
	}
}

async function render() {
	const listView = new ListView({
		viewId: "view-list",
		addItem: () => newView.show(),
		editItem: (id) => editView.show({ workspaceId: id })
	})

	const newView = new DetailView({
		viewId: "view-new",
		saveItem: async ({ name, icon }) => {
			await Workspace.createEmpty({ name, icon })
			listView.show()
		}
	})

	const editView = new DetailView({
		viewId: "view-new",
		saveItem: async ({ workspaceId, name, icon }) => {
			const workspace = await Workspace.get(workspaceId)
			workspace.name = name
			workspace.icon = icon
			await Workspace.save(workspace)

			listView.show()
		},
		deleteItem: async ({ workspaceId }) => {
			const workspace = await Workspace.get(workspaceId)

			if (confirm(`Really remove ${workspace.name}?`)) {
				await Workspace.remove(workspaceId)
				listView.show()
			}
		}
	})

	await listView.render()
}

async function createInitialWorkspaces() {
	const windowId = (await chrome.windows.getLastFocused()).id
	const windowTabs = await chrome.tabs.query({ windowId })
	const workspaceTabs = await Promise.all(windowTabs.map(WorkspaceTab.create))

	const workspace1 = await Workspace.create({
		name: "Workspace 1",
		icon: "home",
		tabs: workspaceTabs
	})

	const workspace2 = await Workspace.createEmpty({
		name: "Workspace 2",
		icon: "star"
	})

	const windowTabIds = windowTabs.map(tab => tab.id)
	const workspaceTabIds = workspaceTabs.map(tab => tab.id)
	
	await OpenWorkspaces.add(windowId, workspace1.id)
	await OpenTabs.addAll(windowTabIds, workspaceTabIds)

	return [workspace1, workspace2]
}

// Debug
document.onkeypress = (e) => {
	if (e.key === "R" && confirm("Clear all data?")) {
		chrome.storage.local.clear()
		chrome.storage.sync.clear()
		chrome.runtime.reload()
	}
}