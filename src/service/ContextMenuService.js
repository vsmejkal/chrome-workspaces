import AtomicLock from "../util/AtomicLock.js"
import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import TabMoveService from "./TabMoveService.js"

const MoveToWorkspaceItemId = "move_to_workspace"
const MoveToWorkspaceLabel_SingleTab = "Move tab to workspace"
const MoveToWorkspaceLabel_ManyTabs = "Move selected tabs to workspace"

async function initialize() {
    chrome.contextMenus.onClicked.addListener(handleAction)
    chrome.runtime.onInstalled.addListener(createMenuItems)
    chrome.tabs.onHighlighted.addListener(handleTabSelect)

    WorkspaceList.onUpdate.subscribe(updateAll)
    Workspace.onUpdate.subscribe(updateItem)
}

const updateAllLock = AtomicLock()

async function updateAll() {
    await updateAllLock(async () => {
        await chrome.contextMenus.removeAll()
        await createMenuItems()
    })
}

async function updateItem(workspaceId) {
    const workspace = await Workspace.get(workspaceId)

    if (workspace) {
        await chrome.contextMenus.update(workspaceId, { title: workspace.name })
    }
}

async function createMenuItems() {
    const workspaces = await WorkspaceList.getWorkspaces()

    if (workspaces.length === 0) {
        return
    }

    try {
        await chrome.contextMenus.create({
            id: MoveToWorkspaceItemId,
            title: MoveToWorkspaceLabel_SingleTab,
            contexts: ["all"],
        })
    } catch (e) {
        // In case menu item already exists
        console.error(e);
    }

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

async function handleAction({ menuItemId }) {
    if (menuItemId !== MoveToWorkspaceItemId) {
        await TabMoveService.moveTabsToWorkspace(menuItemId)
    }
}

export default { initialize }
