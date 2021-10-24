import { assert, randomString } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import Storage from "../storage/Storage.js"
import Config from "../storage/Config.js"
import TabSuspendService from "../service/TabSuspendService.js"

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
	 * @param {WorkspaceTab[]} [tabs] List of the workspace tabs
	 * @param {number} [windowId] Window ID of the workspace
	 * @returns {Promise<Workspace>}
	 */
	async create({ name, color, tabs, windowId }) {
		if (windowId) {
			tabs = await WorkspaceTab.createAllFromWindow(windowId)
		}
		if (!tabs || tabs.length === 0) {
			tabs = [WorkspaceTab.createEmpty()]
		}

		const workspaceId = `${Storage.Key.WORKSPACE_PREFIX}${randomString(8)}`
		const workspace = { id: workspaceId, name, color, tabs }

		await Workspace.save(workspace)
		await WorkspaceList.add(workspaceId, windowId)

		return workspace
	},

	/**
	 * Create tab group with workspace tabs
	 * @param {string} workspaceId 
	 */
	async activate(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
		if (!windowId) return

		const workspace = await Workspace.get(workspaceId)
		const tabs = await chrome.tabs.query({ windowId })
		const tabIds = tabs.map((tab) => tab.id)
		let groupId = await Workspace.getGroupId(workspaceId)

		if (groupId) {
			await chrome.tabs.group({ tabIds, groupId })
		} else {
			groupId = await chrome.tabs.group({ tabIds })
		}
		
		if (workspace && groupId) {
			await chrome.tabGroups.update(groupId, { title: workspace.name, color: workspace.color })
		}
	},

	/**
	 * Ungroup workspace tabs
	 * @param {string} workspaceId
	 */
	async deactivate(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
		if (!windowId) return

		const tabs = await chrome.tabs.query({ windowId })
		const tabIds = tabs.map((tab) => tab.id)

		await chrome.tabs.ungroup(tabIds)
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
	 */
	async save(workspace) {
		assert(Array.isArray(workspace.tabs))
		assert(workspace.tabs.every(tab => typeof tab === "object"))

		await Storage.set(workspace.id, workspace)

		const windowId = await WorkspaceList.findWindowForWorkspace(workspace.id)
		if (!windowId) return

		const [group] = await chrome.tabGroups.query({ windowId })
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
	 */
	async remove(workspaceId) {
		await Workspace.deactivate(workspaceId)
		await WorkspaceList.remove(workspaceId)
		await Storage.remove(workspaceId)
	},

	/**
	 * Focus workspace window
	 * @param {string} workspaceId 
	 */
	async focus(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

		if (windowId) {
			await chrome.windows.update(windowId, { focused: true })
		}
	},

	/**
	 * Open a workspace.
	 * @param {string} workspaceId
	 */
	async open(workspaceId) {
		try {
			await Config.set(Config.Key.OPENING_WORKSPACE, true)
			await Workspace._doOpen(workspaceId)
		} finally {
			await Config.set(Config.Key.OPENING_WORKSPACE, false)
		}
	 },

	async _doOpen(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
		const windowExists = Boolean(windowId && await chrome.windows.get(windowId))

		if (windowExists) {
			await Workspace.activate(workspaceId)
			return
		}

		const workspace = await Workspace.get(workspaceId)
		const window = await chrome.windows.create({
			url: workspace.tabs.map(tab => tab.url),
			focused: true
		})

		workspace.tabs.forEach(({ url, active = false, pinned = false}, index) => {
			const tabId = window.tabs[index].id
			if (url.startsWith("http")) {
				TabSuspendService.scheduleSuspend(tabId)
			}
			chrome.tabs.update(tabId, { active, pinned })
		})

		await WorkspaceList.update(workspace.id, window.id)
		await Workspace.activate(workspaceId)
	},

	/**
	 * Sync window changes to workspace.
	 * @param {unknown} windowId
	 */
	async sync(windowId) {
		const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
		if (!workspaceId) return

		const workspace = await Workspace.get(workspaceId)
		if (!workspace) return

		const tabs = await chrome.tabs.query({ windowId })
		workspace.tabs = tabs.map(WorkspaceTab.create)

		await Workspace.save(workspace)
	},

	/**
	 * Get a Tab Group ID associated with the workspace
	 * @param {string} workspaceId
	 * @returns {Promise<number>} 
	 */
	async getGroupId(workspaceId) {
		const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)
		if (!windowId) return

		const workspace = await Workspace.get(workspaceId)
		if (!workspace) return

		const [group] = await chrome.tabGroups.query({ windowId, title: workspace.name, color: workspace.color })

		return group?.id
	}
}

export default Workspace
