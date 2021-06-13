import { assert, randomString } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import Storage from "../storage/Storage.js"
import { scheduleSuspend } from "../TabSuspend.js"

const Workspace = {
	async create({ name, color, tabs, windowId }) {
		if (!tabs || tabs.length === 0) {
			tabs = [WorkspaceTab.createEmpty()]
		}

		const workspace = {
			id: `${Storage.Key.WORKSPACE_PREFIX}${randomString(8)}`,
			name, color, tabs
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

		const windowId = await WorkspaceList.findWindowForWorkspace(workspace.id)
		if (!windowId) return

		const groupsInWindow = await chrome.tabGroups.query({ windowId })
		const group = groupsInWindow?.[0]
		if (!group) return

		if (group.title !== workspace.name || group.color !== workspace.color) {
			await chrome.tabGroups.update(group.id, {
				title: workspace.name,
				color: workspace.color,
			})
		}
	},

	async remove(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

		await WorkspaceList.remove(workspaceId)
		await Storage.remove(workspaceId)

		if (windowId) {
			const windowTabs = await chrome.tabs.query({ windowId })
			await chrome.tabs.ungroup(windowTabs.map((tab) => tab.id))
		}
	},

	async open(workspaceId) {
		const workspace = await Workspace.get(workspaceId)
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

		if (windowId && await focusWindow(windowId)) {
			return
		}

		const newWindow = await createWindow(workspace)
		await initTabs(workspace, newWindow)

		async function createWindow(workspace) {
			return await chrome.windows.create({
				url: workspace.tabs.map(tab => tab.url),
				focused: true
			})
		}

		async function initTabs(workspace, window) {
			const tabIds = window.tabs.map((tab) => tab.id)

			await WorkspaceList.update(workspace.id, window.id)

			workspace.tabs.forEach(({ url, active = false, pinned = false}, index) => {
				const tabId = tabIds[index]
				if (url.startsWith("http")) {
					scheduleSuspend(tabId)
				}
				chrome.tabs.update(tabId, { active, pinned })
			})

			const groupId = await chrome.tabs.group({ tabIds })
			await chrome.tabGroups.update(groupId, { title: workspace.name, color: workspace.color})
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
