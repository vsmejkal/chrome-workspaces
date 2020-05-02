import Workspace from "../Workspace.js"
import WorkspaceList from "../WorkspaceList.js"
import OpenWorkspaces from "../OpenWorkspaces.js"
import WorkspaceTab from "../WorkspaceTab.js"
import OpenTabs from "../OpenTabs.js"

const container = document.querySelector("#container")
const templateItem = document.querySelector("#template-item")

main()

async function main() {
	let workspaces = await WorkspaceList.getWorkspaces()

	if (workspaces.length === 0) {
		workspaces = await setupWorkspaces();
	}

	renderItems(workspaces)

	document.querySelector("#reload").onclick = () => {
		chrome.storage.local.clear()
		chrome.storage.sync.clear()
		chrome.runtime.reload()
	}
}

async function renderItems(workspaces) {
	const currentWindowId = (await chrome.windows.getLastFocused()).id
	const currentWorkspaceId = (await OpenWorkspaces.find({ windowId: currentWindowId }))?.workspaceId
	container.innerHTML = ""

	for (const workspace of workspaces) {
		const element = createElement(templateItem, {title: workspace.title})
		element.classList.toggle("item-selected", workspace.id === currentWorkspaceId)
		element.onclick = () => openWorkspace(workspace.id)
		
		container.appendChild(element)
	}
}

function createElement(template, props) {
	let html = template.innerHTML.trim()
	for (const propName in props) {
		html = html.replace(`{${propName}}`, props[propName])
	}

	const renderTemplate = document.createElement('template')
	renderTemplate.innerHTML = html

	return renderTemplate.content.firstChild
}

async function setupWorkspaces() {
	const windowId = (await chrome.windows.getLastFocused()).id
	const browserTabs = await chrome.tabs.query({ windowId })
	const workspaceTabs = await Promise.all(browserTabs.map(WorkspaceTab.create))

	const workspace1 = await Workspace.create({
		title: "Workspace 1",
		tabs: workspaceTabs
	})

	const workspace2 = await Workspace.create({
		title: "Workspace 2",
		tabs: [await WorkspaceTab.createEmpty()]
	})
	
	await OpenWorkspaces.add(windowId, workspace1.id)
	await OpenTabs.addAll(
		browserTabs.map(tab => tab.id),
		workspaceTabs.map(tab => tab.id)
	)

	return [workspace1, workspace2]
}

function openWorkspace(workspaceId) {
	chrome.runtime.sendMessage({
		type: "OPEN_WORKSPACE",
		workspaceId
	});
}