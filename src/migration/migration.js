import Migration_00_Color from "./00_color.js"

const migrationList = [
	Migration_00_Color,
]

export async function executeMigrations(previousVersion) {
	for (const migration of migrationList) {
		if (parseFloat(previousVersion) < parseFloat(migration.fromVersion)) {
			await migration.migrate()
		}
	}
}