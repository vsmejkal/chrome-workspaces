const Action = {
    Type: {
        OPEN_WORKSPACE: 'OPEN_WORKSPACE'
    },

    async openWorkspace(workspaceId) {
        await chrome.runtime.sendMessage({
            type: Action.Type.OPEN_WORKSPACE,
            workspaceId
        });
    }
}

export default Action