import Storage from "./Storage.js"

const Key = {
    LAST_WORKSPACE_ID: "lastWorkspaceId",
    OPENING_WORKSPACE: "openingWorkspace",
}

const defaultValue = {
    [Key.OPENING_WORKSPACE]: false
}

const Config = {
    Key,

    async get(key) {
        const config = await Storage.get(Storage.Key.CONFIG) ?? {}
        if (key in config) {
            return config[key]
        } else {
            return defaultValue[key] ?? null
        }
    },

    async set(key, value) {
        await Storage.update(Storage.Key.CONFIG, (config = {}) => {
            config[key] = value
            return config
        })
    }
}

export default Config
