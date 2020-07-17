import OpenWorkspaces from "../../data/OpenWorkspaces.js"
import View from "./View.js"
import WorkspaceList from "../../data/WorkspaceList.js"

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
        const currentWorkspaceId = (await OpenWorkspaces.find({ windowId: currentWindowId }))?.workspaceId

        this._listElement.innerHTML = ""
        this._addButton.onclick = () => this._addItem()

        for (const workspace of workspaces) {
            const selected = workspace.id === currentWorkspaceId
            const item = this._createItem({ ...workspace, selected })
            this._listElement.appendChild(item)
        }
    }

    _createItem({ id, name, icon, selected }) {
        const itemIcon = document.createElement("i")
        if (icon) {
            itemIcon.classList.add("item-icon", "bi", `bi-${icon}`)
        }

        const itemName = document.createElement("div")
        itemName.classList.add("item-name")
        itemName.innerText = name

        const itemButton = document.createElement("i")
        itemButton.classList.add("bi", "bi-three-dots", "item-more-button")
        itemButton.onclick = (e) => {
            e.stopPropagation();
            this._editItem(id);
        }

        const item = document.createElement("button")
        item.classList.add("item")
        item.classList.toggle(selectedClass, selected)
        item.onclick = ({button, ctrlKey, metaKey}) => {
            const newWindow = (button === 0 && ctrlKey) || (button === 0 && metaKey) || (button === 1)
            this._openItem(id, newWindow)
        }
        item.appendChild(itemIcon)
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