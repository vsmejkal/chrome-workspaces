import "./importLibraries.js"
import Workspace from "../workspace/Workspace.js"
import Config from "../storage/Config.js"
import Action from "../Action.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import WorkspaceUpdateService from "../service/WorkspaceUpdateService.js"
import MigrationService from "../service/MigrationService.js"
import WorkspaceOpenService from "../service/WorkspaceOpenService.js"

const { WindowType } = chrome.windows

chrome.runtime.onMessage.addListener(handleMessage)
chrome.runtime.onInstalled.addListener(handleInstall)
chrome.runtime.onStartup.addListener(handleStartup)
chrome.tabs.onActivated.addListener(handleTabActivate)
chrome.tabs.onCreated.addListener(handleTabCreate)
chrome.tabs.onMoved.addListener(handleTabMove)
chrome.tabs.onRemoved.addListener(handleTabRemove)
chrome.tabs.onUpdated.addListener(handleTabUpdate)
chrome.tabs.onAttached.addListener(handleTabAttach)
chrome.tabs.onDetached.addListener(handleTabDetach)
chrome.tabGroups.onCreated.addListener(handleTabGroupCreate)
chrome.tabGroups.onUpdated.addListener(handleTabGroupUpdate)
chrome.windows.onCreated.addListener(handleWindowOpen)
chrome.windows.onRemoved.addListener(handleWindowClose)


async function handleMessage(request, sender, sendResponse) {
	// Always send response
	sendResponse({ status: "ok" })

	if (request.type === Action.Type.OPEN_WORKSPACE) {
		await WorkspaceOpenService.open(request.workspaceId)
	}

	return true
}

async function handleStartup() {
	await WorkspaceList.initialize()
}

async function handleTabActivate({ windowId }) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)

	if (!openingWorkspace) {
		WorkspaceUpdateService.scheduleUpdate(windowId)
	}
}

async function handleTabCreate(tab) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	await addTabToGroup(tab.id, tab.windowId);
}

async function handleTabMove(tabId, { windowId }) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	await WorkspaceUpdateService.update(windowId)
}

async function handleTabRemove(tabId, { windowId, isWindowClosing }) {
	if (isWindowClosing) {
		WorkspaceUpdateService.cancelUpdate(windowId)
	} else {
		await WorkspaceUpdateService.update(windowId)
	}
}

async function handleTabUpdate(tabId, changeInfo, tab) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	if ("url" in changeInfo || "pinned" in changeInfo) {
		WorkspaceUpdateService.scheduleUpdate(tab.windowId)
	}

	if (changeInfo.pinned === false) {
		await addTabToGroup(tabId, tab.windowId)
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

	const workspaceGroupId = await Workspace.getGroupId(workspaceId)
	if (!workspaceGroupId) return

	if (workspaceGroupId !== group.id) {
		// We do not allow other tab groups inside workspace
		const tabs = await chrome.tabs.query({ groupId: group.id })

		if (tabs.length > 0) {
			await chrome.tabs.group({
				groupId: workspaceGroupId,
				tabIds: tabs.map((tab) => tab.id)
			})
		}
	}
}

async function handleTabGroupUpdate(group) {
	const openingWorkspace = await Config.get(Config.Key.OPENING_WORKSPACE)
	if (openingWorkspace) return

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(group.windowId)
	if (!workspaceId) return

	const workspaceGroupId = await Workspace.getGroupId(workspaceId)
	if (workspaceGroupId !== group.id) return;

	const workspace = await Workspace.get(workspaceId)
	if (!workspace) return;

	if (!group.title) {
		// Group title is empty -> reset with the workspace name
		await Workspace.activate(workspaceId)
		return
	}

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

	const workspaceId = await findMatchingWorkspace(window)
	if (workspaceId) {
		await WorkspaceList.update(workspaceId, window.id)
	}
}

async function handleWindowClose(windowId) {
	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (workspaceId) {
		await Config.set(Config.Key.LAST_WORKSPACE_ID, workspaceId)
		await WorkspaceList.update(workspaceId, null)
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

	if (groupId) {
		await chrome.tabs.group({ groupId, tabIds: tabId })
	} else {
		await Workspace.activate(workspaceId)
	}
}

async function findMatchingWorkspace(window) {
	const tabGroups = await chrome.tabGroups.query({ windowId: window.id })
	if (tabGroups.length !== 1) return

	const { title, color } = tabGroups[0]
	let workspaceIds = await WorkspaceList.getWorkspaceIds()
	
	const lastWorkspaceId = await Config.get(Config.Key.LAST_WORKSPACE_ID)
	if (workspaceIds.includes(lastWorkspaceId)) {
		// Search optimization
		workspaceIds = [...new Set([lastWorkspaceId, ...workspaceIds])]
	}

	for (const workspaceId of workspaceIds) {
		const workspace = await Workspace.get(workspaceId)
		if (workspace && workspace.name === title && workspace.color === color) {
			return workspace.id
		}
	}
}