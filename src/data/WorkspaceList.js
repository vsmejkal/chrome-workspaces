import Storage from "./Storage.js"

const WorkspaceList = {
  async getIds() {
    return await Storage.get(Storage.WORKSPACES) ?? []
  },

  async getWorkspaces() {
    const ids = await WorkspaceList.getIds()
    
    return await Storage.getAll(ids)
  },

  async add(workspaceId) {
    const ids = await WorkspaceList.getIds()

    await Storage.set(Storage.WORKSPACES, [...ids, workspaceId])
  },

  async remove(workspaceId) {
    const ids = await WorkspaceList.getIds()

    await Storage.set(Storage.WORKSPACES, ids.filter(id => id !== workspaceId))
  }
}

export default WorkspaceList
