const tabsToSuspend = new Set()

function scheduleSuspend(tabId) {
	tabsToSuspend.add(tabId)
}

function suspendTab(tabId) {
	setTimeout(() => chrome.tabs.discard(tabId), 200)
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (tabsToSuspend.has(tabId) && changeInfo.title && !tab.active) {
		suspendTab(tabId)
		tabsToSuspend.delete(tabId)
	}
})

export default { scheduleSuspend }
