import { windowExists } from "../util/utils.js"
import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import WorkspaceTab from "../workspace/WorkspaceTab.js"

async function moveTabsToWorkspace(workspaceId) {
    const tabs = await chrome.tabs.query({ currentWindow: true, highlighted: true })
    const tabIds = tabs.map((tab) => tab.id)
    const windowId = await WorkspaceList.findWindowForWorkspace(workspaceId)

    if (windowId && await windowExists(windowId)) {
        await chrome.tabs.move(tabIds, { windowId, index: -1 })
        return
    }

    const workspace = await Workspace.get(workspaceId)
    if (!workspace) {
        console.error(`moveTabsToWorkspace: Could not find workspace with id '${workspaceId}'`)
        return
    }

    const workspaceTabs = tabs.map(WorkspaceTab.create)
    workspace.tabs = workspace.tabs.concat(workspaceTabs)
    await Workspace.save(workspace)
    
    await chrome.tabs.remove(tabIds)
}

export default { moveTabsToWorkspace }