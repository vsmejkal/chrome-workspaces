export function importWorkspaces() {
	const fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.accept = "application/json";
	fileInput.onchange = async (e) => {
		const file = e.target.files[0];
    if (!file) return;

		// Read
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        // Parse
        const data = JSON.parse(text);

        // Store
        if (data.workspaceList && data.workspaces) {
          await chrome.storage.local.set({ "workspaceList": data.workspaceList });
          await chrome.storage.local.set({ ...data.workspaces });
        }

        document.querySelector("#import-info").style.display = "block";
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
    reader.readAsText(file);
	};

	// Trigger
	fileInput.click();
}

export async function exportWorkspaces() {
	const { workspaceList = [] } = await chrome.storage.local.get("workspaceList");
	const workspaceIds = workspaceList.map((item) => item.workspaceId);
	const workspaces = await chrome.storage.local.get(workspaceIds);

	// Create
	const data = JSON.stringify({ workspaceList, workspaces }, null, 2);
	const blob = new Blob([data], { type: "application/json" });

	// Download
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "workspaces_backup.json";
	document.body.appendChild(link);
	link.click();

	// Cleanup
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
