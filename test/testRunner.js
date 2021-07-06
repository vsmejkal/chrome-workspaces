import WorkspaceColorMigrationTest from "/test/migration/00_WorkspaceColorMigrationTest.js"

bootstrap()

async function bootstrap() {
    const { installType } = await chrome.management.getSelf()

    if (installType !== "development") {
        alert("Tests can be run only in development mode!")
        return
    }

    await runMigrationTests()
}

async function setUp() {
    await chrome.storage.local.clear()
}

async function runMigrationTests() {
    const migrations = {
        WorkspaceColorMigrationTest,
    }

    for (const suiteName of Object.keys(migrations)) {
        console.log(`%cRunning ${suiteName}...`, "color:blue")

        for (const testName of Object.keys(migrations[suiteName])) {
            if (!testName.startsWith("test")) {
                continue
            }

            try {
                await setUp()
                await migrations[suiteName][testName]()
                console.log(`-> ${testName}... %cSUCCESS`, "color:green;font-weight:bold")
            } catch (e) {
                console.log(`-> ${testName}... %cFAIL`, "color:red;font-weight:bold")
                console.error(e)
            }
        }
    }
}