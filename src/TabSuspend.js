const tabsToSuspend = new Set()

export function scheduleSuspend(tabId) {
	tabsToSuspend.add(tabId)
}

function suspend(tabId) {
	setTimeout(() => chrome.tabs.discard(tabId), 200)
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (tabsToSuspend.has(tabId) && changeInfo.title && !tab.active) {
		suspend(tabId)
		tabsToSuspend.delete(tabId)
	}
})




