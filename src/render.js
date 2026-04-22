/* ===== 渲染结果 ===== */
function renderResult(result) {
  try {
    if (emptyState) emptyState.classList.add("hidden");
    if (resultContent) resultContent.classList.remove("hidden");

    if (titleNode) titleNode.textContent = result.summaryTitle;
    if (summaryCopyNode) summaryCopyNode.textContent = result.summaryCopy;
    if (dominantNode) dominantNode.textContent = `主导：${result.dominant}`;
    if (weakNode) weakNode.textContent = `待补：${result.weak}`;

    // 【新增】综合命格总评
    const overallConclusionNode = document.querySelector("#overall-conclusion");
    if (overallConclusionNode && result.overallConclusion) {
      overallConclusionNode.innerHTML = result.overallConclusion.map(section => `
        <div class="conclusion-block">
          <h4 class="conclusion-heading">${section.heading}</h4>
          <p class="conclusion-text">${section.text}</p>
        </div>
      `).join("");
    }

    if (personalityTitle) personalityTitle.textContent = result.personality.title;
    if (personalityCopy) personalityCopy.textContent = result.personality.copy;
    if (balanceTitle) balanceTitle.textContent = result.balanceTitle;
    if (balanceCopy) balanceCopy.textContent = result.balanceCopy;
    if (focusTitle) focusTitle.textContent = result.focusTitle;
    if (focusCopy) focusCopy.textContent = result.focusCopy;

  // 四柱
  if (pillarGrid) {
    pillarGrid.innerHTML = result.pillars.map((p) => `
      <article class="pillar-card">
        <h4>${p.label} · ${p.meaning}</h4>
        <div class="pillar-symbol">
          <strong>${p.stem}${p.branch}</strong>
          <span>${p.stemElement} / ${p.branchElement}</span>
        </div>
        <div class="pillar-tags">
          <span class="pillar-tag">天干：${p.stem}（${p.stemElement}）</span>
          <span class="pillar-tag">地支：${p.branch}（${p.branchElement}）</span>
        </div>
      </article>
    `).join("");
  }

  // 五行分布（使用加权数据）
  if (elementBars) {
    const maxW = Math.max(...ELEMENTS.map(el => result.weightedCounts[el]));
    elementBars.innerHTML = ELEMENTS.map((el) => {
      const wScore = Math.round(result.weightedCounts[el]);
      const [fillStart, fillEnd] = ELEMENT_STYLES[el];
      const width = `${Math.max((wScore / (maxW || 1)) * 100, 8)}%`;
      const tag = el === result.dominant ? " ▲" : el === result.weak ? " ▽" : "";
      return `
        <div class="element-row">
          <span class="element-label">${el}${tag}</span>
          <div class="element-track">
            <div class="element-fill" style="--fill-width: ${width}; --fill-start: ${fillStart}; --fill-end: ${fillEnd};"></div>
          </div>
          <span class="element-count">${wScore}分</span>
        </div>`;
    }).join("");
  }

  // 【新增】五行分布文字总结
  const elementSummaryNode = document.querySelector("#element-summary");
  if (elementSummaryNode && result.elementSummary) {
    elementSummaryNode.innerHTML = `
      <div class="element-summary-content">
        ${result.elementSummary.map(item => `
          <div class="element-summary-item ${item.type}">
            <span class="es-icon">${item.icon}</span>
            <span class="es-text">${item.text}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  // 纳音显示
  const nayinSection = document.querySelector("#nayin-section");
  if (nayinSection) {
    nayinSection.innerHTML = `
      <div class="nayin-cards">
        <div class="nayin-card">
          <span class="nayin-label">年柱纳音</span>
          <span class="nayin-value">${result.yearNayin}</span>
          <p class="nayin-desc">${NAYIN_DESCRIPTIONS[result.yearNayin] || ""}</p>
        </div>
        <div class="nayin-card">
          <span class="nayin-label">日柱纳音</span>
          <span class="nayin-value">${result.dayNayin}</span>
          <p class="nayin-desc">${NAYIN_DESCRIPTIONS[result.dayNayin] || ""}</p>
        </div>
      </div>
    `;
  }

  // 【新增】身强身弱
  const strengthSection = document.querySelector("#strength-section");
  if (strengthSection && result.strengthResult) {
    const s = result.strengthResult;
    const pct = s.strengthScore;
    const barColor = pct >= 50 ? "var(--accent-primary, #6366f1)" : "var(--accent-secondary, #f59e0b)";
    strengthSection.innerHTML = `
      <div class="strength-card">
        <div class="strength-meter">
          <div class="strength-labels"><span>从弱</span><span>均衡</span><span>从强</span></div>
          <div class="strength-track"><div class="strength-fill" style="width:${pct}%;background:${barColor}"></div><div class="strength-pointer" style="left:${pct}%"><span class="strength-score">${pct}</span></div></div>
        </div>
        <div class="strength-info">
          <div class="strength-badge ${s.isStrong ? 'strong' : 'weak'}">${s.label}</div>
          <span class="strength-month">${s.monthStatus}</span>
        </div>
        <p class="strength-desc">${s.desc}</p>
        <div class="strength-detail"><span>帮扶力量 ${s.helpScore}分</span><span>耗泄力量 ${s.drainScore}分</span></div>
        <div class="module-conclusion"><p>${s.conclusion}</p></div>
      </div>`;
  }

  // 【新增】用神取法
  const usegodSection = document.querySelector("#usegod-section");
  if (usegodSection && result.usefulGod) {
    const u = result.usefulGod;
    // 三法合参推理链
    let reasoningHtml = "";
    if (Array.isArray(u.reasoning) && u.reasoning.length) {
      reasoningHtml = `
        <div class="usegod-reasoning">
          <div class="ug-reasoning-title">三法合参 · 取用推理</div>
          <ul class="ug-reasoning-list">
            ${u.reasoning.map(r => `
              <li class="ug-reasoning-item">
                <span class="ug-r-method">${r.method || ""}</span>
                <span class="ug-r-element">${r.element || ""}</span>
                <span class="ug-r-reason">${r.reason || ""}</span>
              </li>`).join("")}
          </ul>
          ${u.consensusElement ? `<div class="ug-consensus">三法合参共识：<strong>${u.consensusElement}</strong></div>` : ""}
          ${u.conflictNote ? `<div class="ug-conflict">⚠ ${u.conflictNote}</div>` : ""}
        </div>`;
    }
    const narrativeHtml = u.narrative ? `<p class="usegod-narrative">${u.narrative}</p>` : "";
    usegodSection.innerHTML = `
      <div class="usegod-card">
        <div class="usegod-header">
          <div class="usegod-main"><span class="usegod-label">用神</span><span class="usegod-value">${u.useGod}（${u.useGodElement}）</span></div>
          <div class="usegod-strategy">${u.strategy}</div>
        </div>
        <p class="usegod-desc">${u.useGodDesc}</p>
        <div class="usegod-elements">
          <div class="usegod-like"><strong>喜：</strong>${u.likeElements.map(e=>`<span class="el-tag like">${e}</span>`).join("")}</div>
          <div class="usegod-dislike"><strong>忌：</strong>${u.dislikeElements.map(e=>`<span class="el-tag dislike">${e}</span>`).join("")}</div>
        </div>
        ${reasoningHtml}
        ${narrativeHtml}
        <div class="module-conclusion"><p>${u.advice}</p></div>
      </div>`;
  }

  // 【新增】调候用神渲染（含显化度）
  const tiaohuoSection = document.querySelector("#tiaohuo-section");
  if (tiaohuoSection && result.tiaohuoAdvice) {
    const th = result.tiaohuoAdvice;
    // 显化度徽章：优先从 tiaohuoDeep 取
    const deep = result.tiaohuoDeep || th;
    let manifestHtml = "";
    if (deep && deep.manifestLevel) {
      const lvlClass = deep.manifestLevel === "透干" ? "manifest-high"
        : deep.manifestLevel === "藏支" ? "manifest-mid" : "manifest-low";
      const ratioPct = typeof deep.manifestRatio === "number" ? Math.round(deep.manifestRatio * 100) : null;
      manifestHtml = `
        <div class="tiaohuo-manifest">
          <span class="manifest-badge ${lvlClass}">显化度：${deep.manifestLevel}</span>
          ${ratioPct !== null ? `<span class="manifest-ratio">得用率 ${ratioPct}%</span>` : ""}
          ${deep.manifestDetail ? `<p class="manifest-detail">${deep.manifestDetail}</p>` : ""}
        </div>`;
    }
    tiaohuoSection.innerHTML = `
      <div class="usegod-card">
        <div class="usegod-header">
          <div class="usegod-main"><span class="usegod-label">调候喜用</span><span class="usegod-value">${th.useGods.join("、")}</span></div>
          <div class="usegod-strategy">${th.dayStem}日主·${th.monthBranch}月</div>
        </div>
        <p class="usegod-desc">${th.desc}</p>
        ${manifestHtml}
        <div class="module-conclusion"><p>调候用神基于《穷通宝鉴》，是根据出生季节对五行寒暖燥湿的调节。调候用神"透干"优于"藏支"，"藏支"优于"不见"——不见即为调候失令，需大运流年补足。</p></div>
      </div>`;
  }

  // 【新增】十二长生渲染
  const twelveStagesSection = document.querySelector("#twelve-stages-section");
  if (twelveStagesSection && result.twelveStages) {
    const ts = result.twelveStages;
    twelveStagesSection.innerHTML = `
      <div class="shensha-grid">
        ${ts.stages.map(s => `
          <div class="shensha-badge" style="border:1px solid var(--border)">
            <span class="shensha-icon">${s.icon}</span>
            <span class="shensha-name">${s.position}·${s.stage}</span>
            <span class="shensha-type">${s.branch}</span>
            <p class="shensha-desc">${s.brief}</p>
          </div>
        `).join("")}
      </div>
      <div class="module-conclusion"><p>${ts.summary}</p></div>`;
  }

  // 【新增】大运排盘渲染（含精确起运）
  const dayunSection = document.querySelector("#dayun-section");
  if (dayunSection && result.dayun) {
    const dy = result.dayun;
    let preciseHtml = "";
    if (dy.precise && dy.startAgePrecise) {
      const p = dy.startAgePrecise;
      preciseHtml = `<div class="dayun-precise">精确起运：<strong>${p.years}岁 ${p.months}个月 ${p.days}天</strong>${p.fromJieqi ? `（依据节气：${p.fromJieqi}）` : ""}</div>`;
    }
    dayunSection.innerHTML = `
      <div class="dayun-card">
        <div class="dayun-header">
          <div class="dayun-dir">${dy.direction}</div>
          <div class="dayun-start">${dy.startAge}岁起运</div>
        </div>
        <p class="dayun-desc-text">${dy.desc}</p>
        ${preciseHtml}
        <div class="dayun-timeline">
          ${dy.steps.map(s => `
            <div class="dayun-step ${s.isGood ? "good" : ""} ${s.isCaution ? "caution" : ""}">
              <div class="dayun-age">${s.ageStart}-${s.ageEnd}岁</div>
              <div class="dayun-gz">${s.stem}${s.branch}</div>
              <div class="dayun-gods">${s.god}·${s.stage}</div>
              <div class="dayun-score-bar"><div class="dayun-score-fill" style="width:${s.score}%"></div></div>
              <div class="dayun-score-num">${s.score}分</div>
              <div class="dayun-verdict">${s.desc}</div>
            </div>
          `).join("")}
        </div>
      </div>`;
  }

  // 【新增】辅助盘位：胎元/命宫/身宫/小运/童限
  const auxiliarySection = document.querySelector("#auxiliary-section");
  if (auxiliarySection && result.auxiliary) {
    const ax = result.auxiliary;
    const fmtGZ = (v) => {
      if (!v) return "—";
      if (typeof v === "string") return v;
      if (v.stem && v.branch) return `${v.stem}${v.branch}`;
      if (v.gan && v.zhi) return `${v.gan}${v.zhi}`;
      return "—";
    };
    const cellHtml = (label, value, desc) => `
      <div class="aux-cell">
        <div class="aux-label">${label}</div>
        <div class="aux-value">${fmtGZ(value)}</div>
        ${desc ? `<div class="aux-desc">${desc}</div>` : ""}
      </div>`;
    let xiaoyunHtml = "";
    if (Array.isArray(ax.xiaoyun) && ax.xiaoyun.length) {
      xiaoyunHtml = `
        <div class="xiaoyun-block">
          <div class="xiaoyun-title">小运（起运前 8 年，逐年排）</div>
          <div class="xiaoyun-grid">
            ${ax.xiaoyun.map(x => `
              <div class="xiaoyun-item">
                <span class="xy-age">${x.age}岁</span>
                <span class="xy-gz">${x.stem}${x.branch}</span>
                ${x.god ? `<span class="xy-god">${x.god}</span>` : ""}
              </div>`).join("")}
          </div>
        </div>`;
    }
    const tongxianHtml = ax.tongxian
      ? (() => {
          const ageEnd = ax.tongxian.ageEnd || (Array.isArray(ax.xiaoyun) && ax.xiaoyun.length ? ax.xiaoyun.length : 8);
          return `<div class="tongxian-block"><span class="tongxian-label">童限</span><span class="tongxian-value">${ageEnd}岁前</span><span class="tongxian-desc">${ax.tongxian.desc || ""}</span></div>`;
        })()
      : "";
    auxiliarySection.innerHTML = `
      <div class="aux-card">
        <div class="aux-grid">
          ${cellHtml("胎元", ax.taiyuan, "先天气象·月柱退两位干支")}
          ${cellHtml("命宫", ax.mingGong, "性情所宿·生时与月令定宫")}
          ${cellHtml("身宫", ax.shenGong, "后天心志·生时与命宫互配")}
        </div>
        ${xiaoyunHtml}
        ${tongxianHtml}
        <div class="module-conclusion"><p>辅助盘位为四柱之外的辅助视角：胎元看投胎气象与童幼根基；命宫为先天性情之所宿；身宫反映心志与行事；小运细察起运前的年运；童限补全大运起前之童年吉凶。</p></div>
      </div>`;
  }

  // 【新增】太阳时修正说明
  const solarSection = document.querySelector("#solar-section");
  const solarWrap = document.querySelector("#solar-section-wrap");
  if (solarSection && result.solarInfo) {
    const si = result.solarInfo;
    const meanMin = typeof si.meanOffsetMin === "number" ? si.meanOffsetMin.toFixed(1) : "—";
    const eotMin = typeof si.eotMin === "number" ? si.eotMin.toFixed(1) : "—";
    solarSection.innerHTML = `
      <div class="solar-card">
        <div class="solar-mode">
          <span class="solar-badge">${si.modeLabel || (si.mode === "true" ? "真太阳时" : "平太阳时")}</span>
          <span class="solar-note">${si.note || ""}</span>
        </div>
        <div class="solar-detail">
          <div class="solar-row"><span class="sd-k">经度修正：</span><span class="sd-v">${meanMin} 分钟</span></div>
          ${si.mode === "true" ? `<div class="solar-row"><span class="sd-k">均时差（EoT）：</span><span class="sd-v">${eotMin} 分钟</span></div>` : ""}
        </div>
        <div class="module-conclusion"><p>中国通用北京时间，但八字依太阳方位起时。经度每差 1°，时间相差 4 分钟；真太阳时还需加入地球公转椭圆轨道与黄赤交角造成的"均时差"，才更贴合地支时辰的本义。</p></div>
      </div>`;
    if (solarWrap) solarWrap.style.display = "";
  } else if (solarWrap) {
    solarWrap.style.display = "none";
  }

  // 【新增】合冲刑害
  const interactionSection = document.querySelector("#interaction-section");
  if (interactionSection && result.interactions) {
    const it = result.interactions;
    let items = "";
    if (it.stemCombines.length) items += it.stemCombines.map(c => `<div class="ix-item combine"><span class="ix-icon">🤝</span><span class="ix-pair">${c.pair}</span><span class="ix-name">${c.name}→化${c.result}</span></div>`).join("");
    if (it.stemClashes.length) items += it.stemClashes.map(c => `<div class="ix-item clash"><span class="ix-icon">⚡</span><span class="ix-pair">${c.pair}</span><span class="ix-name">${c.desc}</span></div>`).join("");
    if (it.branchCombines.length) items += it.branchCombines.map(c => `<div class="ix-item combine"><span class="ix-icon">💫</span><span class="ix-pair">${c.pair}</span><span class="ix-name">${c.name}</span></div>`).join("");
    if (it.branchThreeCombines.length) items += it.branchThreeCombines.map(c => `<div class="ix-item three-combine"><span class="ix-icon">🔮</span><span class="ix-name">${c.label}：${c.name}</span></div>`).join("");
    if (it.branchThreeMeets.length) items += it.branchThreeMeets.map(c => `<div class="ix-item three-meet"><span class="ix-icon">🌐</span><span class="ix-name">${c.name}</span></div>`).join("");
    if (it.branchClashes.length) items += it.branchClashes.map(c => `<div class="ix-item clash"><span class="ix-icon">💥</span><span class="ix-pair">${c.pair}</span><span class="ix-name">${c.name}</span></div>`).join("");
    if (it.branchPunishes.length) items += it.branchPunishes.map(p => `<div class="ix-item punish"><span class="ix-icon">⚠️</span><span class="ix-name">${p.name}</span><span class="ix-desc">${p.desc}</span></div>`).join("");
    if (it.branchHarms.length) items += it.branchHarms.map(h => `<div class="ix-item harm"><span class="ix-icon">🔻</span><span class="ix-pair">${h.pair}</span><span class="ix-name">${h.name}</span></div>`).join("");
    if (!items) items = `<div class="ix-item none"><span class="ix-icon">✅</span><span class="ix-name">四柱无明显合冲刑害</span></div>`;
    let summaryHtml = it.summary.length ? `<div class="ix-summary">${it.summary.join("。")}。</div>` : "";
    interactionSection.innerHTML = `<div class="ix-grid">${items}</div>${summaryHtml}`;
  }

  // 【新增】格局判断
  const patternSection = document.querySelector("#pattern-section");
  if (patternSection && result.pattern) {
    const pt = result.pattern;
    let specialsHtml = "";
    if (pt.hasSpecial) specialsHtml = `<div class="pattern-specials"><h4>特殊格局</h4>${pt.specialPatterns.map(s => `<div class="pattern-sp-item"><span class="pattern-sp-name">${s.name}</span><span class="pattern-sp-desc">${s.desc}</span></div>`).join("")}</div>`;
    // 从格/化气/专旺
    let transformHtml = "";
    if (pt.transformPattern) {
      const tp = pt.transformPattern;
      transformHtml = `
        <div class="pattern-transform">
          <div class="pt-badge pt-special">${tp.name}</div>
          <p class="pt-transform-desc">${tp.desc || ""}</p>
          ${tp.note ? `<p class="pt-transform-note">${tp.note}</p>` : ""}
        </div>`;
    }
    // 破格救应
    let breakHtml = "";
    if (pt.breakRescue && pt.breakRescue.hasBreak) {
      const br = pt.breakRescue;
      breakHtml = `
        <div class="pattern-break ${br.rescued ? "rescued" : "unrescued"}">
          <div class="pb-title">
            <span class="pb-badge ${br.rescued ? "ok" : "warn"}">${br.rescued ? "有破有救" : "破格未救"}</span>
          </div>
          <div class="pb-body">
            <div class="pb-row"><span class="pb-key">破：</span><span class="pb-val">${br.breakReason || ""}</span></div>
            ${br.rescued ? `<div class="pb-row"><span class="pb-key">救：</span><span class="pb-val">${br.rescueReason || ""}</span></div>` : ""}
          </div>
        </div>`;
    }
    // 扩展结论
    const extendedHtml = pt.extendedConclusion
      ? `<div class="module-conclusion pattern-ext-conclusion"><p>${pt.extendedConclusion}</p></div>`
      : "";
    patternSection.innerHTML = `
      <div class="pattern-card">
        <div class="pattern-main">
          <div class="pattern-name">${pt.mainPattern.name}</div>
          <div class="pattern-god">月令本气十神：${pt.monthMainGod}</div>
        </div>
        <p class="pattern-brief">${pt.mainPattern.brief}</p>
        <p class="pattern-desc">${pt.mainPattern.desc}</p>
        ${transformHtml}
        ${specialsHtml}
        ${breakHtml}
        <div class="module-conclusion"><p>${pt.patternConclusion}</p></div>
        ${extendedHtml}
      </div>`;
  }

  // 【新增】神煞系统（25神煞按类型分组展示）
  const shenshaSection = document.querySelector("#shensha-section");
  if (shenshaSection && result.shensha) {
    const ss = result.shensha;
    if (ss.length > 0) {
      // 按类型归类
      const GROUPS = [
        { key: "吉", label: "吉神贵人", icon: "✨", types: ["吉", "大吉"] },
        { key: "喜", label: "喜庆星", icon: "🎊", types: ["喜"] },
        { key: "桃花", label: "桃花情缘", icon: "🌸", types: ["桃花"] },
        { key: "动", label: "变动星", icon: "🐎", types: ["动"] },
        { key: "凶", label: "凶煞警示", icon: "⚠️", types: ["凶"] },
        { key: "孤", label: "孤独星", icon: "🌘", types: ["孤"] },
      ];
      let html = "";
      GROUPS.forEach(g => {
        const list = ss.filter(s => g.types.includes(s.type));
        if (list.length === 0) return;
        html += `
          <div class="shensha-group shensha-group-${g.key}">
            <div class="shensha-group-title">${g.icon} ${g.label}（${list.length}）</div>
            <div class="shensha-grid">
              ${list.map(s => `
                <div class="shensha-badge ${s.type}">
                  <span class="shensha-icon">${s.icon}</span>
                  <span class="shensha-name">${s.name}</span>
                  ${s.pos ? `<span class="shensha-pos">${s.pos}</span>` : ''}
                  <span class="shensha-type">${s.type}</span>
                  <p class="shensha-desc">${s.desc}</p>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      });
      shenshaSection.innerHTML = html || `<div class="shensha-grid">${ss.map(s => `
        <div class="shensha-badge ${s.type}">
          <span class="shensha-icon">${s.icon}</span>
          <span class="shensha-name">${s.name}</span>
          <span class="shensha-type">${s.type}</span>
          <p class="shensha-desc">${s.desc}</p>
        </div>`).join("")}</div>`;
    } else {
      shenshaSection.innerHTML = `<div class="shensha-empty">四柱未见明显神煞</div>`;
    }
  }

  // 【新增】空亡分析
  const kongwangSection = document.querySelector("#kongwang-section");
  if (kongwangSection && result.kongwang) {
    const kw = result.kongwang;
    let posHtml = "";
    if (kw.hasKongWang) {
      posHtml = kw.kongPositions.map(k => `<div class="kw-pos"><span class="kw-pillar">${k.pillar}</span><span class="kw-branch">${k.branch}</span><span class="kw-meaning">${k.meaning}</span></div>`).join("");
    }
    kongwangSection.innerHTML = `
      <div class="kongwang-card">
        <div class="kw-header"><span class="kw-label">空亡</span><span class="kw-value">${kw.kongWang.join("、")}</span></div>
        ${posHtml ? `<div class="kw-positions">${posHtml}</div>` : ""}
        <p class="kw-desc">${kw.desc}</p>
      </div>`;
  }

  // 【新增】婚姻分析
  const marriageSection = document.querySelector("#marriage-section");
  if (marriageSection && result.marriage) {
    const mg = result.marriage;
    const scoreColor = mg.score >= 75 ? "#22c55e" : mg.score >= 55 ? "#f59e0b" : "#ef4444";
    const risksHtml = (Array.isArray(mg.risks) && mg.risks.length)
      ? `<div class="marriage-risks">
           <div class="marriage-risks-title">⚠ 重点警示</div>
           ${mg.risks.map(r => `<div class="marriage-risk-item">${r}</div>`).join("")}
         </div>`
      : "";
    marriageSection.innerHTML = `
      <div class="marriage-card">
        <div class="marriage-header">
          <div class="marriage-score-circle" style="--score-color:${scoreColor}">
            <span class="marriage-score-num">${mg.score}</span>
            <span class="marriage-score-label">分</span>
          </div>
          <div class="marriage-rating">${mg.rating}</div>
        </div>
        <div class="marriage-factors">${mg.factors.map(f => `<div class="marriage-factor"><span class="mf-dot"></span>${f}</div>`).join("")}</div>
        ${risksHtml}
        <div class="module-conclusion"><p>${mg.conclusion}</p></div>
      </div>`;
  }

  // 【新增】健康诊断
  const healthSection = document.querySelector("#health-section");
  if (healthSection && result.health) {
    const hl = result.health;
    if (hl.warnings.length > 0) {
      healthSection.innerHTML = `<div class="health-warnings">${hl.warnings.map(w => `
        <div class="health-warn-item">
          <div class="hw-header"><span class="hw-element">${w.element}</span><span class="hw-organ">${w.organ}</span></div>
          <p class="hw-desc">${w.desc}</p>
          <p class="hw-illness">注意：${w.illness}</p>
          <p class="hw-nurture">${w.nurture}</p>
        </div>`).join("")}</div>
        <div class="module-conclusion"><p>${hl.summary}</p></div>`;
    } else {
      healthSection.innerHTML = `<div class="health-good"><span>✅</span> ${hl.summary}</div>`;
    }
  }

  // 十神分析（升级版）
  const tenGodSection = document.querySelector("#tengod-section");
  if (tenGodSection && result.tenGodAnalysis) {
    const tga = result.tenGodAnalysis;
    const elStyles = ELEMENT_STYLES;

    // ① 四柱十神明细表
    const pillarTableHTML = tga.pillarDetails.map(pd => {
      const stemGodInfo = pd.stemGod ? (TEN_GOD_MEANINGS[pd.stemGod] || {}) : {};
      return `
        <div class="tga-pillar-card${pd.isDayPillar ? " tga-day-pillar" : ""}">
          <div class="tga-pillar-head">
            <span class="tga-pillar-name">${pd.name}</span>
            <span class="tga-ganzhi" style="color:${elStyles[pd.stemElement]?.[0] || "var(--text-primary)"}">${pd.stem}</span><span class="tga-ganzhi" style="color:${elStyles[pd.branchElement]?.[0] || "var(--text-primary)"}">${pd.branch}</span>
          </div>
          ${pd.isDayPillar ? `<div class="tga-stem-god tga-day-master"><span class="tga-god-badge">日主</span><span class="tga-god-meaning">命主本人 · ${pd.stemElement}</span></div>` : `
          <div class="tga-stem-god">
            <span class="tga-god-badge ${stemGodInfo.icon ? "" : "no-icon"}">${stemGodInfo.icon || ""} ${pd.stemGod}</span>
            <span class="tga-god-brief">${stemGodInfo.brief || ""}</span>
          </div>
          ${pd.stemMeaning ? `<p class="tga-pillar-meaning"><span class="tga-tag">${pd.stemMeaning.tag}</span>${pd.stemMeaning.meaning}</p>` : ""}
          `}
          <div class="tga-hidden-gods">
            ${pd.hiddenGods.map(hg => {
              const hInfo = TEN_GOD_MEANINGS[hg.god] || {};
              return `
                <div class="tga-hidden-item">
                  <span class="tga-hidden-label">${hg.label}</span>
                  <span class="tga-hidden-stem" style="color:${elStyles[hg.element]?.[0] || "var(--text-primary)"}">${hg.stem}(${hg.element})</span>
                  <span class="tga-hidden-god">${hg.god}</span>
                  ${hg.meaning ? `<span class="tga-hidden-meaning">${hg.meaning.tag}</span>` : ""}
                </div>`;
            }).join("")}
          </div>
        </div>`;
    }).join("");

    // ② 十神能量分布（五类柱状图）
    const maxCatPct = Math.max(...tga.catDistribution.map(c => c.pct), 1);
    const catBarsHTML = tga.catDistribution.map(c => {
      const barW = Math.max((c.pct / maxCatPct) * 100, 4);
      const catColors = { 比劫: "#e8a87c", 食伤: "#7ec8e3", 财星: "#f0c75e", 官杀: "#c49bbb", 印星: "#82c99a" };
      const color = catColors[c.cat] || "var(--accent)";
      return `
        <div class="tga-cat-row">
          <div class="tga-cat-label">${c.info.icon} ${c.cat}</div>
          <div class="tga-cat-bar-wrap">
            <div class="tga-cat-bar" style="width:${barW}%;background:${color}"></div>
          </div>
          <div class="tga-cat-pct">${c.pct}%</div>
        </div>`;
    }).join("");

    // 能量分布文字分析
    const catAnalysisItems = [];
    const topCat = tga.catDistribution[0];
    const btmCat = tga.catDistribution[tga.catDistribution.length - 1];
    if (topCat.pct >= 35) {
      catAnalysisItems.push({ type: "info", icon: topCat.info.icon, text: `${topCat.cat}（${topCat.pct}%）占主导地位：${topCat.info.desc}` });
    }
    if (btmCat.pct <= 8) {
      catAnalysisItems.push({ type: "warn", icon: "⚠️", text: `${btmCat.cat}（${btmCat.pct}%）严重不足：${btmCat.info.desc.split("；")[1]?.replace("过旺则", "不足则") || "需要后天补足。"}` });
    }
    if (tga.absentGods.length > 0) {
      catAnalysisItems.push({ type: "warn", icon: "🔍", text: `命局缺少${tga.absentGods.join("、")}，相关领域的能量需通过大运流年来激活。` });
    }
    const catAnalysisHTML = catAnalysisItems.length > 0 ? `
      <div class="tga-cat-analysis">
        ${catAnalysisItems.map(item => `
          <div class="tga-cat-analysis-item ${item.type}">
            <span class="tga-cai-icon">${item.icon}</span>
            <span class="tga-cai-text">${item.text}</span>
          </div>`).join("")}
      </div>` : "";

    // ③ 十神组合解读
    let combosHTML = "";
    if (tga.detectedCombos.length > 0) {
      combosHTML = `
        <div class="tga-combos">
          <h4 class="tga-sub-title">⚡ 十神组合</h4>
          <div class="tga-combo-grid">
            ${tga.detectedCombos.map(c => `
              <div class="tga-combo-card ${c.quality === "吉" ? "combo-good" : "combo-bad"}">
                <div class="tga-combo-head">
                  <span class="tga-combo-name">${c.name}</span>
                  <span class="tga-combo-quality ${c.quality === "吉" ? "q-good" : "q-bad"}">${c.quality}</span>
                </div>
                <p class="tga-combo-desc">${c.desc}</p>
              </div>`).join("")}
          </div>
        </div>`;
    }

    // ④ 综合总评
    const conclusionHTML = `
      <div class="tga-conclusion">
        <h4 class="tga-sub-title">📝 十神总评</h4>
        <p class="tga-conclusion-text">${tga.conclusion}</p>
      </div>`;

    // 组装完整 HTML
    tenGodSection.innerHTML = `
      <div class="tga-wrapper">
        <h4 class="tga-sub-title">📋 四柱十神明细</h4>
        <p class="tga-sub-desc">天干为外在表现，地支藏干为内在潜能。日柱天干为日主本身。</p>
        <div class="tga-pillar-grid">${pillarTableHTML}</div>

        <h4 class="tga-sub-title">📊 十神能量分布</h4>
        <p class="tga-sub-desc">十神归为比劫、食伤、财星、官杀、印星五大类，反映命格核心特质。</p>
        <div class="tga-cat-bars">${catBarsHTML}</div>
        ${catAnalysisHTML}

        ${combosHTML}
        ${conclusionHTML}
      </div>`;
  }

  // 五行生克
  const wuxingSection = document.querySelector("#wuxing-relation-section");

  // 出生地风水渲染
  const birthplaceSectionWrap = document.querySelector("#birthplace-section-wrap");
  const birthplaceSection = document.querySelector("#birthplace-section");
  if (birthplaceSection && birthplaceSectionWrap && result.birthplaceAnalysis && result.regionInfo) {
    try {
      const bp = result.birthplaceAnalysis;
      const ri = result.regionInfo;
      birthplaceSectionWrap.classList.remove("hidden");
      const harmonyColor = bp.harmony >= 2 ? "#75e0a7" : bp.harmony >= 1 ? "#a8d8ff" : bp.harmony >= 0 ? "#f4c978" : "#ff9b6f";
      birthplaceSection.innerHTML = `
        <div class="birthplace-card">
          <div class="birthplace-header">
            <div class="birthplace-city">
              <div>
                <h4>${ri.city}</h4>
                <span class="birthplace-terrain">${ri.direction} · ${ri.terrain}</span>
              </div>
            </div>
            <div class="birthplace-element-badge" style="--bp-color: ${ELEMENT_STYLES[ri.element][0]}">
              ${ri.element}
            </div>
          </div>
          <p class="birthplace-desc">${ri.desc}</p>
          <div class="birthplace-feature">
            <span>${ri.feature}</span>
          </div>
          <div class="birthplace-grid">
            <div class="birthplace-stat">
              <span class="stat-label">地域五行</span>
              <span class="stat-value" style="color: ${ELEMENT_STYLES[ri.element][0]}">${ri.element}</span>
            </div>
            <div class="birthplace-stat">
              <span class="stat-label">与日主关系</span>
              <span class="stat-value">${bp.relation}</span>
            </div>
            <div class="birthplace-stat">
              <span class="stat-label">和谐度</span>
              <span class="stat-value" style="color: ${harmonyColor}">${bp.harmonyLabel}</span>
            </div>
            <div class="birthplace-stat">
              <span class="stat-label">星级评分</span>
              <span class="stat-value">${bp.harmonyStar}</span>
            </div>
          </div>
          ${bp.fillWeak ? `<div class="birthplace-bonus">出生地${ri.element}气恰好补足了你偏弱的${result.weak}元素，天时地利。</div>` : ""}
          <div class="birthplace-analysis">
            <h5>命格影响分析</h5>
            <p>${bp.summary}</p>
          </div>
          <div class="birthplace-analysis">
            <h5>发展方向建议</h5>
            <p>${bp.devAdvice}</p>
          </div>
        </div>
      `;
    } catch (bpErr) {
      console.error("出生地渲染出错：", bpErr);
      if (birthplaceSectionWrap) birthplaceSectionWrap.classList.add("hidden");
    }
  } else if (birthplaceSectionWrap) {
    birthplaceSectionWrap.classList.add("hidden");
  }

  // 紫微斗数渲染
  const ziweiSection = document.querySelector("#ziwei-section");
  if (ziweiSection && result.ziwei) {
    const zw = result.ziwei;
    ziweiSection.innerHTML = `
      <div class="ziwei-summary">
        <p>${zw.summary}</p>
      </div>
      ${zw.sihua && zw.sihua.length > 0 ? `
      <div class="ix-grid" style="margin-bottom:16px">
        ${zw.sihua.map(h => `<div class="ix-item ${h.hua === '忌' ? 'clash' : 'combine'}"><span class="ix-icon">${h.icon}</span><span class="ix-name">化${h.hua}：${h.star}</span><span class="ix-desc">→ ${h.palace}</span></div>`).join("")}
      </div>` : ""}
      <div class="ziwei-grid">
        ${zw.palaces.map((p) => {
          const mainInfo = ZIWEI_STAR_MEANINGS[p.mainStar] || {};
          const scoreClass = p.score >= 80 ? "score-high" : p.score >= 65 ? "score-mid" : "score-low";
          return `
            <div class="ziwei-card">
              <div class="ziwei-card-header">
                <span class="ziwei-palace-name">${p.name}</span>
                <span class="ziwei-branch">${p.branch}</span>
              </div>
              <div class="ziwei-stars">
                ${p.stars.map(s => {
                  const sInfo = ZIWEI_STAR_MEANINGS[s] || {};
                  const isMain = ZIWEI_STARS["主星"].includes(s);
                  const isSha = ZIWEI_STARS["煞星"].includes(s);
                  return `<span class="ziwei-star ${isMain ? 'star-main' : ''} ${isSha ? 'star-sha' : ''}">${s}</span>`;
                }).join("")}
              </div>
              <div class="ziwei-score-row">
                <div class="ziwei-score-bar">
                  <div class="ziwei-score-fill ${scoreClass}" style="width: ${p.score}%"></div>
                </div>
                <span class="ziwei-score-num">${p.score}</span>
              </div>
              <p class="ziwei-meaning">${p.meaning}</p>
              ${mainInfo.desc ? `<p class="ziwei-star-desc">${p.mainStar}：${mainInfo.desc}</p>` : ''}
            </div>
          `;
        }).join("")}
      </div>
    `;
  }
  if (wuxingSection) {
    const r = result.wuxingRelations;
    wuxingSection.innerHTML = `
      <div class="wuxing-relation-grid">
        <div class="wuxing-rel-card rel-self">
          <div class="rel-info">
            <h4>日主五行</h4>
            <p>${result.dayElement}（${result.dayStem}${result.dayBranch}）</p>
          </div>
        </div>
        <div class="wuxing-rel-card rel-generate">
          <div class="rel-info">
            <h4>我生 → ${r.generates}</h4>
            <p>${result.dayElement}生${r.generates}：付出、表达、子女运</p>
          </div>
        </div>
        <div class="wuxing-rel-card rel-overcome">
          <div class="rel-info">
            <h4>我克 → ${r.overcomes}</h4>
            <p>${result.dayElement}克${r.overcomes}：掌控、财运、管理力</p>
          </div>
        </div>
        <div class="wuxing-rel-card rel-generated-by">
          <div class="rel-info">
            <h4>${r.generatedBy} → 生我</h4>
            <p>${r.generatedBy}生${result.dayElement}：庇护、学业、贵人</p>
          </div>
        </div>
        <div class="wuxing-rel-card rel-overcome-by">
          <div class="rel-info">
            <h4>${r.overcomeBy} → 克我</h4>
            <p>${r.overcomeBy}克${result.dayElement}：压力、考验、成长</p>
          </div>
        </div>
      </div>
    `;
  }


  // 流年运势
  const yearlySection = document.querySelector("#yearly-section");
  if (yearlySection) {
    yearlySection.innerHTML = `
      <div class="yearly-timeline">
        ${result.yearlyFortunes.map((yf) => {
          const godInfo = TEN_GOD_MEANINGS[yf.god] || { icon: "" };
          const scoreClass = yf.score >= 80 ? "score-high" : yf.score >= 65 ? "score-mid" : "score-low";
          const wealthClass = yf.wealthScore >= 80 ? "score-high" : yf.wealthScore >= 65 ? "score-mid" : "score-low";
          const careerClass = yf.careerScore >= 80 ? "score-high" : yf.careerScore >= 65 ? "score-mid" : "score-low";
          return `
            <div class="yearly-card ${yf.isCurrent ? 'yearly-current' : ''}">
              <div class="yearly-header">
                <span class="yearly-year">${yf.year}年</span>
                <span class="yearly-gz">${yf.stem}${yf.branch}年</span>
                ${yf.dayun && yf.dayun !== "—" ? `<span class="yearly-dayun-tag" title="所在大运">运·${yf.dayun}${yf.dayunGod ? `(${yf.dayunGod})` : ''}</span>` : ''}
                ${yf.isCurrent ? `<span class="yearly-now-badge">${result.yearlyBadgeText}</span>` : ''}
              </div>
              <div class="yearly-body">
                <div class="yearly-scores-group">
                  <div class="yearly-score-row">
                    <span class="yearly-score-label">综合</span>
                    <div class="yearly-score-bar">
                      <div class="yearly-score-fill ${scoreClass}" style="width: ${yf.score}%"></div>
                    </div>
                    <span class="yearly-score-num">${yf.score}</span>
                  </div>
                  <div class="yearly-score-row">
                    <span class="yearly-score-label">财运</span>
                    <div class="yearly-score-bar">
                      <div class="yearly-score-fill ${wealthClass}" style="width: ${yf.wealthScore}%"></div>
                    </div>
                    <span class="yearly-score-num">${yf.wealthScore}</span>
                  </div>
                  <div class="yearly-score-row">
                    <span class="yearly-score-label">事业</span>
                    <div class="yearly-score-bar">
                      <div class="yearly-score-fill ${careerClass}" style="width: ${yf.careerScore}%"></div>
                    </div>
                    <span class="yearly-score-num">${yf.careerScore}</span>
                  </div>
                </div>
                <div class="yearly-meta">
                  <span class="yearly-element-badge" style="--el-color: ${ELEMENT_STYLES[yf.element][0]}">${yf.element}年</span>
                  <span class="yearly-nayin">${yf.nayin}</span>
                  <span class="yearly-god">${yf.god}</span>
                </div>
                <p class="yearly-desc">${yf.desc}</p>
                <div class="yearly-sub-descs">
                  <p class="yearly-sub-desc"><span class="sub-desc-tag wealth-tag">财</span>${yf.wealthDesc}</p>
                  <p class="yearly-sub-desc"><span class="sub-desc-tag career-tag">业</span>${yf.careerDesc}</p>
                </div>
                ${yf.interaction && yf.interaction.events && yf.interaction.events.length > 0 ? `
                  <div class="yearly-interaction">
                    <div class="yearly-ix-title">🔗 大运×流年×命局 交互</div>
                    <ul class="yearly-ix-list">
                      ${yf.interaction.events.map(e => `<li>${e}</li>`).join("")}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // 流月运势
  const monthlySection = document.querySelector("#monthly-section");
  if (monthlySection) {
    monthlySection.innerHTML = `
      <div class="monthly-grid">
        ${result.monthlyFortunes.map((mf) => {
          const godInfo = TEN_GOD_MEANINGS[mf.god] || { icon: "" };
          return `
            <div class="monthly-card">
              <div class="monthly-header">
                <span class="monthly-num">${mf.month}月</span>
                <span class="monthly-name">${mf.name}</span>
              </div>
              <div class="monthly-body">
                <div class="monthly-gz">${mf.stem}${mf.branch}</div>
                <span class="monthly-keyword" style="--el-color: ${ELEMENT_STYLES[mf.element][0]}">${mf.keyword}</span>
                <span class="monthly-god">${mf.god}</span>
                <p class="monthly-advice">${mf.advice}</p>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // 开运指导
  const luckySection = document.querySelector("#lucky-section");
  if (luckySection) {
    const lucky = result.personality.lucky;
    const profile = result.personality;
    let extraCards = "";
    if (result.birthplaceAnalysis && result.regionInfo) {
      extraCards = `
        <div class="lucky-card wide">
          <h4>出生地发展</h4>
          <p>${result.regionInfo.city}属${result.regionInfo.element}，${result.birthplaceAnalysis.devAdvice}</p>
        </div>
      `;
    }
    luckySection.innerHTML = `
      <div class="lucky-grid">
        <div class="lucky-card">
          <h4>开运颜色</h4>
          <p>${lucky.color}</p>
        </div>
        <div class="lucky-card">
          <h4>幸运数字</h4>
          <p>${lucky.number}</p>
        </div>
        <div class="lucky-card">
          <h4>有利方位</h4>
          <p>${lucky.direction}</p>
        </div>
        <div class="lucky-card">
          <h4>旺运季节</h4>
          <p>${lucky.season}</p>
        </div>
        <div class="lucky-card wide">
          <h4>事业方向</h4>
          <p>${profile.career}</p>
        </div>
        <div class="lucky-card wide">
          <h4>健康提醒</h4>
          <p>${profile.health}</p>
        </div>
        ${extraCards}
      </div>
    `;
  }

  // 滚动到结果
  if (resultContent) resultContent.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (renderErr) {
    console.error("渲染结果出错：", renderErr);
    // 即使部分渲染失败，仍然显示结果区域
    if (emptyState) emptyState.classList.add("hidden");
    if (resultContent) resultContent.classList.remove("hidden");
  }
}

