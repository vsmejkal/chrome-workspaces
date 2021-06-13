import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import WorkspaceTab from "../workspace/WorkspaceTab.js"
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
		openItem: (id) => Action.openWorkspace(id).then(() => window.close())
	})

	const newView = new DetailView({
		saveItem: async ({ name, color }) => {
			await Workspace.create({ name, color })
			listView.show()
		}
	})

	const editView = new DetailView({
		saveItem: async ({ workspaceId, name, color }) => {
			const workspace = await Workspace.get(workspaceId)
			workspace.name = name
			workspace.color = color
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
	await Workspace.create({
		name: "Blue Workspace",
		color: "blue"
	})

	await Workspace.create({
		name: "Green Workspace",
		color: "green"
	})
}

// For debugging
document.onkeypress = async (e) => {
	const extensionInfo = await chrome.management.getSelf()
	const isDevelopment = extensionInfo.installType === "development"

	if (isDevelopment && document.activeElement === document.body && e.key === "R" && confirm("Clear all data?")) {
		chrome.storage.local.clear()
		chrome.storage.sync.clear()
		chrome.runtime.reload()
	}
}