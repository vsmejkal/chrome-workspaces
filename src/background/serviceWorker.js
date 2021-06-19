import "./importLibraries.js"
import Workspace from "../workspace/Workspace.js"
import Config from "../storage/Config.js"
import Action from "../Action.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import SyncService from "../service/SyncService.js"
import MigrationService from "../service/MigrationService.js";

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onActivated.addListener(handleTabActivate)
chrome.tabs.onCreated.addListener(handleTabCreate)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.tabGroups.onUpdated.addListener(handleTabGroupUpdate)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)


const WindowType = chrome.windows.WindowType

async function handleMessage(request, sender, sendResponse) {
	// Always send response
	sendResponse({status: "ok"})

	if (request.type === Action.Type.OPEN_WORKSPACE) {
		await Config.set(Config.Key.OPENING_WORKSPACE, true)
		await Workspace.open(request.workspaceId)
		await Config.set(Config.Key.OPENING_WORKSPACE, false)
	}

	return true
}

async function handleTabActivate({ windowId }) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (!openingWorkspace) {
		SyncService.scheduleSync(windowId)
	}
}

async function handleTabCreate(tab) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (!openingWorkspace) {
		await addTabToGroup(tab.id, tab.windowId);
	}
}

async function handleTabUpdate(tabId, changeInfo, tab) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (!openingWorkspace && changeInfo.url) {
		SyncService.scheduleSync(tab.windowId)
	}
}

async function handleTabRemove(tabId, {windowId, isWindowClosing}) {
	if (isWindowClosing) {
		SyncService.cancelSync(windowId)
	} else {
		SyncService.doSync(windowId)
	}
}

async function handleTabAttach(tabId, {newWindowId}) {
	await addTabToGroup(tabId, newWindowId)

	SyncService.scheduleSync(newWindowId)
}

async function handleTabDetach(tabId, {oldWindowId}) {
	SyncService.scheduleSync(oldWindowId)
}

async function handleTabGroupUpdate(tabGroup) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return
	console.log("handleTabGroupUpdate", tabGroup.id, tabGroup.title, tabGroup.color)

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(tabGroup.windowId)
	if (!workspaceId) return

	const workspace = await Workspace.get(workspaceId)
	workspace.name = tabGroup.title
	workspace.color = tabGroup.color
	await Workspace.save(workspace)
}

async function handleWindowOpen(window) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (openingWorkspace || window.type !== WindowType.NORMAL) {
		return
	}

	const windowId = window.id
	const lastWorkspaceId = await Config.get(Config.Key.LAST_WORKSPACE_ID)
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

	await Config.set(Config.Key.LAST_WORKSPACE_ID, workspaceId)
}

async function handleInstall({ reason, previousVersion }) {
	if (reason === "update") {
		await MigrationService.migrate({
			previousVersion: previousVersion
		})
	}

	if (reason === "install") {
		// TODO: Welcome screen & support
	}
}

async function addTabToGroup(tabId, windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (!workspaceId) return

	const groupsInWindow = await chrome.tabGroups.query({ windowId })
	const firstGroup = groupsInWindow?.[0]
	if (!firstGroup) return

	await chrome.tabs.group({ groupId: firstGroup.id, tabIds: tabId })
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
