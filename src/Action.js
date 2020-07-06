const Action = {
    async openWorkspace(workspaceId, closeCurrent = true) {
        await chrome.runtime.sendMessage({
            type: "OPEN_WORKSPACE",
            workspaceId,
            closeCurrent
        });
    }
}

export default Action