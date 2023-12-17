import Config from "../storage/Config.js"
import Options from "../storage/Options.js"
import { windowExists } from "../util/utils.js"
import Workspace from "../workspace/Workspace.js"
import WorkspaceList from "../workspace/WorkspaceList.js"
import TabSuspendService from "./TabSuspendService.js"

/**
 * Open a workspace.
 * @param {string} workspaceId
 */
async function open(workspaceId) {
    const workspaceWindowId = await Workspace.getWindowId(workspaceId)
    const workspaceWindowExist = await windowExists(workspaceWindowId)
    const currentWindow = await chrome.windows.getLastFocused({ windowTypes: ["normal"] })
    const currentWorkspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindow.id)

    try {
        await Config.set(Config.Key.OPENING_WORKSPACE, true)
        
        if (workspaceWindowExist) {
            await focusWorkspace(workspaceWindowId)
        } else {
            await openWorkspace(workspaceId, currentWindow)
        }

        await Workspace.activate(workspaceId)

        if (currentWorkspaceId && currentWorkspaceId !== workspaceId) {
            await handleOldWindow(currentWindow)
        }
    } finally {
        await Config.set(Config.Key.OPENING_WORKSPACE, false)
    }
}

async function focusWorkspace(windowId) {
    await chrome.windows.update(windowId, { focused: true })
}

async function openWorkspace(workspaceId, currentWindow) {
    const workspace = await Workspace.get(workspaceId)
    const newWindow = await createNewWindow(workspace, currentWindow)

    await WorkspaceList.update(workspace.id, newWindow.id)
}

async function createNewWindow(workspace, currentWindow) {
    const createArgs = {
        url: workspace.tabs.map(tab => tab.url),
        focused: true,
    }

    if (currentWindow) {
        if (["maximized", "fullscreen"].includes(currentWindow.state)) {
            createArgs.state = currentWindow.state
        } else {
            createArgs.left = currentWindow.left
            createArgs.top = currentWindow.top
            createArgs.width = currentWindow.width
            createArgs.height = currentWindow.height
        }
    }

    const window = await chrome.windows.create(createArgs)

    updateWindowTabs(workspace, window)

    return window
}

function updateWindowTabs(workspace, window) {
    workspace.tabs.forEach(({ url, active = false, pinned = false}, index) => {
        const tabId = window.tabs[index].id

        if (url.startsWith("http")) {
            TabSuspendService.scheduleSuspend(tabId)
        }

        if (active || pinned) {
            chrome.tabs.update(tabId, { active, pinned })
        }
    })
}

async function handleOldWindow(window) {
    const { otherWorkspaces } = await Options.get()

    if (otherWorkspaces === "minimize") {
        await chrome.windows.update(window.id, { state: "minimized" })
    } else if (otherWorkspaces === "close") {
        await chrome.windows.remove(window.id)
    }
}

export default { open }
