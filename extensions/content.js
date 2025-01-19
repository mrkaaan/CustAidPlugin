// 监听来自background脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "pageLoaded" || request.action === "tabActivated") {
    // 保证无论是pageLoaded还是tabActivated，只执行一次
    if (window.pageLoaded) {
      return;
    }
    window.pageLoaded = true;
    // console.log(`${request.action} - 执行必要的初始化或更新`);
    // 如果需要响应，确保在所有代码路径中调用sendResponse
    sendResponse({ status: "initialized" });
  } else {
    sendResponse({}); // 发送空响应以避免等待
  }
});

// 全局变量 - 页面被完全加载完毕
if (!window.pageLoaded) {
  window.pageLoaded = false;
}

// 全局变量 - 用于标记是否已请求过通知权限
// 检查并设置全局变量
if (!window.notificationPermissionRequested) {
  window.notificationPermissionRequested = false;
}

// 全局变量 - 用于保存原始标题、闪烁效果的定时器ID
// 确保这些变量仅声明一次
if (!window.originalTitle) {
  window.originalTitle = null;
}
if (!window.flashIntervalId) {
  window.flashIntervalId = null;
}
if (!window.flashTimeoutId) {
  window.flashTimeoutId = null;
}

// 工具函数 - 请求通知权限
function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("悉犀客服平台辅助工具 | This browser does not support desktop notification");
    return Promise.resolve('denied'); // 浏览器不支持通知，则默认拒绝
  }

  if (window.notificationPermissionRequested) {
    // 如果已经请求过权限，直接返回当前权限状态
    return Notification.permission;
  }

  window.notificationPermissionRequested = true; // 标记为已请求

  // 尝试获取或确认通知权限
  return Notification.requestPermission().then(function(permission) {
    console.log(`悉犀客服平台辅助工具 | Notification permission was ${permission}.`);
    return permission;
  }).catch(error => {
    console.error("悉犀客服平台辅助工具 | Error requesting notification permissions:", error);
    return 'denied'; // 发生错误，默认拒绝
  });
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

// 功能 - 闪烁标题
function flashPageTitle(message, duration) {
    // 如果已经有闪烁效果在运行，则先停止它们
    if (window.flashIntervalId !== null) {
        clearInterval(window.flashIntervalId);
        clearTimeout(window.flashTimeoutId);
    }

    // 保存原始标题
    if (window.originalTitle === null) {
        window.originalTitle = document.title;
    }

    // 设置新的标题并开始闪烁
    const newTitle = message;
    document.title = newTitle;

    // 创建闪烁效果
    function flashTitle() {
        document.title = document.title === newTitle ? window.originalTitle : newTitle;
    }

    // 启动闪烁
    window.flashIntervalId = setInterval(flashTitle, 500); // 每500毫秒切换一次

    // 在指定时间后停止闪烁并恢复原始标题
    window.flashTimeoutId = setTimeout(() => {
        clearInterval(window.flashIntervalId); // 停止闪烁
        document.title = window.originalTitle; // 恢复原始标题
        // console.log('悉犀客服平台辅助工具 | 已移除闪烁效果，并恢复原始标题');

        // 清除标识符以便下次调用
        window.flashIntervalId = null;
        window.flashTimeoutId = null;
    }, duration || 5000); // 默认五秒后执行
}

// 功能 - 发送第一条提醒
async function checkSendFirstReminder() {
  const permission = await requestNotificationPermission();
  if (permission === "granted") {
    new Notification('悉犀客服平台辅助工具', {
      body: '悉犀客服平台辅助工具正在运行...',
      tag: '悉犀客服平台辅助工具提示',
      silent: false,
      renotify: true
    });
  }
}

// 将函数暴露给全局对象（如 window），以便可以在其他地方调用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = flashPageTitle;
} else {
    window.flashPageTitle = flashPageTitle;
}


// 功能 - 检查新消息元素是否存在并弹出提示框
function checkNewMessages() {
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
    console.log("悉犀客服平台辅助工具 | 未检测到新消息...");
  }
}

// 功能 - 设置定时检查新消息
async function handleCheckNewMessages() {
  const permission = await requestNotificationPermission();
  if (permission === "granted") {
    // checkNewMessages(); // 首次立即检查
    setInterval(checkNewMessages, 3000); // 每隔3秒检查一次
  }
}

// 功能 - 统计特定格式时间的数量并显示
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

// 工具 - 创建 WebSocket 连接管理函数
function createWebSocket(url) {
  let socket = null;
  let isConnecting = false; // 是否正在连接中
  const reconnectInterval = 3000; // 重连间隔时间（毫秒）
  const pendingMessages = []; // 存储未发送的消息

  function connect() {
      // console.log('悉犀客服平台辅助工具 | Websocket | 尝试建立连接');
      if (isConnecting) {
        // console.log('WebSocket 连接正在建立中，跳过本次请求');
        return; // 如果已经在连接中，直接返回
      }
      isConnecting = true;
      reconnectAttempts = 0; // 重置重连尝试次数

      socket = new WebSocket(url);
      
      socket.onopen = () => {
          console.log('悉犀客服平台辅助工具 | Websocket | 连接已成功打开');
          isConnecting = false;
          reconnectAttempts = 0; // 重置重连尝试次数
          // 发送所有待发送的消息
          while (pendingMessages.length > 0) {
              const message = pendingMessages.shift();
              socket.send(message);
          }
      };
      socket.onerror = (error) => {
          // console.error('悉犀客服平台辅助工具 | Websocket | 连接发生错误:', error);
          isConnecting = false;
      };
      socket.onclose = () => {
          // console.log('悉犀客服平台辅助工具 | Websocket | 连接已关闭');
          isConnecting = false;
      };
  }

    // 定期检测连接状态
    setInterval(() => {
      if (socket && socket.readyState !== WebSocket.OPEN) {
          console.log('悉犀客服平台辅助工具 | Websocket | 检测到连接已断开，尝试重新连接');
            connect();
      }
    }, reconnectInterval);

  // 初始化连接
  connect();

  return {
      send: (data) => {
          if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(data);
          } else {
              console.error('悉犀客服平台辅助工具 | Websocket | 连接未建立，消息已加入待发送队列');
              pendingMessages.push(data); // 将消息加入待发送队列
              connect(); // 尝试建立连接
          }
      },
      onmessage: (callback) => {
          socket.onmessage = callback;
      },
      onerror: (callback) => {
          socket.onerror = callback;
      },
      onclose: (callback) => {
          socket.onclose = callback;
      }
  };
}

// 确保脚本在页面完全加载后执行
window.addEventListener('load', function() {
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

  handleCheckNewMessages();
  console.log("悉犀客服平台辅助工具 | Initial handleCheckNewMessages call");

  // 首次加载时更新计数
  updateCountDisplay();
  // 定时更新一次计数
  setInterval(updateCountDisplay, 30000);
  // 监听DOM变动时更新计数
  const observer = new MutationObserver(updateCountDisplay);
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("悉犀客服平台辅助工具 | Initial updateCountDisplay call");
  



  // 并通过自定义协议发送给Electron程序
  console.log('悉犀客服平台辅助工具 | DOMContentLoaded Electron test');
  
  // 确保#electronTestBox存在
  const electronTestBox = document.getElementById('electronTestBox');
  if (!electronTestBox) {
      console.error('悉犀客服平台辅助工具 | #electronTestBox not found');
      return;
  }

  // 创建输入框并设置类名
  const input = document.createElement('input');
  input.className = 'electron-input';

  // 创建按钮并设置类名
  const button = document.createElement('button');
  button.className = 'electron-button';
  button.innerText = 'Send to Electron';

  // 创建 WebSocket 连接
  const socket = createWebSocket("ws://localhost:8082");

  // 添加按钮点击事件监听器
  button.addEventListener('click', () => {
    const data = { name: 'John', age: input.value };
    const json = JSON.stringify(data); // 将对象转换为 JSON 字符串
    socket.send(json);
  });

  // 监听 WebSocket 消息
  socket.onmessage = (event) => {
      console.log('Received message from Electron app:', event.data);
  };

  // 将输入框和按钮添加到#electronTestBox
  electronTestBox.appendChild(input);
  electronTestBox.appendChild(button);

});
