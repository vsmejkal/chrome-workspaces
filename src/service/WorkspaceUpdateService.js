import Workspace from "../workspace/Workspace.js";

const windowsToSync = new Set()
const refreshPeriod = 200 // ms
let refreshTimer = null

function scheduleUpdate(windowId) {
	windowsToSync.add(windowId)

	if (!refreshTimer) {
		refreshTimer = setTimeout(updateScheduled, refreshPeriod)
	}
}

function cancelUpdate(windowId) {
	windowsToSync.delete(windowId)
}

async function updateScheduled() {
	const windowList = Array.from(windowsToSync)
	refreshTimer = null
	windowsToSync.clear()

	await Promise.all(windowList.map(update))
}

async function update(windowId) {
	windowsToSync.delete(windowId)

	await Workspace.sync(windowId)
}

export default { scheduleUpdate, cancelUpdate, update }