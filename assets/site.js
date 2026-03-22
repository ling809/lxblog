/* global window, document, location */
(() => {
  "use strict";

  const POSTS = [
    {
      title: "红山、良渚与石峁的文明模式差异及其对中华文明多元一体格局的贡献",
      date: "2025-05-23",
      category: "学术",
      tags: ["学术"],
      excerpt: "探讨红山、良渚与石峁三大史前文明的独特模式及其在中华文明多元一体格局中的历史贡献。",
      url: "./assets/pdf/学术/红山、良渚与石峁的文明模式差异及其对中华文明多元一体格局的贡献.pdf",
    },
    {
      title: "碳捕集、利用与封存（CCUS）技术",
      date: "2025-06-02",
      category: "学术",
      tags: ["学术"],
      excerpt: "系统介绍碳捕集、利用与封存（CCUS）技术的基本原理、发展现状与未来前景。",
      url: "./assets/pdf/学术/碳捕集、利用与封存（CCUS）技术.pdf",
    },
    {
      title: "戈林：权力的巅峰到覆灭",
      date: "2026-03-19",
      category: "杂谈",
      tags: ["杂谈"],
      excerpt: "从权力的巅峰到最终的覆灭，回顾历史人物的命运轨迹。",
      url: "./assets/pdf/杂谈/戈林：权力的巅峰到覆灭.pdf",
    },
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const VIDEOS = [
    {
      title: "『AMV/鸣潮』\"未送出的门票\"",
      date: "2025-07-28",
      excerpt: "",
      type: "bilibili",
      bvid: "BV18N8EzoEgD",
      cover: "./assets/img/covers/01-wuchusongchupiao.jpg",
    },
    {
      title: "『AMV/巨人』\"艾伦，这里是你的家\"",
      date: "2025-02-28",
      excerpt: "",
      type: "bilibili",
      bvid: "BV1y19uYrEwi",
      cover: "./assets/img/covers/02-ailun-jia.jpg",
    },
    {
      title: "『mad/电锯人』\"逃 避 人 生\"",
      date: "2024-09-15",
      excerpt: "",
      type: "bilibili",
      bvid: "BV1Jx42edEHD",
      cover: "./assets/img/covers/03-dianjuren.jpg",
    },
    {
      title: "『雪国』一切营求努力总归徒劳",
      date: "2024-08-06",
      excerpt: "银河仿佛哗的一声，向岛村的心头倾泻下来。",
      type: "bilibili",
      bvid: "BV1DfYNeCE9m",
      cover: "./assets/img/covers/04-xueguo.jpg",
    },
    {
      title: "『mad/孤独摇滚』\"所以我放弃了音乐\"",
      date: "2023-01-01",
      excerpt: "喜欢的歌和喜欢的番剧，做喜欢的事情永远不会后悔！",
      type: "bilibili",
      bvid: "BV1PK411q7oH",
      cover: "./assets/img/covers/05-gudugunshan.jpg",
    },
    {
      title: "『紫罗兰/剧场版』\" 爱 \"",
      date: "2021-08-10",
      excerpt: "和你，手牵手，悠然漫步在奇幻森林中，采一朵野花，置于你发丝中，或踏足缤纷海滨，放一扇海螺，在你头顶。因为 with you，一切都美好至极。",
      type: "bilibili",
      bvid: "BV1wb4y167v8",
      cover: "./assets/img/covers/06-ziluolan.jpg",
    },
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  function $(id) {
    return document.getElementById(id);
  }

  function boot() {
    const y = $("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // 留言板功能 - Firebase Realtime Database
  const FIREBASE_URL = "https://personal-7805b-default-rtdb.firebaseio.com/messages.json";
  let cachedMessages = [];

  async function getGuestbook() {
    try {
      const res = await fetch(FIREBASE_URL);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data && typeof data === "object") {
        cachedMessages = Object.values(data);
      } else {
        cachedMessages = [];
      }
      return cachedMessages;
    } catch {
      return cachedMessages;
    }
  }

  async function saveGuestbook(messages) {
    cachedMessages = messages;
    try {
      const data = {};
      messages.forEach((msg, i) => {
        data[`msg_${Date.now()}_${i}`] = msg;
      });
      const res = await fetch(FIREBASE_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("save failed");
    } catch (e) {
      console.warn("保存失败", e);
    }
  }

  function formatGuestbookTime(timestamp) {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderGuestbookList(messages) {
    const container = $("guestbookList");
    if (!container) return;

    const list = messages || cachedMessages;
    container.innerHTML = "";

    if (messages.length === 0) {
      const empty = document.createElement("div");
      empty.className = "guestbook-empty";
      empty.textContent = "还没有留言，来做第一个吧~";
      container.appendChild(empty);
      return;
    }

    // 最新留言在前
    const sorted = [...messages].sort((a, b) => b.time - a.time);

    for (const msg of sorted) {
      const item = document.createElement("div");
      item.className = "guestbook-item";

      const header = document.createElement("div");
      header.className = "guestbook-item__header";

      const name = document.createElement("span");
      name.className = "guestbook-item__name";
      name.textContent = escapeHtml(msg.name);

      const time = document.createElement("span");
      time.className = "guestbook-item__time";
      time.textContent = formatGuestbookTime(msg.time);

      header.appendChild(name);
      header.appendChild(time);

      const content = document.createElement("div");
      content.className = "guestbook-item__content";
      content.textContent = msg.message;

      item.appendChild(header);
      item.appendChild(content);
      container.appendChild(item);
    }
  }

  function setupGuestbook() {
    const form = $("guestbookForm");
    if (!form) return;

    getGuestbook().then(renderGuestbookList);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameInput = $("guestName");
      const messageInput = $("guestMessage");
      if (!nameInput || !messageInput) return;

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) return;

      const btn = form.querySelector(".guestbook-btn");
      btn.disabled = true;
      btn.textContent = "发送中…";

      const messages = cachedMessages.length ? [...cachedMessages] : [];
      messages.push({
        name,
        message,
        time: Date.now(),
      });

      if (messages.length > 50) messages.splice(0, messages.length - 50);

      await saveGuestbook(messages);
      renderGuestbookList(messages);

      nameInput.value = "";
      messageInput.value = "";
      btn.disabled = false;
      btn.textContent = "留言";
    });
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
    setupGuestbook();
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

  function renderVideo() {
    boot();
    const list = $("videoList");
    if (!list) return;

    list.innerHTML = "";
    for (const v of VIDEOS) {
      const card = document.createElement("article");
      card.className = "video-card";

      const thumb = document.createElement("div");
      thumb.className = "video-thumb";

      const img = document.createElement("img");
      img.className = "video-thumb__img";
      img.src = v.cover || "";
      img.alt = v.title;
      img.loading = "lazy";

      const playWrap = document.createElement("div");
      playWrap.className = "video-thumb__play";
      const playIcon = document.createElement("div");
      playIcon.className = "video-thumb__play-icon";
      playWrap.appendChild(playIcon);

      thumb.appendChild(img);
      thumb.appendChild(playWrap);

      const info = document.createElement("div");
      info.className = "video-info";
      const title = document.createElement("h3");
      title.className = "video-info__title";
      title.textContent = v.title;
      const meta = document.createElement("p");
      meta.className = "video-info__meta";
      meta.textContent = formatDate(v.date);
      info.appendChild(title);
      info.appendChild(meta);

      card.appendChild(thumb);
      card.appendChild(info);

      card.addEventListener("click", () => openVideo(v));
      list.appendChild(card);
    }
  }

  function openVideo(v) {
    const modal = $("playerModal");
    const playerWrap = $("modalPlayerWrap");
    const titleEl = $("modalTitle");
    if (!modal || !playerWrap) return;

    playerWrap.innerHTML = "";
    titleEl.textContent = v.title;

    let el;
    if (v.type === "bilibili") {
      el = document.createElement("iframe");
      el.className = "modal__player";
      el.src = `https://player.bilibili.com/player.html?bvid=${v.bvid}&page=1&high_quality=1&danmaku=0`;
    } else {
      el = document.createElement("video");
      el.className = "modal__player";
      el.controls = true;
      el.autoplay = true;
      el.src = v.local;
    }
    el.allow = "autoplay; encrypted-media; fullscreen";
    el.allowFullscreen = true;
    el.frameBorder = "0";
    playerWrap.appendChild(el);

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeVideo() {
    const modal = $("playerModal");
    const playerWrap = $("modalPlayerWrap");
    if (!modal) return;
    modal.classList.remove("is-open");
    playerWrap.innerHTML = "";
    document.body.style.overflow = "";
  }

  function setupModal() {
    const closeBtn = $("modalClose");
    const modal = $("playerModal");
    if (closeBtn) closeBtn.addEventListener("click", closeVideo);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeVideo();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeVideo();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupModal);
  } else {
    setupModal();
  }

  window.Site = {
    boot,
    renderHome,
    renderArchive,
    renderVideo,
  };
})();

