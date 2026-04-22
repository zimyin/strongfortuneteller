/* ==========================================================================
 * marriage-ui.js
 * 合婚模块的 UI 层：事件绑定、调用 calculateFortune（male/female）、渲染结果
 * ========================================================================== */
(function () {
  "use strict";

  const form = document.getElementById("marriage-match-form");
  const resultBox = document.getElementById("mm-result");
  if (!form || !resultBox) return;

  /* ---------- 工具 ---------- */
  function $(sel, root) { return (root || form).querySelector(sel); }

  /**
   * 把 calculateFortune 的结果规范化为 marriage-match.js 期望的结构：
   * - dayPillar: { stem, branch }（从 pillars[2] 或 dayStem/dayBranch 拿）
   * - name / birth 字段补齐
   */
  function normalizeForMatch(result, input) {
    if (!result) return;
    result.name = input.name;
    result.birth = input.birth;
    if (!result.dayPillar) {
      if (Array.isArray(result.pillars) && result.pillars[2]) {
        const d = result.pillars[2];
        result.dayPillar = { stem: d.stem, branch: d.branch };
      } else if (result.dayStem && result.dayBranch) {
        result.dayPillar = { stem: result.dayStem, branch: result.dayBranch };
      }
    }
  }
  function parseDate(dateStr, timeStr) {
    if (!dateStr) return null;
    const ds = dateStr.replace(/\//g, "-").split("-").map(Number);
    let y, m, d;
    if (ds[0] > 31) { [y, m, d] = ds; } else if (ds[2] > 31) { [d, m, y] = ds; } else { [y, m, d] = ds; }
    const ts = (timeStr || "12:00").split(":").map(Number);
    return new Date(y, m - 1, d, ts[0] || 0, ts[1] || 0, 0);
  }

  function collectOne(prefix) {
    const name = $(`input[name="${prefix}_name"]`).value.trim() || (prefix === "m" ? "男方" : "女方");
    const dateStr = $(`input[name="${prefix}_date"]`).value;
    const timeStr = $(`input[name="${prefix}_time"]`).value;
    const place = $(`input[name="${prefix}_place"]`).value.trim();
    const birth = parseDate(dateStr, timeStr);
    if (!birth || isNaN(birth.getTime())) return null;
    return { name, gender: prefix === "m" ? "male" : "female", birth, focus: "overall", birthplace: place };
  }

  /* ---------- 按钮：从上方测算复制 ---------- */
  form.querySelectorAll(".mm-copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.copy; // male / female
      const name = document.querySelector("#name")?.value.trim();
      const gender = document.querySelector("#gender")?.value;
      const date = document.querySelector("#birth-date")?.value;
      const time = document.querySelector("#birth-time")?.value;
      const place = document.querySelector("#birthplace")?.value.trim();
      if (!date) { alert("请先在页面顶部完成一次深度测算，或直接手动输入。"); return; }
      if (kind === "male" && gender !== "male") { if (!confirm("顶部测算的性别不是男，仍要复制到男方栏位吗？")) return; }
      if (kind === "female" && gender !== "female") { if (!confirm("顶部测算的性别不是女，仍要复制到女方栏位吗？")) return; }
      const p = kind === "male" ? "m" : "f";
      $(`input[name="${p}_name"]`).value = name || "";
      $(`input[name="${p}_date"]`).value = date || "";
      $(`input[name="${p}_time"]`).value = time || "12:00";
      $(`input[name="${p}_place"]`).value = place || "";
    });
  });

  /* ---------- 示例（虚拟数据，仅演示）：1990-03-08 辰(男) × 1992-11-14 午(女) ---------- */
  document.getElementById("mm-fill-demo")?.addEventListener("click", () => {
    $(`input[name="m_name"]`).value = "演示-男";
    $(`input[name="m_date"]`).value = "1990-03-08";
    $(`input[name="m_time"]`).value = "08:30"; // 辰时
    $(`input[name="m_place"]`).value = "北京";
    $(`input[name="f_name"]`).value = "演示-女";
    $(`input[name="f_date"]`).value = "1992-11-14";
    $(`input[name="f_time"]`).value = "12:15"; // 午时
    $(`input[name="f_place"]`).value = "上海";
  });

  /* ---------- 提交 ---------- */
  function setLoading(on) {
    const btn = form.querySelector(".mm-submit");
    const overlay = document.getElementById("mm-loading");
    if (on) {
      if (btn) { btn.disabled = true; btn.textContent = "合婚中..."; }
      if (!overlay) {
        const div = document.createElement("div");
        div.id = "mm-loading";
        div.className = "mm-loading";
        div.innerHTML = '<div class="mm-spinner"></div><span>正在排盘分析，请稍候...</span>';
        resultBox.parentNode.insertBefore(div, resultBox);
      }
      document.getElementById("mm-loading").style.display = "";
      resultBox.classList.add("hidden");
    } else {
      if (btn) { btn.disabled = false; btn.textContent = "开始合婚"; }
      const ov = document.getElementById("mm-loading");
      if (ov) ov.style.display = "none";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const male = collectOne("m");
      const female = collectOne("f");
      if (!male || !female) {
        alert("请完整填写男女双方的出生日期与时刻。");
        return;
      }
      if (typeof calculateFortune !== "function") {
        alert("测算引擎未就绪，请稍候重试或刷新页面。");
        return;
      }
      if (typeof computeMarriageMatch !== "function") {
        alert("合婚引擎未加载。");
        return;
      }

      setLoading(true);

      // 异步执行避免 UI 卡死（calculateFortune 是同步 CPU 密集计算）
      setTimeout(() => {
        try {
          const mResult = calculateFortune(male);
          const fResult = calculateFortune(female);
          normalizeForMatch(mResult, male);
          normalizeForMatch(fResult, female);
          const match = computeMarriageMatch(mResult, fResult);
          render(match, mResult, fResult);
          resultBox.classList.remove("hidden");
          resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (err) {
          console.error("合婚出错：", err);
          alert("合婚计算出错：" + err.message + "\n\n" + (err.stack || "").split("\n").slice(0, 4).join("\n"));
        } finally {
          setLoading(false);
        }
      }, 50);
    } catch (err) {
      console.error("合婚出错：", err);
      alert("合婚计算出错：" + err.message + "\n\n" + (err.stack || "").split("\n").slice(0, 4).join("\n"));
      setLoading(false);
    }
  });

  /* ---------- 渲染 ---------- */
  function render(match, m, f) {
    const score = match.totalScore;
    const grade = match.grade;

    // 总评条
    const scorePct = Math.min(100, Math.max(0, score * 10));
    const gradeColor = score >= 9 ? "var(--neon-blue)" : score >= 8 ? "#4ec97a" : score >= 7 ? "#c4a35a" : score >= 6 ? "#d4b876" : "#e05252";

    // 雷达图 SVG
    const radar = buildRadarSVG(match.dimensions);

    // 维度条
    const dimBars = match.dimensions.map(d => {
      const pct = Math.round(d.score * 10);
      return `
        <div class="mm-dim-row">
          <div class="mm-dim-head">
            <span class="mm-dim-key">${escapeHTML(d.key)}</span>
            <span class="mm-dim-score">${d.score.toFixed(1)} / 10</span>
          </div>
          <div class="mm-dim-bar"><div class="mm-dim-fill" style="width:${pct}%"></div></div>
          <div class="mm-dim-title">${escapeHTML(d.title)}</div>
          <div class="mm-dim-detail">${escapeHTML(d.detail)}</div>
        </div>
      `;
    }).join("");

    // 优势 / 提醒
    const adv = match.advantages.length
      ? match.advantages.map(x => `<li>${escapeHTML(x)}</li>`).join("")
      : `<li class="muted">未识别出特别突出的优势项。</li>`;
    const cau = match.cautions.length
      ? match.cautions.map(x => `<li>${escapeHTML(x)}</li>`).join("")
      : `<li class="muted">未发现明显需警惕的项。</li>`;

    // 两人命盘简介
    const mP = m.pillars.map(p => `${p.stem}${p.branch}`).join(" ");
    const fP = f.pillars.map(p => `${p.stem}${p.branch}`).join(" ");

    // 共同喜用 / 共同忌神 / 互补喜用
    const tags = [];
    if (match.sharedLikes && match.sharedLikes.length) {
      tags.push(`<span class="mm-tag mm-tag-good">共同喜用：${match.sharedLikes.join("、")}</span>`);
    }
    if (match.bothAvoid && match.bothAvoid.length) {
      tags.push(`<span class="mm-tag mm-tag-bad">共同忌神：${match.bothAvoid.join("、")}</span>`);
    }
    if (match.maleLikes && match.maleLikes.length) {
      tags.push(`<span class="mm-tag">♂ 喜：${match.maleLikes.join("、")}</span>`);
    }
    if (match.femaleLikes && match.femaleLikes.length) {
      tags.push(`<span class="mm-tag">♀ 喜：${match.femaleLikes.join("、")}</span>`);
    }
    const tagHtml = tags.join("");

    resultBox.innerHTML = `
      <div class="mm-result-card">
        <div class="mm-score-head">
          <div class="mm-score-num" style="color:${gradeColor}">${score.toFixed(1)}<span>/10</span></div>
          <div class="mm-score-grade">${escapeHTML(grade)}</div>
          <div class="mm-score-bar"><div class="mm-score-fill" style="width:${scorePct}%;background:${gradeColor}"></div></div>
        </div>

        <div class="mm-couple-line">
          <div class="mm-couple-slot"><span class="mm-couple-label">♂ ${escapeHTML(m.name)}</span><code>${escapeHTML(mP)}</code></div>
          <div class="mm-couple-mid">×</div>
          <div class="mm-couple-slot"><span class="mm-couple-label">♀ ${escapeHTML(f.name)}</span><code>${escapeHTML(fP)}</code></div>
        </div>

        <div class="mm-tag-line">${tagHtml}</div>

        <div class="mm-radar-wrap">
          ${radar}
        </div>

        <h4 class="mm-sec-h">八维评分详情</h4>
        <div class="mm-dim-list">${dimBars}</div>

        <div class="mm-adv-caus">
          <div class="mm-adv">
            <h4>✓ 优势所在</h4>
            <ul>${adv}</ul>
          </div>
          <div class="mm-caus">
            <h4>! 需要留意</h4>
            <ul>${cau}</ul>
          </div>
        </div>

        <h4 class="mm-sec-h">命理合婚报告</h4>
        <div class="mm-narrative">${renderNarrative(match.narrative)}</div>

        <p class="mm-foot">合婚结论以命理规律为参考，实际姻缘更靠两人用心经营。</p>
      </div>
    `;
  }

  /* ---------- 雷达图 SVG ---------- */
  function buildRadarSVG(dims) {
    const size = 320;
    const cx = size / 2, cy = size / 2;
    const maxR = 120;
    const n = dims.length;
    const angleStep = (Math.PI * 2) / n;

    // 5 圈网格
    let grid = "";
    for (let r = 1; r <= 5; r++) {
      const pts = [];
      const rr = (maxR * r) / 5;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * angleStep;
        pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
      }
      grid += `<polygon points="${pts.join(" ")}" fill="none" stroke="rgba(196,163,90,${0.08 + r * 0.04})" />`;
    }
    // 轴
    let axes = "";
    let labels = "";
    const dataPts = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * angleStep;
      const x = cx + maxR * Math.cos(a);
      const y = cy + maxR * Math.sin(a);
      axes += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(196,163,90,0.15)" />`;
      // 标签位置（略外推）
      const lx = cx + (maxR + 22) * Math.cos(a);
      const ly = cy + (maxR + 22) * Math.sin(a);
      labels += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="#a0a0b8" font-family="Noto Serif SC">${dims[i].key}</text>`;
      // 数据点
      const ratio = Math.max(0, Math.min(1, dims[i].score / 10));
      const rr = maxR * ratio;
      dataPts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);
    }
    const dataPoly = `<polygon points="${dataPts.join(" ")}" fill="rgba(0,212,255,0.16)" stroke="#00d4ff" stroke-width="1.5" />`;
    const dots = dataPts.map(p => {
      const [x, y] = p.split(",");
      return `<circle cx="${x}" cy="${y}" r="3" fill="#00d4ff" />`;
    }).join("");

    return `<svg viewBox="0 0 ${size + 80} ${size}" preserveAspectRatio="xMidYMid meet" class="mm-radar-svg">
      <g transform="translate(40,0)">
        ${grid}${axes}${labels}${dataPoly}${dots}
      </g>
    </svg>`;
  }

  /* ---------- narrative Markdown 轻量渲染 ---------- */
  function renderNarrative(md) {
    if (!md) return "";
    const lines = md.split(/\r?\n/);
    const out = [];
    let inList = false;
    for (const line of lines) {
      if (/^##\s+/.test(line)) {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push(`<h5>${escapeHTML(line.replace(/^##\s+/, ""))}</h5>`);
      } else if (/^-\s+/.test(line)) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push(`<li>${inlineMd(line.replace(/^-\s+/, ""))}</li>`);
      } else if (line.trim() === "") {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push("");
      } else {
        if (inList) { out.push("</ul>"); inList = false; }
        out.push(`<p>${inlineMd(line)}</p>`);
      }
    }
    if (inList) out.push("</ul>");
    return out.join("\n");
  }
  function inlineMd(s) {
    // 先转义再替换 **bold**
    let t = escapeHTML(s);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return t;
  }
  function escapeHTML(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
