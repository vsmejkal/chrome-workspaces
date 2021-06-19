// Wrap service worker in try-catch in order to log errors
try {
	importScripts("background/serviceWorker.compiled.js")
} catch (e) {
	console.error(e)
}
