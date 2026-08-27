# 素材翻译工作台

上传广告素材图片后，按流程完成：

1. OCR 提取海报营销文案
2. 多语本地化翻译
3. 使用图片编辑模型替换原图文案

## 本地运行

```bash
npm start
```

打开：

```text
http://127.0.0.1:8765/material_translation_workflow.html
```

## 部署到 Render

1. 打开 GitHub，新建一个仓库
2. 上传本文件夹 `material-translation-app` 里的所有文件
3. 打开 Render，新建 `Web Service`
4. 连接刚才的 GitHub 仓库
5. 配置：

```text
Build Command: 留空 或 npm install
Start Command: npm start
```

6. 部署完成后，打开：

```text
https://你的Render域名/material_translation_workflow.html
```

## 页面默认配置

- API Base: `https://api.himodels.ai/v1`
- Authorization 格式: `原样传入：Authorization: xxxxx`
- 文本节点路径: `/chat/completions`
- 文本接口格式: `Chat Completions`
- OCR / 翻译模型: `gpt luna low`
- 图片替换模型: `gpt-image-2`
- 通过代理转发 API 请求: 勾选

## API Key

当前版本由使用者在页面里填写 API Key。服务端只转发请求，不保存 API Key。
