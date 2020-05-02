import Storage from "./Storage.js"
import { assert } from "./Utils.js"

const OPEN_WORKSPACES_KEY = "openWorkspaces"

const OpenWorkspaces = {
  async getAll() {
    return await Storage.get(OPEN_WORKSPACES_KEY) ?? {}
  },

  async save(openWorkspaces) {
    Object.entries(openWorkspaces).forEach(([windowId, workspaceId]) => {
      assert(windowId)
      assert(workspaceId)
    })

    await Storage.set(OPEN_WORKSPACES_KEY, openWorkspaces)
  },

  async contains(workspaceId) {
    const openWorkspaces = await OpenWorkspaces.getAll()
    
    return Object.values(openWorkspaces).indexOf(workspaceId) >= 0
  },

  async find({ windowId, workspaceId }) {
    assert(windowId ?? workspaceId)

    const openWorkspaces = await OpenWorkspaces.getAll()
    
    if (!windowId) {
      windowId = Object.keys(openWorkspaces).find(windowId => openWorkspaces[windowId] === workspaceId)
    }

    return { windowId: parseInt(windowId), workspaceId: openWorkspaces[windowId] }
  },

  async add(windowId, workspaceId) {
    const openWorkspaces = await OpenWorkspaces.getAll()

    openWorkspaces[windowId] = workspaceId

    await OpenWorkspaces.save(openWorkspaces)
  },

  async remove({ windowId, workspaceId }) {
    const openWorkspaces = await OpenWorkspaces.getAll()

    if (!windowId) {
      windowId = (await OpenWorkspaces.find({ workspaceId }))?.windowId
    }

    if (windowId) {
      delete openWorkspaces[windowId]
      await OpenWorkspaces.save(openWorkspaces)
    }
  },
}

export default OpenWorkspaces
