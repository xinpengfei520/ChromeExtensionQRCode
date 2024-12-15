chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openPopup") {
    chrome.browserAction.openPopup();
  }
});