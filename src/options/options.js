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

	document.querySelector("button#import").addEventListener("click", importWorkspaces);
	document.querySelector("button#export").addEventListener("click", exportWorkspaces);
}

function importWorkspaces() {
	const fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.accept = 'application/json';
	fileInput.onchange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			// read
			const reader = new FileReader();
			reader.onload = async (e) => {
				const text = e.target.result;
				try {
					// parse
					const data = JSON.parse(text);

					// store
					if (data.workspaceList && data.workspaces) {
						await chrome.storage.local.set({ "workspaceList": data.workspaceList });
						await chrome.storage.local.set({ ...data.workspaces });
					}

					document.querySelector(".info").style.display = 'block';
				} catch (error) {
					console.error('Error parsing JSON:', error);
				}
			};
			reader.readAsText(file);
		}
	};

	// trigger
	fileInput.click();
}

function exportWorkspaces() {
	(async () => {
		const { workspaceList = [] } = await chrome.storage.local.get("workspaceList")
		const workspaceIds = workspaceList.map((item) => item.workspaceId)
		const workspaces = await chrome.storage.local.get(workspaceIds)

		// create
		const data = JSON.stringify({ workspaceList, workspaces }, null, 2);
		const blob = new Blob([data], { type: 'application/json' });

		// download
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'workspaces_backup.json';
		document.body.appendChild(link);
		link.click();

		// cleanup
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
	)()
}