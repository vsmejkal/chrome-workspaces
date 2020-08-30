import Workspace from "./model/Workspace.js";

const windowsToSync = new Set()
const delay = 2000
let timer = null

function schedule(windowId) {
	windowsToSync.add(windowId)
	timer = timer ?? setTimeout(performSync, delay)
}

function unschedule(windowId) {
	windowsToSync.delete(windowId)
}

async function performSync() {
	for (const windowId of windowsToSync) {
		await Workspace.updateFromWindow(windowId)
	}

	if (windowsToSync.size > 0) {
		console.debug('TABS SYNCED', new Date())
	}

	windowsToSync.clear()
	timer = null
}

export default { schedule, unschedule }