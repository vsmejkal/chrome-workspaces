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

const defaultColor = "grey"

export default {
	fromVersion: "0.4",
	migrate: async () => {
		const { workspaceList = [] } = await chrome.storage.local.get("workspaceList")
		const workspaceIds = workspaceList.map((item) => item.workspaceId)
		const workspaces = await chrome.storage.local.get(workspaceIds)

		for (const workspace of Object.values(workspaces)) {
			if (workspace) {
				workspace.color = colorMapping[workspace.color] ?? defaultColor
			}
		}

		await chrome.storage.local.set(workspaces)
	}
}