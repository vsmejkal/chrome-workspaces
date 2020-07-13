import { assert } from "../../Utils.js";

class View {
    #selector = ""

    constructor(selector) {
        this.#selector = selector
    }

    get root() {
        return document.querySelector(this.#selector)
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

        const newView = document.querySelector(this.#selector)
        newView?.classList?.add(activeClass)

        assert(newView, `View ${this.#selector} not found`)

        this.render(props)
    }

    async render() {}
}

export default View