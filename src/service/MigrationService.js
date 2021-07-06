import WorkspaceColorMigration from "../migration/00_WorkspaceColorMigration.js"

const migrationList = [
	WorkspaceColorMigration,
]

async function migrate({ previousVersion }) {
	for (const migration of migrationList) {
		if (parseFloat(previousVersion) < parseFloat(migration.fromVersion)) {
			await migration.migrate()
		}
	}
}

export default { migrate }