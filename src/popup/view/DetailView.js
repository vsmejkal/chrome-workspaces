import View from "./View.js"
import Workspace from "../../data/Workspace.js"

class DetailView extends View {
    constructor({ saveItem, deleteItem }) {
        super("#view-detail")

        this._saveItem = saveItem
        this._deleteItem = deleteItem

        this._heading = this.getElement("h1")
        this._icons = this.getElements("#workspace-icon-picker .icon")
        this._nameField = this.getElement("#workspace-name")
        this._removeButton = this.getElement("#workspace-remove")
        this._saveButton = this.getElement("#workspace-save")
    }

    async render({ workspaceId }) {
        const workspace = await Workspace.get(workspaceId)

        this._heading.innerText = workspace ? "Edit Workspace" : "New Workspace"

        this._nameField.value = workspace?.name ?? ""
        this._nameField.onkeypress = (e) => {
            if (e.key === "Enter") {
                this._saveButton.click()
            }
        }

        this._icons.forEach(element => {
            element.onclick = () => this._selectIcon(element.dataset.icon)
            element.onkeypress = (e) => this._onIconKeyPress(e)
        })
        this._selectIcon(workspace?.icon)

        this._removeButton.style.display = workspace ? "block" : "none"
        this._removeButton.onclick = () => this._deleteItem({ workspaceId })

        this._saveButton.innerText = workspace ? "Done" : "Add"
        this._saveButton.onclick = () => this._validate() && this._saveItem({
            workspaceId: workspaceId,
            name: this._nameField.value,
            icon: this._getSelectedIcon()
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

    _renderIcons() {
        for (const iconName of iconNames) {
            const icon = document.createElement("button")
            icon.classList.add("workspace-icon")
            icon.style.backgroundImage = 'url(/icons/workspace/${iconName}.svg)'
            icon.title = iconName

            this._iconPicker.appendChild(icon)
        }
    }

    _onIconKeyPress(e) {

    }

    _selectIcon(iconName) {
        this._icons.forEach(icon => {
            icon.classList.toggle("icon-selected", icon.dataset.icon === iconName)
        })
    }

    _getSelectedIcon() {
        return this.getElement(".icon-selected")?.dataset?.icon
    }
}

export default DetailView