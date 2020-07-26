import Storage from "./Storage.js"
import { assert } from "../Utils.js";

const WorkspaceList = {
	/**
	 * @returns {Promise<Array<{workspaceId: string, windowId: number}>>}
	 */
	async get() {
		return await Storage.get(Storage.WORKSPACE_LIST) ?? []
	},

	async set(list) {
		await Storage.set(Storage.WORKSPACE_LIST, list)
	},

	async getWorkspaces() {
		const list = await WorkspaceList.get()
		const workspaceIds = list.map(item => item.workspaceId)

		return await Storage.getAll(workspaceIds)
	},

	async add(workspaceId, windowId) {
		const list = await WorkspaceList.get()

		await WorkspaceList.set([...list, {workspaceId, windowId}])
	},

	async remove(workspaceId) {
		const list = await WorkspaceList.get()

		await WorkspaceList.set(list.filter(item => item.workspaceId !== workspaceId))
	},

	async findWorkspaceByWindow(windowId) {
		assert(windowId)
		const list = await WorkspaceList.get()

		return list.find(item => item.windowId === windowId)?.workspaceId
	},

	async findWindowByWorkspace(workspaceId) {
		assert(workspaceId)
		const list = await WorkspaceList.get()

		return list.find(item => item.workspaceId === workspaceId)?.windowId
	}
}

export default WorkspaceList
