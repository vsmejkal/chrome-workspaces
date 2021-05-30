export default {
	fromVersion: "0.4",
	migrate: async () => {
		const colorMapping = {
			["red"]: "red",
			["orange"]: "yellow",
			["yellow"]: "yellow",
			["green"]: "green",
			["turquoise"]: "cyan",
			["lightblue"]: "blue",
			["blue"]: "blue",
			["violet"]: "pink",
			["purple"]: "purple",
			["gray"]: "grey",
		}

		const { workspaceList = [] } = await chrome.storage.local.get("workspaceList")
		const workspaces = await chrome.storage.local.get(workspaceList)

		for (const workspace of Object.values(workspaces)) {
			if (workspace) {
				workspace.color = colorMapping[workspace.color] ?? "grey"
			}
		}

		await chrome.storage.local.set(workspaces)
	}
}