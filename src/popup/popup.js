import Workspace from "../Workspace.js"

const container = document.querySelector("#container")
const templateItem = document.querySelector("#template-item")

main()

async function main() {
	let workspaces = await Workspace.getAll()

	if (workspaces.length === 0) {
		workspaces = await createInitialWorkspaces();
	}

	renderItems(workspaces)
}

async function renderItems(workspaces) {
	const currentWindow = await chrome.windows.getCurrent()
	container.innerHTML = ""

	for (const workspace of workspaces) {
		const element = createElement(templateItem, {title: workspace.title})
		element.classList.toggle("item-selected", workspace.windowId === currentWindow.id)
		element.onclick = () => Workspace.activate(workspace, currentWindow.id)
		
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

async function createInitialWorkspaces() {
	const currentWindow = await chrome.windows.getCurrent()
	
	return [
		await Workspace.create({
			title: "Workspace 1",
			windowId: currentWindow.id
		}),
		await Workspace.create({
			title: "Workspace 2"
		})
	]
}
