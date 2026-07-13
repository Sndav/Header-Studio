# Product

## Register

product

## Users

开发与测试人员。他们在调试 API、跨域行为、缓存策略、代理链路和环境切换时，需要快速、可控地改写浏览器请求与响应头。

## Product Purpose

提供一个本地优先、可审计的 Chrome 扩展，用 Profile 组织 Header 改写规则。多个 Profile 可以同时启用，并按 URL/Host 通配符或正则匹配生效。成功意味着用户能清楚知道哪些规则已启用、将影响哪些 URL，并能随时暂停或修改。

## Brand Personality

克制、可靠、专业。界面延续 ModHeader 一类开发者工具的紧凑操作感，但避免视觉噪音和含糊状态。

## Anti-references

避免营销型 SaaS 仪表盘、玻璃拟态、紫色渐变、过度圆角、装饰性动画，以及把每一组字段都包装成独立卡片的低密度布局。

## Design Principles

1. 当前生效状态始终可见，开关的作用对象必须明确。
2. 常用操作一两步完成，高级匹配能力按需展开。
3. 规则表达接近浏览器底层能力，不隐藏限制或失败原因。
4. 用户数据只保存在本地，不注入页面脚本，不加入遥测。
5. 错误就地呈现，保存和规则同步结果可验证。

## Accessibility & Inclusion

遵循 WCAG 2.2 AA。完整支持键盘操作、清晰焦点环、非颜色单一编码的状态反馈、足够对比度，以及 `prefers-reduced-motion`。
