import Storage from "../storage/Storage.js"
import { assert } from "../util/assert.js";
import Observable from "../util/Observable.js";

const WorkspaceList = {
	onUpdate: new Observable("WorkspaceList.onUpdate"),

	/**
	 * @returns {Promise<Array<{workspaceId: string, windowId: ?number}>>}
	 */
	async getItems() {
		return await Storage.get(Storage.Key.WORKSPACE_LIST) ?? []
	},

	async updateItems(updater) {
		await Storage.update(Storage.Key.WORKSPACE_LIST, (list) => updater(list ?? []))

		await WorkspaceList.onUpdate.notify()
	},

	/**
	 * @returns {Promise<Array<string>>}
	 */
	 async getWorkspaceIds() {
		const list = await WorkspaceList.getItems()
		
		return list.map(item => item.workspaceId)
	},

	/**
	 * @returns {Promise<Array<import("./Workspace.js").Workspace>>}
	 */
	async getWorkspaces() {
		const workspaceIds = await WorkspaceList.getWorkspaceIds()
		const workspaces = await Storage.getAll(workspaceIds)

		return workspaces.filter(Boolean)
	},

	async add(workspaceId, windowId) {
		await WorkspaceList.updateItems((list) => {
			return list.concat({ workspaceId, windowId })
		})
	},

	async update(workspaceId, windowId) {
		await WorkspaceList.updateItems((list) => {
			for (const item of list) {
				if (item.workspaceId === workspaceId) {
					item.windowId = windowId
				}
			}
			return list
		})
	},

	async remove(workspaceId) {
		await WorkspaceList.updateItems((list) => {
			return list.filter(item => item.workspaceId !== workspaceId)
		})
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

	async initialize() {
		await WorkspaceList.updateItems((list) => {
			for (const item of list) {
				item.windowId = undefined
			}
			return list
		})
	}
}

export default WorkspaceList
