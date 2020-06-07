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
  }
}

export default WorkspaceList
