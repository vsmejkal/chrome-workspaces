import Storage from "./Storage.js"
import { assert } from "./Utils.js"

const OpenTabs = {
  async _getAll() {
    return await Storage.get(Storage.OPEN_TABS) ?? {}
  },

  async find({ windowTabId, workspaceTabId }) {
    assert(windowTabId ?? workspaceTabId)

    const openTabs = await OpenTabs._getAll()

    if (!windowTabId) {
      windowTabId = Object.keys(openTabs).find(windowTabId => openTabs[windowTabId] === workspaceTabId)
    }

    return { windowTabId: parseInt(windowTabId), workspaceTabId: openTabs[windowTabId] }
  },

  async save(openTabs) {
    Object.keys(openTabs).forEach(windowTabId => {
      assert(windowTabId)
      assert(openTabs[windowTabId])
    })

    await Storage.set(Storage.OPEN_TABS, openTabs)
  },

  async add(windowTabId, workspaceTabId) {
    const openTabs = await OpenTabs._getAll()
    
    openTabs[windowTabId] = workspaceTabId

    await OpenTabs.save(openTabs)
  },

  async addAll(windowTabIds, workspaceTabIds) {
    assert(windowTabIds.length === workspaceTabIds.length)

    let openTabs = await OpenTabs._getAll()
    
    windowTabIds.forEach((windowTabId, i) =>
      openTabs[windowTabId] = workspaceTabIds[i]
    )
    
    await OpenTabs.save(openTabs)
  },

  async remove({ workspaceTabId, windowTabId }) {
    assert(windowTabId ?? workspaceTabId)

    if (!windowTabId) {
      windowTabId = (await OpenTabs.find({ workspaceTabId }))?.windowTabId
    }

    const openTabs = await OpenTabs._getAll()
    delete openTabs[windowTabId]
    await OpenTabs.save(openTabs)
  },
}

export default OpenTabs
