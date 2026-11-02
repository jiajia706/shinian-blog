// 十年博客 · 百度主动推送脚本（方案 A 配套）
// -------------------------------------------------------------
// 作用：读取 dist/sitemap.xml 里的全部 URL，调用百度搜索资源平台
//       的"主动推送(接口)"接口，加快收录。
// 获取 token：百度搜索资源平台(ziyuan.baidu.com) → 站点管理 →
//             对应站点 → 数据提交 → 主动推送(接口) → 接口调用地址
//             形如 https://example.com?site=...&token=XXXX，取 token 部分。
// 用法：
//   BAIDU_TOKEN=你的token node push_baidu.js
//   （也可在下方常量直接填 token，但不建议，避免误提交）
// -------------------------------------------------------------
const fs = require("fs");
const path = require("path");

const SITE = "https://bthb666.icu"; // 必须与 sitemap 中的域名完全一致
const TOKEN = process.env.BAIDU_TOKEN || "";

const smPath = path.join(__dirname, "dist", "sitemap.xml");

function parseUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) urls.push(m[1].trim());
  return urls;
}

(async () => {
  if (!fs.existsSync(smPath)) {
    console.error("❌ 找不到 dist/sitemap.xml，请先运行 node build_ssg.js 生成。");
    process.exit(1);
  }
  const urls = parseUrls(fs.readFileSync(smPath, "utf8"));
  if (!urls.length) {
    console.error("❌ sitemap 里没有解析到任何 <loc> URL。");
    process.exit(1);
  }
  if (!TOKEN) {
    console.error("⚠️  未提供 BAIDU_TOKEN。");
    console.error("    请在百度搜索资源平台获取 token 后运行：");
    console.error("    BAIDU_TOKEN=你的token node push_baidu.js");
    process.exit(1);
  }

  console.log(`📄 从 sitemap 解析到 ${urls.length} 个待推送 URL：`);
  urls.forEach((u) => console.log("   " + u));

  try {
    const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(
      SITE
    )}&token=${encodeURIComponent(TOKEN)}`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: urls.join("\n"),
    });
    const text = await res.text();
    console.log("\n📨 百度返回：\n" + text);
  } catch (e) {
    console.error("❌ 推送请求失败：", e.message);
    process.exit(1);
  }
})();
