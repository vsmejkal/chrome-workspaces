import View from "./View.js"

class DebugView extends View {
	constructor() {
		super("#view-debug")
	}

	async render() {
		this.getElement(".run-tests-button").onclick = () => {

		}

		this.getElement(".clear-data-button").onclick = () => {
			if (confirm("Clear all user data?")) {
				chrome.storage.local.clear()
				chrome.storage.sync.clear()
				chrome.runtime.reload()
			}
		}
	}
}

export default DebugView