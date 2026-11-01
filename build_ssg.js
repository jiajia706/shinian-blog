// SSG 生成器：读本地 articles.json，产出完整静态站到 dist/
// 用法：node build_ssg.js
// 换域名：修改顶部 BASE 即可（绑定 bthb666.icu 后无需再改）
const fs = require("fs");
const path = require("path");

const BASE = "https://bthb666.icu"; // 自有域名
const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const ASSETS = path.join(ROOT, "assets");
const POSTS_DIR = path.join(DIST, "posts");

const escAttr = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escText = (s) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmtDate = (s) => {
  const d = new Date(s);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const truncate = (s, n) => {
  const t = String(s ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
};

// 读取并排序：置顶优先，再按时间倒序
const articles = JSON.parse(fs.readFileSync(path.join(ROOT, "articles.json"), "utf8"));
articles.sort(
  (a, b) =>
    (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at)
);

function cardHTML(a) {
  const thumb = a.cover_image
    ? `<div class="thumb"><img src="${escAttr(a.cover_image)}" alt="" loading="lazy" /></div>`
    : `<div class="thumb">十年博客</div>`;
  return `
    <article class="post-card" data-cat="${escAttr(a.category || "默认分类")}" data-title="${escAttr(a.title)}">
      ${thumb}
      <div class="body">
        <div class="meta-top">
          <span class="tag">${escText(a.category || "默认分类")}</span>
          ${a.is_pinned ? '<span class="tag pinned">置顶</span>' : ""}
        </div>
        <h2><a href="posts/${a.id}.html">${escText(a.title)}</a></h2>
        <p class="excerpt">${escText(a.excerpt || truncate(a.content, 80))}</p>
        <div class="meta">
          <span>${escText(a.author || "站长")}</span>
          <span>${fmtDate(a.created_at)}</span>
          <span>${a.views || 0} 阅读</span>
        </div>
      </div>
    </article>`;
}

function buildIndex() {
  const counts = {};
  articles.forEach((a) => {
    const c = a.category || "默认分类";
    counts[c] = (counts[c] || 0) + 1;
  });
  const navCats = Object.keys(counts);
  const navHTML = navCats
    .map((c) => `<a href="index.html" data-cat="${escAttr(c)}">${escText(c)}</a>`)
    .join("");
  const catItems = navCats
    .map((c) => `<li data-cat="${escAttr(c)}"><span>${escText(c)}</span><span class="count">${counts[c]}</span></li>`)
    .join("");
  const recent = articles
    .slice(0, 6)
    .map((a) => `<li><a href="posts/${a.id}.html">${escText(a.title)}</a></li>`)
    .join("");
  const listHTML = articles.length ? articles.map(cardHTML).join("") : "";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>十年博客 — 记录技术、生活与思考</title>
  <meta name="description" content="十年博客，一个记录技术教程、生活随笔与实时资讯的个人博客，聚焦科技金融、AI 编程与生活方式。" />
  <meta name="keywords" content="十年博客,技术博客,科技金融,AI编程,个人博客,生活随笔,实时资讯" />
  <meta name="author" content="十年博客" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${BASE}/" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:site_name" content="十年博客" />
  <meta property="og:title" content="十年博客 — 记录技术、生活与思考" />
  <meta property="og:description" content="记录技术教程、生活随笔与实时资讯的个人博客。" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="assets/styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1 class="site-title"><a href="index.html">十年博客</a></h1>
      <p class="site-tagline">记录技术、生活与思考 · 一晃十年</p>
    </div>
  </header>
  <nav class="topnav">
    <div class="container">
      <a href="index.html" data-cat="all" class="active">首页</a>
      ${navHTML}
      <span class="spacer"></span>
    </div>
  </nav>
  <main class="container layout">
    <section>
      <h2 class="section-title" id="listTitle">最新文章</h2>
      <div class="post-list" id="postList">${listHTML}
        <div class="empty-state" id="emptyState" style="display:none">这里还没有文章。</div>
      </div>
    </section>
    <aside class="sidebar">
      <div class="widget"><h3>搜索</h3><div class="search-box"><input type="text" id="searchInput" placeholder="输入关键词…" /><button id="searchBtn">搜索</button></div></div>
      <div class="widget"><h3>分类</h3><ul class="cat-list" id="catList">${catItems || '<li style="color:var(--muted)">暂无分类</li>'}</ul></div>
      <div class="widget"><h3>最新文章</h3><ul class="recent-list">${recent || '<li style="color:var(--muted)">暂无文章</li>'}</ul></div>
      <div class="widget"><h3>关于本站</h3><p style="color:var(--muted);font-size:14px;margin:0">十年博客，记录技术教程、生活随笔与实时资讯。欢迎常来坐坐。</p></div>
    </aside>
  </main>
  <footer class="site-footer"><div class="container">© 2026 十年博客</div></footer>
  <script src="assets/ssg.js"></script>
</body>
</html>`;
}

function buildPost(a) {
  const cover = a.cover_image ? `<img class="post-cover" src="${escAttr(a.cover_image)}" alt="" />` : "";
  const pinned = a.is_pinned ? '<span class="tag pinned">置顶</span>' : "";
  const others = articles.filter((x) => x.id !== a.id).slice(0, 6);
  const recent = articles
    .slice(0, 6)
    .map((x) => `<li><a href="../posts/${x.id}.html">${escText(x.title)}</a></li>`)
    .join("");
  const related = others.length
    ? `<div class="related"><h3>相关文章</h3><ul class="recent-list">${others
        .map((x) => `<li><a href="../posts/${x.id}.html">${escText(x.title)}</a></li>`)
        .join("")}</ul></div>`
    : "";
  const desc = truncate(a.excerpt || a.content, 120);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escText(a.title)} — 十年博客</title>
  <meta name="description" content="${escAttr(desc)}" />
  <meta name="keywords" content="十年博客,${escAttr(a.category || "技术博客")},技术博客,文章" />
  <meta name="author" content="${escAttr(a.author || "站长")}" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${BASE}/posts/${a.id}.html" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="zh_CN" />
  <meta property="og:site_name" content="十年博客" />
  <meta property="og:title" content="${escText(a.title)} — 十年博客" />
  <meta property="og:description" content="${escAttr(desc)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="stylesheet" href="../assets/styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1 class="site-title"><a href="../index.html">十年博客</a></h1>
      <p class="site-tagline">记录技术、生活与思考 · 一晃十年</p>
    </div>
  </header>
  <nav class="topnav">
    <div class="container">
      <a href="../index.html" data-cat="all" class="active">首页</a>
      <a href="../index.html">个人博客</a>
      <a href="../index.html">随风笔记</a>
      <a href="../index.html">实时要闻</a>
      <span class="spacer"></span>
    </div>
  </nav>
  <main class="container layout">
    <section>
      <article class="post-detail">
        <div class="meta-top">
          <span class="tag">${escText(a.category || "默认分类")}</span>
          ${pinned}
        </div>
        <h1>${escText(a.title)}</h1>
        <div class="meta">
          <span>作者：${escText(a.author || "站长")}</span>
          <span>${fmtDate(a.created_at)}</span>
          <span>${a.views || 0} 阅读</span>
        </div>
        ${cover}
        <div class="post-content">${a.content || ""}</div>
        <a class="back-link" href="../index.html">← 返回首页</a>
        ${related}
      </article>
    </section>
    <aside class="sidebar">
      <div class="widget"><h3>最新文章</h3><ul class="recent-list">${recent}</ul></div>
      <div class="widget"><h3>关于本站</h3><p style="color:var(--muted);font-size:14px;margin:0">十年博客，记录技术教程、生活随笔与实时资讯。欢迎常来坐坐。</p></div>
    </aside>
  </main>
  <footer class="site-footer"><div class="container">© 2026 十年博客</div></footer>
</body>
</html>`;
}

function buildSitemap() {
  const urls = [
    `  <url>\n    <loc>${BASE}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ];
  articles.forEach((a) => {
    urls.push(
      `  <url>\n    <loc>${BASE}/posts/${a.id}.html</loc>\n    <lastmod>${fmtDate(
        a.updated_at || a.created_at
      )}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    );
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

function copyAssets() {
  if (!fs.existsSync(path.join(DIST, "assets"))) fs.mkdirSync(path.join(DIST, "assets"), { recursive: true });
  // 只复制展示所需静态资源，避免带入云后端相关脚本
  ["styles.css", "ssg.js"].forEach((f) => {
    fs.copyFileSync(path.join(ASSETS, f), path.join(DIST, "assets", f));
  });
}

// ===== 主流程 =====
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), buildIndex(), "utf8");
articles.forEach((a) => fs.writeFileSync(path.join(POSTS_DIR, `${a.id}.html`), buildPost(a), "utf8"));
fs.writeFileSync(
  path.join(DIST, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`,
  "utf8"
);
fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(), "utf8");
copyAssets();
console.log(`✅ 已生成 ${articles.length} 篇文章 + 首页 + sitemap + robots 到 dist/`);
console.log(`   部署域名： ${BASE}`);
