import Workspace from "../model/Workspace.js"
import Options from "../model/Options.js"
import Action from "../Action.js"
import WorkspaceList from "../model/WorkspaceList.js"
import WindowSync from "../WindowSync.js"

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onActivated.addListener(handleTabActivate)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)

const WindowType = chrome.windows.WindowType
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
		WindowSync.schedule(windowId)
	}
}

async function handleTabUpdate(tabId, changeInfo, tab) {
	if (!openingWorkspace && changeInfo.url) {
		WindowSync.schedule(tab.windowId)
	}
}

async function handleTabRemove(tabId, {windowId, isWindowClosing}) {
	if (isWindowClosing) {
		WindowSync.unschedule(windowId)
	} else {
		WindowSync.schedule(windowId)
	}
}

async function handleTabAttach(tabId, {newWindowId}) {
	WindowSync.schedule(newWindowId)
}

async function handleTabDetach(tabId, {oldWindowId}) {
	WindowSync.schedule(oldWindowId)
}

async function handleWindowOpen(window) {
	if (openingWorkspace || window.type !== WindowType.NORMAL) {
		return
	}

	const windowId = window.id
	const lastWorkspaceId = await Options.get(Options.LAST_WORKSPACE_ID)
	const allWindows = await chrome.windows.getAll({windowTypes: [WindowType.NORMAL]})

	// Chrome opened -> clear old workspace-window mapping
	if (allWindows.length === 1) {
		await WorkspaceList.clearWindowIds()
	}

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


async function workspaceMatchesWindow(workspaceId, windowId) {
	const windowTabs = await chrome.tabs.query({ windowId })
	const windowUrls = new Set(windowTabs.map(tab => tab.url))

	const workspaceTabs = (await Workspace.get(workspaceId))?.tabs ?? []
	const matchedUrls = workspaceTabs.filter(tab => windowUrls.has(tab.url))

	const totalTabs = windowTabs.length
	const totalMatches = matchedUrls.length

	return totalMatches > 0 && (totalTabs - totalMatches <= 1 || totalMatches / totalTabs > 0.75)
}