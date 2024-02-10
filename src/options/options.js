import { exportWorkspaces, importWorkspaces } from "../service/ImportExportService.js";
import Options from "../storage/Options.js";

document.addEventListener("DOMContentLoaded", renderOptions);

function renderOptions() {
	loadOptions()
	attachEventHandlers()
}

async function loadOptions() {
	const options = await Options.get()

	for (const [key, value] of Object.entries(options)) {
		const element = document.querySelector(`input[name=${key}][value=${value}]`)
		if (element instanceof HTMLInputElement) {
			element.checked = true
		}
	}
}

async function attachEventHandlers() {
	const options = await Options.get()

	for (const key of Object.keys(options)) {
		document.querySelectorAll(`input[name=${key}]`).forEach((element) => {
			element.addEventListener("change", (e) => {
				Options.update({ [key]: e.target.value })
			})
		})
	}

	document.querySelector("button#import").addEventListener("click", importWorkspaces);
	document.querySelector("button#export").addEventListener("click", exportWorkspaces);
}

