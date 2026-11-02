#!/usr/bin/env node
/**
 * 十年博客 · 代理发布引擎（方案 A）
 * -------------------------------------------------------------
 * 用途：由 AI / 站长在本地代理发布文章，流程为
 *        写入 articles.json → 重新生成 dist/ → 上线到 EdgeOne Pages
 *
 * 命令：
 *   node publish.js add --file article.json     从 JSON 文件新增一篇文章
 *   node publish.js add --title "标题" --category "分类" --excerpt "摘要" --content "<p>正文HTML</p>" [--cover https://...] [--author 站长] [--pinned]
 *   node publish.js remove --id 5               按 id 删除文章
 *   node publish.js list                        列出当前所有文章
 *   node publish.js build                       仅重新生成 dist/（不发布）
 *   node publish.js deploy                      生成 dist/ 并尝试 wrangler 部署
 *
 * 说明：
 *   - 文章正文 content 支持 HTML（<p><strong><em> 等），会原样内联到页面，利于百度抓取。
 *   - id / created_at / updated_at / views 自动填充，无需手写。
 *   - 正式发布到 bthb666.icu 需要在 Cloudflare 侧完成连接 / 部署（见 DEPLOY.md）。
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = __dirname;
const ARTICLES = path.join(ROOT, "articles.json");
const BUILD = path.join(ROOT, "build_ssg.js");

const today = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

function load() {
  return JSON.parse(fs.readFileSync(ARTICLES, "utf8"));
}
function save(list) {
  fs.writeFileSync(ARTICLES, JSON.stringify(list, null, 2) + "\n", "utf8");
}

function build() {
  execFileSync("node", [BUILD], { cwd: ROOT, stdio: "inherit" });
}

// 极简命令行参数解析
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

function addArticle(data) {
  if (!data.title || !data.content) {
    console.error("❌ 缺少必填字段：title 与 content 必须提供");
    process.exit(1);
  }
  const list = load();
  const nextId = list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  const now = today();
  const article = {
    id: nextId,
    title: data.title,
    category: data.category || "默认分类",
    excerpt: data.excerpt || "",
    content: data.content,
    cover_image: data.cover_image || null,
    author: data.author || "站长",
    views: 0,
    is_pinned: !!data.is_pinned,
    created_at: now,
    updated_at: now,
  };
  list.push(article);
  save(list);
  console.log(`✅ 已新增文章 #${nextId}《${article.title}》到 articles.json`);
  return article;
}

function removeArticle(id) {
  const list = load();
  const idx = list.findIndex((x) => String(x.id) === String(id));
  if (idx === -1) {
    console.error(`❌ 找不到 id=${id} 的文章`);
    process.exit(1);
  }
  const [removed] = list.splice(idx, 1);
  save(list);
  console.log(`✅ 已删除文章 #${id}《${removed.title}》`);
}

function listArticles() {
  const list = load();
  console.log(`当前共 ${list.length} 篇文章：\n`);
  list
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .forEach((a) => {
      console.log(
        `  #${a.id}  [${a.category}]  ${a.is_pinned ? "📌" : "  "} ${a.title}  (${a.created_at})`
      );
    });
}

async function deploy() {
  build();
  // 若已安装 edgeone CLI 并配置了 EO_API_TOKEN，可直接命令行部署
  const token = process.env.EO_API_TOKEN;
  if (token) {
    try {
      console.log("\n🚀 正在部署 dist/ 到 EdgeOne Pages ...");
      execFileSync("npx", ["edgeone", "pages", "deploy", "dist", "-n", "shinian-blog", "-t", token], {
        cwd: ROOT,
        stdio: "inherit",
      });
      console.log("✅ 部署完成。");
      return;
    } catch (e) {
      console.error("❌ EdgeOne CLI 部署失败，请检查 EO_API_TOKEN 与 edgeone 是否安装（npm i -g edgeone）。");
    }
  }
  // 默认走「直接上传」：无需命令行，把 dist/ 拖进 EdgeOne 控制台即可
  console.log(
    "\n📁 已生成 dist/，请按以下方式上线（无需命令行）：\n" +
      "    1) 打开 EdgeOne 控制台 → Pages（或 Makers）→ 新建项目 → 选择「直接上传」。\n" +
      "    2) 把本地 shinian-blog/dist/ 整个文件夹拖进去（或上传 dist-upload.zip 解压后的内容）。\n" +
      "    3) 点击开始部署，得到 *.edgeone.run / *.edgeone.app 预览地址。\n" +
      "    4) 项目设置里添加自定义域名 bthb666.icu（加速区域选「海外/全球」可免备案），按提示加 CNAME，自动签发 HTTPS。\n" +
      "    （想以后 push 自动上线，可改用 Git 方式：构建命令 node build_ssg.js，输出目录 dist。）"
  );
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);

  switch (cmd) {
    case "add": {
      let data;
      if (args.file) {
        const fp = path.resolve(args.file);
        if (!fs.existsSync(fp)) {
          console.error(`❌ 找不到文章文件：${fp}`);
          process.exit(1);
        }
        data = JSON.parse(fs.readFileSync(fp, "utf8"));
      } else {
        data = {
          title: args.title,
          category: args.category,
          excerpt: args.excerpt,
          content: args.content,
          cover_image: args.cover || null,
          author: args.author || "站长",
          is_pinned: !!args.pinned,
        };
      }
      addArticle(data);
      build();
      console.log("📦 已重新生成 dist/，可部署到 Cloudflare Pages。");
      break;
    }
    case "remove": {
      if (!args.id) {
        console.error("❌ 请指定 --id");
        process.exit(1);
      }
      removeArticle(args.id);
      build();
      break;
    }
    case "list":
      listArticles();
      break;
    case "build":
      build();
      break;
    case "deploy":
      await deploy();
      break;
    default:
      console.log(
        "十年博客 · 代理发布引擎\n" +
          "用法：\n" +
          "  node publish.js add --file article.json\n" +
          "  node publish.js add --title \"标题\" --category \"分类\" --excerpt \"摘要\" --content \"<p>正文</p>\" [--cover url] [--pinned]\n" +
          "  node publish.js remove --id 5\n" +
          "  node publish.js list\n" +
          "  node publish.js build\n" +
          "  node publish.js deploy\n"
      );
  }
}

main();
