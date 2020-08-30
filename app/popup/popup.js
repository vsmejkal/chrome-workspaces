import Workspace from "../model/Workspace.js"
import WorkspaceList from "../model/WorkspaceList.js"
import WorkspaceTab from "../model/WorkspaceTab.js"
import ListView from "./view/ListView.js"
import DetailView from "./view/DetailView.js";
import Action from "../Action.js";

init().then(render)


async function init() {
	let list = await WorkspaceList.getItems()

	if (list.length === 0) {
		await createInitialWorkspaces()
	}
}

async function render() {
	const listView = new ListView({
		addItem: () => newView.show(),
		editItem: (id) => editView.show({ workspaceId: id }),
		openItem: (id, newWindow) => Action.openWorkspace(id, newWindow).then(() => window.close())
	})

	const newView = new DetailView({
		saveItem: async ({ name, icon }) => {
			await Workspace.create({ name, icon })
			listView.show()
		}
	})

	const editView = new DetailView({
		saveItem: async ({ workspaceId, name, icon }) => {
			const workspace = await Workspace.get(workspaceId)
			workspace.name = name
			workspace.icon = icon
			await Workspace.save(workspace)

			listView.show()
		},
		deleteItem: async ({ workspaceId }) => {
			const workspace = await Workspace.get(workspaceId)

			if (confirm(`Remove "${workspace.name}"?`)) {
				await Workspace.remove(workspaceId)
				listView.show()
			}
		}
	})

	await listView.show()
}

async function createInitialWorkspaces() {
	const windowId = (await chrome.windows.getCurrent()).id
	const tabs = await chrome.tabs.query({ windowId })

	await Workspace.create({
		name: "Workspace 1",
		icon: "home",
		tabs: tabs.map(WorkspaceTab.create),
		windowId
	})

	await Workspace.create({
		name: "Workspace 2",
		icon: "star"
	})
}

// For debugging
document.onkeypress = async (e) => {
	const extensionInfo = await chrome.management.getSelf()
	const isDevelopment = extensionInfo.installType === "development"

	if (isDevelopment && e.key === "R" && confirm("Clear all data?")) {
		chrome.storage.local.clear()
		chrome.storage.sync.clear()
		chrome.runtime.reload()
	}
}