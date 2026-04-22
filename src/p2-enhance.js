/* ===========================================================
 * p2-enhance.js —— P2 设计增强（信息架构 / Tab / 图表 / 主题）
 * 设计原则：纯增强，不改动现有 DOM 容器 id/class
 * 一键回退：从 index.html 删除本脚本引入即可
 * =========================================================== */
(function () {
  "use strict";

  /* -------- 工具 -------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const el = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "style") e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (html !== undefined) e.innerHTML = html;
    return e;
  };

  /* -------- Tab 分组规则：把 30+ subsection 归到 5 个 Tab -------- */
  // 依据 subsection 内部元素 id 来归组
  const TAB_GROUPS = [
    {
      id: "overview",
      label: "命盘总览",
      matches: [
        "summary-title", "summary-copy", "overall-conclusion",
        "pillar-grid", "nayin-section", "element-bars", "element-summary",
        "strength-section", "usegod-section", "tiaohuo-section",
      ],
    },
    {
      id: "pattern",
      label: "格局神煞",
      matches: [
        "twelve-stages-section", "interaction-section", "pattern-section",
        "shensha-section", "kongwang-section", "wuxing-relation-section",
        "tengod-section",
      ],
    },
    {
      id: "life",
      label: "婚姻健康",
      matches: [
        "marriage-section", "health-section", "birthplace-section",
        "personality-title", "balance-title", "focus-title",
      ],
    },
    {
      id: "dayun",
      label: "大运流年",
      matches: [
        "dayun-section", "auxiliary-section", "solar-section",
        "yearly-section", "monthly-section", "lucky-section",
      ],
    },
    {
      id: "ziwei",
      label: "紫微斗数",
      matches: ["ziwei-section"],
    },
    {
      id: "chat",
      label: "AI 问答",
      matches: ["chat-panel"],
    },
  ];

  /* 默认默认展开的 subsection id（其他默认折叠） */
  const DEFAULT_OPEN = new Set([
    "pillar-grid", "element-bars", "strength-section", "usegod-section",
    "dayun-section", "ziwei-section", "chat-panel",
  ]);

  /* -------- 1. 关键结论速览（结论先行） -------- */
  function renderQuickConclusion() {
    const rc = $("#result-content");
    if (!rc || rc.classList.contains("hidden")) return;
    // 从已渲染 DOM 抓取要点（render.js 已填值）
    const dominant = $("#dominant-pill")?.textContent?.trim() || ""; // "主导：火"
    const weak = $("#weak-pill")?.textContent?.trim() || "";         // "待补：木"
    const summary = $("#summary-copy")?.textContent?.trim() || "";

    // 日主强弱：抓 strength-section 里的 .strength-badge（身强/身弱/偏强...）+ 分数
    let strengthLabel = "";
    const sBadge = $("#strength-section .strength-badge");
    const sScore = $("#strength-section .strength-score");
    if (sBadge) {
      strengthLabel = sBadge.textContent.trim();
      if (sScore) strengthLabel += `（${sScore.textContent.trim()}分）`;
    }

    // 从 usegod-section 抓用神、喜、忌
    let useGod = "";
    const useGodEl = $("#usegod-section .usegod-value")
      || $("#usegod-section .usegod-element")
      || $("#usegod-section .ug-element");
    if (useGodEl) {
      useGod = useGodEl.textContent.trim().slice(0, 16);
    } else {
      // 兜底：找 strong 时要排除 "喜：" "忌：" 这种标签文字
      const strongs = $$("#usegod-section strong");
      const hit = strongs.find(s => {
        const t = s.textContent.trim();
        return t && !/^(喜|忌)[:：]?$/.test(t);
      });
      if (hit) useGod = hit.textContent.trim().slice(0, 16);
    }

    // 抓取「喜」「忌」五行列表
    function extractLikeDislike(cls) {
      const el = $(`#usegod-section .${cls}`);
      if (!el) return "";
      // 取子元素文本（排除 <strong> 标签本身），如 "木 火 土"
      return Array.from(el.children)
        .filter(c => c.tagName !== "STRONG" && c.classList.contains("el-tag"))
        .map(c => c.textContent.trim())
        .filter(Boolean)
        .join(" ")
        || el.textContent.replace(/^(喜|忌)[:：]\s*/, "").trim();
    }
    const likeEls = extractLikeDislike("usegod-like");
    const dislikeEls = extractLikeDislike("usegod-dislike");

    // 从 pattern-section 抓主格局
    let pattern = "";
    const patternEl = $("#pattern-section .pattern-name")
      || $("#pattern-section h4")
      || $("#pattern-section strong");
    if (patternEl) pattern = patternEl.textContent.trim().slice(0, 18);

    // 当前大运（多路兜底）
    let curDayun = "";
    // 1) 从当前流年卡的"运·XX"标签抓
    const yearlyTag = $(".yearly-card.yearly-current .yearly-dayun-tag");
    if (yearlyTag) {
      const m = yearlyTag.textContent.match(/运[·・]\s*([甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥])/);
      if (m) curDayun = m[1];
    }
    // 2) 从大运步骤里按当前年龄匹配
    if (!curDayun) {
      const steps = $$("#dayun-section .dayun-step");
      if (steps.length) {
        // 尝试从 hero/summary 抓年龄，或用"岁"文本推断
        let currentAge = null;
        const birthDateInput = document.querySelector("#birth-date");
        if (birthDateInput && birthDateInput.value) {
          const by = parseInt(birthDateInput.value.slice(0, 4), 10);
          if (!isNaN(by)) currentAge = new Date().getFullYear() - by;
        }
        if (currentAge != null) {
          const hit = steps.find(s => {
            const ageText = s.querySelector(".dayun-age")?.textContent || "";
            const m = ageText.match(/(\d+)\s*[-–]\s*(\d+)/);
            if (!m) return false;
            const a = +m[1], b = +m[2];
            if (currentAge >= a && currentAge <= b) {
              s.classList.add("current"); // 顺便打标记，给大运曲线用
              return true;
            }
            return false;
          });
          if (hit) {
            const gz = hit.querySelector(".dayun-gz");
            if (gz) curDayun = gz.textContent.trim();
          }
        }
      }
    }
    // 3) 兜底：取大运步骤第一项
    if (!curDayun) {
      const firstGz = $("#dayun-section .dayun-step .dayun-gz");
      if (firstGz) curDayun = firstGz.textContent.trim();
    }

    const card = el("div", { id: "p2-quick-card", class: "p2-quick-card" });
    // dominant 原本格式为 "主导：火"，这里提纯成五行单字
    const dominantEl = (dominant.match(/[金木水火土]/g) || []).join("") || "—";
    // 为每项值分配语义色
    function valColor(k, v) {
      if (!v || v === "—") return "";
      switch (k) {
        case "日主强弱":
          return strengthLabel.includes("身强") ? "p2-quick-v-strong"
            : strengthLabel.includes("身弱") ? "p2-quick-v-weak" : "p2-quick-v-balanced";
        case "五行主导": return "p2-quick-v-el";
        case "用神": return "p2-quick-v-god";
        case "喜": return likeEls ? "p2-quick-v-good" : "";
        case "忌": return dislikeEls ? "p2-quick-v-bad" : "";
        case "主格局": return "p2-quick-v-pattern";
        case "当前大运": return "p2-quick-v-dayun";
        default: return "";
      }
    }
    const items = [
      { k: "日主强弱", v: strengthLabel || "—" },
      { k: "五行主导", v: dominantEl },
      { k: "用神", v: useGod || "—" },
      { k: "喜", v: likeEls || "—" },
      { k: "忌", v: dislikeEls || "—" },
      { k: "主格局", v: pattern || "—" },
      { k: "当前大运", v: curDayun || "—" },
    ];
    card.innerHTML = `
      <div class="p2-quick-head">
        <span class="p2-quick-tag">关键结论速览</span>
        <span class="p2-quick-hint">一眼看懂你的命盘核心</span>
      </div>
      <div class="p2-quick-grid">
        ${items.map(i => `
          <div class="p2-quick-cell">
            <div class="p2-quick-k">${i.k}</div>
            <div class="p2-quick-v${valColor(i.k, i.v) ? " " + valColor(i.k, i.v) : ""}">${i.v}</div>
          </div>`).join("")}
      </div>
      ${weak ? `<div class="p2-quick-sub">${weak}</div>` : ""}
    `;
    const existing = $("#p2-quick-card");
    if (existing) {
      // 已存在则替换内容（允许数据补齐后重算）
      existing.innerHTML = card.innerHTML;
    } else {
      const summaryCard = $(".summary-card");
      if (summaryCard && summaryCard.parentNode) {
        summaryCard.parentNode.insertBefore(card, summaryCard.nextSibling);
      }
    }
  }

  /* -------- 2. Tab 导航 -------- */
  function classifySection(section) {
    // 返回 tab id
    const ids = $$("*[id]", section).map(n => n.id);
    ids.push(section.id);
    for (const group of TAB_GROUPS) {
      if (group.matches.some(m => ids.includes(m))) return group.id;
    }
    return "overview";
  }

  function buildTabs() {
    const rc = $("#result-content");
    if (!rc || rc.classList.contains("hidden")) return;
    if ($("#p2-tabs")) return;

    // 标签所有 subsection
    const sections = $$("#result-content > section, #result-content > .insight-grid");
    sections.forEach(sec => {
      const group = classifySection(sec);
      sec.setAttribute("data-p2-tab", group);
    });

    // 构建 tab bar
    const tabBar = el("div", { id: "p2-tabs", class: "p2-tabs" });
    TAB_GROUPS.forEach((g, i) => {
      const btn = el("button", {
        type: "button",
        class: "p2-tab-btn" + (i === 0 ? " active" : ""),
        "data-tab": g.id,
      }, g.label);
      btn.addEventListener("click", () => activateTab(g.id));
      tabBar.appendChild(btn);
    });

    // 插入到总览卡片后
    const anchor = $("#p2-quick-card") || $(".summary-card");
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(tabBar, anchor.nextSibling);
    }
    activateTab(TAB_GROUPS[0].id);

    // 首次展示 tab 栏时加一次性吸引注意的闪烁动画
    try {
      const seen = sessionStorage.getItem("p2-tabs-seen");
      if (!seen) {
        tabBar.classList.add("p2-tabs-hint");
        setTimeout(() => tabBar.classList.remove("p2-tabs-hint"), 3500);
        sessionStorage.setItem("p2-tabs-seen", "1");
      }
    } catch (e) { /* sessionStorage may be blocked */ }
  }

  function activateTab(tabId) {
    $$(".p2-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
    $$("#result-content > section, #result-content > .insight-grid").forEach(sec => {
      const g = sec.getAttribute("data-p2-tab");
      // summary 卡片、quick 卡片、tab 栏常驻显示
      if (!g) { sec.style.display = ""; return; }
      sec.style.display = (g === tabId) ? "" : "none";
    });
    // 滚动回顶部，体验更好
    const rp = $("#result-panel");
    if (rp) rp.scrollTop = 0;
  }

  /* -------- 3. 折叠展开 -------- */
  function buildCollapsibles() {
    $$("#result-content .subsection").forEach(sec => {
      const head = sec.querySelector(".subsection-heading");
      if (!head || head.querySelector(".p2-collapse-btn")) return;

      // 判断默认状态
      const firstChild = sec.querySelector("div[id]");
      const key = firstChild ? firstChild.id : sec.id;
      const open = DEFAULT_OPEN.has(key) || DEFAULT_OPEN.has(sec.id);

      const btn = el("button", {
        type: "button",
        class: "p2-collapse-btn",
        "aria-label": "展开/收起",
      }, open ? "−" : "+");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        sec.classList.toggle("p2-collapsed");
        btn.textContent = sec.classList.contains("p2-collapsed") ? "+" : "−";
      });
      head.style.cursor = "pointer";
      head.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;
        btn.click();
      });
      head.appendChild(btn);
      if (!open) sec.classList.add("p2-collapsed");
    });
  }

  /* -------- 4. 五行雷达图（SVG） -------- */
  function renderWuxingRadar() {
    const wrap = $("#element-bars");
    if (!wrap) return;
    if ($("#p2-radar")) return;

    // 从已渲染的 bar 里提取百分比
    const bars = $$(".element-bar, .bar-item, [data-element]", wrap);
    const data = [];
    const elementOrder = ["木", "火", "土", "金", "水"];
    elementOrder.forEach(name => {
      let v = 0;
      for (const b of bars) {
        const label = (b.textContent || "").slice(0, 30);
        if (label.includes(name)) {
          const m = label.match(/(\d+(?:\.\d+)?)\s*%?/);
          if (m) { v = parseFloat(m[1]); break; }
        }
      }
      data.push({ name, value: v });
    });

    // 如果没拿到数据，不渲染
    if (data.every(d => d.value === 0)) return;

    const max = Math.max(40, ...data.map(d => d.value));
    const size = 280, cx = size / 2, cy = size / 2, R = 100;
    const n = 5;

    function pt(i, r) {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    }

    // 背景网格
    const rings = [0.25, 0.5, 0.75, 1].map(k => {
      const points = Array.from({ length: n }, (_, i) => pt(i, R * k).join(",")).join(" ");
      return `<polygon points="${points}" fill="none" stroke="var(--p2-radar-grid,#2a2f45)" stroke-width="1"/>`;
    }).join("");

    const axes = Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(i, R);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--p2-radar-grid,#2a2f45)" stroke-width="1"/>`;
    }).join("");

    const labels = Array.from({ length: n }, (_, i) => {
      const [x, y] = pt(i, R + 18);
      const colors = { "木": "#6fbf7a", "火": "#e06b6b", "土": "#c9a25a", "金": "#d0c8b8", "水": "#6aa8d8" };
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle"
              font-size="13" fill="${colors[data[i].name]}">${data[i].name} ${data[i].value.toFixed(0)}%</text>`;
    }).join("");

    const dataPoints = data.map((d, i) => pt(i, R * (d.value / max)).join(",")).join(" ");

    const svg = `
      <svg id="p2-radar" viewBox="0 0 ${size} ${size}" width="100%" height="${size}" style="max-width:${size}px;display:block;margin:0 auto">
        ${rings}
        ${axes}
        <polygon points="${dataPoints}" fill="rgba(106,184,201,0.22)" stroke="#6ab8c9" stroke-width="1.5"/>
        ${data.map((d, i) => {
          const [x, y] = pt(i, R * (d.value / max));
          return `<circle cx="${x}" cy="${y}" r="3.5" fill="#8a6db5"/>`;
        }).join("")}
        ${labels}
      </svg>`;

    const radarWrap = el("div", { id: "p2-radar-wrap", class: "p2-radar-wrap" }, `
      <div class="p2-chart-title">五行能量雷达</div>
      ${svg}
    `);
    wrap.parentNode.insertBefore(radarWrap, wrap);
  }

  /* -------- 5. 大运曲线（SVG） -------- */
  function renderDayunCurve() {
    const dy = $("#dayun-section");
    if (!dy) return;
    if ($("#p2-dayun-curve")) return;

    const cards = $$(".dayun-step", dy);
    if (!cards.length) return;

    const data = [];
    cards.forEach(c => {
      const gz = (c.querySelector(".dayun-gz") || c).textContent.trim().slice(0, 4);
      const ageEl = c.querySelector(".dayun-age");
      const ageTxt = ageEl ? ageEl.textContent : "";
      const ageMatch = ageTxt.match(/(\d+)/);
      const age = ageMatch ? parseInt(ageMatch[1], 10) : NaN;
      // 评分：优先 .dayun-score-num 里的"XX分"
      let score = 60;
      const scoreNumEl = c.querySelector(".dayun-score-num");
      const scoreFillEl = c.querySelector(".dayun-score-fill");
      if (scoreNumEl) {
        const m = scoreNumEl.textContent.match(/(\d+(?:\.\d+)?)/);
        if (m) score = parseFloat(m[1]);
      } else if (scoreFillEl && scoreFillEl.style.width) {
        const m = scoreFillEl.style.width.match(/(\d+(?:\.\d+)?)/);
        if (m) score = parseFloat(m[1]);
      } else {
        if (c.classList.contains("good")) score = 80;
        else if (c.classList.contains("caution")) score = 45;
      }
      data.push({ gz, age: isNaN(age) ? data.length * 10 : age, score, isCurrent: c.classList.contains("current") });
    });

    if (data.length < 2) return;

    const W = 600, H = 180, P = 36;
    const minAge = Math.min(...data.map(d => d.age));
    const maxAge = Math.max(...data.map(d => d.age));
    const spanAge = Math.max(1, maxAge - minAge);
    const x = (age) => P + (W - 2 * P) * (age - minAge) / spanAge;
    const y = (s) => H - P - (H - 2 * P) * Math.min(100, Math.max(0, s)) / 100;

    const pathD = data.map((d, i) => `${i ? "L" : "M"} ${x(d.age).toFixed(1)} ${y(d.score).toFixed(1)}`).join(" ");
    const areaD = pathD + ` L ${x(data[data.length - 1].age).toFixed(1)} ${H - P} L ${x(data[0].age).toFixed(1)} ${H - P} Z`;

    const grids = [25, 50, 75].map(v => `
      <line x1="${P}" y1="${y(v).toFixed(1)}" x2="${W - P}" y2="${y(v).toFixed(1)}" stroke="var(--p2-grid,#2a2f45)" stroke-dasharray="3,3" stroke-width="1"/>
      <text x="${P - 6}" y="${y(v).toFixed(1)}" text-anchor="end" dominant-baseline="middle" font-size="10" fill="var(--p2-grid-label,#6a708a)">${v}</text>
    `).join("");

    const dots = data.map(d => `
      <circle cx="${x(d.age).toFixed(1)}" cy="${y(d.score).toFixed(1)}" r="${d.isCurrent ? 5 : 3}" fill="${d.isCurrent ? "#e0a958" : "#6ab8c9"}" stroke="#0f111a" stroke-width="${d.isCurrent ? 2 : 1}"/>
      <text x="${x(d.age).toFixed(1)}" y="${H - P + 14}" text-anchor="middle" font-size="10" fill="var(--p2-grid-label,#8a92ad)">${d.gz}</text>
      <text x="${x(d.age).toFixed(1)}" y="${H - P + 26}" text-anchor="middle" font-size="9" fill="var(--p2-grid-label,#6a708a)">${d.age}岁</text>
    `).join("");

    const svg = `
      <svg id="p2-dayun-curve" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="xMidYMid meet">
        ${grids}
        <path d="${areaD}" fill="rgba(138,109,181,0.12)"/>
        <path d="${pathD}" fill="none" stroke="#8a6db5" stroke-width="2"/>
        ${dots}
      </svg>`;

    const wrap = el("div", { class: "p2-dayun-curve-wrap" }, `
      <div class="p2-chart-title">大运走势</div>
      ${svg}
    `);
    dy.parentNode.insertBefore(wrap, dy);
  }

  /* -------- 6. 暗/亮主题切换 -------- */
  function setupThemeToggle() {
    if ($("#p2-theme-toggle")) return;

    // 恢复上次主题
    const saved = localStorage.getItem("p2-theme") || "dark";
    if (saved === "light") document.documentElement.setAttribute("data-theme", "light");

    const btn = el("button", {
      id: "p2-theme-toggle",
      class: "p2-theme-toggle",
      type: "button",
      title: "切换明暗主题",
    }, saved === "light" ? "☾" : "☀");

    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = cur === "light" ? "dark" : "light";
      if (next === "light") document.documentElement.setAttribute("data-theme", "light");
      else document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("p2-theme", next);
      btn.textContent = next === "light" ? "☾" : "☀";
    });

    document.body.appendChild(btn);
  }

  /* -------- 入口：等 render.js 填完再增强 -------- */
  function enhance() {
    try { setupThemeToggle(); } catch (e) { console.warn("[p2] theme", e); }
    const rc = $("#result-content");
    if (!rc || rc.classList.contains("hidden")) return false;
    try { renderQuickConclusion(); } catch (e) { console.warn("[p2] quick", e); }
    try { renderWuxingRadar(); } catch (e) { console.warn("[p2] radar", e); }
    try { renderDayunCurve(); } catch (e) { console.warn("[p2] dayun", e); }
    try { buildCollapsibles(); } catch (e) { console.warn("[p2] collapse", e); }
    try { buildTabs(); } catch (e) { console.warn("[p2] tabs", e); }
    return true;
  }

  // 监听 result-content 的 class 变化（hidden 摘除时触发）
  function observe() {
    const rc = $("#result-content");
    if (!rc) { setTimeout(observe, 200); return; }
    // 先尝试一次
    if (!rc.classList.contains("hidden")) enhance();

    const mo = new MutationObserver(() => {
      if (!rc.classList.contains("hidden")) {
        enhance();
      } else {
        // 隐藏后清理 P2 注入节点，便于下次重算
        ["#p2-quick-card", "#p2-tabs", "#p2-radar-wrap", ".p2-dayun-curve-wrap"].forEach(sel => {
          $$(sel).forEach(n => n.remove());
        });
        $$("#result-content .subsection").forEach(sec => {
          sec.classList.remove("p2-collapsed");
          sec.removeAttribute("data-p2-tab");
          sec.style.display = "";
          const btn = sec.querySelector(".p2-collapse-btn");
          if (btn) btn.remove();
        });
      }
    });
    mo.observe(rc, { attributes: true, attributeFilter: ["class"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe);
  } else {
    observe();
  }

  // 暴露手动触发
  window.p2Enhance = enhance;
})();
