// 十年博客 · 本机发布后台
// 零依赖 Node 服务：在电脑上运行，浏览器打开即可自己发文章
// 用法：node admin/admin-server.js   （或双击「启动后台.bat」）
const fs = require("fs");
const path = require("path");
const http = require("http");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, ".."); // 博客项目根目录
const PORT = 8787;
const ART_FILE = path.join(ROOT, "articles.json");
const COVERS_DIR = path.join(ROOT, "assets", "covers");
const CATEGORIES = ["个人博客", "随风笔记", "实时要闻"];
// 是否推送：测试时可设 ADMIN_PUSH=0 关闭推送
const DO_PUSH = process.env.ADMIN_PUSH !== "0";

// 转义 HTML，防止内容破坏页面或被注入
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// 纯文本 -> HTML：空行分段包 <p>，段内换行转 <br>
function textToHtml(text) {
  const blocks = String(text || "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (!blocks.length) return esc(text || "");
  return blocks.map((b) => "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>").join("");
}

function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(body);
}

// 读取 request body（支持较大图片 base64）
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 25 * 1024 * 1024) {
        reject(new Error("请求体过大（超过 25MB）"));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// git 推送（本机直接推，重试 3 次）
function pushWithRetry() {
  for (let i = 0; i < 3; i++) {
    try {
      execSync("git push origin master", { cwd: ROOT, stdio: "pipe" });
      return { ok: true };
    } catch (e) {
      const msg = e.stderr ? e.stderr.toString() : e.message || "";
      if (i === 2) return { ok: false, msg };
      try {
        execSync("ping -n 2 127.0.0.1 >nul");
      } catch (_) {}
    }
  }
  return { ok: false, msg: "重试次数用尽" };
}

function handlePublish(body, res) {
  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    return send(res, 400, { success: false, message: "数据格式错误" });
  }
  const title = String(data.title || "").trim();
  const category = String(data.category || "").trim();
  const rawContent = String(data.content || "").trim();
  const excerptInput = String(data.excerpt || "").trim();

  if (!title) return send(res, 400, { success: false, message: "标题不能为空" });
  if (!CATEGORIES.includes(category))
    return send(res, 400, { success: false, message: "分类不合法，请选择下拉项" });
  if (!rawContent) return send(res, 400, { success: false, message: "正文不能为空" });

  let articles;
  try {
    articles = JSON.parse(fs.readFileSync(ART_FILE, "utf8"));
  } catch (e) {
    return send(res, 500, { success: false, message: "读取 articles.json 失败：" + e.message });
  }

  const newId = articles.length ? Math.max(...articles.map((a) => a.id)) + 1 : 1;

  // 保存封面图
  let coverImage = "";
  if (data.image && data.imageExt) {
    const ext = String(data.imageExt).replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
    const fname = newId + "." + ext;
    try {
      const buf = Buffer.from(String(data.image), "base64");
      if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
      fs.writeFileSync(path.join(COVERS_DIR, fname), buf);
      coverImage = "assets/covers/" + fname;
    } catch (e) {
      return send(res, 500, { success: false, message: "保存封面图失败：" + e.message });
    }
  }

  const html = textToHtml(rawContent);
  const excerpt = excerptInput || rawContent.replace(/\s+/g, " ").slice(0, 60);
  const now = new Date().toISOString();

  articles.push({
    id: newId,
    title,
    category,
    excerpt,
    content: html,
    cover_image: coverImage,
    author: "站长",
    views: 0,
    is_pinned: false,
    created_at: now,
    updated_at: now,
  });

  try {
    fs.writeFileSync(ART_FILE, JSON.stringify(articles, null, 2) + "\n", "utf8");
  } catch (e) {
    return send(res, 500, { success: false, message: "写入 articles.json 失败：" + e.message });
  }

  // git 提交
  const addFiles = "articles.json" + (coverImage ? " assets/covers/" + path.basename(coverImage) : "");
  try {
    execSync("git add " + addFiles, { cwd: ROOT, stdio: "pipe" });
    execSync('git commit -m "admin publish id' + newId + '"', { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    return send(res, 500, { success: false, message: "git 提交失败：" + (e.message || "") });
  }

  let pushInfo = { ok: true, msg: "（已配置不推送）" };
  if (DO_PUSH) {
    pushInfo = pushWithRetry();
  }

  const ok = pushInfo.ok;
  return send(res, 200, {
    success: true,
    id: newId,
    title,
    pushOk: ok,
    message: ok
      ? "✅ 已发布并推送，EdgeOne 几分钟后自动上线"
      : "⚠️ 已保存到仓库但推送失败，请在项目目录手动执行：git push origin master",
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url.split("?")[0];
    if (req.method === "GET" && (url === "/" || url === "/admin.html")) {
      const html = fs.readFileSync(path.join(__dirname, "admin.html"), "utf8");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(html);
    }
    if (req.method === "GET" && url === "/api/status") {
      let count = 0,
        maxId = 0;
      try {
        const a = JSON.parse(fs.readFileSync(ART_FILE, "utf8"));
        count = a.length;
        maxId = a.length ? Math.max(...a.map((x) => x.id)) : 0;
      } catch (_) {}
      return send(res, 200, { count, maxId });
    }
    if (req.method === "POST" && url === "/api/publish") {
      const body = await readBody(req);
      return handlePublish(body, res);
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  } catch (e) {
    send(res, 500, { success: false, message: "服务器错误：" + e.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  let count = 0;
  try {
    count = JSON.parse(fs.readFileSync(ART_FILE, "utf8")).length;
  } catch (_) {}
  console.log("========================================");
  console.log("  十年博客 · 发布后台已启动");
  console.log("  请在浏览器打开： http://127.0.0.1:8787");
  console.log("  当前文章数：" + count);
  console.log("  关闭本窗口即可停止后台");
  console.log("========================================");
});
