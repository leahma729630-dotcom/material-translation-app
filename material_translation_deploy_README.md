# 素材翻译工作台部署说明

## 文件

需要部署这两个文件：

- `material_translation_workflow.html`
- `material_translation_server.mjs`

本地双击启动脚本：

- `start_material_translation.command`

## 本地使用

```bash
cd 文件所在目录
node material_translation_server.mjs
```

打开：

```text
http://127.0.0.1:8765/material_translation_workflow.html
```

## 公开分享给别人使用

不要分享 `127.0.0.1` 链接。`127.0.0.1` 只代表访问者自己的电脑。

要让别人点一个链接就能用，需要把 `material_translation_server.mjs` 部署到一台公网服务器或云平台上，让它同时提供：

- 页面：`/material_translation_workflow.html`
- 代理：`/api/proxy/...`

云平台启动命令建议：

```bash
HOST=0.0.0.0 PORT=8765 node material_translation_server.mjs
```

部署后分享平台生成的公网地址，例如：

```text
https://your-domain.example.com/material_translation_workflow.html
```

## 页面配置

默认配置：

- API Base: `https://api.himodels.ai/v1`
- Authorization 格式: `原样传入：Authorization: xxxxx`
- 文本节点路径: `/chat/completions`
- 文本接口格式: `Chat Completions`
- OCR / 翻译模型: `gpt luna low`
- 图片替换模型: `gpt-image-2`
- 通过代理转发 API 请求: 勾选

## API Key 安全

当前版本由使用者在页面里填写 API Key，浏览器会把它发给同源代理，代理再转发给三方 API。代理服务不会保存 Key。

如果要团队长期使用，更推荐把 API Key 放在服务端环境变量里，并从页面中移除 API Key 输入框。
