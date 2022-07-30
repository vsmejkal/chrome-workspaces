const Action = {
    Type: {
        OPEN_WORKSPACE: "OPEN_WORKSPACE",
        NOTIFY_OBSERVERS: "NOTIFY_OBSERVERS",
    },

    async openWorkspace(workspaceId) {
        await chrome.runtime.sendMessage({
            type: Action.Type.OPEN_WORKSPACE,
            workspaceId,
        })
    },

    async notifyBackgroundObservers(eventName, args) {
        await chrome.runtime.sendMessage({
            type: Action.Type.NOTIFY_OBSERVERS,
            eventName,
            args,
        })
    }
}

export default Action