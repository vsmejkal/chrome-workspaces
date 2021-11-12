import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import ListView from "./view/ListView.js"
import DetailView from "./view/DetailView.js";
import Action from "../Action.js";
import RemoveView from "./view/RemoveView.js";
import DebugView from "./view/DebugView.js";
import EmptyListView from "./view/EmptyListView.js";

// Bootstrap and render the workspace list
document.addEventListener("DOMContentLoaded", render);

async function render() {
	showListView()
	registerDebugView()
}

async function showListView() {
	await showWorkspaceListView()

	const workspaceList = await WorkspaceList.getItems()
	if (workspaceList.length === 0) {
		await showEmptyListView()
	}

	async function showWorkspaceListView() {
		const listView = new ListView({
			onAddItem: () => showAddWorkspaceView(),
			onEditItem: (workspaceId) => showEditWorkspaceView(workspaceId),
			onOpenItem: async (workspaceId) => {
				await Action.openWorkspace(workspaceId)
				closePopup()
			} 
		})
	
		await listView.show()
	}
	
	async function showEmptyListView() {
		const emptyListView = new EmptyListView({
			onAddItem: () => showAddWorkspaceView(),
		})
	
		await emptyListView.show()
	}
}

async function showAddWorkspaceView() {
	const newView = new DetailView({
		onSave: async ({ name, color, windowId }) => {	
			const workspace = await Workspace.create({ name, color, windowId })
			await Action.openWorkspace(workspace.id)
			closePopup()
		}
	})

	await newView.show()
}

async function showEditWorkspaceView(workspaceId) {
	const editView = new DetailView({
		onSave: async ({ workspaceId, name, color }) => {
			const workspace = await Workspace.get(workspaceId)
			workspace.name = name
			workspace.color = color
			await Workspace.save(workspace)
			showListView()
		},
		onRemove: async ({ workspaceId }) => {
			showRemoveWorkspaceView(workspaceId)
		}
	})

	await editView.show({ workspaceId })
}

async function showRemoveWorkspaceView(workspaceId) {
	const removeView = new RemoveView({
		onCancel: async ({ workspaceId }) => {
			showEditWorkspaceView(workspaceId)
		},
		onRemove: async ({ workspaceId }) => {
			await Workspace.remove(workspaceId)
			showListView()
		}
	})
	
	await removeView.show({ workspaceId })
}

async function registerDebugView() {
	const { installType } = await chrome.management.getSelf()
	if (installType !== "development") return;

	document.onkeydown = async (event) => {
		if (event.key === ".") {
			new DebugView().show()
		}
	}
}

function closePopup() {
	window.close()
}
