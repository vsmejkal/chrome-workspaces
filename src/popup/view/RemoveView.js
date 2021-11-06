import View from "./View.js"
import Workspace from "../../workspace/Workspace.js"

class RemoveView extends View {
	constructor({ onRemove, onCancel }) {
		super("#view-remove")

		this._onCancel = onCancel
		this._onRemove = onRemove
	}

	async render({ workspaceId }) {
		const workspace = await Workspace.get(workspaceId)

		const workspaceNameElement = this.getElement(".workspace-name")
		workspaceNameElement.innerText = workspace.name

		const tabCountElement = this.getElement(".workspace-tab-count")
		const tabCount = workspace.tabs.length
		tabCountElement.innerHTML = `${tabCount}&nbsp;${tabCount === 1 ? "tab" : "tabs"}`

		const cancelButton = this.getElement(".cancel-button")
		cancelButton.onclick = () => this._onCancel({ workspaceId });

		const removeButton = this.getElement(".remove-button")
		removeButton.onclick = () => this._onRemove({ workspaceId })
		removeButton.focus()
	}
}

export default RemoveView