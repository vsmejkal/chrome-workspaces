import Storage from "./Storage.js"

const Key = {
    LAST_WORKSPACE_ID: "lastWorkspaceId",
    OPENING_WORKSPACE: "openingWorkspace",
}

const DefaultValue = {
    [Key.OPENING_WORKSPACE]: false
}

const Config = {
    Key,

    async get(key) {
        const config = await Storage.get(Storage.Key.CONFIG) ?? {}
        return config[key] ?? DefaultValue[key] ?? null
    },

    async set(key, value) {
        const config = await Storage.get(Storage.Key.CONFIG) ?? {}
        config[key] = value
        await Storage.set(Storage.Key.CONFIG, config)
    }
}

export default Config
