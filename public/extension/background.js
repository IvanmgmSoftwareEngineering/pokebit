// PokeBit Background Service Worker
// Handles opening import view in new tab

chrome.action.onClicked.addListener((tab) => {
  // This runs when the extension icon is clicked
  // The popup will handle most functionality
});

// Listen for messages from popup to open import in new tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openImportTab') {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('index.html#/import')
    });
    sendResponse({ success: true });
  }
  return true;
});
