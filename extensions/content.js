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

// 工具函数 - 请求通知权限，并在获得权限后开始定期检查
function checkSendFirstReminder() {
  if (!("Notification" in window)) {
    console.log("悉犀客服平台辅助工具 | This browser does not support desktop notification");
  } else {
    // 尝试获取或确认通知权限
    Notification.requestPermission().then(function(permission) {
      if (permission === "granted") {
        // 用户同意后，可以继续
        new Notification('悉犀客服平台辅助工具', {
          body: '悉犀客服平台辅助工具正在运行...',
          tag: '悉犀客服平台辅助工具提示',
          silent: false, // 确保通知会发出声音
          renotify : true // 允许重新通知
        });
        console.log("悉犀客服平台辅助工具 | Notification permission was granted.");
      } else {
        console.log("悉犀客服平台辅助工具 | Notification permission was denied.");
      }
    }).catch(error => {
      console.error("悉犀客服平台辅助工具 | Error requesting notification permissions:", error);
    });
  }
}

// 工具函数 - toaster提示
function createToast(options) {
  // 默认配置
  const defaults = {
      styles: {
          backgroundColor: '#333',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '4px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          zIndex: '9999',
          opacity: '0',
          transition: 'opacity 0.5s, transform 0.5s'
      },
      message: '默认消息内容',
      position: {
          top: '20px',
          left: '20px',
          initialTransform: 'translateY(-20px)', // 初始位置在屏幕外
          finalTransform: 'translateY(0)'        // 显示时移动到正确的位置
      },
      timeout: 3000 // 3秒后自动消失
  };

  // 合并用户提供的选项与默认配置
  const settings = { ...defaults, ...options };
  settings.styles = { ...defaults.styles, ...settings.styles };
  settings.position = { ...defaults.position, ...settings.position };

  // 创建一个新的 div 作为 toast 消息
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = settings.message;

  // 设置样式
  Object.assign(toast.style, settings.styles);
  toast.style.position = 'fixed';
  toast.style.top = settings.position.top;
  toast.style.left = settings.position.left;
  toast.style.transform = settings.position.initialTransform;

  // 添加到 body 中
  document.body.appendChild(toast);

  // 显示动画
  setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = settings.position.finalTransform;
  }, 50);

  // 自动消失
  setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = settings.position.initialTransform;
      setTimeout(() => document.body.removeChild(toast), 500); // 等待动画结束后移除元素
  }, settings.timeout); // 指定时长后自动消失
}

// 工具函数 - 闪烁标题
// 使用闭包保存状态
let originalTitle = null;
let flashIntervalId = null;
let flashTimeoutId = null;

function flashPageTitle(message, duration) {
    // 如果已经有闪烁效果在运行，则先停止它们
    if (flashIntervalId !== null) {
        clearInterval(flashIntervalId);
        clearTimeout(flashTimeoutId);
    }

    // 保存原始标题
    if (originalTitle === null) {
        originalTitle = document.title;
    }

    // 设置新的标题并开始闪烁
    const newTitle = message;
    document.title = newTitle;

    // 创建闪烁效果
    function flashTitle() {
        document.title = document.title === newTitle ? originalTitle : newTitle;
    }

    // 启动闪烁
    flashIntervalId = setInterval(flashTitle, 500); // 每500毫秒切换一次

    // 在指定时间后停止闪烁并恢复原始标题
    flashTimeoutId = setTimeout(() => {
        clearInterval(flashIntervalId); // 停止闪烁
        document.title = originalTitle; // 恢复原始标题
        // console.log('悉犀客服平台辅助工具 | 已移除闪烁效果，并恢复原始标题');

        // 清除标识符以便下次调用
        flashIntervalId = null;
        flashTimeoutId = null;
    }, duration || 5000); // 默认五秒后执行
}

// 将函数暴露给全局对象（如 window），以便可以在其他地方调用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = flashPageTitle;
} else {
    window.flashPageTitle = flashPageTitle;
}


// 功能2：检查某个元素是否存在并弹出提示框
function checkForNewMessages() {
  const element = document.querySelector("[class$='online-touch-timer_container']");
  // element && element.textContent.trim()
  if (element) {
    // 如果元素存在且有文本内容，则创建并显示通知
    // 新消息提示 - Notification提示
    new Notification('淘工厂新消息', {
      body: '淘工厂有新消息尽快回复 (๑´ㅂ`๑)',
      tag: '淘工厂新消息提示',
      silent: false, // 确保通知会发出声音
      renotify : true // 允许重新通知
    });
    // 新消息提示 - Toast提示
    createToast({
      styles: {
          backgroundColor: '#ffa502', // 背景
          color: '#fff',
          padding: '20px',
          borderRadius: '8px'
      },
      message: '这里有新消息，尽快回复 (╯°□°)╯︵ ┻━┻',
      position: {
          top: '10px',
          left: '10px',
          initialTransform: 'translateY(-20px)',
          finalTransform: 'translateY(0)'
      },
      timeout: 2000 // 2秒后自动消失
    });
    // 新消息提示 - 闪烁标题
    flashPageTitle('淘工厂有新消息', 2000);
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
        setInterval(checkForNewMessages, 3000); // 每隔3秒检查一次
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

  // 查找目标collapsed元素
  const collapsed = document.querySelector("[class$='online-touch-explorer-closed-touch-list_collapsed']");
  if (collapsed) {
    // 查找原本存在的number元素
    // console.log("悉犀客服平台辅助工具 | collapsed found");
    const originalNumberSpan = collapsed.querySelector("[class$='online-touch-explorer-closed-touch-list_number']");

    if (originalNumberSpan) {
      if (count !== 0) {
        console.log(`悉犀客服平台辅助工具 | 检测到的今日接待数量: ${count}`);
      }
      // 创建新的span用于显示计数，并设置样式以确保它位于原number元素的右边
      let newCountSpan = collapsed.querySelector(".custom-count-span");
      if (!newCountSpan) {
        console.log("悉犀客服平台辅助工具 | newCountSpan not found, creating new one");
        newCountSpan = document.createElement('span');
        newCountSpan.className = "custom-count-span";
        newCountSpan.title = "辅助工具添加元素 - 今日接待人数统计"; // 设置title属性
        // 插入到originalNumberSpan之后
        originalNumberSpan.parentNode.insertBefore(newCountSpan, originalNumberSpan.nextSibling);
      }

      // 更新新span的内容
      newCountSpan.textContent = `|今日:${count}`;
    }
  } else {
    // 统计总数未找到
    console.log("悉犀客服平台辅助工具 | 未找到collapsed元素");
  }
}

// 设置定时器，每隔3秒执行一次updateCountDisplay
setInterval(updateCountDisplay, 3000*10);

// 监听DOM变动
const observer = new MutationObserver(updateCountDisplay);
observer.observe(document.body, { childList: true, subtree: true });

// 确保脚本在页面完全加载后执行
window.addEventListener('load', function() {
  // 功能1：进入对应网站的提示 工具正在运行
  // alert("悉犀客服平台辅助工具 | 正在运行");
  // 加载提示 - Notification提示
  checkSendFirstReminder()
  // 加载提示 - Toast提示
  createToast({
    styles: {
        backgroundColor: '#2ecc71', // 背景
        color: '#fff',
        padding: '20px',
        borderRadius: '8px'
    },
    message: '悉犀客服平台辅助工具正在运行...',
    position: {
        top: '10px',
        left: '10px',
        initialTransform: 'translateY(-20px)',
        finalTransform: 'translateY(0)'
    },
    timeout: 2000 // 2秒后自动消失
  });

  setupNotificationCheck();
  console.log("悉犀客服平台辅助工具 | Initial setupNotificationCheck call");

  // 初始调用以确保首次加载时更新计数
  updateCountDisplay();
  console.log("悉犀客服平台辅助工具 | Initial updateCountDisplay call");
});