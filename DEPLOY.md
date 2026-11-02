# 十年博客 · EdgeOne Pages 部署与百度收录指引

本目录（`shinian-blog/`）是**纯静态站点生成（SSG）**架构，已适配 **腾讯云 EdgeOne Pages**，可绑定你的自有域名 `bthb666.icu`，并被百度正常收录。

> 发文章走 **方案 A（AI 代理发布）**：你告诉我发什么，我写入 `articles.json` → 重新生成 `dist/` → 你部署上线。无需登录任何后台。详见文末「六、代理发布（方案 A）」。

---

## 一、dist/ 是什么（要上传的就是它）

`build_ssg.js` 读取 `articles.json`，生成完整静态站到 `dist/`：

- `dist/index.html` —— 首页，**全部文章列表直接写死在 HTML 里**（百度无需执行 JS 就能读到正文）
- `dist/posts/<id>.html` —— 每篇文章独立页，正文完整内联
- `dist/sitemap.xml` —— 站点地图（指向 `https://bthb666.icu`）
- `dist/robots.txt` —— 爬虫规则
- `dist/assets/` —— 样式 + 前端交互脚本（仅分类/搜索，无任何网络请求）

**本站是“预构建”纯静态站，零云后端、零 API 调用**，所以分享码自然消失、浏览器地址干净、`bthb666.icu` 直接访问。

> ⚠️ 目前 `dist/` 里是 3 篇占位示例（科技金融 / AI / 随笔）。正式上线前替换为你的内容：编辑 `articles.json` 后运行 `node build_ssg.js`，或直接让我按主题生成。

---

## 二、首次上线（直接上传，零命令）—— 你选的方式

1. **拿上传包**：用本地 `shinian-blog/dist/` 文件夹（或我提供的 `dist-upload.zip`）。
2. 打开 **EdgeOne 控制台** https://console.cloud.tencent.com/edgeone → 进入 **Pages（或 Makers）** → 新建项目 → 选择 **「直接上传」**。
3. 把 `dist/` 文件夹拖进上传区（或上传 `dist-upload.zip` 解压后的内容），项目名填 `shinian-blog`，**加速区域选「海外/全球」**（可免 ICP 备案）。
4. 点「开始部署」，几十秒后得到 `*.edgeone.run` / `*.edgeone.app` 预览地址，先打开确认页面正常。

> ⚠️ 注意：直接上传的项目**不能切换**到 Git 自动部署。以后每次更新文章，我重建好 `dist/` 后，你需要再把新的 `dist/` 拖进去一次（进阶的 Git 自动部署见第三节）。

---

## 三、（可选升级）Git 自动部署

以后想“推送即上线、彻底不用上传”，可改用 Git 方式：
1. 把本项目推到 GitHub 仓库。
2. EdgeOne 新建项目 → 选择「导入 Git 仓库」→ 连接 GitHub → 选仓库。
3. 构建配置：**构建命令** `node build_ssg.js`、**输出目录** `dist`、框架预设选「无」。
4. 之后我发文章时 `publish.js` 会自动 `git push`，EdgeOne 自动重新部署。

---

## 四、绑定自有域名 bthb666.icu

1. 项目设置 → **自定义域名** → 添加 `bthb666.icu`（建议同时加 `www.bthb666.icu`）。
2. EdgeOne 会给出**需要添加的 DNS 记录**（通常把 `bthb666.icu` 用 CNAME 指向 EdgeOne 给的地址）。
3. 去 **`bthb666.icu` 的域名注册商 / DNSPod 后台**添加该记录：
   - 类型：**CNAME**
   - 名称：`@`（根域名）和 `www`
   - 指向：EdgeOne 给的地址
4. 保存后等 DNS 生效（几分钟到几小时），EdgeOne **自动签发 HTTPS 证书**。
5. 生效后访问 `https://bthb666.icu` 即可看到站点，**分享码消失、地址干净**。

> 加速区域选「海外/全球」时绑定自定义域名**无需 ICP 备案**；若选「中国大陆」节点则需要备案。个人博客推荐海外区域，省去备案。

---

## 五、让百度收录（关键！否则搜不到）

绑定域名后**必须主动提交**，百度不会自动发现新站：

1. 打开 **百度搜索资源平台** https://ziyuan.baidu.com ，用百度账号登录。
2. **添加站点** `bthb666.icu`，按提示验证所有权（通常加一条 TXT 解析，或下载验证文件放到 `dist/` 根目录再部署）。
3. 进入「站点管理 → 资源提交 → **提交 sitemap**」，填入 `https://bthb666.icu/sitemap.xml`。
4. 用「**普通收录 / 主动推送**」把首页和文章页 URL 推给百度，加速抓取。
5. 新站收录慢（数天到数周），且**排名需要时间 + 持续更新内容 + 外部链接**（别人网站链向你）。

> 收录前提已具备：纯静态正文、sitemap、robots、canonical、各页 meta 都已在 `dist/` 里配好。

---

## 六、代理发布（方案 A）怎么用

你不用登录任何后台。**两种下单方式**：

### 方式 ①：直接告诉我
> “帮我发一篇关于 XXX 的文章，分类放「随风笔记」，配图用 AI 生成封面。”

我会：写入 `articles.json` → 跑 `node build_ssg.js` 重新生成 `dist/` → 你随后把新 `dist/` 拖进 EdgeOne（直接上传方式需再拖一次；若已升级 Git 方式则自动上线）。

### 方式 ②：用 publish.js（本地执行）
```bash
# 从 JSON 文件新增一篇文章（推荐，正文可写 HTML）
node publish.js add --file article.json

# 或命令行直接给（简单内容）
node publish.js add --title "标题" --category "随风笔记" --excerpt "摘要" --content "<p>正文</p>" [--cover https://...] [--pinned]

# 删除某篇
node publish.js remove --id 5

# 仅重新生成 dist/
node publish.js build

# 生成并部署（装了 edgeone CLI 且配置了 EO_API_TOKEN 时自动；否则打印上传指引）
node publish.js deploy
```

`article.json` 示例：
```json
{
  "title": "标题",
  "category": "随风笔记",
  "excerpt": "一句话摘要",
  "content": "<p>正文支持 <strong>HTML</strong>，会原样内联到页面。</p>",
  "cover_image": null,
  "author": "站长",
  "is_pinned": false
}
```
`id / created_at / updated_at / views` 会自动填充，无需手写。

---

## 七、本地预览（部署前自测）
```bash
cd shinian-blog
node build_ssg.js
cd dist && python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

---

## 八、文件索引

| 文件 | 作用 |
|---|---|
| `articles.json` | 文章数据源（发文章编辑这个） |
| `build_ssg.js` | 静态生成器，读 json → 产出 dist/ |
| `publish.js` | 代理发布引擎（增/删/重建/部署） |
| `assets/ssg.js` | 前台分类/搜索交互（纯前端） |
| `assets/styles.css` | 科技金融风样式 |
| `dist/` | **要上传到 EdgeOne 的部署包** |
| `dist-upload.zip` | dist/ 的压缩包，方便直接上传 |
| `DEPLOY.md` | 本指引 |
