import Workspace from "../data/Workspace.js"
import WorkspaceTab from "../data/WorkspaceTab.js"
import OpenTabs from "../data/OpenTabs.js"
import OpenWorkspaces from "../data/OpenWorkspaces.js"
import Options from "../data/Options.js"

chrome.runtime.onMessage.addListener(handleMessage)
// chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
// chrome.tabs.onAttached.addListener(handleTabAttach)
// chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)

async function handleMessage(request, sender, sendResponse) {
  if (request.type === "OPEN_WORKSPACE") {
    Workspace.open(request.workspaceId, request.closeCurrent).then()
  }

  // Always send response
  sendResponse({ status: "ok" })

  return true
}

async function handleTabUpdate(tabId, changeInfo, tab) {
  console.log("TAB UPDATE", changeInfo)

  const { workspaceTabId } = await OpenTabs.find({ windowTabId: tabId })

  if (workspaceTabId) {
    await WorkspaceTab.update(workspaceTabId, changeInfo)
    return
  }

  const { workspaceId } = await OpenWorkspaces.find({ windowId: tab.windowId })

  if (workspaceId && changeInfo.status === "loading") {
    const workspaceTab = await WorkspaceTab.create(tab)
    await Workspace.addTab(workspaceId, workspaceTab.id, tab.index)
    await OpenTabs.add(tabId, workspaceTab.id)
  }
}

async function handleTabRemove(tabId, removeInfo) {
  console.log("TAB REMOVE", removeInfo)

  const { workspaceId } = await OpenWorkspaces.find({ windowId: removeInfo.windowId })
  const { workspaceTabId } = await OpenTabs.find({ windowTabId: tabId })

  if (workspaceId && workspaceTabId && !removeInfo.isWindowClosing) {
    await Workspace.removeTab(workspaceId, workspaceTabId)
    await WorkspaceTab.remove(workspaceTabId)
  }

  await OpenTabs.remove({ windowTabId: tabId })
}

async function handleTabAttach(tabId, attachInfo) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId: attachInfo.newWindowId })
  const { workspaceTabId } = await OpenTabs.find({ windowTabId: tabId })
  const position = attachInfo.newPosition

  if (workspaceId && workspaceTabId) {
    await Workspace.addTab(workspaceId, workspaceTabId, position)
  }
}

async function handleTabDetach(tabId, detachInfo) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId: detachInfo.oldWindowId })
  const { workspaceTabId } = await OpenTabs.find({ windowTabId: tabId })

  if (workspaceId && workspaceTabId) {
    await Workspace.removeTab(workspaceId, workspaceTabId)
  }
}

async function matchWindowToWorkspace(windowId, workspaceId) {
  const windowTabs = await chrome.tabs.query({ windowId })
  const workspaceTabs = await Workspace.getTabs(workspaceId)

  if (windowTabs.length !== workspaceTabs.length) {
    console.log('NOT MATCHED (length)')
    return false
  }

  let matched = true

  for (let i = 0; i < windowTabs.length; i++) {
    if (windowTabs[i].url !== workspaceTabs[i].url) {
      console.log('NOT MATCHED (urls)', windowTabs[i].url, workspaceTabs[i].url)
    }
  }

  if (!matched) {
    return false
  }

  const windowTabIds = windowTabs.map(tab => tab.id)
  const workspaceTabIds = workspaceTabs.map(tab => tab.id)

  await OpenTabs.addAll(windowTabIds, workspaceTabIds)
  await OpenWorkspaces.add(windowId, workspaceId)

  console.log('MATCHED :)')

  return true
}

async function handleWindowOpen(window) {
  const lastWorkspaceId = await Options.get(Options.LAST_WORKSPACE_ID)
  const windows = await chrome.windows.getAll({
    windowTypes: ["normal"]
  })

  // Opening first window
  if (windows.length === 1 && lastWorkspaceId) {
    await matchWindowToWorkspace(window.id, lastWorkspaceId)
  }
}

async function handleWindowClose(windowId) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId })
  const windows = await chrome.windows.getAll({
    windowTypes: ["normal"]
  })

  if (workspaceId) {
    await Workspace.dispose(workspaceId)
  }

  // Closing last window
  if (windows.length === 0) {
    await Options.set(Options.LAST_WORKSPACE_ID, workspaceId)
  }
}

async function handleInstall() {
// TODO: Context menu
  /*await chrome.contextMenus.create({
    id: "sendToWorkspace",
    title: "Send to Workspace",
  })

  await chrome.contextMenus.create({
    id: "ws1",
    parentId: "sendToWorkspace",
    title: "Workspace 1",
  })

  await chrome.contextMenus.create({
    id: "ws2",
    parentId: "sendToWorkspace",
    title: "Workspace 2",
  })*/
}
