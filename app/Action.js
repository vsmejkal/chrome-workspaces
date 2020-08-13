const Action = {
    Type: {
        OPEN_WORKSPACE: 'OPEN_WORKSPACE'
    },

    async openWorkspace(workspaceId, newWindow = false) {
        await chrome.runtime.sendMessage({
            type: Action.Type.OPEN_WORKSPACE,
            workspaceId,
            closeCurrent: !newWindow
        });
    }
}

export default Action