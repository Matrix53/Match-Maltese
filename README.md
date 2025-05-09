# 线条小狗连连看 (Line Art Dog Memory Match)

一个有趣的线条小狗主题记忆配对游戏，结合了美观的动画效果、连击系统、成就系统和竞争性的排行榜功能。

![游戏截图](./images/win.jpeg)

## 游戏描述

线条小狗连连看是一个经典的记忆配对游戏。玩家需要翻转卡片，找出配对的图案。游戏使用线条风格的小狗图案，界面简洁可爱，适合所有年龄段的玩家。游戏中隐藏了多个彩蛋和成就等你发现！

## 特点

- 🎮 简单易上手的游戏玩法
- 🐕 可爱的线条小狗主题
- 🎯 实时计分和计时系统
- 🔥 连击系统，连续匹配获得更高分数
- 🏆 成就系统，解锁隐藏彩蛋
- 📊 本地排行榜功能
- 🎵 背景音乐和丰富音效
- 🎉 精美的视觉特效和动画
- 📱 响应式设计，支持各类设备（手机、平板和桌面）
- 🔄 多浏览器兼容性（特别优化了Firefox和Edge浏览器）

## 游戏规则

1. 点击"开始游戏"按钮开始新游戏
2. 点击卡片将其翻转
3. 每次只能翻转两张卡片
4. 如果两张卡片匹配，它们将保持翻转状态
5. 如果两张卡片不匹配，它们将自动翻回
6. 连续快速匹配可以触发连击，获得额外分数奖励
7. 游戏限时60秒，在时间结束前尽可能多地匹配卡片对
8. 成功匹配所有卡片对将获得胜利，并记录得分
9. 尝试完成各种隐藏成就以解锁彩蛋

## 分数系统

- 基础分数：每对匹配的卡片可获得最多200分
- 匹配速度：匹配越快，获得分数越高
- 连击奖励：
  - 连续匹配2张卡片：1.5倍分数
  - 连续匹配3张或更多：2倍以上分数，最高可达5倍
- 分数等级：根据累计分数解锁炫酷的分数显示特效

## 成就系统

游戏包含多个隐藏成就，通过不同的游戏行为解锁：

- 尝试发现游戏界面中的小彩蛋
- 尝试特定的卡片翻转模式
- 达到特定分数或连击次数
- ...更多等你发现！

## 技术细节

本游戏使用纯前端技术开发：

- HTML5
- CSS3 (包括高级动画和响应式设计)
- JavaScript (ES6+)
- 本地存储 (localStorage) 用于保存排行榜数据和成就数据

### 文件结构

```
Match-Maltese/
├── index.html        # 游戏主页面
├── style.css         # 样式表
├── script.js         # 游戏逻辑
├── README.md         # 项目说明
├── LICENSE           # MIT许可证
├── images/           # 游戏图片资源
│   ├── cards/        # 卡片图片
│   ├── hidden/       # 彩蛋图片
│   ├── status_*.png  # 状态栏图片
│   ├── *.svg         # SVG资源
│   ├── win.jpeg      # 胜利图片
│   └── fail.jpeg     # 失败图片
└── sounds/           # 游戏音效
    ├── background.mp3  # 背景音乐
    ├── score.mp3       # 得分音效
    ├── win.mp3         # 胜利音效
    ├── combo.mp3       # 连击音效
    ├── super_combo.mp3 # 超级连击音效
    ├── fail.mp3        # 失败音效
    └── achieve.mp3     # 成就解锁音效
```

### 功能亮点

- **动态分数系统**: 匹配速度越快，获得的分数越高
- **连击机制**: 快速连续匹配获得分数倍率，最高5倍
- **视觉特效**: 连击特效、匹配特效、分数动画等多种视觉反馈
- **成就系统**: 多个隐藏成就和彩蛋等你发现
- **排行榜**: 保存玩家最高分，支持分享功能
- **时间警告**: 剩余时间过少时有友好提示
- **多设备优化**: 针对不同屏幕尺寸和方向进行了优化
- **浏览器兼容性**: 特别针对Firefox和Edge浏览器进行了优化

## 如何运行

1. 克隆或下载此仓库
2. 使用网页浏览器打开 `index.html` 文件
3. 开始享受游戏！

## 兼容性

游戏已针对以下环境进行了优化：

- 现代浏览器 (Chrome, Firefox, Safari, Edge)
- 移动设备 (iOS, Android)
- 各种屏幕尺寸和方向（横屏、竖屏）
- 特别适配了Firefox和Edge浏览器的特性

## 未来计划

- [ ] 添加多种游戏难度
- [ ] 实现在线排行榜
- [ ] 增加更多卡片主题
- [ ] 添加声音设置选项
- [ ] 增加更多成就和彩蛋
- [ ] 添加教程模式
- [ ] 多语言支持

## 许可证

此项目采用 MIT 许可证 - 详情请见 [LICENSE](./LICENSE) 文件。

## 作者

该游戏由纯前端技术爱好者开发，旨在创建一个有趣且美观的记忆游戏。

---

祝您游戏愉快！🐶

PS: 试着点击游戏界面中的小狗图像，或者按特定顺序翻转卡片，你可能会发现一些惊喜！