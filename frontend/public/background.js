// 1. Allow opening side panel by clicking the toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));


chrome.runtime.onInstalled.addListener(({ reason }) => {
  // Set Side Panel behavior: Open on click
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("SidePanel Setup Error:", error));

  // Professional Onboarding: Open permission tab on fresh install
  if (reason === 'install') {
    chrome.tabs.create({ url: 'onboarding.html' });
  }
});