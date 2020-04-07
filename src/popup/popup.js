const container = document.querySelector("#container");
const templateItem = document.querySelector("#template-item");

start();


async function start() {
	const workspaces = await getWorkspaces();

	renderWorkspaces(workspaces);
}

async function getWorkspaces() {
	const result = await chrome.storage.local.get("workspaces");
	
	if (result.workspaces) {
		console.debug('Workspaces found', result.workspaces);
		return result.workspaces;
	} else {
		console.debug('Workspaces not found, creating default configuration');
		return await createDefaultWorkspaces();
	} 
}

async function setWorkspaces(workspaces) {
	return await chrome.storage.local.set({"workspaces": workspaces});
}

async function createDefaultWorkspaces() {
	const window = await chrome.windows.getCurrent();

	return [{
		title: "Workspace 1",
		tabs: await captureTabs(),
		windowId: window.id
	}, {
		title: "Workspace 2",
		tabs: [{
			url: "chrome://newtab/"
		}]
	}];

	debugger;
}

async function renderWorkspaces(workspaces) {
	const window = await chrome.windows.getCurrent();
	container.innerHTML = '';

	for (const workspace of workspaces) {
		const element = createElement(templateItem, {title: workspace.title});
		element.classList.toggle("item-selected", workspace.windowId === window.id);
		element.onclick = () => switchWorkspace(workspace)
		container.appendChild(element);
	}
}

function createElement(template, props) {
	let html = template.innerHTML.trim();
	for (const propName in props) {
		html = html.replace(`{${propName}}`, props[propName]);
	}

    const renderTemplate = document.createElement('template');
	renderTemplate.innerHTML = html;

    return renderTemplate.content.firstChild;
}

async function switchWorkspace(workspace) {
	const tabsToRemove = await chrome.tabs.query({currentWindow: true});

	console.debug("Creating workspace", workspace);
	debugger;
	for (const tab of workspace.tabs) {
		chrome.tabs.create(tab);
	}

	console.debug("Closing old tabs", tabsToRemove);
	debugger;
	for (const tab of tabsToRemove) {
		chrome.tabs.remove(tab.id);
	}

	workspace.windowId = window.id;
}

async function getActiveWorkspace() {
	const window = await chrome.windows.getCurrent();
}

async function captureTabs() {
	return (await chrome.tabs.query({currentWindow: true})).map(getTabProps);
}

function getTabProps(tab) {
	const { url, pinned = false, active = false } = tab;

	return { url, pinned, active };
}