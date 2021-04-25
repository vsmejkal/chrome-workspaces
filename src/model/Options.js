import Storage from "./Storage.js"

const Options = {
    LAST_WORKSPACE_ID: "lastWorkspaceId",

    async get(key) {
        const options = await Storage.get(Storage.OPTIONS) ?? {}

        return options[key] ?? null
    },

    async set(key, value) {
        const options = await Storage.get(Storage.OPTIONS) ?? {}
        options[key] = value

        await Storage.set(Storage.OPTIONS, options)
    }
}

export default Options
