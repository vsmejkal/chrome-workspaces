import SyncStorage from "./SyncStorage.js"

/**
* @typedef OptionsData
* @type {object}
* @property {"top" | "bottom"} addPosition Add new items to the top or to the bottom.
* @property {"keep_open" | "minimize" | "close"} otherWorkspaces How to handle the current workspaces when opening a new workspace.
* @property {"manual" | "name"} sorting Workspace list sorting.
*/

const Key = {
    ADD_POSITION: "addPosition",
    SORTING: "sorting",
    OTHER_WORKSPACES: "otherWorkspaces"
}

const defaultOptions = {
    [Key.ADD_POSITION]: "bottom",
    [Key.SORTING]: "manual",
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