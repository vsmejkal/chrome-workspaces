import Workspace from "../Workspace.js"
import WorkspaceTab from "../WorkspaceTab.js"
import OpenTabs from "../OpenTabs.js"
import OpenWorkspaces from "../OpenWorkspaces.js"

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
    Workspace.open(request.workspaceId)
  }

  // Always send response
  sendResponse({ status: "ok"})
}

async function handleTabUpdate(tabId, changeInfo, tab) {
  const workspaceTabId = await OpenTabs.find(tabId)
  
  if (workspaceTabId) {
    console.log("TAB UPDATE", changeInfo)
    await WorkspaceTab.update(workspaceTabId, changeInfo)
    return
  }

  const { workspaceId } = await OpenWorkspaces.find({ windowId: tab.windowId })

  if (workspaceId && changeInfo.status === "complete") {
    console.log("TAB CREATE", changeInfo)

    const workspaceTab = await WorkspaceTab.create(tab)
    await Workspace.addTab(workspaceId, workspaceTab.id, tab.index)
    await OpenTabs.add(tabId, workspaceTab.id)
  }
}

async function handleTabRemove(tabId, removeInfo) {
  console.log("TAB REMOVE", removeInfo)

  const { workspaceId } = await OpenWorkspaces.find({ windowId: removeInfo.windowId })
  const workspaceTabId = await OpenTabs.find(tabId)

  if (workspaceId && workspaceTabId && !removeInfo.isWindowClosing) {
    await Workspace.removeTab(workspaceId, workspaceTabId)
    await WorkspaceTab.remove(workspaceTabId)
  }

  await OpenTabs.remove({ browserTabId: tabId })
}

async function handleTabAttach(tabId, attachInfo) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId: attachInfo.newWindowId })
  const workspaceTabId = await OpenTabs.find(tabId)
  const position = attachInfo.newPosition

  if (workspaceId && workspaceTabId) {
    await Workspace.addTab(workspaceId, workspaceTabId, position)
  }
}

async function handleTabDetach(tabId, detachInfo) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId: detachInfo.oldWindowId })
  const workspaceTabId = await OpenTabs.find(tabId)

  if (workspaceId && workspaceTabId) {
    await Workspace.removeTab(workspaceId, workspaceTabId)
  }
}

async function handleWindowOpen(window) {

}

async function handleWindowClose(windowId) {
  const { workspaceId } = await OpenWorkspaces.find({ windowId })

  if (workspaceId) {
    const workspace = await Workspace.get(workspaceId)
    workspace?.tabs?.forEach(workspaceTabId => OpenTabs.remove({ workspaceTabId }))
  }

  await OpenWorkspaces.remove({ windowId })
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
