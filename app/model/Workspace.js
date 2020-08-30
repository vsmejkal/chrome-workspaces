import { assert, randomString } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import Storage from "./Storage.js"
import { scheduleSuspend } from "../TabSuspend.js"

const Workspace = {
	async create({ name, icon, tabs, windowId }) {
		if (!tabs || tabs.length === 0) {
			tabs = [WorkspaceTab.createEmpty()]
		}

		const workspace = {
			id: `${Storage.WORKSPACE_PREFIX}${randomString(8)}`,
			name, icon, tabs
		}

		await Workspace.save(workspace)
		await WorkspaceList.add(workspace.id, windowId)

		return workspace
	},

	async get(workspaceId) {
		return await Storage.get(workspaceId)
	},

	async save(workspace) {
		assert(Array.isArray(workspace.tabs))
		assert(workspace.tabs.every(tab => typeof tab === "object"))

		await Storage.set(workspace.id, workspace)
	},

	async remove(workspaceId) {
		await WorkspaceList.remove(workspaceId)
		await Storage.remove(workspaceId)
	},

	async open(workspaceId, closeCurrent = true) {
		const workspace = await Workspace.get(workspaceId)
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

		if (windowId && await focusWindow(windowId)) {
			return
		}

		const currentWindow = await chrome.windows.getLastFocused()
		const {left, top, width, height} = currentWindow
		const properties = closeCurrent ? {left, top, width, height} : {}

		const newWindow = await createWindow(workspace, properties)
		await initWindow(workspace, newWindow)

		if (closeCurrent) {
			await closeWindow(currentWindow.id)
		}

		async function createWindow(workspace, properties) {
			return await chrome.windows.create({
				url: workspace.tabs.map(tab => tab.url),
				focused: true,
				...properties
			})
		}

		async function initWindow(workspace, window) {
			await WorkspaceList.update(workspace.id, window.id)

			workspace.tabs.forEach(({ url, active = false, pinned = false}, i) => {
				const tabId = window.tabs[i].id
				if (url.startsWith("http")) {
					scheduleSuspend(tabId)
				}
				chrome.tabs.update(tabId, { active, pinned })
			})
		}

		async function focusWindow(windowId) {
			try {
				await chrome.windows.update(windowId, { focused: true })
				return true
			} catch (e) {
				console.error(e)
				return false
			}
		}

		async function closeWindow(windowId) {
			try {
				await chrome.windows.remove(windowId)
				return true
			} catch (e) {
				console.error(e)
				return false
			}
		}
	},

	async updateFromWindow(windowId) {
		const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
		if (!workspaceId) return

		const workspace = await Workspace.get(workspaceId)
		if (!workspace) return

		const tabs = await chrome.tabs.query({ windowId })
		workspace.tabs = tabs.map(WorkspaceTab.create)

		await Workspace.save(workspace)
	}
}

export default Workspace
