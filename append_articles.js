// 追加 10 篇新文章到 articles.json（保留原有 10 篇，站点变 20 篇）
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "articles.json");

const NEW = [
  {
    id: 11,
    title: "远程工作三年：自由与自律的拉锯",
    category: "个人博客",
    excerpt: "真正难的不是没有老板盯着，而是如何把自由变成产出。三年下来，我学到最重要的一课是：结构感比意志力更可靠。",
    content: "<p>远程工作第三年，我越来越确信：真正难的不是「没有老板盯着」，而是<strong>如何把自由变成产出</strong>。</p><p>最初那阵子很爽，睡到自然醒、穿着睡衣开会。但很快发现，没有外部节奏，时间会像沙子一样从指缝漏走。三年里我试过番茄钟、时间块、晨间例行，最后留下的，不是某个神奇工具，而是一套<em>稳定的结构感</em>：固定起床、固定开工、固定收工。</p><p>自由不是想做什么就做什么，而是有能力决定不做什么。这大概是我从远程工作里拿到的最贵的一课。</p>",
    cover_image: "assets/covers/11.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 12,
    title: "我的阅读系统：从囤书到真读",
    category: "个人博客",
    excerpt: "买书如山倒，读书如抽丝。后来我用一个笨办法破局：让书架只放三本未读，读完一本才能再买一本。",
    content: "<p>曾经我的电子书库里躺着两百多本「总有一天会读」的书，却年年读完不了几本。<strong>买书如山倒，读书如抽丝。</strong></p><p>破局靠一个笨办法：<em>让未读清单只保留三本</em>。读完一本，才能再添一本。限制反而带来专注——我不再焦虑地囤，而是认真地把眼前这几本啃完。</p><p>另外，读过的书我会用三句话写「它解决了我哪个问题」。写不出来的，多半是没真懂，值得二刷。</p>",
    cover_image: "assets/covers/12.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 13,
    title: "个人博客的成本账：一年花了多少",
    category: "个人博客",
    excerpt: "把域名、对象存储、CDN 摊开来算，一个纯静态博客一年的花销低到可以忽略。贵的从来不是钱，是坚持。",
    content: "<p>常有人问我：自己搞个博客贵不贵？我把账摊开算给你看。</p><p>域名一年几十块，静态托管 + CDN 在多数平台有免费额度，图床可以用对象存储按量计费。<strong>加起来一年可能还不到一杯奶茶钱。</strong></p><p>所以真正贵的从来不是钱，是<em>坚持更新的心力</em>。技术把门槛压到了地板，剩下的，只有「写不写」这一个问题。</p>",
    cover_image: "assets/covers/13.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 14,
    title: "断舍离一年后，我剩下了什么",
    category: "随风笔记",
    excerpt: "扔掉的不只是杂物，还有「万一哪天用得上」的囤积焦虑。留下的，是更轻的自己和更清楚的判断。",
    content: "<p>一年前我搞了次大扫除，按「最近一年用过吗」的标准清空了半个家。扔掉的不只是杂物，还有那种<strong>「万一哪天用得上」的囤积焦虑</strong>。</p><p>留下的，是更轻的自己和更清楚的判断——买东西前会多问一句：它真的会进我的生活吗？多数时候答案是不会。</p><p>断舍离不是苦行，而是把空间和注意力，留给真正重要的东西。</p>",
    cover_image: "assets/covers/14.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 15,
    title: "手冲咖啡：十分钟的正念练习",
    category: "随风笔记",
    excerpt: "磨豆、注水、等待萃取——这十分钟的仪式，是一天里唯一不被消息打断的留白。",
    content: "<p>每天清晨，我会给自己十分钟做一杯手冲。不是因为多懂咖啡，而是贪恋那段<strong>不被消息打断的留白</strong>。</p><p>磨豆的香气、注水的画圈、看液滴一格格落下——这些动作把人从「接下来要做什么」的焦虑里拽回当下。<em>正念不一定要打坐，一杯咖啡也可以。</em></p><p>十分钟后，人醒了，心也静了。</p>",
    cover_image: "assets/covers/15.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 16,
    title: "年度复盘：用三个问题看清自己",
    category: "随风笔记",
    excerpt: "不写长篇总结，只回答三个问题：今年哪件事让我最骄傲？哪件最遗憾？明年最想改变的一个习惯是什么？",
    content: "<p>每年最后一周，我不写长篇总结，只逼自己回答三个问题。</p><p>一、<strong>今年哪件事让我最骄傲？</strong>它暴露了我的哪种能力，值得继续放大。二、<strong>哪件事最遗憾？</strong>它的根源，是能力缺口还是注意力错配。三、<strong>明年最想改变的一个习惯是什么？</strong>只选一个，多了等于没选。</p><p>三个问题，比洋洋洒洒的年终总结更能<em>看清自己</em>。</p>",
    cover_image: "assets/covers/16.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 17,
    title: "城市散步：在熟悉里发现陌生",
    category: "随风笔记",
    excerpt: "换个方向、拐条没走过的巷子，城市忽然陌生起来。每周一次的无目的散步，是我给大脑的免费旅行。",
    content: "<p>住在同一座城几年，通勤路线闭着眼都能走。直到有天我故意拐进一条没走过的巷子，城市忽然<strong>陌生又新鲜</strong>起来。</p><p>从那以后，每周一次「无目的散步」成了习惯：不导航、不赶路，只是看店招、听人声、数梧桐。这种低成本的<em>免费旅行</em>，比刷十条短视频更能让人松一口气。</p><p>熟悉里藏着陌生，只要你愿意慢下来拐个弯。</p>",
    cover_image: "assets/covers/17.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 18,
    title: "AI Agent 正在改写软件开发流程",
    category: "实时要闻",
    excerpt: "从「写代码」到「定义意图」，Agent 把程序员从重复劳动里解放出来。真正稀缺的，变成提对需求、审好结果的能力。",
    content: "<p>如果说大模型去年还在帮人补全代码，今年它已经开始<strong>自主拆解任务、调用工具、跑通流程</strong>。AI Agent 正在把软件开发从「写代码」推向「定义意图」。</p><p>重复性的脚手架、单测、文档生成，正逐步交给 Agent；人则退到更高处：把需求讲清楚、把边界划明白、把结果审扎实。<em>真正稀缺的能力，变成了「提对问题、审好答案」。</em></p><p>这不是程序员的终局，而是一次分工的重新洗牌。</p>",
    cover_image: "assets/covers/18.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 19,
    title: "数字人民币试点扩围：它补上了哪块拼图",
    category: "实时要闻",
    excerpt: "当 e-CNY 走进更多消费与政务场景，它真正补上的，是法定数字货币在「可编程支付」上的想象空间。",
    content: "<p>数字人民币的试点范围持续扩围，从零售消费延伸到补贴发放、政务缴费。表面看是多了一种支付方式，底层却别有洞天。</p><p>e-CNY 的特别之处在于<strong>可编程性</strong>：一笔补贴可以设定「只能用于本地消费、月底失效」，一笔助学金可以限定「仅限教育场景」。这种<em>条件支付</em>，是传统账户体系很难低成本做到的。</p><p>所以当它在更多场景落地，真正补上的，是法定货币在「智能合约化」上那块长期缺席的拼图。</p>",
    cover_image: "assets/covers/19.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  },
  {
    id: 20,
    title: "边缘计算如何托起物联网的实时性",
    category: "实时要闻",
    excerpt: "当千万设备同时上报，云端往返的延迟就成了瓶颈。把算力下沉到边缘，物联网才真正「实时」起来。",
    content: "<p>摄像头、传感器、表计……当千万设备同时上报，把所有数据都回传云端再处理，<strong>那几百毫秒的往返延迟就成了瓶颈</strong>。</p><p>边缘计算的解法是把模型和能力下沉到离设备更近的节点：异常在本地识别、指令在本地下发、只在必要时才上云汇总。<em>云做大脑，边做神经末梢。</em></p><p>正是这套「云边协同」，让物联网从「能连上」走向「实时响应」，撑起了工厂质检、车路协同这一类对时延零容忍的场景。</p>",
    cover_image: "assets/covers/20.jpg",
    author: "站长", views: 0, is_pinned: false,
    created_at: "2026-11-03", updated_at: "2026-11-03"
  }
];

const list = JSON.parse(fs.readFileSync(FILE, "utf8"));
const existingIds = new Set(list.map(a => a.id));
let added = 0;
for (const a of NEW) {
  if (existingIds.has(a.id)) { console.log(`跳过已存在 id=${a.id}`); continue; }
  list.push(a); added++;
}
fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
console.log(`已追加 ${added} 篇，articles.json 现有 ${list.length} 篇`);
