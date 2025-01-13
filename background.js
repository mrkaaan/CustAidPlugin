// 监听标签页更新和激活状态变化
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "pageLoaded" }, function(response) {});
  }
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab.url.startsWith("https://c2mbc.service.xixikf.cn/im-desk") || 
        tab.url.startsWith("http://127.0.0.1:5500/code/test.html")) {
      chrome.tabs.sendMessage(activeInfo.tabId, { action: "tabActivated" }, function(response) {});
    }
  });
});

// 如果需要存储一些全局变量或设置定时任务，也可以在这里实现