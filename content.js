// 确保脚本在页面完全加载后执行
window.addEventListener('load', function() {

  // 功能1：进入对应网站的提示 工具正在运行
  alert("悉犀客服平台辅助工具 正在运行");

  // 功能2：拦截ctrl+W关闭窗口的操作，弹出提示框
  // window.addEventListener('keydown', function(event) {
  //   if (event.key === 'w' && event.ctrlKey) {
  //     event.preventDefault();
  //     if (confirm("你按下了Ctrl + W。是否要关闭此标签页？")) {
  //       window.close();
  //     }
  //   }
  // });

  // 功能3：检查某个元素是否存在并弹出提示框
  function checkElementPresence() {
    const element = document.querySelector("[class$='online-touch-timer_container']");
    if (element && element.textContent.trim()) {
      alert("检测到带有文本内容的指定元素！");
    }
  }

  setInterval(checkElementPresence, 3000);

  // 功能4：统计特定格式时间的数量并在页面上显示
  function updateCountDisplay() {
    const elements = document.querySelectorAll("[class$='online-touch-explorer-member-card_end-time']");
    let count = 0;

    elements.forEach(element => {
      const timeMatch = element.textContent.match(/(\d{2}:\d{2})/);
      if (timeMatch) {
        count++;
      }
    });

    const header = document.querySelector(".online-touch-explorer-closed-touch-list_collapsed header");
    if (header) {
      let numberSpan = header.querySelector(".online-touch-explorer-closed-touch-list_number");
      if (!numberSpan) {
        numberSpan = document.createElement('span');
        numberSpan.className = "online-touch-explorer-closed-touch-list_number";
        header.appendChild(numberSpan);
      }
      numberSpan.textContent = `计数: ${count}`;
    }
  }

  // 监听DOM变动
  const observer = new MutationObserver(updateCountDisplay);
  observer.observe(document.body, { childList: true, subtree: true });

  // 初始调用以确保首次加载时更新计数
  updateCountDisplay();

});

// 监听来自background脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "pageLoaded" || request.action === "tabActivated") {
    // 在这里放置当页面加载完成或标签页激活时要执行的代码
    console.log(`${request.action} - 执行必要的初始化或更新`);
  }
});