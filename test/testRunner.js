// document.addEventListener("DOMContentLoaded"
bootstrap()

async function bootstrap() {
	const { installType } = await chrome.management.getSelf()

	if (installType !== "development") {
		alert("Tests can be run only in development mode!");
		return;
	}

	await runMigrationTests();
}

async function setUp() {
	chrome.storage.local.clear()
}

async function runMigrationTests() {
	document.body.innerText = "Running migration test #1..."
}