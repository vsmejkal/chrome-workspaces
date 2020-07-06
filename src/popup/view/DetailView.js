import View from "./View.js"
import Workspace from "../../data/Workspace.js"

class DetailView extends View {
    constructor({ saveItem, deleteItem }) {
        super("#view-detail")

        this._saveItem = saveItem
        this._deleteItem = deleteItem

        this._heading = this.getElement("h1");
        this._nameField = this.getElement("#workspace-name")
        this._removeButton = this.getElement("#workspace-remove")
        this._saveButton = this.getElement("#workspace-save")
    }

    async render({ workspaceId }) {
        const itemExists = Boolean(workspaceId)
        const workspace = await Workspace.get(workspaceId)

        this._heading.innerText = itemExists ? "Edit Workspace" : "New Workspace"

        this._nameField.value = itemExists ? workspace.name : ""
        this._nameField.onkeypress = (e) => {
            if (e.key === "Enter") {
                this._saveButton.click()
            }
        }

        this._removeButton.style.display = itemExists ? "block" : "none"
        this._removeButton.onclick = () => this._deleteItem({ workspaceId })

        this._saveButton.innerText = itemExists ? "Done" : "Add"
        this._saveButton.onclick = () => this._validate() && this._saveItem({
            workspaceId: workspaceId,
            name: this._nameField.value
        })

        this._nameField.focus()
    }

    _validate() {
        if (this._nameField.value.length === 0) {
            this._nameField.focus()
            return false
        }

        return true
    }
}

export default DetailView