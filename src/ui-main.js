
/* ===== DOM 节点缓存 ===== */
const form = document.querySelector("#fortune-form");
const fillDemoButton = document.querySelector("#fill-demo");
const emptyState = document.querySelector("#empty-state");
const resultContent = document.querySelector("#result-content");

const titleNode = document.querySelector("#summary-title");
const summaryCopyNode = document.querySelector("#summary-copy");
const dominantNode = document.querySelector("#dominant-pill");
const weakNode = document.querySelector("#weak-pill");
const pillarGrid = document.querySelector("#pillar-grid");
const elementBars = document.querySelector("#element-bars");
const personalityTitle = document.querySelector("#personality-title");
const personalityCopy = document.querySelector("#personality-copy");
const balanceTitle = document.querySelector("#balance-title");
const balanceCopy = document.querySelector("#balance-copy");
const focusTitle = document.querySelector("#focus-title");
const focusCopy = document.querySelector("#focus-copy");

/* 启动检查：确保核心 DOM 节点存在 */
if (!form) {
  console.error("严重错误：找不到 #fortune-form 表单元素！");
}
if (!resultContent) {
  console.error("严重错误：找不到 #result-content 结果容器！");
}

/* ===== 事件绑定 ===== */
if (fillDemoButton) {
  fillDemoButton.addEventListener("click", () => {
    document.querySelector("#name").value = "小满";
    document.querySelector("#gender").value = "female";
    document.querySelector("#birth-date").value = "1998-11-16";
    document.querySelector("#birth-time").value = "09:20";
    document.querySelector("#birthplace").value = "杭州";
    document.querySelector("#focus").value = "overall";
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  try {
    const name = document.querySelector("#name").value.trim() || "你";
    const gender = document.querySelector("#gender").value;
    const birthDate = document.querySelector("#birth-date").value;
    const birthTime = document.querySelector("#birth-time").value;
    const birthplace = document.querySelector("#birthplace").value.trim();
    const focus = document.querySelector("#focus").value;

    if (!birthDate || !birthTime) {
      window.alert("请先填写完整的出生日期和时刻。");
      return;
    }

    // 兼容不同浏览器日期格式：yyyy-MM-dd / yyyy/MM/dd / dd/MM/yyyy 等
    const dateParts = birthDate.replace(/\//g, "-").split("-").map(Number);
    let year, month, day;
    if (dateParts[0] > 31) {
      // yyyy-MM-dd 格式
      [year, month, day] = dateParts;
    } else if (dateParts[2] > 31) {
      // dd-MM-yyyy 格式
      [day, month, year] = dateParts;
    } else {
      // 默认按 yyyy-MM-dd
      [year, month, day] = dateParts;
    }

    const timeParts = birthTime.replace(/\//g, ":").split(":").map(Number);
    const hour = timeParts[0] || 0;
    const minute = timeParts[1] || 0;

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
      window.alert("日期或时间格式不正确，请重新输入。\n当前读取到：" + birthDate + " " + birthTime);
      return;
    }

    const birth = new Date(year, month - 1, day, hour, minute, 0);

    if (isNaN(birth.getTime())) {
      window.alert("无法解析日期，请检查输入。\n解析结果：" + year + "年" + month + "月" + day + "日 " + hour + ":" + minute);
      return;
    }

    const result = calculateFortune({ name, gender, birth, focus, birthplace });
    window.__lastResult = result; // 保存结果供占卜使用
    renderResult(result);
  } catch (err) {
    console.error("测算出错：", err);
    window.alert("测算出错：" + err.message + "\n请检查输入信息后重试。");
  }
});

/* ===== 首页占卜模块（独立运行） ===== */
(function initHomeDivination() {
  // 获取当前五行参数：优先用测算结果，否则随机
  function getDivinationParams() {
    const r = window.__lastResult;
    if (r && r.dayElement && r.dominant && r.weak) {
      return { dayElement: r.dayElement, dominant: r.dominant, weak: r.weak, birth: r.birth, hasResult: true };
    }
    // 没有测算结果时，用当天日期生成默认五行
    const today = new Date();
    const seed = today.getFullYear() * 100 + today.getMonth() + today.getDate();
    const dayEl = ELEMENTS[seed % 5];
    const domEl = ELEMENTS[(seed * 3 + 1) % 5];
    let weakEl = ELEMENTS[(seed * 7 + 2) % 5];
    if (weakEl === domEl) weakEl = ELEMENTS[(ELEMENTS.indexOf(domEl) + 2) % 5];
    return { dayElement: dayEl, dominant: domEl, weak: weakEl, birth: today, hasResult: false };
  }

  const drawFortuneBtn = document.querySelector("#draw-fortune-btn");
  const dailyFortuneResult = document.querySelector("#daily-fortune-result");
  const fortuneStickContainer = document.querySelector("#fortune-stick-container");

  if (drawFortuneBtn) {
    drawFortuneBtn.addEventListener("click", () => {
      const params = getDivinationParams();
      if (fortuneStickContainer) fortuneStickContainer.classList.add("shaking");
      drawFortuneBtn.disabled = true;
      drawFortuneBtn.textContent = "摇签中...";

      setTimeout(() => {
        if (fortuneStickContainer) fortuneStickContainer.classList.remove("shaking");
        const fortune = drawDailyFortune(params.dayElement, params.dominant, params.weak);

        const rankClass = fortune.rank.includes("上上") ? "rank-best" : fortune.rank.includes("上签") ? "rank-good" : fortune.rank.includes("中上") ? "rank-mid-good" : fortune.rank.includes("下") ? "rank-bad" : "rank-mid";

        const bazi_note = params.hasResult
          ? `<p><strong>五行解读：</strong>${fortune.elementReading}</p>`
          : `<p class="divination-no-bazi">完成深度测算后，将结合你的八字五行给出专属五行解读</p>`;

        dailyFortuneResult.innerHTML = `
          <div class="fortune-card">
            <div class="fortune-header">
              <span class="fortune-rank ${rankClass}">${fortune.rank}</span>
              <span class="fortune-date">${fortune.drawDate}</span>
            </div>
            <h4 class="fortune-title">第${safeMod(Date.now(), 99) + 1}签 · ${fortune.title}</h4>
            <div class="fortune-poem">${fortune.poem.replace(/\n/g, "<br>")}</div>
            <div class="fortune-divider"></div>
            <div class="fortune-advice">
              <p><strong>签文解读：</strong>${fortune.advice}</p>
              ${bazi_note}
            </div>
          </div>
        `;
        dailyFortuneResult.classList.remove("hidden");
        drawFortuneBtn.textContent = "再摇一签";
        drawFortuneBtn.disabled = false;
      }, 1500);
    });
  }

  const drawTarotBtn = document.querySelector("#draw-tarot-btn");
  const tarotResult = document.querySelector("#tarot-result");

  if (drawTarotBtn) {
    drawTarotBtn.addEventListener("click", () => {
      const params = getDivinationParams();
      drawTarotBtn.disabled = true;
      drawTarotBtn.textContent = "占卜中...";

      const deckDisplay = document.querySelector(".tarot-deck-display");
      if (deckDisplay) deckDisplay.classList.add("flipping");

      setTimeout(() => {
        if (deckDisplay) deckDisplay.classList.remove("flipping");
        const tarot = drawTarot(params.dayElement, params.dominant, params.weak, params.birth);

        let cardsHtml = tarot.drawn.map(d => `
          <div class="tarot-drawn-card ${d.isReversed ? "reversed" : ""} ${d.isElementMatch ? "element-match" : ""}">
            <div class="tarot-card-position">${d.position}</div>
            <div class="tarot-card-face">
              <span class="tarot-emoji">${d.card.emoji}</span>
              <h4>${d.card.name}${d.isReversed ? "（逆位）" : ""}</h4>
            </div>
            <p class="tarot-reading">${d.reading}</p>
            <p class="tarot-element-note">${params.hasResult ? d.elementNote : ""}</p>
          </div>
        `).join("");

        const baziTip = params.hasResult
          ? ""
          : `<p class="divination-no-bazi">完成深度测算后，将结合你的八字五行给出更精准的牌面解读</p>`;

        tarotResult.innerHTML = `
          <div class="tarot-spread">
            ${cardsHtml}
          </div>
          <div class="tarot-overall">
            <h4>综合解读</h4>
            <p>${tarot.overallReading}</p>
            ${baziTip}
            <span class="tarot-date">${tarot.drawDate}</span>
          </div>
        `;
        tarotResult.classList.remove("hidden");
        drawTarotBtn.textContent = "再次占卜";
        drawTarotBtn.disabled = false;
      }, 2000);
    });
  }
})();

/* ===== 核心计算 ===== */
function calculateFortune({ name, gender, birth, focus, birthplace }) {
  // 【新增】真太阳时修正
  // 先匹配一次出生地拿到标准城市名，再用该城市的经度修正时辰
  const preRegion = matchBirthplace(birthplace);
  const solarInfo = preRegion ? applyTrueSolarTime(birth, preRegion.city) : null;
  const originalBirth = birth;
  const effectiveBirth = solarInfo ? solarInfo.adjusted : birth;

  const yearPillar = getYearPillar(effectiveBirth);
  const monthPillar = getMonthPillar(effectiveBirth, yearPillar.stem);
  const dayPillar = getDayPillar(effectiveBirth);
  const hourPillar = getHourPillar(effectiveBirth, dayPillar.stem);
  // 将函数内后续流程的 birth 统一为修正后时间（保持原有代码少改动）
  birth = effectiveBirth;

  const pillars = [
    { label: "年柱", meaning: "根基与外在印象", ...yearPillar },
    { label: "月柱", meaning: "成长环境与行动方式", ...monthPillar },
    { label: "日柱", meaning: "核心性格与自我感", ...dayPillar },
    { label: "时柱", meaning: "晚近追求与潜在愿景", ...hourPillar },
  ];

  // 【升级】五行加权计数（替代旧的简单8份计数）
  const weightedCounts = getWeightedElementCounts(pillars);
  // 保留旧的简单计数用于向后兼容
  const counts = ELEMENTS.reduce((acc, el) => { acc[el] = 0; return acc; }, {});
  pillars.forEach((p) => { counts[p.stemElement] += 1; counts[p.branchElement] += 1; });

  const ranked = ELEMENTS.map((el) => ({ element: el, count: weightedCounts[el] }))
    .sort((a, b) => b.count - a.count);
  const dominant = ranked[0].element;
  const weak = ranked[ranked.length - 1].element;
  const balance = Math.round(ranked[0].count - ranked[ranked.length - 1].count);

  // 纳音
  const yearNayinIndex = getGanzhiIndex(yearPillar.stem, yearPillar.branch);
  const dayNayinIndex = getGanzhiIndex(dayPillar.stem, dayPillar.branch);
  const yearNayin = NAYIN_TABLE[yearNayinIndex];
  const dayNayin = NAYIN_TABLE[dayNayinIndex];

  // 【升级】身强身弱判断
  const dayElement = STEM_ELEMENTS[dayPillar.stem];
  const strengthResult = calculateDayMasterStrength(pillars, dayPillar.stem);

  // 【升级】用神取法
  const usefulGod = determineUsefulGod(strengthResult, dayPillar.stem);

  // 【升级】完整十神（含地支藏干）
  const completeTenGods = getCompleteTenGods(pillars, dayPillar.stem);

  // 旧十神保留向后兼容
  const tenGods = [
    { pillar: "年柱", stem: yearPillar.stem, god: getTenGod(dayPillar.stem, yearPillar.stem) },
    { pillar: "月柱", stem: monthPillar.stem, god: getTenGod(dayPillar.stem, monthPillar.stem) },
    { pillar: "时柱", stem: hourPillar.stem, god: getTenGod(dayPillar.stem, hourPillar.stem) },
  ];

  // 【升级】十神深度分析
  const tenGodAnalysis = generateTenGodAnalysis({
    completeTenGods, tenGods, pillars, dayStem: dayPillar.stem, gender, strengthResult, usefulGod,
  });

  // 【升级】格局判断
  const pattern = determinePattern(pillars, dayPillar.stem, strengthResult, completeTenGods);

  // 【升级】合冲刑害分析
  const interactions = analyzeInteractions(pillars);

  // 【升级】神煞系统（扩充到25个，加入性别参数用于孤辰寡宿判断）
  const shensha = analyzeShensha(pillars, dayPillar.stem, gender);

  // 【升级】空亡分析
  const kongwang = analyzeKongWang(pillars);

  // 【升级】婚姻分析
  const marriage = analyzeMarriage(pillars, dayPillar.stem, gender, strengthResult);

  // 【升级】健康诊断
  const health = analyzeHealth(weightedCounts, usefulGod);

  // 【新增】调候用神（穷通宝鉴）
  const tiaohuoAdvice = typeof getTiaohuoAdvice === "function" ? getTiaohuoAdvice(dayPillar.stem, monthPillar.branch) : null;

  // 【新增】十二长生宫
  const twelveStages = typeof analyzeTwelveStages === "function" ? analyzeTwelveStages(pillars, dayPillar.stem) : null;

  // 【新增】大运排盘
  const dayun = typeof calculateDaYun === "function" ? calculateDaYun(pillars, gender, birth) : null;

  // 五行生克分析
  const wuxingRelations = {
    generates: ELEMENT_GENERATE[dayElement],
    overcomes: ELEMENT_OVERCOME[dayElement],
    generatedBy: ELEMENT_GENERATED_BY[dayElement],
    overcomeBy: ELEMENT_OVERCOME_BY[dayElement],
  };

  // 流年分析
  const currentYear = new Date().getFullYear();
  const yearlyFocusYear = Math.min(Math.max(currentYear, YEARLY_RANGE_START), YEARLY_RANGE_END);
  const yearlyBadgeText = currentYear < YEARLY_RANGE_START ? "起始" : currentYear > YEARLY_RANGE_END ? "最近" : "当前";
  const yearlyFortunes = [];
  // 根据出生年推算当前年龄，用于定位所属大运步
  const locateDayunStep = (year) => {
    if (!dayun || !Array.isArray(dayun.steps)) return null;
    const age = year - birth.getFullYear();
    return dayun.steps.find(s => age >= s.ageStart && age <= s.ageEnd) || null;
  };
  for (let y = YEARLY_RANGE_START; y <= YEARLY_RANGE_END; y++) {
    const yPillar = getYearPillarByYear(y);
    const yElement = STEM_ELEMENTS[yPillar.stem];
    const influence = YEARLY_ELEMENT_INFLUENCE[dayElement]?.[yElement] || { score: 65, desc: "平稳过渡之年" };
    const wealthInfluence = YEARLY_WEALTH_INFLUENCE[dayElement]?.[yElement] || { score: 60, desc: "财运平稳" };
    const careerInfluence = YEARLY_CAREER_INFLUENCE[dayElement]?.[yElement] || { score: 65, desc: "事业平稳" };
    const yNayinIdx = getGanzhiIndex(yPillar.stem, yPillar.branch);

    // 【新增】大运×流年×命局 三重交互分析
    const dayunStep = locateDayunStep(y);
    const interaction = typeof analyzeLiuYunInteraction === "function"
      ? analyzeLiuYunInteraction(yPillar, dayunStep, pillars, dayPillar.stem)
      : null;
    // 在原分数基础上用 scoreAdjust 做微调
    let finalScore = influence.score + (interaction ? interaction.scoreAdjust : 0);
    finalScore = Math.min(95, Math.max(35, finalScore));

    yearlyFortunes.push({
      year: y, stem: yPillar.stem, branch: yPillar.branch, element: yElement, nayin: NAYIN_TABLE[yNayinIdx],
      score: finalScore, baseScore: influence.score, desc: influence.desc,
      wealthScore: wealthInfluence.score, wealthDesc: wealthInfluence.desc,
      careerScore: careerInfluence.score, careerDesc: careerInfluence.desc,
      god: getTenGod(dayPillar.stem, yPillar.stem), isCurrent: y === yearlyFocusYear,
      // 交互数据
      dayun: dayunStep ? `${dayunStep.stem}${dayunStep.branch}` : "—",
      dayunGod: dayunStep ? dayunStep.god : "",
      interaction: interaction,
    });
  }

  // 流月分析
  const monthlyFortunes = [];
  const monthNames = ["寅月·立春", "卯月·惊蛰", "辰月·清明", "巳月·立夏", "午月·芒种", "未月·小暑",
    "申月·立秋", "酉月·白露", "戌月·寒露", "亥月·立冬", "子月·大雪", "丑月·小寒"];
  const currentYearPillar = getYearPillarByYear(currentYear);
  for (let m = 0; m < 12; m++) {
    const mStem = getMonthStem(currentYearPillar.stem, m);
    const mBranch = BRANCHES[(2 + m) % 12];
    const god = getTenGod(dayPillar.stem, mStem);
    const info = MONTHLY_KEYWORDS[god] || { keyword: "平稳", advice: "顺其自然，保持平常心" };
    monthlyFortunes.push({ month: m + 1, name: monthNames[m], stem: mStem, branch: mBranch, element: STEM_ELEMENTS[mStem], god, keyword: info.keyword, advice: info.advice });
  }

  // 出生地分析
  const regionInfo = matchBirthplace(birthplace);
  let birthplaceAnalysis = null;
  if (regionInfo) birthplaceAnalysis = analyzeBirthplaceInfluence(regionInfo, dayElement, dominant, weak, counts);

  // 【升级】总览文案
  const birthTimeStr = `${birth.getFullYear()}年${birth.getMonth() + 1}月${birth.getDate()}日${birth.getHours()}时`;
  const zodiacMap = { 子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇", 午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪" };
  const zodiac = zodiacMap[yearPillar.branch] || "";

  let summaryCopy = `${name}，${birthTimeStr}生人，属${zodiac}，日主${dayPillar.stem}${dayPillar.branch}（${dayElement}），纳音"${dayNayin}"——${NAYIN_DESCRIPTIONS[dayNayin] || ""}。`;
  summaryCopy += `\n\n【身强身弱】日主${strengthResult.label}（${strengthResult.strengthScore}分），${strengthResult.monthStatus}。${strengthResult.desc}`;
  summaryCopy += `\n【用神】${usefulGod.strategy}——喜${usefulGod.likeElements.join("、")}，忌${usefulGod.dislikeElements.join("、")}。`;
  summaryCopy += `\n【格局】${pattern.mainPattern.name}——${pattern.mainPattern.desc}`;
  if (pattern.hasSpecial) summaryCopy += `，兼有${pattern.specialPatterns.map(s => s.name).join("、")}`;
  summaryCopy += `。`;
  if (shensha.length > 0) summaryCopy += `\n【神煞】命带${shensha.map(s => s.name).join("、")}。`;
  if (tiaohuoAdvice) summaryCopy += `\n【调候】${tiaohuoAdvice.desc.substring(0, 40)}...`;
  if (dayun) summaryCopy += `\n【大运】${dayun.desc}`;
  if (birthplaceAnalysis) summaryCopy += `\n出生于${regionInfo.city}（${regionInfo.element}），地域气场${birthplaceAnalysis.harmonyLabel}。`;
  if (solarInfo) summaryCopy += `\n【真太阳时】${solarInfo.note}。`;

  const summaryTitle = `${name}的命盘深度解析`;
  const focusSection = FOCUS_GUIDE[focus] || FOCUS_GUIDE.overall;
  const profile = DOMINANT_PROFILE[dominant];
  const weakAdvice = WEAK_ELEMENT_ADVICE[weak];

  // 【新增】综合命格总评（多段落深度评语）
  const overallConclusion = generateOverallConclusion({
    name, gender, zodiac, dayElement, dominant, weak, balance,
    strengthResult, usefulGod, pattern, shensha, interactions,
    marriage, birthplaceAnalysis, regionInfo, profile,
    weightedCounts, yearlyFortunes, currentYear: new Date().getFullYear(),
  });

  // 【新增】五行分布文字总结
  const elementSummary = generateElementSummary({
    weightedCounts, dominant, weak, dayElement, strengthResult, usefulGod,
  });
  const ziwei = calculateZiwei(birth);

  return {
    name, birth, gender, birthplace, birthplaceAnalysis, regionInfo,
    originalBirth, solarInfo,
    pillars, counts, weightedCounts, dominant, weak, balance, dayElement,
    dayStem: dayPillar.stem, dayBranch: dayPillar.branch, yearNayin, dayNayin,
    summaryTitle, summaryCopy, overallConclusion, elementSummary,
    // 新增数据
    strengthResult, usefulGod, completeTenGods, tenGodAnalysis, pattern, interactions,
    shensha, kongwang, marriage, health, tiaohuoAdvice, twelveStages, dayun,
    // 兼容旧数据
    personality: profile,
    balanceTitle: `${weak}元素补足方案`,
    balanceCopy: weakAdvice.brief + "\n" + weakAdvice.detail,
    focusTitle: focusSection.title,
    focusCopy: focusSection.template(dominant, weak, balance, counts),
    tenGods, wuxingRelations, yearlyFortunes, yearlyBadgeText, monthlyFortunes, currentYear, ziwei, zodiac,
  };
}

