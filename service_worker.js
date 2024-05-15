let classMap;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "content" && msg.subject === "showPageAction") {
    chrome.action.show(sender.tab.id);
  }

  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    sendResponse({ classes: Array.from(classMap.entries()) });
  }

  return false; // Required to keep the message channel open for sendResponse
});