import { randomString } from "./Utils.js"
import OpenTabs from "./OpenTabs.js"
import Storage from "./Storage.js"

const WorkspaceTab = {
  async create(tabInfo) {
    const workspaceTab = {
      id: `${Storage.TAB_PREFIX}_${randomString(10)}`,
      title: tabInfo.title?.slice(0, 40),
      url: tabInfo.url ?? tabInfo.pendingUrl
    }

    if (tabInfo.pinned) {
      workspaceTab.pinned = true
    }
    if (tabInfo.active) {
      workspaceTab.active = true
    }

    await WorkspaceTab.save(workspaceTab)

    return workspaceTab
  },

  async createEmpty() {
    return await WorkspaceTab.create({
      url: "chrome://newtab/"
    })
  },

  async get(workspaceTabId) {
    return await Storage.get(workspaceTabId)
  },

  async save(workspaceTab) {
    await Storage.set(workspaceTab.id, workspaceTab)
  },

  async open(workspaceTab) {
    const windowTab = await chrome.tabs.create({
      url: workspaceTab.url,
      pinned: workspaceTab.pinned ?? false,
      active: workspaceTab.active ?? false,
    })

    await OpenTabs.add(windowTab.id, workspaceTab.id)
  },

  async update(workspaceTabId, data) {
    const workspaceTab = await WorkspaceTab.get(workspaceTabId)
    const properties = ["title", "url", "pinned"]
    let changed = false

    for (const property of properties) {
      if (property in data && data[property] !== workspaceTab[property]) {
        workspaceTab[property] = data[property]
        changed = true
      }
    }

    if (changed) {
      await WorkspaceTab.save(workspaceTab)
    }
  },

  async remove(workspaceTabId) {
    await Storage.remove(workspaceTabId)
    await OpenTabs.remove({ workspaceTabId })
  }
}

export default WorkspaceTab
