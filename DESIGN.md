---
name: Header Studio
description: A compact, trustworthy header rule editor for developers and testers.
colors:
  primary: "oklch(0.62 0.16 68)"
  primary-hover: "oklch(0.54 0.16 68)"
  background: "oklch(1 0 0)"
  surface: "oklch(0.97 0.004 68)"
  ink: "oklch(0.22 0.012 68)"
  muted: "oklch(0.48 0.014 68)"
  border: "oklch(0.87 0.008 68)"
  success: "oklch(0.52 0.14 150)"
  danger: "oklch(0.56 0.19 28)"
typography:
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "6px"
  md: "10px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "7px 9px"
---

# Design System: Header Studio

## 1. Overview

**Creative North Star: "The Calibrated Workbench"**

这是一个长时间停留在开发者视线边缘的精密工具。界面采用纯白工作面、浅中性工具栏和少量琥珀色状态强调，信息密度接近浏览器 DevTools，而不是营销后台。

布局依靠分隔线、对齐和层级建立结构，不依靠层层卡片。所有状态变化都应迅速、安静、可逆。

**Key Characteristics:**

- 紧凑但不拥挤
- 生效状态明确
- 字段对齐稳定
- 高级能力渐进呈现

## 2. Colors

纯白与中性灰构成工作面，琥珀色只用于主操作、选中项和生效状态。

### Primary

- **Workbench Amber** (`oklch(0.62 0.16 68)`): 主按钮、焦点与当前 Profile。

### Neutral

- **Clean Canvas** (`oklch(1 0 0)`): 主背景和输入框。
- **Tool Rail** (`oklch(0.97 0.004 68)`): 侧栏与工具条。
- **Graphite Ink** (`oklch(0.22 0.012 68)`): 主文本。
- **Measured Gray** (`oklch(0.48 0.014 68)`): 次级说明。

**The Sparse Accent Rule.** 琥珀色面积不超过可见界面的 10%，只表达操作与状态。

## 3. Typography

**Display Font:** Inter (with system-ui fallback)

**Body Font:** Inter (with system-ui fallback)

**Label/Mono Font:** ui-monospace for regex and technical values

**Character:** 单一无衬线家族保持工具一致性，技术表达使用等宽字体以提高可扫描性。

### Hierarchy

- **Headline** (700, 16px, 1.35): 当前 Profile 名称。
- **Title** (650, 13px, 1.4): 分组与列表项名称。
- **Body** (400, 13px, 1.45): 输入和说明。
- **Label** (600, 12px, 1.3): 字段标签与列标题。

**The Quiet Type Rule.** 不使用展示字体、巨型标题或大写字距装饰。

## 4. Elevation

界面默认扁平，依靠色阶和 1px 分隔线组织层级。只有浮层菜单使用紧凑结构阴影；焦点使用明确轮廓而非阴影装饰。

**The Flat-By-Default Rule.** 静止表面不悬浮，阴影只属于脱离文档流的浮层。

## 5. Components

### Buttons

- **Shape:** 紧凑矩形，6px 圆角。
- **Primary:** 琥珀色填充、白色文字、8px 12px 内边距。
- **Hover / Focus:** 加深填充；焦点使用 2px 外轮廓。
- **Secondary / Ghost:** 中性描边或透明背景，不使用宽阴影。

### Chips

- **Style:** 只用于匹配类型和状态，浅色底、深色字。
- **State:** 选中态使用边框和图标共同表达。

### Cards / Containers

- **Corner Style:** 主布局不用卡片；必要的空状态容器最高 10px。
- **Background:** 白色内容面与浅灰工具面。
- **Shadow Strategy:** 无。
- **Border:** 1px 中性分隔线。
- **Internal Padding:** 12–16px。

### Inputs / Fields

- **Style:** 白底、1px 中性边框、6px 圆角。
- **Focus:** 琥珀边框配 2px 半透明轮廓。
- **Error / Disabled:** 错误文字就地显示；禁用态降低对比并保持标签可读。

### Navigation

左侧 Profile 列表固定宽度。当前项使用浅琥珀底、深色文字和独立启用开关；不依赖颜色单独表达选中状态。

### Header Row

每行按“启用、操作、名称、值、删除”稳定对齐。名称输入提供常见 Header 建议，但允许任意合法名称。

## 6. Do's and Don'ts

### Do:

- **Do** 保持 12–13px 标签与 13px 正文的紧凑比例。
- **Do** 为开关、按钮、输入框提供 `:focus-visible` 状态。
- **Do** 同时用文字、图标或控件位置表达启用和错误状态。

### Don't:

- **Don't** 制作营销型 SaaS 仪表盘、玻璃拟态或紫色渐变。
- **Don't** 使用超过 16px 的卡片圆角或无意义的大面积阴影。
- **Don't** 把每组字段包装成独立卡片，或用装饰性动画打断编辑流程。
- **Don't** 使用彩色粗侧边条作为列表项或提示的强调方式。
