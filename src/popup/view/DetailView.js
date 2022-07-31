import View from "./View.js"
import Workspace from "../../workspace/Workspace.js"
import WorkspaceColor from "../../workspace/WorkspaceColor.js"
import WorkspaceList from "../../workspace/WorkspaceList.js"

class DetailView extends View {
    constructor({ onSave, onRemove }) {
        super("#view-detail")

        this._onSave = onSave
        this._onRemove = onRemove

        this._heading = this.getElement("h1")
        this._nameField = this.getElement(".workspace-name")
        this._colorPicker = this.getElement(".color-picker")
        this._useCurrentWindowSection = this.getElement(".section-window")
        this._useCurrentWindow = this.getElement(".use-current-window")
        this._removeButton = this.getElement(".remove-button")
        this._saveButton = this.getElement(".save-button")
    }

    async render({ workspaceId }) {
        const workspace = await Workspace.get(workspaceId)
        const activeWorkspaceId = await this._getActiveWorkspace()
        const isNew = !workspace

        this._heading.innerText = isNew ? "New Workspace" : "Edit Workspace"

        this._nameField.value = workspace?.name ?? ""

        this._renderColors()
        this._selectColor(workspace?.color ?? "grey")

        if (isNew && !activeWorkspaceId) {
            this._useCurrentWindowSection.style.display = "block"
            this._useCurrentWindow.checked = false
        } else {
            this._useCurrentWindowSection.style.display = "none"
            this._useCurrentWindow.checked = false
        }

        this._removeButton.style.display = isNew ? "none" : "block"
        this._removeButton.onclick = () => this._onRemove({ workspaceId })

        this._saveButton.innerText = isNew ? "Create" : "Done"
        this._saveButton.onclick = () => this._handleSave(workspaceId)

        this._nameField.focus()
    }

    keyPressed(e) {
        if (e.key === "Enter") {
            this._saveButton.click()
            e.preventDefault()
        }
    }

    async _handleSave(workspaceId) {
        if (!this._validate()) return

        const currentWindow = await chrome.windows.getCurrent()

        this._onSave({
            workspaceId: workspaceId,
            name: this._nameField.value,
            color: this._getSelectedColor(),
            windowId: this._useCurrentWindow.checked ? currentWindow.id : undefined,
        })
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

    async _getActiveWorkspace() {
        const currentWindow = await chrome.windows.getCurrent()
        const currentWorkspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindow.id)

        return currentWorkspaceId
    }
}

export default DetailView