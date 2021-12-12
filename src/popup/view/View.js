import { assert } from "../../util/assert.js";

class View {
    static #activeView = null
    #selector = ""

    constructor(selector) {
        this.#selector = selector

        document.addEventListener("keydown", e => {
            if (this === View.#activeView) {
                this.keyPressed(e)
            }
        })
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
        return Array.from(this.root.querySelectorAll(selector))
    }

    async show(props = {}) {
        const oldView = document.querySelector(`.${activeClass}`)
        oldView?.classList?.remove(activeClass)

        const newView = this.root
        newView.classList.add(activeClass)

        View.#activeView = this

        await this.render(props)
    }

    async render(props) {}

    keyPressed(event) {}
}

const activeClass = "view-active"

export default View