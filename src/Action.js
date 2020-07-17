const Action = {
    async openWorkspace(workspaceId, newWindow = false) {
        await chrome.runtime.sendMessage({
            type: "OPEN_WORKSPACE",
            workspaceId,
            closeCurrent: !newWindow
        });
    }
}

export default Action