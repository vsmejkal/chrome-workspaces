import View from "./View.js"
import WorkspaceList from "../../model/WorkspaceList.js"
import Color from "../../Color.js"

class ListView extends View {
    constructor({ addItem, editItem, openItem }) {
        super("#view-list")

        this._addItem = addItem
        this._editItem = editItem
        this._openItem = openItem

        this._listElement = this.getElement("#workspace-list")
        this._addButton = this.getElement("#new-workspace-button")
    }

    async render() {
        const workspaces = await WorkspaceList.getWorkspaces()
        const currentWindowId = (await chrome.windows.getCurrent()).id
        const currentWorkspaceId = await WorkspaceList.findWorkspaceForWindow(currentWindowId)

        this._listElement.innerHTML = ""
        this._addButton.onclick = () => this._addItem()

        for (const workspace of workspaces) {
            const selected = workspace.id === currentWorkspaceId
            const item = this._createItem({ ...workspace, selected })
            this._listElement.appendChild(item)
        }
    }

    _createItem({ id, name, color = "gray", selected }) {
        const itemColor = document.createElement("div")
        itemColor.classList.add("item-color")

        const itemName = document.createElement("div")
        itemName.classList.add("item-name")
        itemName.innerText = name

        const itemButton = document.createElement("i")
        itemButton.title = "Edit"
        itemButton.classList.add("bi", "bi-three-dots", "item-edit-button")
        itemButton.onclick = (e) => {
            e.stopPropagation();
            this._editItem(id);
        }

        const item = document.createElement("button")
        item.classList.add("item")
        item.classList.toggle(selectedClass, selected)
        item.onclick = () => this._openItem(id)
        item.style.setProperty('--item-color', Color[color])
        item.style.setProperty('--item-color-dark', Color[color])
        item.appendChild(itemColor)
        item.appendChild(itemName)
        item.appendChild(itemButton)

        return item
    }

    keyPressed({ key }) {
        const items = [...this._listElement.children, this._addButton]
        const focusedItem = items.includes(document.activeElement) ? document.activeElement : null
        const selectedItem = this.getElement(`.${selectedClass}`)
        const currentItem = focusedItem ?? selectedItem
        const currentIndex = items.indexOf(currentItem)
        const prevIndex = currentItem ? currentIndex - 1 : items.length - 1
        const nextIndex = currentItem ? currentIndex + 1 : 0

        if (key === "ArrowUp") {
            items[prevIndex]?.focus()
        } else if (key === "ArrowDown") {
            items[nextIndex]?.focus()
        }
    }
}

const selectedClass = "item-selected"

export default ListView