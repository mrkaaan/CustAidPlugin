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
      // alert("检测到带有文本内容的指定元素！");
      console.log("悉犀客服平台辅助工具 | 检测到带有文本内容的指定元素！");
      
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

    // 查找目标header元素
    const header = document.querySelector(".online-touch-explorer-closed-touch-list_collapsed header");
    if (header) {
      // 查找原本存在的number元素
      console.log("悉犀客服平台辅助工具 | header found");
      const originalNumberSpan = header.querySelector(".online-touch-explorer-closed-touch-list_number");

      if (originalNumberSpan) {
        // 创建新的span用于显示计数，并设置样式以确保它位于原number元素的右边
        console.log("悉犀客服平台辅助工具 | originalNumberSpan found")
        let newCountSpan = header.querySelector(".custom-count-span");
        if (!newCountSpan) {
          console.log("悉犀客服平台辅助工具 | newCountSpan not found, creating new one");
          newCountSpan = document.createElement('span');
          newCountSpan.className = "custom-count-span";
          // 插入到originalNumberSpan之后
          originalNumberSpan.parentNode.insertBefore(newCountSpan, originalNumberSpan.nextSibling);
        }

        // 更新新span的内容
        newCountSpan.textContent = ` | 计数: ${count}`;
      }
    } else{
      console.log("悉犀客服平台辅助工具 | header not found");
    }
  }

  // 监听DOM变动
  const observer = new MutationObserver(updateCountDisplay);
  observer.observe(document.body, { childList: true, subtree: true });

  // 初始调用以确保首次加载时更新计数
  console.log("悉犀客服平台辅助工具 | Initial updateCountDisplay call");
  updateCountDisplay();

});

// 监听来自background脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "pageLoaded" || request.action === "tabActivated") {
    // 在这里放置当页面加载完成或标签页激活时要执行的代码
    console.log(`${request.action} - 执行必要的初始化或更新`);
  }
});