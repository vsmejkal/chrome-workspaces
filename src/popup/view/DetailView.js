import View from "./View.js"
import Workspace from "../../workspace/Workspace.js"
import WorkspaceColor from "../../workspace/WorkspaceColor.js"

class DetailView extends View {
    constructor({ onSave, onRemove }) {
        super("#view-detail")

        this._onSave = onSave
        this._onRemove = onRemove

        this._heading = this.getElement("h1")
        this._nameField = this.getElement(".workspace-name")
        this._colorPicker = this.getElement(".color-picker")
        this._removeButton = this.getElement(".remove-button")
        this._saveButton = this.getElement(".save-button")
    }

    async render({ workspaceId }) {
        const workspace = await Workspace.get(workspaceId)

        this._heading.innerText = workspace ? "Edit Workspace" : "New Workspace"

        this._nameField.value = workspace?.name ?? ""

        this._renderColors()
        this._selectColor(workspace?.color ?? "grey")

        this._removeButton.style.display = workspace ? "block" : "none"
        this._removeButton.onclick = () => this._onRemove({ workspaceId })

        this._saveButton.innerText = workspace ? "Done" : "Add"
        this._saveButton.onclick = () => this._validate() && this._onSave({
            workspaceId: workspaceId,
            name: this._nameField.value,
            color: this._getSelectedColor()
        })

        this._nameField.focus()
    }

    keyPressed({ key }) {
        if (key === "Enter") {
            this._saveButton.click()
        }
    }

    _validate() {
        if (this._nameField.value.length === 0) {
            this._nameField.focus()
            return false
        }

        return true
    }

    _renderColors() {
        this._colorPicker.innerHTML = ""

        for (const colorName of Object.keys(WorkspaceColor)) {
            const radio = document.createElement("input")
            radio.type = "radio"
            radio.name = "color"
            radio.value = colorName

            const button = document.createElement("div")
            button.classList.add('color')
            button.style.backgroundColor = WorkspaceColor[colorName]

            const label = document.createElement("label")
            label.appendChild(radio)
            label.appendChild(button)
            
            this._colorPicker.appendChild(label)
        }
    }

    _selectColor(colorName) {
        this.getElement(`input[type=radio][value=${colorName}]`).checked = true
    }

    _getSelectedColor() {
        return this.getElement("input[type=radio]:checked")?.value
    }
}

export default DetailView