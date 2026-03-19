# personal-site

一个类似 `socralin.github.io` 风格的**纯静态**个人主页/博客模板（HTML/CSS/JS，无依赖）。

## 本地预览

在 `personal-site/` 目录下启动静态服务器即可。

PowerShell：

```powershell
cd "d:\浙江大学\课题作业\大二课程\ai id\personal-site"
python -m http.server 8080
```

然后浏览器打开：

- `http://localhost:8080/index.html`

## 部署到 GitHub Pages（最常见做法）

1. 在 GitHub 新建仓库：`<你的用户名>.github.io`
2. 把 `personal-site/` 里的文件**放到仓库根目录**
3. 推送后等待 1-2 分钟，访问 `https://<你的用户名>.github.io/`

## 修改内容

- 主页与导航：`index.html`
- 关于页：`about.html`
- 归档页：`archive.html`
- 文章页面：`posts/*.html`
- 文章列表数据（用于主页/归档自动渲染）：`assets/site.js` 里的 `POSTS`
- 样式主题：`assets/style.css`

