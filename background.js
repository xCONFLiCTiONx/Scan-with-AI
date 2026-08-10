// background.js

async function updatePopupForTab(tabId) {
  try {
    await chrome.action.setPopup({ tabId, popup: "popup.html" });
  } catch (e) {
    console.warn("Failed to set popup for tab", tabId, e);
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  updatePopupForTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && (changeInfo.url || changeInfo.status === "complete")) {
    updatePopupForTab(tabId);
  }
});