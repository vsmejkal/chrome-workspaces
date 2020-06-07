const Storage = {
  OPEN_TABS: "openTabs",
  OPEN_WORKSPACES: "openWorkspaces",
  OPTIONS: "options",
  WORKSPACES: "workspaces",
  WORKSPACE_PREFIX: "workspace",
  TAB_PREFIX: "tab",

  async get(key) {
    const data = await chrome.storage.local.get(key)

    return data[key] ?? null
  },

  async getAll(keys) {
    const data = await chrome.storage.local.get(keys)

    return keys.map(key => data[key] ?? null)
  },

  async set(key, value) {
    await chrome.storage.local.set({ [key]: value })
  },

  async setAll(items) {
    await chrome.storage.local.set(items)
  },

  async update(key, updater) {
    const value = await this.get(key)

    await this.set(key, updater(value))
  },

  async remove(key) {
    await chrome.storage.local.remove(key)
  },

  async sync() {

  },

  onChange: {
    _observers: [],

    subscribe(observer) {
      this._observers.push(observer)
    },

    notify(key, value) {
      this._observers.forEach(observer => observer(key, value))
    }
  }
}

chrome.storage.onChanged.addListener(function(changes) {
  for (let key in changes) {
    Storage.onChange.notify(key, changes[key].newValue)
  }
})

export default Storage