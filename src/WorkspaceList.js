import Storage from "./Storage.js"

const WORKSPACES_KEY = "workspaces"

const WorkspaceList = {
  async getIds() {
    return await Storage.get(WORKSPACES_KEY) ?? []
  },

  async getWorkspaces() {
    const ids = await WorkspaceList.getIds()
    
    return await Storage.getAll(ids)
  },

  async add(workspaceId) {
    const ids = await WorkspaceList.getIds()

    await Storage.set(WORKSPACES_KEY, [...ids, workspaceId])
  }
}

export default WorkspaceList
