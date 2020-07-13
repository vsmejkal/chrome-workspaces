import { randomString, assert } from "../Utils.js"
import WorkspaceList from "./WorkspaceList.js"
import WorkspaceTab from "./WorkspaceTab.js"
import OpenWorkspaces from "./OpenWorkspaces.js"
import Storage from "./Storage.js"
import OpenTabs from "./OpenTabs.js"

const Workspace = {
  async create({ name, icon, tabs }) {
    const id = `${Storage.WORKSPACE_PREFIX}_${randomString(8)}`
    const workspace = {
      id, name, icon,
      tabs: tabs.map(tab => tab.id ?? tab)
    }

    await Workspace.save(workspace)
    await WorkspaceList.add(workspace.id)

    return workspace
  },

  async createEmpty(args) {
    const newTab = await WorkspaceTab.createEmpty()

    await Workspace.create({ ...args, tabs: [newTab] })
  },

  async get(workspaceId) {
    return await Storage.get(workspaceId)
  },
  
  async save(workspace) {
    assert(Array.isArray(workspace.tabs))
    assert(workspace.tabs.every(tab => typeof tab === "string"))

    await Storage.set(workspace.id, workspace)
  },

  async remove(workspaceId) {
    await WorkspaceList.remove(workspaceId)
    await Workspace.dispose(workspaceId)
    await Storage.remove(workspaceId)
  },

  async open(workspaceId, closeCurrent = true) {
    if (await OpenWorkspaces.contains(workspaceId)) {
      await Workspace.focus(workspaceId)
      return
    }

    const workspaceTabs = await Workspace.getTabs(workspaceId)
    if (workspaceTabs.length === 0) {
      workspaceTabs.push(await WorkspaceTab.createEmpty())
    }

    const createData = {
      url: workspaceTabs.map(tab => tab.url),
      focused: true
    }

    const currentWindow= await chrome.windows.getLastFocused()

    if (closeCurrent) {
      createData.left = currentWindow.left
      createData.top = currentWindow.top
      createData.width = currentWindow.width
      createData.height = currentWindow.height
    }

    const newWindow = await chrome.windows.create(createData)
    const newTabs = await chrome.tabs.query({ windowId: newWindow.id })
    const newTabIds = newTabs.map(tab => tab.id)
    const workspaceTabIds = workspaceTabs.map(tab => tab.id)

    await OpenTabs.addAll(newTabIds, workspaceTabIds)
    await OpenWorkspaces.add(newWindow.id, workspaceId)

    if (closeCurrent) {
      await chrome.windows.remove(currentWindow.id)
    }
  },

  async dispose(workspaceId) {
    const workspace = await Workspace.get(workspaceId)
    workspace?.tabs?.forEach(workspaceTabId =>
        OpenTabs.remove({ workspaceTabId })
    )

    await OpenWorkspaces.remove({ workspaceId })
  },

  async getTabs(workspaceId) {
    const workspace = await Workspace.get(workspaceId)
    if (!workspace) {
      return []
    }

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
