# MamboLab 课题组主页

https://mambolab.cc

纯静态站点，无构建步骤。改内容不需要懂代码，用站内后台即可。

## 站点结构

| 文件 | 作用 |
|---|---|
| `index.html` | 首页：简介、最新动态、研究方向 |
| `about.html` | About：研究方向、做事方式、联系方式 |
| `publications.html` | 论文列表（按年份分组，可按期刊/会议筛选） |
| `members.html` | 成员（按 PI / 博士 / 硕士 / 实习生 / 校友分组） |
| `special-days.html` | Special Day：按年份和学期切换，未举办显示倒计时，已举办显示照片 |
| `admin.html` | 内容管理后台（不对外链接，需 GitHub Token） |
| `data/*.js` | 全部内容数据，页面加载时读取 |
| `assets/style.css` | 样式 |
| `assets/app.js` | 渲染逻辑 |

## 怎么改内容

### 方式一：站内后台（推荐）

1. 打开 https://mambolab.cc/admin.html
2. 填入 GitHub Token（`github_pat_` 开头，勾 `Contents: Read and write`），点验证
   - Token 只存在你自己的浏览器 localStorage，不经过任何第三方
3. 在三个标签页里改：
   - **成员**：增删改，`分组` 决定显示在哪一块
   - **Special Day**：先选年份学期，再维护本学期的那几次；日期留空显示"日期待定"，填未来日期自动倒计时
   - **动态**：首页的最新动态
4. 点保存 → 直接提交到仓库 → 约 1 分钟后线上生效

### 方式二：直接改 `data/*.js`

格式是 `window.ML_DATA.members = {...}`，里面是标准 JSON。在 GitHub 网页上点开文件 → 编辑 → Commit 即可。

### 上传照片

后台 Special Day 页面底部有「上传照片」按钮，选图后自动提交到
`assets/img/special-days/<年份>-<学期>/`，并把链接复制到剪贴板，粘进对应那条的「照片链接」框里保存即可。

## 本地预览

```bash
cd mambo-lab-site-v2
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

```bash
GITHUB_TOKEN=github_pat_xxx python3 deploy.py
```

推送到 `MamboAILab/MamboAILab.github.io` 的 `main` 分支，GitHub Pages 自动构建。

## 域名

- `CNAME` 文件内容为 `mambolab.cc`
- 阿里云 DNS：4 条 A 记录指向 `185.199.108/109/110/111.153`，`www` 做 CNAME 指向 `mamboailab.github.io`
