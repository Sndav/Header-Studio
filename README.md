# Header Studio

一个本地优先、Manifest V3 的 Chrome Header 修改扩展，使用 React、TypeScript 和 Vite 构建。

## 能力

- 同时修改 Request 与 Response Headers
- 多 Profile 同时生效，支持独立启用和暂停
- 按 Host 通配符、完整 URL 通配符或 Chrome RE2 正则匹配
- 常见 Header 名称输入建议
- 所有配置保存在 `chrome.storage.local`
- 不注入页面脚本、不请求远程代码、无遥测

## 开发

```bash
npm install
npm run build
```

然后在 `chrome://extensions` 开启“开发者模式”，选择“加载已解压的扩展程序”，加载 `dist/`。

## 匹配规则

- `*`：所有 HTTP/HTTPS URL
- `*.example.com`：根域名与任意子域名
- `api.example.com`：指定 Host，可带任意端口
- `https://example.com/api/*`：完整 URL 通配符
- `RE2 regex`：直接交给 `declarativeNetRequest`，保存后会由 Chrome 校验

多个匹配规则之间是“或”；同一 Profile 中的 Header 会应用到每个匹配规则。多个已启用 Profile 可以同时工作，列表中靠后的 Profile 具有更高规则优先级。

## 权限说明

- `storage`：在本地保存 Profile
- `declarativeNetRequest`：通过 Chrome 原生规则修改 Header
- `<all_urls>`：让用户配置的规则可以作用于任意站点；扩展不会读取网页内容
