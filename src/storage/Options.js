import SyncStorage from "./SyncStorage.js"

/**
* @typedef OptionsData
* @type {object}
* @property {"keep_open"|"minimize"|"close"} otherWorkspaces How to handle the current workspaces when opening a new workspace.
*/

const Key = {
    OTHER_WORKSPACES: "otherWorkspaces"
}

const defaultOptions = {
    [Key.OTHER_WORKSPACES]: "keep_open"
}

const Options = {
    Key,

    /**
     * Get options. If there is no value for given key, default value is returned.
     * @returns {Promise<OptionsData>}
     */
    async get() {
        const options = await SyncStorage.get(SyncStorage.Key.OPTIONS) ?? {}

        return { ...defaultOptions, ...options }
    },

    /**
     * Update options.
     * @param {Object.<keyof Key, any>} newValues 
     */
    async update(newValues) {
        await SyncStorage.update(SyncStorage.Key.OPTIONS, (currentValues = {}) => {
            return { ...currentValues, ...newValues }
        })
    }
}

export default Options