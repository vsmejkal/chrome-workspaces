import Workspace from "../workspace/Workspace.js";

const windowsToSync = new Set()
const delay = 500
let timer = null

function scheduleSync(windowId) {
	windowsToSync.add(windowId)
	timer = timer ?? setTimeout(performSync, delay)
}

function cancelSync(windowId) {
	windowsToSync.delete(windowId)
}

function doSync(windowId) {
	windowsToSync.delete(windowId)
	Workspace.updateFromWindow(windowId).then()
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

export default { scheduleSync, cancelSync, doSync }