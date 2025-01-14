// service_worker.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).then(() => {
      // 发送消息到特定标签页
      chrome.tabs.sendMessage(tabId, { action: "pageLoaded" }, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log("Received response from content script:", response);
        }
      });
    }).catch(error => {
      console.error("Failed to inject content script:", error);
    });
  }
});

chrome.tabs.onActivated.addListener(async function(activeInfo) {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url.startsWith("https://c2mbc.service.xixikf.cn/im-desk") || 
        tab.url.startsWith("http://127.0.0.1:5500/code/test.html") ||
        tab.url.startsWith("http://127.0.0.1:5501/demo.html")) {
      await chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ['content.js']
      });
      chrome.tabs.sendMessage(activeInfo.tabId, { action: "tabActivated" }, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log("Received response from content script:", response);
        }
      });
    }
  } catch (error) {
    console.error("Error handling tab activation:", error);
  }
});