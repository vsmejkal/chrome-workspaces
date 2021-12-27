import Options from "../storage/Options.js";

document.addEventListener("DOMContentLoaded", renderOptions);

async function renderOptions() {
	await loadOptions()
	attachEventHandlers()
}

async function loadOptions() {
	const { otherWorkspaces } = await Options.get()

	document.querySelector(`input[name=otherWorkspaces][value=${otherWorkspaces}]`).checked = true
}

function attachEventHandlers() {
	document.querySelectorAll("input[name=otherWorkspaces]").forEach((element) => {
		element.addEventListener("change", (e) => {
			Options.update({ otherWorkspaces: e.target.value })
		})
	})
}