import "./importLibraries.js"
import Workspace from "../workspace/Workspace.js"
import Config from "../storage/Config.js"
import Action from "../Action.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import WorkspaceUpdateService from "../service/WorkspaceUpdateService.js"
import MigrationService from "../service/MigrationService.js";

const { WindowType, WINDOW_ID_NONE } = chrome.windows

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.tabs.onActivated.addListener(handleTabActivate)
chrome.tabs.onCreated.addListener(handleTabCreate)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.tabGroups.onCreated.addListener(handleTabGroupCreate)
chrome.tabGroups.onUpdated.addListener(handleTabGroupUpdate)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)
chrome.windows.onFocusChanged.addListener(handleWindowFocus, { windowTypes: [WindowType.NORMAL] })


async function handleMessage(request, sender, sendResponse) {
	// Always send response
	sendResponse({status: "ok"})

	if (request.type === Action.Type.OPEN_WORKSPACE) {
		await Workspace.open(request.workspaceId)
	}

	return true
}

async function handleTabActivate({ windowId }) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (!openingWorkspace) {
		WorkspaceUpdateService.scheduleUpdate(windowId)
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
		WorkspaceUpdateService.scheduleUpdate(tab.windowId)
	}
}

async function handleTabRemove(tabId, { windowId, isWindowClosing }) {
	if (isWindowClosing) {
		WorkspaceUpdateService.cancelUpdate(windowId)
	} else {
		await WorkspaceUpdateService.update(windowId)
	}
}

async function handleTabAttach(tabId, attachInfo) {
	for (let attempt = 0; attempt < 10; attempt++) {
		try {
			await addTabToGroup(tabId, attachInfo.newWindowId)
			break
		} catch {
			// Tab cannot be edited while user is dragging it
			await new Promise((resolve) => setTimeout(resolve, 500))
		}
	}
	
	WorkspaceUpdateService.scheduleUpdate(attachInfo.newWindowId)
}

async function handleTabDetach(tabId, { oldWindowId }) {
	WorkspaceUpdateService.scheduleUpdate(oldWindowId)
}

async function handleTabGroupCreate(group) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(group.windowId)
	if (!workspaceId) return

	const groups = await chrome.tabGroups.query({ windowId: group.windowId })
	if (groups.length > 1) {
		// Destroy custom tab groups inside workspace
		await Workspace.activate(workspaceId)
	}
}

async function handleTabGroupUpdate(group) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(group.windowId)
	if (!workspaceId) return

	const workspace = await Workspace.get(workspaceId)
	if (!workspace) return;

	const groups = await chrome.tabGroups.query({ windowId: group.windowId })
	if (groups.length > 1) return;

	if (workspace.name !== group.title || workspace.color !== group.color) {
		workspace.name = group.title
		workspace.color = group.color
		await Workspace.save(workspace)
	}
}

async function handleWindowOpen(window) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (openingWorkspace || window.type !== WindowType.NORMAL) {
		return
	}

	const allWindows = await chrome.windows.getAll({
		windowTypes: [WindowType.NORMAL]
	})

	if (allWindows.length === 1) {
		await WorkspaceList.clearWindowMapping()
	}

	const lastWorkspaceId = await Config.get(Config.Key.LAST_WORKSPACE_ID)
	if (!lastWorkspaceId) return

	const lastWorkspace = await Workspace.get(lastWorkspaceId)
	if (!lastWorkspace) return

	const tabGroups = await chrome.tabGroups.query({ windowId: window.id })

	if (tabGroups.length === 1 && tabGroups[0].color === lastWorkspace.color && tabGroups[0].title === lastWorkspace.name) {
		await WorkspaceList.update(lastWorkspaceId, window.id)
	}
}

async function handleWindowClose(windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (workspaceId) {
		await WorkspaceList.update(workspaceId, null)
	}
}

async function handleWindowFocus(windowId) {
	if (windowId === WINDOW_ID_NONE) return

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (workspaceId) {
		await Config.set(Config.Key.LAST_WORKSPACE_ID, workspaceId)
	}
}

async function handleInstall({ reason, previousVersion }) {
	if (reason === "update") {
		await MigrationService.migrate({
			previousVersion: previousVersion
		})
	}

	if (reason === "install") {
		// TODO: Onboarding page & support
	}
}

async function addTabToGroup(tabId, windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (!workspaceId) return

	const groupId = await Workspace.getGroupId(workspaceId)
	if (!groupId) return

	await chrome.tabs.group({ groupId, tabIds: tabId })
}
