import { randomString, assert } from "./Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import OpenWorkspaces from "./OpenWorkspaces.js"
import Storage from "./Storage.js"
import OpenTabs from "./OpenTabs.js"

const WORKSPACE_ID_PREFIX = "workspace_"

const Workspace = {
  async create({ title, tabs }) {
    const workspace = {
      id: WORKSPACE_ID_PREFIX + randomString(8),
      title,
      tabs: tabs.map(tab => tab.id ?? tab)
    }

    await Workspace.save(workspace)
    await WorkspaceList.add(workspace.id)

    return workspace
  },

  async get(workspaceId) {
    return await Storage.get(workspaceId)
  },
  
  async save(workspace) {
    assert(Array.isArray(workspace.tabs))
    assert(workspace.tabs.every(tab => typeof tab === "string"))

    await Storage.set(workspace.id, workspace)
  },

  async open(workspaceId) {
    if (await OpenWorkspaces.contains(workspaceId)) {
      await Workspace.focus(workspaceId)
      return
    }

    const workspaceTabs = await Workspace.getTabs(workspaceId)
    if (workspaceTabs.length === 0) {
      return
    }
    
    const { id: oldWindowId, left, top, width, height } = await chrome.windows.getLastFocused()

    const newWindow = await chrome.windows.create({
      url: workspaceTabs.map(tab => tab.url),
      focused: true,
      left, top, width, height
    })

    await OpenWorkspaces.add(newWindow.id, workspaceId)
    await OpenWorkspaces.remove({ windowId: oldWindowId })
    await chrome.windows.remove(oldWindowId)
  },

  async getTabs(workspaceId) {
    const workspace = await Workspace.get(workspaceId)
    const tabs = await Storage.getAll(workspace.tabs)

    return tabs.filter(Boolean)
  },

  async addTab(workspaceId, workspaceTabId, position) {
    const workspace = await Workspace.get(workspaceId)

    workspace.tabs.splice(position, 0, workspaceTabId)

    await Workspace.save(workspace)
  },

  async removeTab(workspaceId, workspaceTabId) {
    const workspace = await Workspace.get(workspaceId)

    workspace.tabs = workspace.tabs.filter(tabId => tabId !== workspaceTabId)

    await Workspace.save(workspace)
  },

  async focus(workspaceId) {
    const { windowId } = await OpenWorkspaces.find({ workspaceId })

    if (windowId) {
      await chrome.windows.update(parseInt(windowId), { focused: true })
    }
  },
}

export default Workspace
