# WebNav Hub - 粘土拟物化导航中心

灵感来自高端机械键盘的粘土拟物化导航中心。柔和3D圆角按钮，灰白色背景，焦橙色点缀，几何无衬线字体。

## 设计风格

网站采用 **Claymorphism (粘土拟物化)** 风格，通过柔和的阴影效果，创造出一种像粘土一样柔软、立体的感觉，完美复刻了键盘按键的圆润和厚实质感。

主要设计元素包括：

- **简洁的 3D 圆角按钮**: 所有交互元素都具有圆润的边缘和立体感。
- **灰白色背景**: 整体背景采用干净、柔和的灰白色调。
- **中性灰色调色板**: 以浅灰色和骨白色为主色调，辅以焦橙色作为强调色。
- **几何无衬线字体**: 使用 Inter 字体，现代且易读。

## 功能

- **分类导航**: 将链接按类别分组，方便快速查找。
- **平滑滚动**: 点击导航链接时，页面会平滑滚动到对应分类。
- **返回顶部**: 页头滚出视口后显示粘土拟物化圆形按钮，一键返回顶部。
- **键盘友好**: 每张卡片都是原生链接，`Tab` / `Enter` 直接可用，并有清晰的 `:focus-visible` 焦点环和「跳到主要内容」链接。
- **响应式设计**: 适配不同屏幕尺寸，针对移动端优化，导航在窄屏改为单行横向滚动。
- **深色模式**: 跟随系统配色（`light-dark()`），无需额外切换按钮。
- **高性能优化**: 首屏之外的分类延后渲染，滚动相关交互不监听 `scroll` 事件。

## 技术栈

- HTML5
- CSS3 (自定义属性, Grid, Flexbox, 动画, `light-dark()`, `content-visibility`)
- JavaScript (IntersectionObserver, `scrollend`)
- Google Fonts (Inter 字体)
- 内联 SVG 图标精灵（图形来自 Font Awesome Free 6.7.2，CC BY 4.0），不再依赖图标字体与第三方 CSS

## 使用说明

1. 打开 `index.html` 文件即可使用。
2. 点击顶部导航栏中的分类链接，可以快速跳转到对应的内容区域。
3. 点击任意链接卡片，即可在新标签页中打开对应的网站。
4. 使用键盘的 `Tab` 键可以在链接卡片间导航，按 `Enter` 或 `Space` 键激活链接。
5. 滚动页面超过300px后，右下角会显示返回顶部按钮，点击可平滑滚动到页面顶部。

## 文件结构

```
.
├── index.html       # 主页面
├── style.css        # 样式文件
├── main.js          # 交互逻辑
└── README.md        # 项目说明文档
```

## 性能优化

### 渲染

- **延后渲染首屏之外的分类**: 第二个及以后的 `.link-grid` 使用 `content-visibility: auto` + `contain-intrinsic-size`，布局与绘制按需发生，且不会造成滚动跳动。
- **去掉强制合成层**: 不再对每个卡片 `translateZ(0)` / `will-change`，避免上百个图层的内存与合成开销。
- **CSS 动画只走合成器**: 位移统一用 `translate` / `scale` 独立变换属性，过渡只声明真正变化的属性，不再使用 `transition: all`。
- **移除持续动画**: 标题流光与整页 `filter: blur()` 入场动画已删除，避免持续的整页重绘。

### 交互

- **不监听 `scroll`**: 当前分类高亮优先用浏览器原生的 `scroll-target-group` + `:target-current`（Chrome 140+），其余浏览器回退到 `IntersectionObserver`；返回顶部按钮同样用 `IntersectionObserver`。
- **原生行为优先**: 卡片是 `<a>`，锚点跳转、平滑滚动、键盘操作全部由浏览器处理，JS 只保留约 70 行。

### 资源与样式

- **图标不再走字体**: 197 个图标改为文档内的 SVG 精灵（126 个 `<symbol>`，每个只保留实际用到的图形），一次传输、随首屏渲染、可用 `currentColor` 着色。按 6.7.2 版本实测，这省掉了 Font Awesome 的 `all.min.css`（73.9 KB，gzip 21.3 KB）与 solid / brands / regular 三套 webfont（158 + 119 + 25 = 302 KB），代价是 `index.html` 从 50 KB 增到 136 KB（gzip 6.1 KB → 33.5 KB）；首屏传输量净减约 296 KB，请求数减少 4 个，也不再需要第三方 CDN 与 SRI。
- **单一外部依赖**: 只剩 Google Fonts；样式表很小且自带 `font-display: swap`，直接同步加载，避免 `preload` + `onload` 在慢网络下的图标/文字闪烁。
- **精简字体请求**: 只请求实际用到的字重（400/500/600/800）。
- **字体交换不跳动**: `font-size-adjust: from-font` 按主字体的 x-height 缩放回退字体，减少字体加载完成时的版面位移。
- **内容安全策略**: 通过 meta CSP 只允许同源脚本、同源样式与 Google Fonts 的字体来源，页面内没有任何内联脚本/内联样式/内联事件处理器。
- **标准滚动条**: 用 `scrollbar-color` / `scrollbar-width` 替代 `::-webkit-scrollbar`，仅在必要时回退。
- **单层背景装饰**: 把两个全屏固定伪元素合成为一个。

## 响应式设计

- 针对平板、手机等不同屏幕尺寸进行了优化，确保在各种设备上都有良好的用户体验。
- 返回顶部按钮在移动端自动调整大小和位置。
- 卡片网格布局根据屏幕尺寸自适应调整。

## 键盘支持

- 卡片与导航链接都是原生 `<a>`，`Tab` / `Enter` 由浏览器直接支持（不再需要自定义键盘处理）。
- 页面顶部有「跳到主要内容」链接，可直接跳过导航。
- 当前分类通过 `aria-current` 暴露给辅助技术，并有可见的 `:focus-visible` 焦点环。

## 自定义

- **颜色**: 可以通过修改 `:root` 中的 CSS 自定义属性来更改主题色。
- **字体**: 可以替换 Google Fonts 链接来使用其他字体。
- **布局**: 可以调整 `.link-grid` 的 `grid-template-columns` 来改变卡片的排列方式。

## 更新日志

### v4.0 - 按 Modern Web Guidance 全面优化
- 图标从 Font Awesome webfont 改为内联 SVG 精灵，移除第三方图标 CSS、三套字体与 cdnjs 预连接
- 当前分类高亮改用原生 `scroll-target-group` + `:target-current`，`IntersectionObserver` 作为回退，并用 `scrollend` 同步 `aria-current`
- 字体加载简化为同步样式表（去掉 `preload` + 内联 `onload`），加入 `font-size-adjust: from-font`
- 新增 meta CSP（同源脚本/样式 + Google Fonts 字体源）、`theme-color`（浅/深色各一）
- 删除不再被引用的 `style_simplified.css`

### v3.0 - 现代 Web 平台版本
- 卡片改为语义化链接，修复了链接无可访问名称、焦点环被裁剪的问题
- 颜色系统改用 `color-scheme` + `light-dark()`，移除重复的深色模式覆盖
- 使用 `content-visibility`、独立变换属性和 `IntersectionObserver` 优化渲染与交互
- 滚动条改用标准属性，Font Awesome 增加 SRI，字体请求精简
- 支持系统字号缩放（`<meta name="text-scale">`）与强制配色模式

### v2.0 - 性能优化版本
- 重构CSS样式系统，简化阴影和渐变效果
- 优化JavaScript代码，移除复杂API调用
- 增加低性能设备自动适配功能
- 简化动画效果，提高整体流畅度
- 减少文件大小，优化加载速度

### v1.0 - 初始版本
- 完整的粘土拟物化设计
- 机械键盘风格的交互效果
- 响应式布局设计
- 键盘导航支持