import WorkspaceList from "../workspace/WorkspaceList.js"
import TabMoveService from "./TabMoveService.js"

const MoveToWorkspaceItemId = "move_to_workspace"
const MoveToWorkspaceLabel_SingleTab = "Move tab to workspace"
const MoveToWorkspaceLabel_ManyTabs = "Move selected tabs to workspace"

async function initialize() {
    chrome.contextMenus.onClicked.addListener(handleAction)
    chrome.runtime.onInstalled.addListener(createMenuItems)
    chrome.tabs.onHighlighted.addListener(handleTabSelect)
}

async function update(workspaceId) {
    await chrome.contextMenus.removeAll()
    await createMenuItems()
}

async function createMenuItems() {
    const workspaces = await WorkspaceList.getWorkspaces()

    await chrome.contextMenus.create({
		id: MoveToWorkspaceItemId,
		title: MoveToWorkspaceLabel_SingleTab,
        contexts: ["all"],
	})

    for (const workspace of workspaces) {
        await chrome.contextMenus.create({
            id: workspace.id,
            title: workspace.name,
            parentId: MoveToWorkspaceItemId,
            contexts: ["all"],
        })
    }
}

async function handleTabSelect({ tabIds }) {
    const title = tabIds.length > 1 ? MoveToWorkspaceLabel_ManyTabs : MoveToWorkspaceLabel_SingleTab

    await chrome.contextMenus.update(MoveToWorkspaceItemId, { title })
}

async function handleAction({ menuItemId: workspaceId }) {
    await TabMoveService.moveTabsToWorkspace(workspaceId)
}

export default { initialize, update }
