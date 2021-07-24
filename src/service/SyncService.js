import Workspace from "../workspace/Workspace.js";
import WorkspaceList from "../workspace/WorkspaceList.js";

const windowsToSync = new Set()
const syncPeriod = 200
let syncTimer = null

function scheduleSync(windowId) {
	windowsToSync.add(windowId)

	if (!syncTimer) {
		syncTimer = setTimeout(syncScheduled, syncPeriod)
	}
}

function cancelSync(windowId) {
	windowsToSync.delete(windowId)
}

async function syncWindow(windowId) {
	windowsToSync.delete(windowId)

	const workspaceId = await WorkspaceList.findWorkspaceForWindow(windowId)
	if (!workspaceId) return

	await Workspace.update(workspaceId)
}

async function syncScheduled() {
	const windowList = Array.from(windowsToSync)
	syncTimer = null
	windowsToSync.clear()

	await Promise.all(windowList.map(syncWindow))
}

export default { scheduleSync, cancelSync, syncWindow }