import WorkspaceColorMigration from "/src/migration/00_WorkspaceColorMigration.js"
import { assertEqual } from "/src/Utils.js"

const WorkspaceColorMigrationTest = {
    async testColorMapping() {
        await chrome.storage.local.set({
            "workspace_blue": {
                id: "workspace_blue",
                name: "Blue Workspace",
                color: "blue",
            },
            "workspace_orange": {
                id: "workspace_orange",
                name: "Orange workspace",
                color: "orange",
            },
            "workspace_gray": {
                id: "workspace_gray",
                name: "Gray workspace",
                color: "gray",
            },
            "workspaceList": [
                { workspaceId: "workspace_blue" },
                { workspaceId: "workspace_orange" },
                { workspaceId: "workspace_gray" },
            ],
        })

        await WorkspaceColorMigration.migrate()

        const {
            workspace_blue,
            workspace_orange,
            workspace_gray
        } = await chrome.storage.local.get(["workspace_blue", "workspace_orange", "workspace_gray"])

        assertEqual(workspace_blue?.color, "blue")
        assertEqual(workspace_orange?.color, "yellow")
        assertEqual(workspace_gray?.color, "grey")
    },

    async testUnknownAndMissingColor() {
        await chrome.storage.local.set({
            "workspace_1": {
                id: "workspace_1",
                name: "Workspace with unknown color",
                color: "unknown",
            },
            "workspace_2": {
                id: "workspace_2",
                name: "Workspace with undefined color",
            },
            "workspaceList": [
                { workspaceId: "workspace_1" },
                { workspaceId: "workspace_2" },
            ],
        })

        await WorkspaceColorMigration.migrate()

        const { workspace_1, workspace_2 } = await chrome.storage.local.get(["workspace_1", "workspace_2"])

        assertEqual(workspace_1?.color, "grey")
        assertEqual(workspace_2?.color, "grey")
    },

    async testWithNoData() {
        await WorkspaceColorMigration.migrate()
    },
}

export default WorkspaceColorMigrationTest