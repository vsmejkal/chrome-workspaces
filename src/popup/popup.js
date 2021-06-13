import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import ListView from "./view/ListView.js"
import DetailView from "./view/DetailView.js";
import Action from "../Action.js";
import RemoveView from "./view/RemoveView.js";

init().then(render)

async function init() {
	let list = await WorkspaceList.getItems()

	if (list.length === 0) {
		await createInitialWorkspaces()
	}
}

async function render() {
	const listView = new ListView({
		onAddItem: () => newView.show(),
		onEditItem: (id) => editView.show({ workspaceId: id }),
		onOpenItem: (id) => Action.openWorkspace(id).then(() => window.close())
	})

	const newView = new DetailView({
		onSave: async ({ name, color }) => {
			await Workspace.create({ name, color })
			listView.show()
		}
	})

	const editView = new DetailView({
		onSave: async ({ workspaceId, name, color }) => {
			const workspace = await Workspace.get(workspaceId)
			workspace.name = name
			workspace.color = color
			await Workspace.save(workspace)

			listView.show()
		},
		onRemove: async ({ workspaceId }) => {
			removeView.show({ workspaceId })
		}
	})

	const removeView = new RemoveView({
		onCancel: async ({ workspaceId }) => {
			editView.show({ workspaceId })
		},
		onRemove: async ({ workspaceId }) => {
			await Workspace.remove(workspaceId)
			listView.show()
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