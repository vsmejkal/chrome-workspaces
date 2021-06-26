import Migration_00_Color, { colorMapping, defaultColor } from "../../src/migration/00_color.js"
import { assertEqual } from "../../src/Utils.js";

export default {
	async testColorMapping() {
		for (const [fromColor, toColor] of Object.entries(colorMapping)) {
			await chrome.storage.local.set({
				"workspace_1": {
					id: "workspace_1",
					name: "workspace",
					color: fromColor,
				},
				"workspaceList": {
					"workspace_1": undefined,
				}
			})

			await Migration_00_Color.migrate()

			const result = await chrome.storage.local.get("workspace_1")

			const convertedColor = result["workspace_1"]?.color
			assertEqual(convertedColor, toColor)
		}
	},

	async testUnknownColor() {
		await chrome.storage.local.set({
			"workspace_1": {
				id: "workspace_1",
				name: "workspace",
				color: "unknown",
			},
			"workspace_2": {
				id: "workspace_2",
				name: "workspace",
			},
			"workspaceList": {
				"workspace_1": undefined,
				"workspace_2": undefined,
			}
		})

		await Migration_00_Color.migrate()

		const result = await chrome.storage.local.get(["workspace_1", "workspace_2"])

		const convertedColor1 = result["workspace_1"]?.color
		assertEqual(convertedColor1, defaultColor)

		const convertedColor2 = result["workspace_2"]?.color
		assertEqual(convertedColor2, defaultColor)
	},

	async testWithNoWorkspaces() {
		await Migration_00_Color.migrate()
	},
}