// 纯前端交互：分类筛选 + 搜索（不调用任何网络/云 API，仅操作已渲染的 DOM）
(function () {
  var state = { cat: "all", q: "" };

  function cards() {
    return Array.prototype.slice.call(document.querySelectorAll("#postList .post-card"));
  }

  function apply() {
    var any = false;
    cards().forEach(function (c) {
      var okCat = state.cat === "all" || c.getAttribute("data-cat") === state.cat;
      var okQ =
        !state.q ||
        (c.getAttribute("data-title") || "").toLowerCase().indexOf(state.q) > -1;
      var show = okCat && okQ;
      c.style.display = show ? "" : "none";
      if (show) any = true;
    });
    var empty = document.getElementById("emptyState");
    if (empty) empty.style.display = any ? "none" : "";
    var title = document.getElementById("listTitle");
    if (title)
      title.textContent = state.q
        ? '搜索：“' + state.q + '”'
        : state.cat === "all"
        ? "最新文章"
        : state.cat;
    document.querySelectorAll(".topnav a[data-cat]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-cat") === state.cat);
    });
  }

  // 顶部导航分类（非“首页”）
  document.querySelectorAll('.topnav a[data-cat]:not([data-cat="all"])').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      state.cat = a.getAttribute("data-cat");
      state.q = "";
      var si = document.getElementById("searchInput");
      if (si) si.value = "";
      apply();
    });
  });

  // 侧边栏分类
  document.querySelectorAll("#catList li[data-cat]").forEach(function (li) {
    li.addEventListener("click", function () {
      state.cat = li.getAttribute("data-cat");
      state.q = "";
      var si = document.getElementById("searchInput");
      if (si) si.value = "";
      apply();
    });
  });

  var sb = document.getElementById("searchBtn");
  if (sb)
    sb.addEventListener("click", function () {
      state.q = (document.getElementById("searchInput").value || "").trim().toLowerCase();
      state.cat = "all";
      apply();
    });
  var si = document.getElementById("searchInput");
  if (si)
    si.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        state.q = si.value.trim().toLowerCase();
        state.cat = "all";
        apply();
      }
    });

  apply();
})();
