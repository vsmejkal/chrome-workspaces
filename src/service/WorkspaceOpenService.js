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
    const windowId = await Workspace.getWindowId(workspaceId)
    const windowExist = await windowExists(windowId)
    const currentWindow = await getCurrentWorkspaceWindow()

    try {
        await Config.set(Config.Key.OPENING_WORKSPACE, true)
        
        if (windowExist) {
            await focusWorkspace(windowId, currentWindow)
        } else {
            await openWorkspace(workspaceId, currentWindow)
        }

        await Workspace.activate(workspaceId)

        if (currentWindow && currentWindow.id !== windowId) {
            await handleOldWindow(currentWindow)
        }
    } finally {
        await Config.set(Config.Key.OPENING_WORKSPACE, false)
    }
}

async function focusWorkspace(windowId, currentWindow) {
    const updateArgs = { focused: true }

    if (["maximized", "fullscreen"].includes(currentWindow?.state)) {
        updateArgs.state = currentWindow.state
    }
    
    await chrome.windows.update(windowId, updateArgs)
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

async function getCurrentWorkspaceWindow() {
    const currentWindow = await chrome.windows.getLastFocused({
        windowTypes: ["normal"],
    })
    const workspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindow.id)
    
    return workspaceId ? currentWindow : null
}

export default { open }
