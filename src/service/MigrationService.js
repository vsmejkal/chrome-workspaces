import Migration_00_Color from "../migration/00_color.js"

const migrationList = [
	Migration_00_Color,
]

async function migrate({ previousVersion }) {
	for (const migration of migrationList) {
		if (parseFloat(previousVersion) < parseFloat(migration.fromVersion)) {
			await migration.migrate()
		}
	}
}

export default { migrate }