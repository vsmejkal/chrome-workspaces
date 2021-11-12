import View from "./View.js"
import Workspace from "../../workspace/Workspace.js"

class RemoveView extends View {
	constructor({ onRemove, onCancel }) {
		super("#view-remove")

		this._onCancel = onCancel
		this._onRemove = onRemove
		this._description = this.getElement(".description")
	}

	async render({ workspaceId }) {
		const workspace = await Workspace.get(workspaceId)
		const windowId = await Workspace.getWindowId(workspaceId)

		const workspaceNameElement = this.getElement(".workspace-name")
		workspaceNameElement.innerText = workspace.name

		if (windowId) {
			this._description.innerText = "The browser window remains open."
		} else {
			const tabCount = workspace.tabs.length
			this._description.innerText = `${tabCount} saved ${tabCount === 1 ? "tab" : "tabs"} will be lost.`
		}

		const cancelButton = this.getElement(".cancel-button")
		cancelButton.onclick = () => this._onCancel({ workspaceId });

		const removeButton = this.getElement(".remove-button")
		removeButton.onclick = () => this._onRemove({ workspaceId })
		removeButton.focus()
	}
}

export default RemoveView