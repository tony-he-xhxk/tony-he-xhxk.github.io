---
layout: post
title: ActivityWatch AI 智能分类+自包含看板开源啦！🎉
date: 2026-08-09
tags: [VibeCoding, 电脑时间监测软件, 实用工具分享]
images:
  - src: /assets/images/posts/2026-08-09-ActivityWatch/aw-1.webp
    alt: ActivityWatch AI 分类器界面截图
  - src: /assets/images/posts/2026-08-09-ActivityWatch/aw-2.webp
    alt: ActivityWatch 看板演示截图
---

说来惭愧喵。上次发了一篇帖子说这个工具"近期不会开源"，结果被 WorkBuddy 追着改了整整一天——修了 50+ 个 bug、做了全配置外部化、换了标准库替代第三方依赖、删掉了所有个人信息——现在它已经是一个正经的项目了，不拿出来有点说不过去。不开源让大家感觉星河君在炫耀什么，这可不好喵。

星河君最初的想法很简单：ActivityWatch 手动分类太累了，Category Builder 加规则加到手软，干脆让 AI 来干。Python 脚本从 AW 读取窗口活动（应用名 + 标题），清洗去重后丢给 AI 分类，结果写回 AW，再生成一个自包含的 HTML 看板——数据直接嵌在文件里，双击就开，不用搭服务器。

最开始只接了一个 DeepSeek API，后来考虑到开源项目的普适性，于是改成了多提供商支持：DeepSeek / OpenAI / 任何兼容接口，改一行配置就能切换喵。分类体系也从原来的粗糙切分细化成了 17 个类别——AI 对话、编程开发、技术社区、视频娱乐、购物消费……基本覆盖了日常能遇到的窗口类型。

最让星河君满意的几个设计：

① **无脑装依赖**（新增！）。把仓库 clone 下来之后，在目录运行 `pip install -r requirements.txt`，自动安装必需的依赖。

② **一键 bat 脚本**。双击就跑，自动检测依赖、首次自动做 7 天全量初始化、生成本地看板后浏览器弹出。之后每次双击只处理增量数据，几秒钟完成。

③ **热规则修正**（新增！）。AI 分类难免有不准的时候，但不用改代码——在 `hot-rule.txt` 里用自然语言写一句"当标题包含腾讯文档时，应分类为文档写作"，保存即生效。

④ **自包含看板**。饼图、柱状图、明细表全在一个 HTML 里，按 今天/3天/7天 切换。右上角还有个生成长图按钮，点一下就导出高清截图（图 2 就是虚构数据生成的长图）。

⑤ **全配置驱动**。分类提示词、已知应用映射、站点识别规则、类别颜色、API 参数……全都外置在 `config.json`、`prompt.txt`、`site-patterns.json` 里，不用改一行 Python 代码就能定制。

代码已经开源在 GitHub：

[https://github.com/tony-he-xhxk/activitywatch-ai-classifier](https://github.com/tony-he-xhxk/activitywatch-ai-classifier)

欢迎提 issue 或者 PR。

星河君自己已经用了好几天了，后面有什么 bug 继续修！🥰 如果你觉得这个项目对你有用，欢迎来 GitHub 给上一颗 star！

最近台风天，大家要注意安全啊！