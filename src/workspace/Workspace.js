import { assert, randomString } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import Storage from "../storage/Storage.js"
import { scheduleSuspend } from "../TabSuspend.js"

/**
 * @typedef {'grey'|'blue'|'red'|'yellow'|'green'|'pink'|'purple'|'cyan'} WorkspaceColor
 */

/**
 * @typedef {Object} Workspace
 * @property {string} id
 * @property {string} name
 * @property {WorkspaceColor} color
 * @property {WorkspaceTab[]} tabs
 */

const Workspace = {
	/**
	 * Create and save a new workspace.
	 * @param {string} name Title of the workspace
	 * @param {WorkspaceColor} color Color of the workspace
	 * @param {WorkspaceTab[]|null} tabs List of the workspace tabs
	 * @param windowId Window ID of the workspace
	 * @returns {Promise<Workspace>}
	 */
	async create({ name, color, tabs, windowId }) {
		if (!tabs || tabs.length === 0) {
			tabs = [WorkspaceTab.createEmpty()]
		}

		const id = `${Storage.Key.WORKSPACE_PREFIX}${randomString(8)}`
		const workspace = { id, name, color, tabs }

		await Workspace.save(workspace)
		await WorkspaceList.add(workspace.id, windowId)

		return workspace
	},

	/**
	 * Get workspace by ID.
	 * @param {string} workspaceId
 	 * @returns {Promise<Workspace|null>}
	 */
	async get(workspaceId) {
		return await Storage.get(workspaceId)
	},

	/**
	 * Save changes to an existing workspace.
	 * @param {Workspace} workspace
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Remove workspace by ID.
	 * @param {string} workspaceId
	 * @returns {Promise<void>}
	 */
	async remove(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

		await WorkspaceList.remove(workspaceId)
		await Storage.remove(workspaceId)

		if (windowId) {
			const windowTabs = await chrome.tabs.query({ windowId })
			await chrome.tabs.ungroup(windowTabs.map((tab) => tab.id))
		}
	},

	/**
	 * Open a workspace.
	 * @param {string} workspaceId
	 * @returns {Promise<void>}
	 */
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

	/**
	 * Sync window changes to workspace.
	 * @param {string} workspaceId
	 * @returns {Promise<void>}
	 */
	async update(workspaceId) {
		const workspace = await Workspace.get(workspaceId)
		if (!workspace) return

		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
		if (!windowId) return

		const tabs = await chrome.tabs.query({ windowId })
		workspace.tabs = tabs.map(WorkspaceTab.create)

		await Workspace.save(workspace)
	}
}

export default Workspace
