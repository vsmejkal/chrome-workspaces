import OpenWorkspaces from "../../data/OpenWorkspaces.js"
import Action from "../../Action.js"
import View from "./View.js"
import WorkspaceList from "../../data/WorkspaceList.js"

class ListView extends View {
    constructor({ addItem, editItem }) {
        super("#view-list")

        this._addItem = addItem
        this._editItem = editItem
    }

    async render() {
        const workspaces = await WorkspaceList.getWorkspaces()
        const currentWindowId = (await chrome.windows.getLastFocused()).id
        const currentWorkspaceId = (await OpenWorkspaces.find({ windowId: currentWindowId }))?.workspaceId

        const listElement = this.getElement("#workspace-list")
        listElement.innerHTML = ""

        for (const workspace of workspaces) {
            const selected = workspace.id === currentWorkspaceId
            const item = this._createItem({ ...workspace, selected })
            listElement.appendChild(item)
        }

        const addButton = this.getElement("#new-workspace-button")
        addButton.onclick = () => this._addItem();
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

        const item = document.createElement("div")
        item.classList.add("item")
        item.classList.toggle("item-selected", selected)
        item.onclick = () => Action.openWorkspace(id)
        item.onauxclick = (e) => Action.openWorkspace(id, e.button !== 1)
        item.appendChild(itemIcon)
        item.appendChild(itemName)
        item.appendChild(itemButton)

        return item
    }
}

export default ListView