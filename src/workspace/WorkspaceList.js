import Storage from "../storage/Storage.js"
import { assert } from "../Utils.js";

const WorkspaceList = {
	/**
	 * @returns {Promise<Array<{workspaceId: string, windowId: ?number}>>}
	 */
	async getItems() {
		return await Storage.get(Storage.Key.WORKSPACE_LIST) ?? []
	},

	async setItems(list) {
		await Storage.set(Storage.Key.WORKSPACE_LIST, list)
	},

	async getWorkspaces() {
		const list = await WorkspaceList.getItems()
		const workspaceIds = list.map(item => item.workspaceId)

		return await Storage.getAll(workspaceIds)
	},

	async add(workspaceId, windowId) {
		const list = await WorkspaceList.getItems()

		await WorkspaceList.setItems(list.concat({ workspaceId, windowId }))
	},

	async update(workspaceId, windowId) {
		const list = await WorkspaceList.getItems()

		for (const item of list) {
			if (item.workspaceId === workspaceId) {
				item.windowId = windowId
			}
		}

		await WorkspaceList.setItems(list)
	},

	async remove(workspaceId) {
		const list = await WorkspaceList.getItems()

		await WorkspaceList.setItems(list
			.filter(item => item.workspaceId !== workspaceId)
		)
	},

	async findWorkspaceForWindow(windowId) {
		assert(windowId)
		const list = await WorkspaceList.getItems()

		return list.find(item => item.windowId === windowId)?.workspaceId
	},

	async findWindowForWorkspace(workspaceId) {
		assert(workspaceId)
		const list = await WorkspaceList.getItems()

		return list.find(item => item.workspaceId === workspaceId)?.windowId
	},

	async clearWindowIds() {
		const list = await WorkspaceList.getItems()
		for (const item of list) {
			item.windowId = null
		}

		await WorkspaceList.setItems(list)
	}
}

export default WorkspaceList
