# MamboLab 课题组主页

纯静态站点，无构建依赖 —— 改完 HTML/CSS 直接提交即可生效。

## 目录

```
index.html           页面全部内容（文字都在这一个文件里）
assets/style.css     样式（颜色、字体、间距）
.nojekyll            告诉 GitHub Pages 不要走 Jekyll 编译
```

## 常见修改

**改文字**：直接编辑 `index.html`，中文内容都在标签里，按区块搜关键词即可。

| 区块 | 搜索关键词 |
|---|---|
| 首屏标语 | `class="lede"` |
| 研究方向 | `id="research"` |
| 成员 | `id="people"` |
| 论文 | `id="publications"` |
| 动态 | `id="news"` |
| 招生 | `id="join"` |

**加一条新闻**：在 `<ul class="news-list">` 里复制一个 `<li>`，改日期和内容，新的放最前面。

**加一位成员**：复制 `<article class="person">` 整块，改姓名、角色、方向三行。

**改配色**：`assets/style.css` 顶部 `:root` 里的变量，`--accent` 是主色。

## 待办（内容补齐）

- [ ] 成员名单（现有 3 个占位卡片）
- [ ] 论文列表（目前链接到 PI 个人主页）
- [ ] 联系邮箱（现为占位 `contact@mambolab.cc`）
- [ ] 实验室 logo / 团队合照
- [ ] 域名 `mambolab.cc` DNS 配好后，在 Pages 设置里填 Custom domain

## 本地预览

直接双击 `index.html` 用浏览器打开即可，不需要起服务器。
