import Config from "../storage/Config.js"
import WorkspaceList from "../workspace/WorkspaceList.js"

/**
 * Check that extension has permission to open local files. If not, show a popup with instructions how to enable it.
 * 
 * @param {chrome.tabs.Tab} tab Chrome tab
 */
export async function checkLocalFileAccess(tab) {
    if (tab.url?.startsWith("file://")) {
        const hasFilePermission = await chrome.extension.isAllowedFileSchemeAccess()
        const workspaceId = await WorkspaceList.findWorkspaceForWindow(tab.windowId)
        const popupDismissed = await Config.get(Config.Key.FILE_ACCESS_POPUP_DISMISSED)

        if (workspaceId && !hasFilePermission && !popupDismissed) {
            chrome.windows.create({
                url: chrome.runtime.getURL("src/pages/file-access/file-access.html"),
                type: "popup",
                focused: true,
                width: 450,
                height: 300,
            })
        }
    }
}

export default { checkLocalFileAccess }
