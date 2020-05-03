import Storage from "./Storage.js"
import { assert } from "./Utils.js"

const OPEN_TABS_KEY = "openTabs"

const OpenTabs = {
  async _getAll() {
    return await Storage.get(OPEN_TABS_KEY) ?? {}
  },

  async find(browserTabId) {
    const openTabs = await OpenTabs._getAll()

    return openTabs[browserTabId]
  },

  async findBrowserTabId(workspaceTabId) {
    const openTabs = await OpenTabs._getAll()

    for (let browserTabId of Object.keys(openTabs)) {
      if (openTabs[browserTabId] === workspaceTabId) {
        return parseInt(browserTabId)
      }
    }
  },

  async save(openTabs) {
    Object.entries(openTabs).forEach(([browserTabId, workspaceTabId]) => {
      assert(browserTabId)
      assert(workspaceTabId)
    })

    await Storage.set(OPEN_TABS_KEY, openTabs)
  },

  async add(browserTabId, workspaceTabId) {
    const openTabs = await OpenTabs._getAll()
    
    openTabs[browserTabId] = workspaceTabId

    await OpenTabs.save(openTabs)
  },

  async addAll(browserTabIds, workspaceTabIds) {
    assert(browserTabIds.length === workspaceTabIds.length)

    let openTabs = await OpenTabs._getAll()
    
    browserTabIds.forEach((browserTabId, i) =>
      openTabs[browserTabId] = workspaceTabIds[i]
    )
    
    await OpenTabs.save(openTabs)
  },

  async remove({ workspaceTabId, browserTabId }) {
    const openTabs = await OpenTabs._getAll()

    if (!browserTabId) {
      browserTabId = await OpenTabs.findBrowserTabId(workspaceTabId)
    }

    if (browserTabId) {
      delete openTabs[browserTabId]
      await OpenTabs.save(openTabs)
    }
  },
}

export default OpenTabs
