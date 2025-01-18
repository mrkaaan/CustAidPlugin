# CustAidDesktop

浏览器拓展插件 - 悉犀客服平台辅助工具

使用过千牛客服平台，后转用悉犀，使用过程中发现悉犀客服平台的一些功能不够完善，悉犀作为网页端没有千牛这个本地应用的灵活，比如新消息的提示，悬浮窗的提示等。因此，开发了这个浏览器插件，用来辅助悉犀客服平台的使用。

## 功能

- 进入对应页面的提示
- 新消息提示：当有新消息时，会有Notification提示，Toast提示，标题栏闪烁，悬浮窗提示（开发中）
- 今日接单人数的统计
- cookie隔离，修改悉犀平台一个浏览器只能登陆一个账号的限制（开发中）
- 通过对接本地程序实现悬浮窗提示（开发中）


### 浏览器扩展基础知识

谷歌浏览器扩展，使用`manifest.json`定义权限和背景脚本。该扩展将监听网页上的特定元素变化，并向其他浏览器发送通知。

- **Manifest 文件**: 需要声明必要的权限，例如 `"activeTab"`、`"background"` 和 `"notifications"`。
- **内容脚本**: 用于注入到淘工厂网页，监控指定元素的变化 content.js。
- **后台脚本**: 负责管理事件监听器、与内容脚本通信以及与外部服务器通信 backgroud.js。

### 跨浏览器通信

由于浏览器实例是独立的，直接通信可能不是最简单的方法。通过一个中心化的后端服务来中转信息。每个浏览器扩展可以连接到这个服务，并订阅相关的消息更新。

