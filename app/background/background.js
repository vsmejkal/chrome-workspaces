import Workspace from "../model/Workspace.js"
import Options from "../model/Options.js"
import Action from "../Action.js"
import WorkspaceList from "../model/WorkspaceList.js"

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onActivated.addListener(handleTabActivate)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)
window.setInterval(updateWorkspaces, 5000)

const WindowType = chrome.windows.WindowType
const dirtyWindows = new Set()
let openingWorkspace = false

async function handleMessage(request, sender, sendResponse) {
	// Always send response
	sendResponse({status: "ok"})

	if (request.type === Action.Type.OPEN_WORKSPACE) {
		openingWorkspace = true
		await Workspace.open(request.workspaceId, request.closeCurrent)
		openingWorkspace = false
	}

	return true
}

async function handleTabActivate({windowId}) {
	if (!openingWorkspace) {
		dirtyWindows.add(windowId)
	}
}

async function handleTabUpdate(tabId, changeInfo, tab) {
	if (!openingWorkspace) {
		dirtyWindows.add(tab.windowId)
	}
}

async function handleTabRemove(tabId, {windowId, isWindowClosing}) {
	if (isWindowClosing) {
		dirtyWindows.delete(windowId)
	} else {
		dirtyWindows.add(windowId)
	}
}

async function handleTabAttach(tabId, {newWindowId}) {
	dirtyWindows.add(newWindowId)
}

async function handleTabDetach(tabId, {oldWindowId}) {
	dirtyWindows.add(oldWindowId)
}

async function handleWindowOpen(window) {
	if (openingWorkspace || window.type !== WindowType.NORMAL) {
		return
	}

	const windowId = window.id
	const lastWorkspaceId = await Options.get(Options.LAST_WORKSPACE_ID)

	if (lastWorkspaceId && await workspaceMatchesWindow(lastWorkspaceId, windowId)) {
		await WorkspaceList.update(lastWorkspaceId, windowId)
	}
}

async function handleWindowClose(windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (workspaceId) {
		await WorkspaceList.update(workspaceId, null)
	}

	await Options.set(Options.LAST_WORKSPACE_ID, workspaceId)
}

async function handleInstall() {
	// TODO: Welcome screen & support
}

async function updateWorkspaces() {
	for (const windowId of dirtyWindows) {
		await Workspace.updateFromWindow(windowId)
	}

	if (dirtyWindows.size > 0) {
		console.debug('TABS SYNCED', new Date())
	}

	dirtyWindows.clear()
}

async function workspaceMatchesWindow(workspaceId, windowId) {
	const windowTabs = await chrome.tabs.query({ windowId })
	const windowUrls = new Set(windowTabs.map(tab => tab.url))

	const workspaceTabs = (await Workspace.get(workspaceId))?.tabs ?? []
	const matchedUrls = workspaceTabs.filter(tab => windowUrls.has(tab.url))

	return matchedUrls.length > 0 && windowTabs.length - matchedUrls.length <= 1
}