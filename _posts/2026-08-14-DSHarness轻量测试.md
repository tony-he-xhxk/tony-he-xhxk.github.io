---
layout: post
title: 我对 DS Harness 进行了轻量测试，结果如何？
date: 2026-08-14
tags: [技术分享, 水]
images:
  - src: /assets/images/posts/2026-08-14-DSHarness/dsh-1.png
    alt: DS Harness 测试数据截图 1
  - src: /assets/images/posts/2026-08-14-DSHarness/dsh-2.png
    alt: DS Harness 测试数据截图 2
  - src: /assets/images/posts/2026-08-14-DSHarness/dsh-3.png
    alt: DS Harness 前端测试页面截图
  - src: /assets/images/posts/2026-08-14-DSHarness/dsh-4.png
    alt: DS Harness 前端测试页面截图
---

星河君今天在一台 Ubuntu 24.04 虚拟机上部署了 DS Harness，并进行了一些轻量级的测试，用的是 v4f 模型。我一共进行了 6 项测试，前 5 项主要考察模型的基础编程能力，最后 1 项是前端界面生成。

先叠个甲：因为这些任务都是轻量级别的测试，没有涉及到全栈的开发，也没有涉及到非常复杂的逻辑撰写，结果也只代表我的测试环境的结果，所以测试结果和模型能力不能外推。

几项数据如图 1-2，任务 6 的前端界面的部分截图如图 3-4（没截全，只是给大家粗略看一下效果）。

基础的编程是没问题的，而且由于是 v4f 模型，速度非常快，都是一次性通过验收，没有作弊行为。

**基础编程给到夯。**

前端审美总体看起来比较舒服，元素比较到位，配色也有讲究；

总体的体验比较丝滑，交互体验不错；

咖啡杯是纯 CSS 画的，略显粗糙，但是咖啡杯上的动态冒起的热气效果还是不错的；

图标元素设计偏常规，没有创新点可言。

**前端给到人上人（高配版）。**

现在 DS 还没上调定价，这个轻量级测试下来，总共用了 0.26r，Token 数 1322592，缓存命中率 94%。

这里是一份总结文档：

[https://docs.qq.com/aio/DZVZWTUJJRXBmU2Jk](https://docs.qq.com/aio/DZVZWTUJJRXBmU2Jk)

大家可以仔细看看，也欢迎在评论区分享你实测 DS Harness 的效果如何。由于我的技术能力限制，没能进行全栈的高难度实测，各位可以拿复杂的项目给 DS Harness 出考题喵，然后也可以分享你对 DS Harness 的看法，你会不会把 DS Harness 作为主力使用呢？🥰