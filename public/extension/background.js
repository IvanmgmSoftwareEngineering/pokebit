// PokeBit Background Service Worker
// Side Panel extension - opens panel on action click

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PokeBit extension installed successfully');
  // Enable side panel for all tabs
  chrome.sidePanel.setOptions({
    enabled: true
  });
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
