// 确保服务工作线程已正确加载，并且它不会阻止消息传递的逻辑错误
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "pageLoaded") {
    console.log("Service worker received page loaded message");
    // 如果需要响应，确保在所有代码路径中调用sendResponse
    sendResponse({ status: "received" });
  } else {
    sendResponse({}); // 发送空响应以避免等待
  }
});

// 监听标签页更新和激活状态变化
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "pageLoaded" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log("Received response:", response);
      }
    });
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    // 确保tab.url存在并是一个字符串
    if (tab && typeof tab.url === 'string' && 
        (tab.url.startsWith("https://c2mbc.service.xixikf.cn/im-desk") || 
         tab.url.startsWith("http://127.0.0.1:5500/code/test.html"))) {
      chrome.tabs.sendMessage(activeInfo.tabId, { action: "tabActivated" }, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        } else {
          console.log("Received response:", response);
        }
      });
    }
  });
});