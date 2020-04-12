export default {
  async create({ title, windowId = null }) {
    const workspace = {
      id: `workspace_${randomString(8)}`,
      title,
      windowId,
      index: 0,
      tabs: [],
    }
    
    const workspaces = await this.getAll()
    if (workspaces.length > 0) {
      workspace.index = Math.max(...workspaces.map(ws => ws.index)) + 1
    }
    if (windowId) {
      workspace.tabs = await this._captureTabs(windowId)
    }

    this.save(workspace)

    return workspace
  },

  async getAll() {
    const data = await chrome.storage.local.get(null)
    
    return Object.keys(data)
      .filter(key => key.startsWith("workspace_"))
      .map(key => data[key])
      .sort((ws1, ws2) => ws1.index - ws2.index)
  },

  async getByWindow(windowId) {
    const workspaces = await this.getAll()

    return workspaces.find(ws => ws.windowId === windowId)
  },

  async sync(windowId) {
    const workspace = await this.getByWindow(windowId)
    if (workspace) {
      workspace.tabs = await this._captureTabs()
      this.save(workspace)
    }
  },
  
  async save(workspace) {
    return await chrome.storage.local.set({[workspace.id]: workspace})
  },

  async activate(workspace, windowId) {
    const oldTabs = await chrome.tabs.query({ windowId })
    const oldWorkspace = await this.getByWindow(windowId)
    
    if (oldWorkspace) {
      oldWorkspace.tabs = this._captureTabs(windowId)
      oldWorkspace.windowId = null
      this.save(oldWorkspace)
    }

    const newTabs = workspace.tabs
    if (newTabs.length === 0) {
      newTabs.push({ url: "chrome://newtab/" })
    }
  
    debugger
    for (const tab of newTabs) {
      chrome.tabs.create(tab)
    }
  
    for (const tab of oldTabs) {
      chrome.tabs.remove(tab.id)
    }
  
    workspace.windowId = windowId
    this.save(workspace)
  },

  async _captureTabs(windowId) {
    const windowTabs = await chrome.tabs.query({ windowId })
  
    return windowTabs.map(tab => {
      const { url, pinned = false, active = false } = tab

      return { url, pinned, active }
    })
  }
}

function randomString(length) {
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
