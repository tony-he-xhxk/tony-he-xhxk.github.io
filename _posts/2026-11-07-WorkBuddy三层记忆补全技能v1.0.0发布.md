---
layout: post
title: WorkBuddy 三层记忆补全技能 v1.0.0 发布！
date: 2026-11-07
tags: [技术分享, WorkBuddy, 实用工具分享]
images:
  - src: /assets/images/posts/2026-11-07-WorkBuddy三层记忆补全技能/memory-recall-1-github-repository.webp
    alt: GitHub 上的 wb-memory-recall 仓库首页：README 介绍三层记忆自动注入与按需读全功能
  - src: /assets/images/posts/2026-11-07-WorkBuddy三层记忆补全技能/memory-recall-2-github-release.webp
    alt: GitHub Release 页面：WorkBuddy 三层记忆补全技能 v1.0.0，包含功能说明、安装步骤和 memory-recall.zip
---

大家在使用WorkBuddy的时候，有没有这样的体验：明明模型在其他会话已经踩过坑，并且你看着它把这个踩坑写进长期记忆，但是开启新会话之后，可能又把同样的坑踩一遍？

据星河君的WorkBuddy自述，每个会话开头并不是什么都没有的，它会带上长期记忆文件和用户的自定义指令；但是由于记忆文件比较长，很可能在某处直接截断，模型可能没读到长期记忆文件里关于这个坑的章节，文件可能就直接被截断了；如果模型想了解完整的内容，需要它自己突然“开智”去回忆一下：“诶，我是不是之前做过这个任务，那时候怎么踩的坑？”，并且主动读一次长期记忆文件，才会知道。但是显然，后者需要特别聪明的模型才能看到这一点，并且具有极大的不确定性：很多模型就直接聚焦于当前的任务，而非以前踩过的坑。

这真是一个痛点：用户眼睁睁看着模型在它曾经记载过的坑上，再栽倒一次，于是很多人认为WorkBuddy上的大模型普遍“记性不太好”。实际上用户每次开新对话，只需要跟WorkBuddy说一句“请先读取长期记忆文件”，就能解决这个问题；但每次说，未免也太麻烦了一点。

这就是星河君最近做的一个小技能的初衷。

这个技能能够：精准把WorkBuddy的三层长期记忆（用户级 `MEMORY.md` / 项目级 `MEMORY.md` / 最近几日日报）在会话开头自动灌进上下文，需要时再读全文。或者，用户可以手动触发这个技能，让模型读取完整的三层记忆。具体如下：

- 自动注入：`SessionStart` hook 在开会话时输出一份 ≤18 KB 的精简版，按 ★ / 铁律 / 踩坑 / 纠正 加权挑章节，并明确列出哪些章节被省略。

- 按需读全：输入 `/memory-recall` 时分层定位 + 分片读完全文。

这样，就可以让WorkBuddy在开工前，就读取记忆的完整片段，降低其反复踩同一个坑的概率。

星河君已经将技能打包为zip并开源在GitHub上：

[https://github.com/tony-he-xhxk/wb-memory-recall/releases/tag/v1.0.0](https://github.com/tony-he-xhxk/wb-memory-recall/releases/tag/v1.0.0)

请下载zip文件并按照用户版README的指引完成初始化步骤，即可。

**注意：**仓库根目录/蓝奏云根目录 的README是给你看的用户版README，技能包里的README是给WorkBuddy看的AI版README。

**声明：**本技能是用户技能，与WorkBuddy开发团队无关。本技能在GitHub上以MIT协议开源，可自由分发复制，星河君不考虑闭源或将其用于商业项目中。
