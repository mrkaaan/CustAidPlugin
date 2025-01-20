// service_worker.js

// 检查URL是否符合任意一个模式
function matchesAnyPattern(url) {
  try {
    // 创建一个新的 URL 对象来解析输入的 URL 字符串
    const parsedUrl = new URL(url);

    // 定义允许的主机名和协议
    const allowedHosts = [
      'c2mbc.service.xixikf.cn',
      '127.0.0.1'
    ];

    // 检查协议和主机名是否在允许的列表中
    if (allowedHosts.includes(parsedUrl.hostname)) {
      // 如果主机名是 c2mbc.service.xixikf.cn，则路径必须以 /im-desk 开始
      if (parsedUrl.hostname === 'c2mbc.service.xixikf.cn') {
        return parsedUrl.pathname.startsWith('/im-desk');
      }
      // 如果主机名是 127.0.0.1，则允许任何路径
      else if (parsedUrl.hostname === '127.0.0.1') {
        return true;
      }
    }

    // 如果不符合以上条件，则返回 false
    return false;
  } catch (e) {
    // 如果提供的字符串不是一个有效的 URL，则抛出异常。在这种情况下，我们也返回 false。
    return false;
  }
}

// 公共函数：注入脚本并向内容脚本发送消息
async function injectAndSendMessage(tabId, action) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
    
    chrome.tabs.sendMessage(tabId, { action }, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        console.log(`Received response from content script for ${action}:`, response);
      }
    });
  } catch (error) {
    console.error("Failed to inject content script or send message:", error);
  }
}

// 监听页面加载完成
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && matchesAnyPattern(tab.url)) {
    injectAndSendMessage(tabId, "pageLoaded");
  }
});

// 监听标签页激活
chrome.tabs.onActivated.addListener(async function(activeInfo) {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if(tab && tab.url){
      if (matchesAnyPattern(tab.url)) {
        injectAndSendMessage(activeInfo.tabId, "tabActivated");
      }
    }
  } catch (error) {
    console.error("Error handling tab activation:", error);
  }
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTabData') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
              const tab = tabs[0];
              sendResponse({
                  title: tab.title,
                  url: tab.url,
                  windowId: tab.windowId,
                  tabId: tab.id
              });
          } else {
              sendResponse(null); // 如果没有找到活动标签页，返回 null
          }
      });
      return true; // 表示异步响应
  }
});

// background.js
chrome.runtime.onMessageExternal.addListener(
  (message, sender, sendResponse) => {
    if (message.action === 'focusTab') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs.find(tab => tab.id === message.tabId);
        if (tab) {
          chrome.tabs.update(tab.id, { active: true });
          chrome.windows.update(tab.windowId, { focused: true });
        }
      });
    }
  }
);