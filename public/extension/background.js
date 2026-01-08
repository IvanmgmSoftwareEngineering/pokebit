// PokeBit Background Service Worker
// Minimal service worker - extension uses HashRouter for navigation

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PokeBit extension installed successfully');
});
