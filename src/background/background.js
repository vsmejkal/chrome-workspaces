chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onCreated.addListener(syncCurrentWorkspace)
chrome.tabs.onRemoved.addListener(syncCurrentWorkspace)
chrome.tabs.onAttached.addListener(syncCurrentWorkspace)
chrome.tabs.onDetached.addListener(syncCurrentWorkspace)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)

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

async function handleWindowOpen() {

}

async function handleWindowClose() {

}

async function syncCurrentWorkspace() {
  console.log("sync workspace");
}