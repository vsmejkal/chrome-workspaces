import Config from "../../storage/Config.js";

async function openExtensionSettings() {
  await chrome.tabs.create({
    url: "chrome://extensions/?id=" + chrome.runtime.id
  })
  
  window.close();
}

async function dismissPopup() {
  // Do not show popup anymore
  await Config.set(Config.Key.FILE_ACCESS_POPUP_DISMISSED, true)
  
  window.close();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#openExtensionSettings").addEventListener("click", openExtensionSettings);
  document.querySelector("#dismiss").addEventListener("click", dismissPopup);
})

