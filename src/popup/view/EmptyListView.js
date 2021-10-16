import View from "./View.js"

class EmptyListView extends View {
    constructor({ onAddItem }) {
        super("#view-empty-list")

        this._onAddItem = onAddItem
        this._addButton = this.getElement(".new-button")
    }

    async render() {
        this._addButton.onclick = () => this._onAddItem()
    }
}

export default EmptyListView