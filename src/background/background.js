import Workspace from "../storage/Workspace.js"
import Options from "../storage/Options.js"
import Action from "../Action.js";
import WorkspaceList from "../storage/WorkspaceList.js";

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)
window.setInterval(updateWorkspaces, 10000)

const dirtyWindows = new Set()

async function handleMessage(request, sender, sendResponse) {
	if (request.type === Action.Type.OPEN_WORKSPACE) {
		Workspace.open(request.workspaceId, request.closeCurrent)
	}

	// Always send response
	sendResponse({status: "ok"})

	return true
}

async function handleTabUpdate(tabId, changeInfo, tab) {
	dirtyWindows.add(tab.windowId)
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
	const workspaceId = await Options.get(Options.LAST_WORKSPACE_ID)
	const windowId = window.id
	const windows = await chrome.windows.getAll({windowTypes: ["normal"]})
	const isFirstWindow = windows.length === 1
	const isWorkspaceWindow = await workspaceMatchesWindow(workspaceId, windowId)

	if (isFirstWindow && isWorkspaceWindow) {
		await Workspace.assignWindow(workspaceId, windowId)
	}
}

async function handleWindowClose(windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceByWindow(windowId)
	const windows = await chrome.windows.getAll({windowTypes: ["normal"]})
	const isLastWindow = windows.length === 0

	if (workspaceId) {
		await Workspace.assignWindow(workspaceId, null)
	}

	if (isLastWindow) {
		await Options.set(Options.LAST_WORKSPACE_ID, workspaceId)
	}
}

async function handleInstall() {
	// TODO: Welcome screen
}

async function updateWorkspaces() {
	for (const windowId of dirtyWindows) {
		await Workspace.updateFromWindow(windowId)
	}

	if (dirtyWindows.size > 0) {
		console.log('SYNCED', new Date())
	}

	dirtyWindows.clear()
}

async function workspaceMatchesWindow(workspaceId, windowId) {
	const tabs = await chrome.tabs.query({windowId})
	const workspace = await Workspace.get(workspaceId)

	if (!workspace || tabs.length !== workspace.tabs.length) {
		return false
	}

	for (let i = 0; i < tabs.length; i++) {
		if (tabs[i].url !== workspace.tabs[i].url) {
			return false
		}
	}

	return true
}