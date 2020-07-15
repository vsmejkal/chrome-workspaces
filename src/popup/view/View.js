import { assert } from "../../Utils.js";

class View {
    #selector = ""

    constructor(selector) {
        this.#selector = selector
    }

    get root() {
        const root = document.querySelector(this.#selector)
        assert(root, `View ${this.#selector} not found`)
        return root
    }

    getElement(selector) {
        return this.root.querySelector(selector)
    }

    getElements(selector) {
        return this.root.querySelectorAll(selector)
    }

    show(props = {}) {
        const activeClass = "view-active"

        const oldView = document.querySelector(`.${activeClass}`)
        oldView?.classList?.remove(activeClass)

        const newView = this.root
        newView.classList.add(activeClass)

        this.render(props)
    }

    async render(props) {}
}

export default View