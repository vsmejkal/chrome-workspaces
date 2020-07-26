import { assert, randomString } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import Storage from "./Storage.js"
import { scheduleSuspend } from "../Suspender.js";

const Workspace = {
	async create({ name, icon, tabs, windowId }) {
		if (!tabs) {
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

	// TODO: refactor
	async open(workspaceId, closeCurrent = true) {
		const workspace = await Workspace.get(workspaceId)
		const windowId = await WorkspaceList.findWindowByWorkspace(workspaceId)

		if (windowId) {
			await chrome.windows.update(windowId, { focused: true })
			return
		}

		const createData = {
			url: workspace.tabs.map(tab => tab.url),
			focused: true
		}

		const oldWindow = await chrome.windows.getLastFocused()

		if (closeCurrent) {
			createData.left = oldWindow.left
			createData.top = oldWindow.top
			createData.width = oldWindow.width
			createData.height = oldWindow.height
		}

		const newWindow = await chrome.windows.create(createData)
		const newTabs = await chrome.tabs.query({ windowId: newWindow.id })
		assert(workspace.tabs.length === newTabs.length)

		newTabs
			.filter((tab, i) => workspace.tabs[i].url.startsWith("http"))
			.forEach(tab => scheduleSuspend(tab.id))

		await Workspace.assignWindow(workspaceId, newWindow.id)

		if (closeCurrent) {
			await chrome.windows.remove(oldWindow.id)
		}
	},

	async assignWindow(workspaceId, windowId) {
		const list = await WorkspaceList.get()

		list.forEach(item => {
			if (item.workspaceId === workspaceId) {
				item.windowId = windowId
			}
		})

		await WorkspaceList.set(list)
	},

	async updateFromWindow(windowId) {
		const workspaceId = await WorkspaceList.findWorkspaceByWindow(windowId)
		if (!workspaceId) return

		const workspace = await Workspace.get(workspaceId)
		if (!workspace) return

		const tabs = await chrome.tabs.query({ windowId })
		workspace.tabs = tabs.map(WorkspaceTab.create)

		await Workspace.save(workspace)
	}
}

export default Workspace
