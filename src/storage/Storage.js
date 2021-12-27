import { assert } from "../util/assert.js";
import AtomicLock from "../util/AtomicLock.js";

const updateLock = AtomicLock()

const Key = {
	CONFIG: "config",
	WORKSPACE_LIST: "workspaceList",
	WORKSPACE_PREFIX: "workspace_",
}

const Storage = {
	Key,

	async get(key) {
		if (!key) return null
		const data = await chrome.storage.local.get(key)

		return data[key] ?? null
	},

	async getAll(keys) {
		const data = await chrome.storage.local.get(keys)

		return keys.map(key => data[key] ?? null)
	},

	async set(key, value) {
		assert(key)
		await chrome.storage.local.set({[key]: value})
	},

	async update(key, updater) {
		await updateLock(async () => {
			const value = await this.get(key)
			const newValue = await updater(value)
			await this.set(key, newValue)
		})
	},

	async remove(key) {
		await chrome.storage.local.remove(key)
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

chrome.storage.onChanged.addListener(function (changes) {
	for (let key in changes) {
		Storage.onChange.notify(key, changes[key].newValue)
	}
})

export default Storage