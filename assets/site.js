/* global window, document, location */
(() => {
  "use strict";

  const POSTS = [
    {
      title: "示例文章一",
      date: "2026-01-18",
      category: "随笔",
      tags: ["随笔", "平时学习篇"],
      excerpt: "这是一个文章页模板。你可以在这里写正文、引用、列表与代码块。",
      url: "./posts/2026-01-18-sample-1.html",
    },
    {
      title: "示例文章二",
      date: "2026-01-18",
      category: "课程攻略",
      tags: ["课程攻略", "期末复习篇"],
      excerpt: "如果你想用 Markdown 写作并自动生成页面，我们也可以加一个本地构建脚本。",
      url: "./posts/2026-01-18-sample-2.html",
    },
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  function $(id) {
    return document.getElementById(id);
  }

  function boot() {
    const y = $("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function uniqTags(posts) {
    const set = new Set();
    for (const p of posts) for (const t of p.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"));
  }

  function renderTagPills(container, tags, linkToArchive = true) {
    container.innerHTML = "";
    for (const t of tags) {
      const a = document.createElement("a");
      a.className = "tag";
      a.textContent = t;
      a.href = linkToArchive ? `./archive.html#tag=${encodeURIComponent(t)}` : "#";
      container.appendChild(a);
    }
  }

  function renderHome() {
    boot();

    const list = $("postList");
    const tags = $("tagList");
    if (!list || !tags) return;

    const latest = POSTS.slice(0, 8);
    list.innerHTML = "";
    for (const p of latest) {
      const card = document.createElement("article");
      card.className = "card post";

      const title = document.createElement("h3");
      title.className = "post__title";
      const link = document.createElement("a");
      link.href = p.url;
      link.textContent = p.title;
      title.appendChild(link);

      const meta = document.createElement("div");
      meta.className = "post__meta";
      meta.textContent = `${formatDate(p.date)} · ${p.category}`;

      const excerpt = document.createElement("p");
      excerpt.className = "post__excerpt";
      excerpt.textContent = p.excerpt;

      const t = document.createElement("div");
      t.className = "tags";
      for (const tag of p.tags.slice(0, 3)) {
        const a = document.createElement("a");
        a.className = "tag";
        a.textContent = tag;
        a.href = `./archive.html#tag=${encodeURIComponent(tag)}`;
        t.appendChild(a);
      }

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(t);
      card.appendChild(excerpt);
      list.appendChild(card);
    }

    renderTagPills(tags, uniqTags(POSTS).slice(0, 12));
  }

  function parseHash() {
    // supports #tag=xxx
    const h = (location.hash || "").replace(/^#/, "");
    const out = {};
    for (const part of h.split("&")) {
      if (!part) continue;
      const [k, v] = part.split("=");
      out[decodeURIComponent(k)] = decodeURIComponent(v || "");
    }
    return out;
  }

  function renderArchive() {
    boot();

    const list = $("archiveList");
    const search = $("search");
    const tagFilter = $("tagFilter");
    if (!list || !search || !tagFilter) return;

    const tags = ["", ...uniqTags(POSTS)];
    tagFilter.innerHTML = "";
    for (const t of tags) {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t ? t : "全部标签";
      tagFilter.appendChild(opt);
    }

    const hash = parseHash();
    if (hash.tag) tagFilter.value = hash.tag;

    function apply() {
      const q = (search.value || "").trim().toLowerCase();
      const tf = tagFilter.value;

      const filtered = POSTS.filter((p) => {
        const matchTag = !tf || p.tags.includes(tf);
        if (!matchTag) return false;
        if (!q) return true;
        const hay = `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });

      renderArchiveList(list, filtered);
    }

    search.addEventListener("input", apply);
    tagFilter.addEventListener("change", () => {
      const tf = tagFilter.value;
      if (tf) location.hash = `tag=${encodeURIComponent(tf)}`;
      else history.replaceState(null, "", location.pathname);
      apply();
    });

    window.addEventListener("hashchange", () => {
      const h2 = parseHash();
      tagFilter.value = h2.tag || "";
      apply();
    });

    apply();
  }

  function renderArchiveList(container, posts) {
    container.innerHTML = "";
    if (posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "muted";
      empty.textContent = "没有匹配的文章。";
      container.appendChild(empty);
      return;
    }

    const groups = groupByYear(posts);
    for (const year of Object.keys(groups).sort((a, b) => Number(b) - Number(a))) {
      const block = document.createElement("div");
      block.className = "card";
      block.style.padding = "12px 14px";

      const h = document.createElement("div");
      h.style.display = "flex";
      h.style.alignItems = "baseline";
      h.style.justifyContent = "space-between";
      h.style.gap = "10px";
      const title = document.createElement("h2");
      title.style.margin = "0";
      title.style.fontSize = "16px";
      title.textContent = year;
      const count = document.createElement("span");
      count.className = "muted";
      count.style.fontSize = "12px";
      count.textContent = `${groups[year].length} 篇`;
      h.appendChild(title);
      h.appendChild(count);

      const ul = document.createElement("ul");
      ul.style.margin = "10px 0 0";
      ul.style.paddingLeft = "18px";
      ul.style.display = "grid";
      ul.style.gap = "8px";

      for (const p of groups[year]) {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = p.url;
        a.textContent = p.title;
        const meta = document.createElement("span");
        meta.className = "muted";
        meta.style.marginLeft = "8px";
        meta.style.fontSize = "12px";
        meta.textContent = `(${formatDate(p.date)} · ${p.category})`;
        li.appendChild(a);
        li.appendChild(meta);
        ul.appendChild(li);
      }

      block.appendChild(h);
      block.appendChild(ul);
      container.appendChild(block);
    }
  }

  function groupByYear(posts) {
    const g = {};
    for (const p of posts) {
      const year = p.date.slice(0, 4);
      if (!g[year]) g[year] = [];
      g[year].push(p);
    }
    return g;
  }

  function formatDate(yyyyMmDd) {
    const [y, m, d] = yyyyMmDd.split("-").map((x) => Number(x));
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  window.Site = {
    boot,
    renderHome,
    renderArchive,
  };
})();

