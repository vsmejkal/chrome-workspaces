import { assert } from "../util/assert.js";
import AtomicLock from "../util/AtomicLock.js";

const updateLock = AtomicLock()

const Key = {
	OPTIONS: "options",
}

const SyncStorage = {
	Key,

	async get(key) {
		if (!key) return null
		const data = await chrome.storage.sync.get(key)

		return data[key] ?? null
	},

	async set(key, value) {
		assert(key)
		await chrome.storage.sync.set({[key]: value})
	},

	async update(key, updater) {
		await updateLock(async () => {
			const value = await this.get(key)
			const newValue = await updater(value)
			await this.set(key, newValue)
		})
	},
}

export default SyncStorage