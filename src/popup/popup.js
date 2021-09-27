import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import ListView from "./view/ListView.js"
import DetailView from "./view/DetailView.js";
import Action from "../Action.js";
import RemoveView from "./view/RemoveView.js";
import DebugView from "./view/DebugView.js";

// Bootstrap and render the workspace list
document.addEventListener("DOMContentLoaded", render);

async function render() {
	const listView = new ListView({
		onAddItem: () => newView.show(),
		onEditItem: (workspaceId) => editView.show({ workspaceId }),
		onOpenItem: async (workspaceId) => {
			const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
			const windowExists = Boolean(windowId && await chrome.windows.get(windowId))

			if (windowExists) {
				await Workspace.focus(workspaceId)
			} else {
				await Action.openWorkspace(workspaceId)
			}

			closePopup()
		} 
	})

	const newView = new DetailView({
		onSave: async ({ name, color }) => {
			const currentWindow = await chrome.windows.getLastFocused()
			const currentWorkspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindow.id)
			const windowId = !currentWorkspaceId ? currentWindow.id : undefined
			const newWorkspace = await Workspace.create({ name, color, windowId })
			
			await Action.openWorkspace(newWorkspace.id)

			closePopup()
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

	registerDebugView()

	await listView.show()
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
