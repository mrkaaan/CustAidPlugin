// 设置间隔时间变量
const interval = 5000;

// 监听来自background脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "pageLoaded" || request.action === "tabActivated") {
    console.log(`${request.action} - 执行必要的初始化或更新`);
    // 如果需要响应，确保在所有代码路径中调用sendResponse
    sendResponse({ status: "initialized" });
  } else {
    sendResponse({}); // 发送空响应以避免等待
  }
});

// 功能2：检查某个元素是否存在并弹出提示框
function checkForNewMessages() {
  const element = document.querySelector("[class$='online-touch-timer_container']");
  if (element && element.textContent.trim()) {
    // 如果元素存在且有文本内容，则创建并显示通知
    new Notification('淘工厂新消息', {
      body: '淘工厂有一条新消息尽快回复 (๑´ㅂ`๑)',
      tag: '淘工厂新消息提示',
      silent: false, // 确保通知会发出声音
      renotify : true // 允许重新通知
    });
    console.log("悉犀客服平台辅助工具 | 检测到新消息！");
  } else {
    console.log("悉犀客服平台辅助工具 | 没有检测新消息...");
  }
}

// 请求通知权限，并在获得权限后开始定期检查
function setupNotificationCheck() {
  if (!("Notification" in window)) {
    console.log("悉犀客服平台辅助工具 | This browser does not support desktop notification");
  } else {
    // 尝试获取或确认通知权限
    Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
        // 用户同意后，可以继续
        checkForNewMessages(); // 首次立即检查
        console.log("悉犀客服平台辅助工具 | Notification permission was granted.");
        setInterval(checkForNewMessages, interval); // 每隔3秒检查一次
      } else {
        console.log("悉犀客服平台辅助工具 | Notification permission was denied.");
      }
    }).catch(error => {
      console.error("悉犀客服平台辅助工具 | Error requesting notification permissions:", error);
    });
  }
}

// 功能3：统计特定格式时间的数量并在页面上显示
function updateCountDisplay() {
  const elements = document.querySelectorAll("[class$='online-touch-explorer-member-card_end-time']");
  let count = 0;

  elements.forEach(element => {
    const timeMatch = element.textContent.match(/(\d{2}:\d{2})/);
    if (timeMatch) {
      count++;
    }
  });

  // 查找目标header元素
  const header = document.querySelector(".online-touch-explorer-closed-touch-list_collapsed header");
  if (header) {
    // 查找原本存在的number元素
    console.log("悉犀客服平台辅助工具 | header found");
    const originalNumberSpan = header.querySelector(".online-touch-explorer-closed-touch-list_number");

    if (originalNumberSpan) {
      console.log(`悉犀客服平台辅助工具 | 检测到的今日接待数量: ${count}`);
      // 创建新的span用于显示计数，并设置样式以确保它位于原number元素的右边
      let newCountSpan = header.querySelector(".custom-count-span");
      if (!newCountSpan) {
        console.log("悉犀客服平台辅助工具 | newCountSpan not found, creating new one");
        newCountSpan = document.createElement('span');
        newCountSpan.className = "custom-count-span";
        newCountSpan.title = "辅助工具添加元素 - 今日接待人数统计"; // 设置title属性
        // 插入到originalNumberSpan之后
        originalNumberSpan.parentNode.insertBefore(newCountSpan, originalNumberSpan.nextSibling);
      }

      // 更新新span的内容
      newCountSpan.textContent = ` | 今日接待计数: ${count}`;
    }
  } else {
    // 统计总数未找到
    console.log("悉犀客服平台辅助工具 | 未找到header元素");
  }
}

// 设置定时器，每隔3秒执行一次updateCountDisplay
setInterval(updateCountDisplay, interval*5);

// 监听DOM变动
const observer = new MutationObserver(updateCountDisplay);
observer.observe(document.body, { childList: true, subtree: true });

// 确保脚本在页面完全加载后执行
window.addEventListener('load', function() {
  // 功能1：进入对应网站的提示 工具正在运行
  alert("悉犀客服平台辅助工具 | 正在运行");

  setupNotificationCheck();
  console.log("悉犀客服平台辅助工具 | Initial setupNotificationCheck call");

  // 初始调用以确保首次加载时更新计数
  updateCountDisplay();
  console.log("悉犀客服平台辅助工具 | Initial updateCountDisplay call");
});