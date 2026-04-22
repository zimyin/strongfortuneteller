/* ========================================================================
 * 八字核心算法引擎 v2.0
 * 基于《八字教程整理》《子平真诠》《滴天髓》《王德峰讲稿》
 * ======================================================================== */

/* ===== 地支藏干系统 ===== */
const BRANCH_HIDDEN_STEMS = {
  子: [{ stem: "癸", weight: 100 }],
  丑: [{ stem: "己", weight: 60 }, { stem: "癸", weight: 30 }, { stem: "辛", weight: 10 }],
  寅: [{ stem: "甲", weight: 60 }, { stem: "丙", weight: 30 }, { stem: "戊", weight: 10 }],
  卯: [{ stem: "乙", weight: 100 }],
  辰: [{ stem: "戊", weight: 60 }, { stem: "乙", weight: 30 }, { stem: "癸", weight: 10 }],
  巳: [{ stem: "丙", weight: 60 }, { stem: "庚", weight: 30 }, { stem: "戊", weight: 10 }],
  午: [{ stem: "丁", weight: 70 }, { stem: "己", weight: 30 }],
  未: [{ stem: "己", weight: 60 }, { stem: "丁", weight: 30 }, { stem: "乙", weight: 10 }],
  申: [{ stem: "庚", weight: 60 }, { stem: "壬", weight: 30 }, { stem: "戊", weight: 10 }],
  酉: [{ stem: "辛", weight: 100 }],
  戌: [{ stem: "戊", weight: 60 }, { stem: "辛", weight: 30 }, { stem: "丁", weight: 10 }],
  亥: [{ stem: "壬", weight: 70 }, { stem: "甲", weight: 30 }],
};

/* ===== 四柱权重体系 ===== */
const PILLAR_WEIGHTS = {
  yearStem: 8, monthStem: 12, dayStem: 0, hourStem: 12,
  yearBranch: 4, monthBranch: 40, dayBranch: 12, hourBranch: 12,
};

/* ===== 身强身弱判断 ===== */
function calculateDayMasterStrength(pillars, dayStem) {
  const dayEl = STEM_ELEMENTS[dayStem];
  let helpScore = 0, drainScore = 0;
  const positions = [
    { stem: pillars[0].stem, branch: pillars[0].branch, stemW: 8, branchW: 4 },
    { stem: pillars[1].stem, branch: pillars[1].branch, stemW: 12, branchW: 40 },
    { stem: null, branch: pillars[2].branch, stemW: 0, branchW: 12 },
    { stem: pillars[3].stem, branch: pillars[3].branch, stemW: 12, branchW: 12 },
  ];
  positions.forEach(({ stem, branch, stemW, branchW }) => {
    if (stem) {
      const el = STEM_ELEMENTS[stem];
      if (el === dayEl || ELEMENT_GENERATED_BY[dayEl] === el) helpScore += stemW;
      else drainScore += stemW;
    }
    if (branch && BRANCH_HIDDEN_STEMS[branch]) {
      BRANCH_HIDDEN_STEMS[branch].forEach(({ stem: h, weight: w }) => {
        const ratio = w / 100;
        const el = STEM_ELEMENTS[h];
        if (el === dayEl || ELEMENT_GENERATED_BY[dayEl] === el) helpScore += branchW * ratio;
        else drainScore += branchW * ratio;
      });
    }
  });
  const total = helpScore + drainScore;
  const score = total > 0 ? Math.round((helpScore / total) * 100) : 50;
  let level, label, desc, conclusion;
  if (score >= 85) { level = 7; label = "从强"; desc = "日主极旺，宜顺其势，取比劫印星为用"; conclusion = "命主精力充沛、意志坚定，有领袖气质。但过刚则折，须防刚愎自用、不听人言。事业上宜自主创业或担任管理角色，不宜受制于人。财运方面先苦后甜，中年后渐入佳境。"; }
  else if (score >= 70) { level = 6; label = "强"; desc = "日主偏旺，宜用官杀、食伤、财星制衡"; conclusion = "命主性格果断、执行力强，有魄力和主见。适合在竞争性行业发展，能担当重任。但需注意脾气急躁、与人争执的倾向。财运较好，但花销也大，宜节制消费、做好理财。"; }
  else if (score >= 58) { level = 5; label = "偏强"; desc = "日主稍旺，宜适当泄耗，食伤生财为佳"; conclusion = "命主能力出众、自信心强，做事有章法。事业上适合技术、管理或创意类工作。发挥特长可将才华转化为财富。婚姻中需要适度退让，避免过于主导。"; }
  else if (score >= 42) { level = 4; label = "均衡"; desc = "日主中和，五行流通为上，忌冲破平衡"; conclusion = "命主性情平和、适应力强，属于难得的均衡命格。一生少大起大落，福运绵长。事业和生活都较顺遂，关键是保持现状、不要轻易冒险打破平衡。逢大运流年冲破时需特别谨慎。"; }
  else if (score >= 30) { level = 3; label = "偏弱"; desc = "日主稍弱，宜印星帮扶、比劫助力"; conclusion = "命主性格温和、善于合作，但独立决策能力需加强。事业上适合团队协作或依托平台发展，不宜单打独斗。贵人运重要——得贵人相助可事半功倍。财运平稳但不宜投机。"; }
  else if (score >= 15) { level = 2; label = "弱"; desc = "日主偏弱，急需印比帮扶，忌官杀克伐"; conclusion = "命主心思细腻、多愁善感，内心世界丰富。早年可能坎坷较多，需靠自身努力和贵人帮扶渡过难关。事业上宜选择稳定行业，避免高风险投资。中晚年运势渐好，宜养生保身。"; }
  else { level = 1; label = "从弱"; desc = "日主极弱，宜弃命从势，顺克泄之气"; conclusion = "命主性格柔顺、随遇而安，宜顺势而为、不宜强求。事业上适合辅助性角色或自由职业，跟随强者可获益。一生波折较多但逢凶化吉，关键在于放下执念、顺应天时。"; }
  // 月令支持
  const hiddens = BRANCH_HIDDEN_STEMS[pillars[1].branch];
  const mainEl = STEM_ELEMENTS[hiddens[0].stem];
  let monthStatus;
  if (mainEl === dayEl) monthStatus = "得令·旺";
  else if (ELEMENT_GENERATED_BY[dayEl] === mainEl) monthStatus = "得令·相";
  else if (ELEMENT_GENERATE[dayEl] === mainEl) monthStatus = "失令·休";
  else if (ELEMENT_OVERCOME[dayEl] === mainEl) monthStatus = "失令·囚";
  else if (ELEMENT_OVERCOME_BY[dayEl] === mainEl) monthStatus = "失令·死";
  else monthStatus = "平";
  return { helpScore: Math.round(helpScore), drainScore: Math.round(drainScore), strengthScore: score, level, label, desc, conclusion, isStrong: score >= 50, monthStatus };
}

/* ===== 用神取法 ===== */
function determineUsefulGod(strengthResult, dayStem) {
  const dayEl = STEM_ELEMENTS[dayStem];
  const { isStrong, level, label } = strengthResult;
  let useGod, useGodElement, avoidGod, avoidGodElement, useGodDesc, strategy, advice;
  const likeElements = [], dislikeElements = [];

  if (level >= 6) {
    useGod = "食伤"; useGodElement = ELEMENT_GENERATE[dayEl]; avoidGod = "印星"; avoidGodElement = ELEMENT_GENERATED_BY[dayEl]; strategy = "泄秀生财";
    useGodDesc = `日主${label}，${dayEl}气过旺，宜用${useGodElement}（食伤）泄秀，${ELEMENT_OVERCOME[dayEl]}（财星）耗气。忌${avoidGodElement}（印星）和${dayEl}（比劫）再助旺。`;
    advice = `【开运建议】发挥才华是关键，宜从事创意、教育、技术输出类工作。多与${useGodElement}属性的人合作（如从事${useGodElement}相关行业者）。颜色宜选${useGodElement}系，居住和办公方位宜${useGodElement}方。流年遇食伤大运为黄金期，可大胆施展。`;
    likeElements.push(ELEMENT_GENERATE[dayEl], ELEMENT_OVERCOME[dayEl], ELEMENT_OVERCOME_BY[dayEl]);
    dislikeElements.push(dayEl, ELEMENT_GENERATED_BY[dayEl]);
  } else if (level === 5) {
    useGod = "财星"; useGodElement = ELEMENT_OVERCOME[dayEl]; avoidGod = "比劫"; avoidGodElement = dayEl; strategy = "耗气制衡";
    useGodDesc = `日主偏强，宜用${useGodElement}（财星）耗气，${ELEMENT_GENERATE[dayEl]}（食伤）泄秀为辅。忌${avoidGodElement}（比劫）和${ELEMENT_GENERATED_BY[dayEl]}（印星）。`;
    advice = `【开运建议】财运是突破口，宜主动求财而非坐等。适合从事${useGodElement}相关行业或面向${useGodElement}方向发展。多结交财星旺的朋友，合作共赢。避免与同行过度竞争，宜差异化发展。`;
    likeElements.push(ELEMENT_GENERATE[dayEl], ELEMENT_OVERCOME[dayEl], ELEMENT_OVERCOME_BY[dayEl]);
    dislikeElements.push(dayEl, ELEMENT_GENERATED_BY[dayEl]);
  } else if (level === 4) {
    useGod = "通关"; useGodElement = ELEMENT_GENERATE[dayEl]; avoidGod = "冲破"; avoidGodElement = ELEMENT_OVERCOME_BY[dayEl]; strategy = "维持均衡";
    useGodDesc = `日主中和难得，五行流通是关键。忌${avoidGodElement}（七杀）冲破平衡，宜顺势而为。`;
    advice = `【开运建议】保持现状是最好的策略。不宜大起大落的投资或剧烈的生活变动。遇到冲太岁的年份需格外小心，提前做好防范。日常宜修身养性，维持五行平衡的生活方式。`;
    likeElements.push(ELEMENT_GENERATE[dayEl], ELEMENT_GENERATED_BY[dayEl]);
    dislikeElements.push(ELEMENT_OVERCOME_BY[dayEl]);
  } else if (level === 3) {
    useGod = "印星"; useGodElement = ELEMENT_GENERATED_BY[dayEl]; avoidGod = "官杀"; avoidGodElement = ELEMENT_OVERCOME_BY[dayEl]; strategy = "生扶日主";
    useGodDesc = `日主偏弱，宜用${useGodElement}（印星）生扶，${dayEl}（比劫）助力为辅。忌${avoidGodElement}（官杀）克伐和过多${ELEMENT_OVERCOME[dayEl]}（财星）耗气。`;
    advice = `【开运建议】多学习、多读书、多考证——印星代表学识和贵人。选择${useGodElement}方位居住或办公有利。宜进入大平台或跟随有实力的领导发展，借力使力。避免独自承担过大压力。`;
    likeElements.push(ELEMENT_GENERATED_BY[dayEl], dayEl);
    dislikeElements.push(ELEMENT_OVERCOME_BY[dayEl], ELEMENT_OVERCOME[dayEl], ELEMENT_GENERATE[dayEl]);
  } else if (level === 1) {
    useGod = "从势"; useGodElement = ELEMENT_OVERCOME_BY[dayEl]; avoidGod = "印比"; avoidGodElement = ELEMENT_GENERATED_BY[dayEl]; strategy = "弃命从势";
    useGodDesc = `日主从弱，宜弃命随势，顺从${useGodElement}（官杀）之气。忌${avoidGodElement}（印星）和${dayEl}（比劫）来扶。`;
    advice = `【开运建议】顺势而为是唯一出路。不要逆势而动，宜跟随大势、大平台。遇到帮扶日主的大运流年反而不顺（因为破了从格），遇到泄耗的运势反而如鱼得水。人生格局特殊，成就往往非常规路径。`;
    likeElements.push(ELEMENT_OVERCOME_BY[dayEl], ELEMENT_OVERCOME[dayEl], ELEMENT_GENERATE[dayEl]);
    dislikeElements.push(dayEl, ELEMENT_GENERATED_BY[dayEl]);
  } else {
    useGod = "印星"; useGodElement = ELEMENT_GENERATED_BY[dayEl]; avoidGod = "财星"; avoidGodElement = ELEMENT_OVERCOME[dayEl]; strategy = "扶弱抑强";
    useGodDesc = `日主弱，急需${useGodElement}（印星）生扶、${dayEl}（比劫）助力。忌${avoidGodElement}（财星）损印、${ELEMENT_OVERCOME_BY[dayEl]}（官杀）克伐。`;
    advice = `【开运建议】当务之急是增强自身实力——学习深造、考取资格证书、寻找靠山。${useGodElement}方位和颜色是贵人方。切忌贪财冒险，守住已有资源比追逐新机会更重要。中晚年运势逐渐走强。`;
    likeElements.push(ELEMENT_GENERATED_BY[dayEl], dayEl);
    dislikeElements.push(ELEMENT_OVERCOME_BY[dayEl], ELEMENT_OVERCOME[dayEl], ELEMENT_GENERATE[dayEl]);
  }
  return { useGod, useGodElement, avoidGod, avoidGodElement, useGodDesc, strategy, advice, likeElements: [...new Set(likeElements)], dislikeElements: [...new Set(dislikeElements)] };
}

/* ===== 天干合冲 ===== */
const STEM_COMBINE = {
  甲己: { result: "土", name: "中正之合" }, 己甲: { result: "土", name: "中正之合" },
  乙庚: { result: "金", name: "仁义之合" }, 庚乙: { result: "金", name: "仁义之合" },
  丙辛: { result: "水", name: "威制之合" }, 辛丙: { result: "水", name: "威制之合" },
  丁壬: { result: "木", name: "淫慝之合" }, 壬丁: { result: "木", name: "淫慝之合" },
  戊癸: { result: "火", name: "无情之合" }, 癸戊: { result: "火", name: "无情之合" },
};
const STEM_CLASH = {
  甲庚: "金克木", 庚甲: "金克木", 乙辛: "金克木", 辛乙: "金克木",
  丙壬: "水克火", 壬丙: "水克火", 丁癸: "水克火", 癸丁: "水克火",
};

/* ===== 地支六合 ===== */
const BRANCH_SIX_COMBINE = {
  子丑: { result: "土", name: "子丑合土" }, 丑子: { result: "土", name: "子丑合土" },
  寅亥: { result: "木", name: "寅亥合木" }, 亥寅: { result: "木", name: "寅亥合木" },
  卯戌: { result: "火", name: "卯戌合火" }, 戌卯: { result: "火", name: "卯戌合火" },
  辰酉: { result: "金", name: "辰酉合金" }, 酉辰: { result: "金", name: "辰酉合金" },
  巳申: { result: "水", name: "巳申合水" }, 申巳: { result: "水", name: "巳申合水" },
  午未: { result: "火", name: "午未合火" }, 未午: { result: "火", name: "午未合火" },
};

/* ===== 地支三合局 ===== */
const BRANCH_THREE_COMBINE = [
  { branches: ["申", "子", "辰"], result: "水", name: "申子辰合水局" },
  { branches: ["寅", "午", "戌"], result: "火", name: "寅午戌合火局" },
  { branches: ["亥", "卯", "未"], result: "木", name: "亥卯未合木局" },
  { branches: ["巳", "酉", "丑"], result: "金", name: "巳酉丑合金局" },
];

/* ===== 地支三会方 ===== */
const BRANCH_THREE_MEET = [
  { branches: ["寅", "卯", "辰"], result: "木", name: "寅卯辰会东方木" },
  { branches: ["巳", "午", "未"], result: "火", name: "巳午未会南方火" },
  { branches: ["申", "酉", "戌"], result: "金", name: "申酉戌会西方金" },
  { branches: ["亥", "子", "丑"], result: "水", name: "亥子丑会北方水" },
];

/* ===== 地支六冲 ===== */
const BRANCH_SIX_CLASH = {
  子午: "子午冲", 午子: "子午冲", 丑未: "丑未冲", 未丑: "丑未冲",
  寅申: "寅申冲", 申寅: "寅申冲", 卯酉: "卯酉冲", 酉卯: "卯酉冲",
  辰戌: "辰戌冲", 戌辰: "辰戌冲", 巳亥: "巳亥冲", 亥巳: "巳亥冲",
};

/* ===== 地支六害 ===== */
const BRANCH_SIX_HARM = {
  子未: "子未害", 未子: "子未害", 丑午: "丑午害", 午丑: "丑午害",
  寅巳: "寅巳害", 巳寅: "寅巳害", 卯辰: "卯辰害", 辰卯: "卯辰害",
  申亥: "申亥害", 亥申: "申亥害", 酉戌: "酉戌害", 戌酉: "酉戌害",
};

/* ===== 地支三刑 ===== */
const BRANCH_THREE_PUNISH = [
  { branches: ["寅", "巳", "申"], name: "寅巳申无恩之刑", desc: "恃势凌人，易招是非" },
  { branches: ["丑", "戌", "未"], name: "丑戌未持势之刑", desc: "目无长上，傲慢自大" },
  { branches: ["子", "卯"], name: "子卯无礼之刑", desc: "缺少礼数，言行无忌" },
  { branches: ["辰", "辰"], name: "辰辰自刑", desc: "自寻烦恼" },
  { branches: ["午", "午"], name: "午午自刑", desc: "急躁冲动" },
  { branches: ["酉", "酉"], name: "酉酉自刑", desc: "孤芳自赏" },
  { branches: ["亥", "亥"], name: "亥亥自刑", desc: "思虑过多" },
];

/* ===== 分析四柱合冲刑害 ===== */
function analyzeInteractions(pillars) {
  const stems = pillars.map(p => p.stem);
  const branches = pillars.map(p => p.branch);
  const names = ["年柱", "月柱", "日柱", "时柱"];
  const r = { stemCombines: [], stemClashes: [], branchCombines: [], branchThreeCombines: [], branchThreeMeets: [], branchClashes: [], branchPunishes: [], branchHarms: [], summary: [] };

  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const sk = stems[i] + stems[j];
      if (STEM_COMBINE[sk]) r.stemCombines.push({ pair: `${names[i]}${stems[i]}—${names[j]}${stems[j]}`, ...STEM_COMBINE[sk] });
      if (STEM_CLASH[sk]) r.stemClashes.push({ pair: `${names[i]}${stems[i]}—${names[j]}${stems[j]}`, desc: STEM_CLASH[sk] });
      const bk = branches[i] + branches[j];
      if (BRANCH_SIX_COMBINE[bk]) r.branchCombines.push({ pair: `${names[i]}${branches[i]}—${names[j]}${branches[j]}`, ...BRANCH_SIX_COMBINE[bk] });
      if (BRANCH_SIX_CLASH[bk]) r.branchClashes.push({ pair: `${names[i]}${branches[i]}—${names[j]}${branches[j]}`, name: BRANCH_SIX_CLASH[bk] });
      if (BRANCH_SIX_HARM[bk]) r.branchHarms.push({ pair: `${names[i]}${branches[i]}—${names[j]}${branches[j]}`, name: BRANCH_SIX_HARM[bk] });
    }
  }
  BRANCH_THREE_COMBINE.forEach(c => { const f = c.branches.filter(b => branches.includes(b)); if (f.length >= 2) r.branchThreeCombines.push({ name: c.name, found: f.join(""), label: f.length === 3 ? "三合局成" : "半三合", result: c.result }); });
  BRANCH_THREE_MEET.forEach(c => { const f = c.branches.filter(b => branches.includes(b)); if (f.length >= 3) r.branchThreeMeets.push({ name: c.name, result: c.result }); });
  BRANCH_THREE_PUNISH.forEach(p => {
    if (p.branches.length === 2) {
      const [a, b] = p.branches;
      if (a === b) { if (branches.filter(br => br === a).length >= 2) r.branchPunishes.push({ name: p.name, desc: p.desc }); }
      else { if (branches.includes(a) && branches.includes(b)) r.branchPunishes.push({ name: p.name, desc: p.desc }); }
    } else { if (p.branches.filter(b => branches.includes(b)).length >= 2) r.branchPunishes.push({ name: p.name, desc: p.desc }); }
  });
  if (r.stemCombines.length) r.summary.push(`天干有${r.stemCombines.map(c => c.name).join("、")}，合化之气影响命格走向`);
  if (r.branchCombines.length) r.summary.push(`地支有${r.branchCombines.map(c => c.name).join("、")}，六合助力，利人际关系和贵人运`);
  if (r.branchThreeCombines.length) r.summary.push(`${r.branchThreeCombines.map(c => `${c.label}→${c.name}`).join("、")}，格局层次提升`);
  if (r.branchClashes.length) r.summary.push(`⚠ ${r.branchClashes.map(c => c.name).join("、")}，主变动冲突，逢冲之年需防意外`);
  if (r.branchPunishes.length) r.summary.push(`⚠ ${r.branchPunishes.map(p => p.name).join("、")}，注意人际纠纷和法律风险`);
  if (r.branchHarms.length) r.summary.push(`${r.branchHarms.map(h => h.name).join("、")}，暗害需防，小心被算计`);
  // 综合结论
  const hasGood = r.stemCombines.length + r.branchCombines.length + r.branchThreeCombines.length + r.branchThreeMeets.length;
  const hasBad = r.stemClashes.length + r.branchClashes.length + r.branchPunishes.length + r.branchHarms.length;
  if (hasGood > hasBad) r.summary.push("总体而言命局合多冲少，人际和睦、贵人运旺");
  else if (hasBad > hasGood) r.summary.push("总体而言命局冲害偏多，一生变动较大，需在稳定中求发展");
  else if (hasGood === 0 && hasBad === 0) r.summary.push("四柱无明显合冲，命局平稳安定");
  return r;
}

/* ===== 完整十神（含地支藏干） ===== */
function getCompleteTenGods(pillars, dayStem) {
  const names = ["年柱", "月柱", "日柱", "时柱"];
  const all = [];
  pillars.forEach((p, i) => {
    if (i !== 2) {
      const god = getTenGod(dayStem, p.stem);
      all.push({ position: names[i] + "天干", stem: p.stem, element: STEM_ELEMENTS[p.stem], god, info: TEN_GOD_MEANINGS[god], isHidden: false });
    }
    if (BRANCH_HIDDEN_STEMS[p.branch]) {
      BRANCH_HIDDEN_STEMS[p.branch].forEach((h, hIdx) => {
        const god = getTenGod(dayStem, h.stem);
        const label = hIdx === 0 ? "本气" : hIdx === 1 ? "中气" : "余气";
        all.push({ position: `${names[i]}${p.branch}藏${label}`, stem: h.stem, element: STEM_ELEMENTS[h.stem], god, info: TEN_GOD_MEANINGS[god], isHidden: true, hiddenLabel: label });
      });
    }
  });
  const counts = {}, details = {};
  all.forEach(g => { counts[g.god] = (counts[g.god] || 0) + 1; if (!details[g.god]) details[g.god] = []; details[g.god].push(g.position); });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const absent = Object.keys(TEN_GOD_MEANINGS).filter(g => !counts[g]);
  return { all, counts, details, sortedGods: sorted, dominantGod: sorted[0]?.[0] || "", absentGods: absent };
}

/* ===== 格局判断 ===== */
function determinePattern(pillars, dayStem, strengthResult, tenGodResult) {
  const hiddens = BRANCH_HIDDEN_STEMS[pillars[1].branch];
  const monthMainGod = getTenGod(dayStem, hiddens[0].stem);
  const pats = { 正官: "正官格", 七杀: "七杀格", 正财: "正财格", 偏财: "偏财格", 正印: "正印格", 偏印: "偏印格", 食神: "食神格", 伤官: "伤官格" };
  const patDescs = {
    正官格: { brief: "月令透官，主功名富贵", detail: "正官格为八格之首，主人品行端正、有责任感、重信用。适合体制内发展、公务员、管理层。一生注重名誉，行事光明磊落。若官星有印星保护，富贵可期；若财来生官，更是锦上添花。" },
    七杀格: { brief: "月令透杀，主权威显赫", detail: "七杀格命主个性刚烈、有魄力、敢于冒险。适合军警、法律、竞技、创业等需要魄力的领域。若食神制杀或印星化杀，则化凶为吉、大权在握。但杀无制则一生多灾多险。" },
    正财格: { brief: "月令透财，主勤劳致富", detail: "正财格命主务实勤恳、理财有方、重视家庭。适合金融、会计、贸易、实业经营。一生财运稳定，靠正道获利，不宜投机取巧。注：男命财为妻星，正财格利婚姻；女命财为夫星之财源，主能掌家理财，婚姻须另看官杀与日支配置。" },
    偏财格: { brief: "月令透偏财，主慷慨大方", detail: "偏财格命主慷慨豪爽、人缘极佳、善于交际。适合销售、公关、投资、娱乐行业。财运来去较大，有意外之财但也容易散财。社交广泛，朋友众多，但须防小人借贷不还。" },
    正印格: { brief: "月令透印，主学业有成", detail: "正印格命主聪慧好学、品德端正、有长辈缘。适合教育、学术、文化、出版等行业。一生得贵人相助，学历和资质是立身之本。母亲对命主影响极大，家庭教育良好。" },
    偏印格: { brief: "月令透偏印，主悟性过人", detail: "偏印格命主思维独特、直觉敏锐、有艺术天赋。适合研究、玄学、中医、IT技术、自由职业。性格较为孤僻内敛，不善交际但内心丰富。需注意偏印夺食带来的创业风险。" },
    食神格: { brief: "月令透食，主才华横溢", detail: "食神格命主才华出众、心态乐观、享受生活。适合餐饮、文艺、娱乐、设计等创意行业。食神生财格局极佳，以才华换取财富。一生较有口福，但须防过度安逸、缺乏进取心。" },
    伤官格: { brief: "月令透伤，主技艺出众", detail: "伤官格命主才气纵横、不拘一格、追求完美。适合律师、医生、技术专家、艺术家等专业领域。伤官配印为上格，才华与修养兼备。但伤官见官则是非多，须避免与权威对抗。" },
  };
  const pName = pats[monthMainGod] || "杂气格";
  const patInfo = patDescs[pName] || { brief: "月令杂气，综合取用", detail: "杂气格需要综合分析命局中最旺的十神来确定格局走向。灵活性强，适应面广，关键看大运引发哪种力量。" };
  const mainPattern = { name: pName, brief: patInfo.brief, desc: patInfo.detail };
  const specials = [];
  const gc = tenGodResult.counts;
  if ((gc["七杀"] || 0) >= 1 && (gc["正印"] || 0) >= 1) specials.push({ name: "杀印相生", desc: "化杀为权，智勇双全。有将帅之才，适合掌权管人、军警法务。" });
  if ((gc["食神"] || 0) >= 1 && (gc["七杀"] || 0) >= 1) specials.push({ name: "食神制杀", desc: "以柔克刚，才华化压力。善于用智慧化解困境，事业成就较高。" });
  if ((gc["伤官"] || 0) >= 1 && (gc["正印"] || 0) >= 1) specials.push({ name: "伤官配印", desc: "才华与修养并重。既有创造力又有深度，适合学术研究或高端专业。" });
  if (((gc["食神"] || 0) + (gc["伤官"] || 0)) >= 2 && ((gc["正财"] || 0) + (gc["偏财"] || 0)) >= 1) specials.push({ name: "食伤生财", desc: "才华直接变现，财运亨通。靠本事赚钱，越努力越幸运。" });
  if ((gc["正官"] || 0) >= 1 && (gc["正印"] || 0) >= 1) specials.push({ name: "官印相生", desc: "功名显赫，仕途顺利。有领导力和学识，适合体制内升迁。" });
  if (((gc["比肩"] || 0) + (gc["劫财"] || 0)) >= 3) specials.push({ name: "比劫成群", desc: "竞争激烈，人际复杂。破财之兆，须防合伙纠纷和朋友借钱。" });
  // 综合格局结论
  let patternConclusion = `此命为${pName}`;
  if (specials.length > 0) patternConclusion += `，兼有${specials.map(s=>s.name).join("、")}等特殊格局`;
  patternConclusion += `。${mainPattern.brief}。`;
  return { mainPattern, monthMainGod, specialPatterns: specials, hasSpecial: specials.length > 0, patternConclusion };
}

/* ===== 五行加权计数 ===== */
function getWeightedElementCounts(pillars) {
  const c = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  const pos = [
    { stem: pillars[0].stem, branch: pillars[0].branch, sW: 8, bW: 4 },
    { stem: pillars[1].stem, branch: pillars[1].branch, sW: 12, bW: 40 },
    { stem: pillars[2].stem, branch: pillars[2].branch, sW: 0, bW: 12 },
    { stem: pillars[3].stem, branch: pillars[3].branch, sW: 12, bW: 12 },
  ];
  pos.forEach(({ stem, branch, sW, bW }) => {
    if (stem && sW > 0) c[STEM_ELEMENTS[stem]] += sW;
    if (branch && BRANCH_HIDDEN_STEMS[branch]) BRANCH_HIDDEN_STEMS[branch].forEach(({ stem: h, weight: w }) => { c[STEM_ELEMENTS[h]] += bW * (w / 100); });
  });
  return c;
}

/* ===== 神煞系统 ===== */
const TIANYI_TABLE = { 甲: ["丑", "未"], 戊: ["丑", "未"], 乙: ["子", "申"], 己: ["子", "申"], 丙: ["亥", "酉"], 丁: ["亥", "酉"], 庚: ["丑", "未"], 辛: ["寅", "午"], 壬: ["卯", "巳"], 癸: ["卯", "巳"] };
const WENCHANG_TABLE = { 甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申", 己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯" };
const YIMA_TABLE = { "申子辰": "寅", "寅午戌": "申", "亥卯未": "巳", "巳酉丑": "亥" };
const TAOHUA_TABLE = { "申子辰": "酉", "寅午戌": "卯", "亥卯未": "子", "巳酉丑": "午" };
const HUAGAI_TABLE = { "申子辰": "辰", "寅午戌": "戌", "亥卯未": "未", "巳酉丑": "丑" };
const TIANDE_TABLE = { 寅: "丁", 卯: "申", 辰: "壬", 巳: "辛", 午: "亥", 未: "甲", 申: "癸", 酉: "寅", 戌: "丙", 亥: "乙", 子: "巳", 丑: "庚" };
const YUEDE_TABLE = { 寅: "丙", 卯: "甲", 辰: "壬", 巳: "庚", 午: "丙", 未: "甲", 申: "壬", 酉: "庚", 戌: "丙", 亥: "甲", 子: "壬", 丑: "庚" };

/* ===== 扩展神煞表（补到25个） ===== */
// 禄神：日干临官之位
const LUSHEN_TABLE = { 甲: "寅", 乙: "卯", 丙: "巳", 戊: "巳", 丁: "午", 己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子" };
// 羊刃：日干帝旺之位（阳干取刃，阴干取禄前一位）
const YANGREN_TABLE = { 甲: "卯", 乙: "辰", 丙: "午", 戊: "午", 丁: "未", 己: "未", 庚: "酉", 辛: "戌", 壬: "子", 癸: "丑" };
// 将星：三合局中位（年/日支 → 将星支）
const JIANGXING_TABLE = { "申子辰": "子", "寅午戌": "午", "亥卯未": "卯", "巳酉丑": "酉" };
// 亡神：三合局临官前位
const WANGSHEN_TABLE = { "申子辰": "亥", "寅午戌": "巳", "亥卯未": "寅", "巳酉丑": "申" };
// 劫煞：三合局绝位
const JIESHA_TABLE = { "申子辰": "巳", "寅午戌": "亥", "亥卯未": "申", "巳酉丑": "寅" };
// 灾煞：冲将星
const ZAISHA_TABLE = { "申子辰": "午", "寅午戌": "子", "亥卯未": "酉", "巳酉丑": "卯" };
// 红鸾：年支起卯逆行（子年卯/丑年寅/寅年丑/卯年子/辰年亥...）
const HONGLUAN_TABLE = { 子: "卯", 丑: "寅", 寅: "丑", 卯: "子", 辰: "亥", 巳: "戌", 午: "酉", 未: "申", 申: "未", 酉: "午", 戌: "巳", 亥: "辰" };
// 天喜：红鸾对冲
const TIANXI_TABLE = { 子: "酉", 丑: "申", 寅: "未", 卯: "午", 辰: "巳", 巳: "辰", 午: "卯", 未: "寅", 申: "丑", 酉: "子", 戌: "亥", 亥: "戌" };
// 孤辰（男）：亥子丑见寅、寅卯辰见巳、巳午未见申、申酉戌见亥
const GUCHEN_TABLE = { 亥: "寅", 子: "寅", 丑: "寅", 寅: "巳", 卯: "巳", 辰: "巳", 巳: "申", 午: "申", 未: "申", 申: "亥", 酉: "亥", 戌: "亥" };
// 寡宿（女）：亥子丑见戌、寅卯辰见丑、巳午未见辰、申酉戌见未
const GUASU_TABLE = { 亥: "戌", 子: "戌", 丑: "戌", 寅: "丑", 卯: "丑", 辰: "丑", 巳: "辰", 午: "辰", 未: "辰", 申: "未", 酉: "未", 戌: "未" };
// 金舆：日干富贵载体
const JINYU_TABLE = { 甲: "辰", 乙: "巳", 丙: "未", 丁: "申", 戊: "未", 己: "申", 庚: "戌", 辛: "亥", 壬: "丑", 癸: "寅" };
// 国印贵人
const GUOYIN_TABLE = { 甲: "戌", 乙: "亥", 丙: "丑", 丁: "寅", 戊: "丑", 己: "寅", 庚: "辰", 辛: "巳", 壬: "未", 癸: "申" };
// 学堂（日干长生对应支）
const XUETANG_TABLE = { 甲: "亥", 乙: "午", 丙: "寅", 丁: "酉", 戊: "寅", 己: "酉", 庚: "巳", 辛: "子", 壬: "申", 癸: "卯" };
// 词馆（日干→文思/口才位）
const CIGUAN_TABLE = { 甲: "巳", 乙: "巳", 丙: "申", 丁: "申", 戊: "申", 己: "申", 庚: "亥", 辛: "亥", 壬: "寅", 癸: "寅" };
// 天医：月支前一位（帮助疗愈）
const TIANYI_YI_TABLE = { 子: "亥", 丑: "子", 寅: "丑", 卯: "寅", 辰: "卯", 巳: "辰", 午: "巳", 未: "午", 申: "未", 酉: "申", 戌: "酉", 亥: "戌" };
// 血刃：年支→血光冲支
const XUEREN_TABLE = { 子: "丑", 丑: "未", 寅: "戌", 卯: "辰", 辰: "巳", 巳: "申", 午: "酉", 未: "子", 申: "卯", 酉: "戌", 戌: "寅", 亥: "未" };
// 三奇贵人：四柱天干组合
const SANQI_GROUPS = [
  { name: "天上三奇", stems: ["甲", "戊", "庚"], desc: "甲戊庚齐，主贵气冲天，多出将相之才" },
  { name: "地下三奇", stems: ["乙", "丙", "丁"], desc: "乙丙丁齐，主才华横溢，文星高照" },
  { name: "人中三奇", stems: ["壬", "癸", "辛"], desc: "壬癸辛齐，主智慧灵敏，谋略过人" },
];

/* ===== 扩展神煞 25 项（2026-04-22 升级至 50） ===== */
// 太极贵人（年干起）
const TAIJI_TABLE = { 甲: ["子","午"], 乙: ["子","午"], 丙: ["卯","酉"], 丁: ["卯","酉"], 戊: ["辰","戌","丑","未"], 己: ["辰","戌","丑","未"], 庚: ["寅","亥"], 辛: ["寅","亥"], 壬: ["巳","申"], 癸: ["巳","申"] };
// 德秀贵人（月支起，含干支组合；简化为干支列表）
const DEXIU_TABLE = { 寅: {stems:["丙","丁"]}, 卯: {stems:["丙","丁"]}, 辰: {stems:["丙","丁"]}, 巳: {stems:["戊","癸"]}, 午: {stems:["戊","癸"]}, 未: {stems:["戊","癸"]}, 申: {stems:["甲","己"]}, 酉: {stems:["甲","己"]}, 戌: {stems:["甲","己"]}, 亥: {stems:["壬","癸"]}, 子: {stems:["壬","癸"]}, 丑: {stems:["壬","癸"]} };
// 福星贵人（日干起）
const FUXING_TABLE = { 甲: "寅", 乙: "丑", 丙: "子", 丁: "酉", 戊: "申", 己: "未", 庚: "午", 辛: "巳", 壬: "辰", 癸: "卯" };
// 玉堂贵人（日干起，主文贵）
const YUTANG_TABLE = { 甲: "丑", 乙: "子", 丙: "亥", 丁: "酉", 戊: "未", 己: "申", 庚: "未", 辛: "午", 壬: "卯", 癸: "寅" };
// 天厨贵人（日干起，主食禄）
const TIANCHU_TABLE = { 甲: "巳", 乙: "午", 丙: "子", 丁: "巳", 戊: "午", 己: "申", 庚: "寅", 辛: "午", 壬: "酉", 癸: "亥" };
// 天官贵人（日干起，主升迁）
const TIANGUAN_TABLE = { 甲: "未", 乙: "辰", 丙: "巳", 丁: "寅", 戊: "卯", 己: "酉", 庚: "亥", 辛: "申", 壬: "戌", 癸: "午" };
// 天赦日（仅四个特定日柱）
const TIANSHE_DAYS = ["戊寅", "甲午", "戊申", "甲子"];
// 六秀日
const LIUXIU_DAYS = ["丙午", "丁未", "戊子", "戊午", "己丑", "己未"];
// 魁罡日
const KUIGANG_DAYS = ["庚辰", "庚戌", "壬辰", "戊戌"];
// 十恶大败日
const SHIE_DAYS = ["甲辰","乙巳","壬申","丙申","丁亥","庚辰","戊戌","癸亥","辛巳","己丑"];
// 四废日（按季）
const SIFEI_DAYS_BY_SEASON = {
  春: ["庚申","辛酉"], // 寅卯辰月
  夏: ["壬子","癸亥"], // 巳午未月
  秋: ["甲寅","乙卯"], // 申酉戌月
  冬: ["丙午","丁巳"], // 亥子丑月
};
const MONTH_TO_SEASON = { 寅:"春",卯:"春",辰:"春", 巳:"夏",午:"夏",未:"夏", 申:"秋",酉:"秋",戌:"秋", 亥:"冬",子:"冬",丑:"冬" };
// 阴阳差错日
const YYCC_DAYS = ["丙子","丁丑","戊寅","辛卯","壬辰","癸巳","丙午","丁未","戊申","辛酉","壬戌","癸亥"];
// 飞刃（羊刃对冲位）
const FEIREN_TABLE = { 甲:"酉", 乙:"戌", 丙:"子", 戊:"子", 丁:"丑", 己:"丑", 庚:"卯", 辛:"辰", 壬:"午", 癸:"未" };
// 勾绞煞（按年支）
const GOUJIAO_TABLE = {
  子: {gou:"卯", jiao:"酉"}, 丑: {gou:"辰", jiao:"戌"}, 寅: {gou:"巳", jiao:"亥"},
  卯: {gou:"午", jiao:"子"}, 辰: {gou:"未", jiao:"丑"}, 巳: {gou:"申", jiao:"寅"},
  午: {gou:"酉", jiao:"卯"}, 未: {gou:"戌", jiao:"辰"}, 申: {gou:"亥", jiao:"巳"},
  酉: {gou:"子", jiao:"午"}, 戌: {gou:"丑", jiao:"未"}, 亥: {gou:"寅", jiao:"申"},
};
// 咸池（桃花另名，已有桃花，此处作为日干起咸池区分）
const XIANCHI_TABLE = { 甲:"子", 乙:"巳", 丙:"卯", 丁:"申", 戊:"卯", 己:"申", 庚:"午", 辛:"亥", 壬:"酉", 癸:"寅" };
// 丧门（年支前两位）
const SANGMEN_TABLE = { 子:"寅", 丑:"卯", 寅:"辰", 卯:"巳", 辰:"午", 巳:"未", 午:"申", 未:"酉", 申:"戌", 酉:"亥", 戌:"子", 亥:"丑" };
// 吊客（年支后两位）
const DIAOKE_TABLE = { 子:"戌", 丑:"亥", 寅:"子", 卯:"丑", 辰:"寅", 巳:"卯", 午:"辰", 未:"巳", 申:"午", 酉:"未", 戌:"申", 亥:"酉" };
// 白虎（年支前四位）
const BAIHU_TABLE = { 子:"辰", 丑:"巳", 寅:"午", 卯:"未", 辰:"申", 巳:"酉", 午:"戌", 未:"亥", 申:"子", 酉:"丑", 戌:"寅", 亥:"卯" };
// 天狗（年支前五位）
const TIANGOU_TABLE = { 子:"巳", 丑:"午", 寅:"未", 卯:"申", 辰:"酉", 巳:"戌", 午:"亥", 未:"子", 申:"丑", 酉:"寅", 戌:"卯", 亥:"辰" };
// 披麻（年支前三位）
const PIMA_TABLE = { 子:"酉", 丑:"戌", 寅:"亥", 卯:"子", 辰:"丑", 巳:"寅", 午:"卯", 未:"辰", 申:"巳", 酉:"午", 戌:"未", 亥:"申" };
// 天空（年支前五位另一派，此处用"年支对冲前一位"的通用算法）
const TIANKONG_TABLE = { 子:"巳", 丑:"午", 寅:"未", 卯:"申", 辰:"酉", 巳:"戌", 午:"亥", 未:"子", 申:"丑", 酉:"寅", 戌:"卯", 亥:"辰" };
// 大耗（年支前六位即对冲位相邻）
const DAHAO_TABLE = { 子:"未", 丑:"申", 寅:"酉", 卯:"戌", 辰:"亥", 巳:"子", 午:"丑", 未:"寅", 申:"卯", 酉:"辰", 戌:"巳", 亥:"午" };
// 隔角（年支前四位，近似）
const GEJIAO_TABLE = { 子:"寅", 丑:"卯", 寅:"辰", 卯:"巳", 辰:"午", 巳:"未", 午:"申", 未:"酉", 申:"戌", 酉:"亥", 戌:"子", 亥:"丑" };
// 三台（年支三合前一位连续三位）—— 简化：年支起到后两位连续地支都见到
const SANTAI_TABLE = {
  申子辰: ["寅","卯","辰"], 寅午戌: ["申","酉","戌"], 亥卯未: ["巳","午","未"], 巳酉丑: ["亥","子","丑"],
};
// 八座（年支起连续三位，另一派）—— 简化为与三台同表不同起始
const BAZUO_TABLE = {
  申子辰: ["卯","辰","巳"], 寅午戌: ["酉","戌","亥"], 亥卯未: ["午","未","申"], 巳酉丑: ["子","丑","寅"],
};

function analyzeShensha(pillars, dayStem, gender) {
  const results = [];
  const branches = pillars.map(p => p.branch);
  const stems = pillars.map(p => p.stem);
  const yearBranch = pillars[0].branch;
  const monthBranch = pillars[1].branch;
  const dayBranch = pillars[2].branch;
  const sanheKey = Object.keys(YIMA_TABLE).find(k => k.includes(yearBranch) || k.includes(dayBranch)) || "";
  const push = (item, locatePos) => {
    // locatePos: 若传入则查找所在柱（用于提示）
    let pos = "";
    if (locatePos && locatePos.kind === "branch") {
      const idx = branches.indexOf(locatePos.value);
      if (idx >= 0) pos = ["年", "月", "日", "时"][idx] + "支";
    } else if (locatePos && locatePos.kind === "stem") {
      const idx = stems.indexOf(locatePos.value);
      if (idx >= 0) pos = ["年", "月", "日", "时"][idx] + "干";
    }
    if (pos) item.pos = pos;
    results.push(item);
  };

  // ===== 原有 7 个 =====
  (TIANYI_TABLE[dayStem] || []).forEach(b => { if (branches.includes(b)) push({ name: "天乙贵人", icon: "⭐", type: "吉", desc: "逢凶化吉，多得贵人相助" }, { kind: "branch", value: b }); });
  if (WENCHANG_TABLE[dayStem] && branches.includes(WENCHANG_TABLE[dayStem])) push({ name: "文昌贵人", icon: "📖", type: "吉", desc: "利考试学术，文才出众" }, { kind: "branch", value: WENCHANG_TABLE[dayStem] });
  if (TIANDE_TABLE[monthBranch] && stems.includes(TIANDE_TABLE[monthBranch])) push({ name: "天德贵人", icon: "🌟", type: "吉", desc: "化灾解厄，心性善良" }, { kind: "stem", value: TIANDE_TABLE[monthBranch] });
  if (YUEDE_TABLE[monthBranch] && stems.includes(YUEDE_TABLE[monthBranch])) push({ name: "月德贵人", icon: "🌙", type: "吉", desc: "为人宽厚，少灾少难" }, { kind: "stem", value: YUEDE_TABLE[monthBranch] });
  if (sanheKey) {
    if (branches.includes(YIMA_TABLE[sanheKey])) push({ name: "驿马", icon: "🐎", type: "动", desc: "主奔波迁移，适合外向发展" }, { kind: "branch", value: YIMA_TABLE[sanheKey] });
    if (branches.includes(TAOHUA_TABLE[sanheKey])) push({ name: "桃花", icon: "🌸", type: "桃花", desc: "异性缘旺，有魅力" }, { kind: "branch", value: TAOHUA_TABLE[sanheKey] });
    if (branches.includes(HUAGAI_TABLE[sanheKey])) push({ name: "华盖", icon: "☂️", type: "孤", desc: "聪明独立，有哲学倾向" }, { kind: "branch", value: HUAGAI_TABLE[sanheKey] });
  }

  // ===== 新增 18 个 =====
  // 禄神
  if (LUSHEN_TABLE[dayStem] && branches.includes(LUSHEN_TABLE[dayStem])) push({ name: "禄神", icon: "💰", type: "吉", desc: "主俸禄爵位，自食其力，财源稳定" }, { kind: "branch", value: LUSHEN_TABLE[dayStem] });
  // 羊刃
  if (YANGREN_TABLE[dayStem] && branches.includes(YANGREN_TABLE[dayStem])) push({ name: "羊刃", icon: "⚔️", type: "凶", desc: "性格刚烈，魄力大，忌冲动，易有血光/手术" }, { kind: "branch", value: YANGREN_TABLE[dayStem] });
  // 将星（按年支三合局）
  const yearSanheKey = Object.keys(JIANGXING_TABLE).find(k => k.includes(yearBranch));
  if (yearSanheKey && branches.includes(JIANGXING_TABLE[yearSanheKey])) push({ name: "将星", icon: "🎖", type: "吉", desc: "主掌权、领导力强，有将帅之才" }, { kind: "branch", value: JIANGXING_TABLE[yearSanheKey] });
  // 亡神
  if (yearSanheKey && branches.includes(WANGSHEN_TABLE[yearSanheKey])) push({ name: "亡神", icon: "👤", type: "凶", desc: "主城府深、心机重，逢之易破财招祸" }, { kind: "branch", value: WANGSHEN_TABLE[yearSanheKey] });
  // 劫煞
  if (yearSanheKey && branches.includes(JIESHA_TABLE[yearSanheKey])) push({ name: "劫煞", icon: "💥", type: "凶", desc: "主破财劫夺，易遭外来之灾" }, { kind: "branch", value: JIESHA_TABLE[yearSanheKey] });
  // 灾煞
  if (yearSanheKey && branches.includes(ZAISHA_TABLE[yearSanheKey])) push({ name: "灾煞", icon: "⚡", type: "凶", desc: "主意外灾厄，出行需谨慎" }, { kind: "branch", value: ZAISHA_TABLE[yearSanheKey] });
  // 红鸾
  if (HONGLUAN_TABLE[yearBranch] && branches.includes(HONGLUAN_TABLE[yearBranch])) push({ name: "红鸾", icon: "💕", type: "喜", desc: "主婚姻喜庆，逢之主成亲、添丁" }, { kind: "branch", value: HONGLUAN_TABLE[yearBranch] });
  // 天喜
  if (TIANXI_TABLE[yearBranch] && branches.includes(TIANXI_TABLE[yearBranch])) push({ name: "天喜", icon: "🎉", type: "喜", desc: "主喜庆之事，人缘佳，异性缘旺" }, { kind: "branch", value: TIANXI_TABLE[yearBranch] });
  // 孤辰（以男性为主使用，但现代命理男女通用，仅区分侧重）
  if (GUCHEN_TABLE[yearBranch] && branches.includes(GUCHEN_TABLE[yearBranch])) push({ name: "孤辰", icon: "🌑", type: "孤", desc: "六亲缘薄，性格清高孤僻" }, { kind: "branch", value: GUCHEN_TABLE[yearBranch] });
  // 寡宿
  if (GUASU_TABLE[yearBranch] && branches.includes(GUASU_TABLE[yearBranch])) push({ name: "寡宿", icon: "🌘", type: "孤", desc: `情感孤独，${gender === 'female' ? '女命尤需留意婚姻' : '宜专注事业精进'}` }, { kind: "branch", value: GUASU_TABLE[yearBranch] });
  // 金舆
  if (JINYU_TABLE[dayStem] && branches.includes(JINYU_TABLE[dayStem])) push({ name: "金舆", icon: "🚗", type: "吉", desc: "主富贵安乐，出行有车马，配偶贤良" }, { kind: "branch", value: JINYU_TABLE[dayStem] });
  // 国印贵人
  if (GUOYIN_TABLE[dayStem] && branches.includes(GUOYIN_TABLE[dayStem])) push({ name: "国印贵人", icon: "🏛", type: "吉", desc: "主掌权印，利公职、文教、官运" }, { kind: "branch", value: GUOYIN_TABLE[dayStem] });
  // 学堂
  if (XUETANG_TABLE[dayStem] && branches.includes(XUETANG_TABLE[dayStem])) push({ name: "学堂", icon: "🎓", type: "吉", desc: "主学业有成，知识根基深厚" }, { kind: "branch", value: XUETANG_TABLE[dayStem] });
  // 词馆
  if (CIGUAN_TABLE[dayStem] && branches.includes(CIGUAN_TABLE[dayStem])) push({ name: "词馆", icon: "✒️", type: "吉", desc: "主文采斐然，口才佳，利文笔创作" }, { kind: "branch", value: CIGUAN_TABLE[dayStem] });
  // 天医
  if (TIANYI_YI_TABLE[monthBranch] && branches.includes(TIANYI_YI_TABLE[monthBranch])) push({ name: "天医", icon: "⚕️", type: "吉", desc: "主身体康健，遇事得医，适合医药相关" }, { kind: "branch", value: TIANYI_YI_TABLE[monthBranch] });
  // 血刃
  if (XUEREN_TABLE[yearBranch] && branches.includes(XUEREN_TABLE[yearBranch])) push({ name: "血刃", icon: "🩸", type: "凶", desc: "主血光之灾，注意安全驾驶及外伤" }, { kind: "branch", value: XUEREN_TABLE[yearBranch] });
  // 三奇贵人
  SANQI_GROUPS.forEach(g => {
    const ordered = [stems[0], stems[1], stems[2], stems[3]];
    // 连续三柱天干（年月日 或 月日时）按顺序齐全
    const seq1 = ordered.slice(0, 3).join("") === g.stems.join("");
    const seq2 = ordered.slice(1, 4).join("") === g.stems.join("");
    if (seq1 || seq2) push({ name: g.name, icon: "🔱", type: "大吉", desc: g.desc });
  });
  // 天罗地网
  const dayEl = STEM_ELEMENTS[dayStem];
  if ((dayEl === "火") && branches.includes("戌") && branches.includes("亥")) push({ name: "天罗", icon: "🕸", type: "凶", desc: "火命逢戌亥，易遇阻碍，行事多波折" });
  if ((dayEl === "水" || dayEl === "土") && branches.includes("辰") && branches.includes("巳")) push({ name: "地网", icon: "🕸", type: "凶", desc: "水土命逢辰巳，易陷困局，需耐心破解" });

  // ===== 扩展 25 项（2026-04-22）=====
  const yearStem = stems[0];
  const dayPillar = stems[2] + pillars[2].branch;
  const monthSeason = MONTH_TO_SEASON[monthBranch];

  // 太极贵人（以年干起）
  (TAIJI_TABLE[yearStem] || []).forEach(b => {
    if (branches.includes(b)) push({ name: "太极贵人", icon: "☯", type: "吉", desc: "主悟性高、近玄学哲理，有宗教缘或深思能力" }, { kind: "branch", value: b });
  });
  // 德秀贵人（月支决定天干组合，四柱天干凑齐）
  const dexiu = DEXIU_TABLE[monthBranch];
  if (dexiu && dexiu.stems.every(s => stems.includes(s))) {
    push({ name: "德秀贵人", icon: "🌟", type: "吉", desc: "主为人有德有才，化难成祥，聪慧不俗" });
  }
  // 福星贵人
  if (FUXING_TABLE[dayStem] && branches.includes(FUXING_TABLE[dayStem])) {
    push({ name: "福星贵人", icon: "🍀", type: "吉", desc: "主福泽深厚、多享清福，一生衣食无忧" }, { kind: "branch", value: FUXING_TABLE[dayStem] });
  }
  // 玉堂贵人
  if (YUTANG_TABLE[dayStem] && branches.includes(YUTANG_TABLE[dayStem])) {
    push({ name: "玉堂贵人", icon: "🏛", type: "吉", desc: "主清贵文雅，利科名、文职、学术显达" }, { kind: "branch", value: YUTANG_TABLE[dayStem] });
  }
  // 天厨贵人
  if (TIANCHU_TABLE[dayStem] && branches.includes(TIANCHU_TABLE[dayStem])) {
    push({ name: "天厨贵人", icon: "🍽", type: "吉", desc: "主口福佳、食禄丰，利餐饮、医药相关" }, { kind: "branch", value: TIANCHU_TABLE[dayStem] });
  }
  // 天官贵人
  if (TIANGUAN_TABLE[dayStem] && branches.includes(TIANGUAN_TABLE[dayStem])) {
    push({ name: "天官贵人", icon: "🎩", type: "吉", desc: "主官运亨通、易得提拔、升迁之喜" }, { kind: "branch", value: TIANGUAN_TABLE[dayStem] });
  }
  // 天赦日
  if (TIANSHE_DAYS.includes(dayPillar)) {
    push({ name: "天赦日", icon: "🕊", type: "大吉", desc: "天赦日生人，一生逢凶化吉、有灾得解、百难消除" });
  }
  // 六秀日
  if (LIUXIU_DAYS.includes(dayPillar)) {
    push({ name: "六秀日", icon: "🌸", type: "吉", desc: "日生六秀，主人聪明秀丽、多才多艺、气质出众" });
  }
  // 魁罡日（与前文魁罡格呼应，作为日柱神煞单独标记）
  if (KUIGANG_DAYS.includes(dayPillar)) {
    push({ name: "魁罡日", icon: "⚡", type: "刚", desc: "日柱魁罡，性刚气烈、聪明果断，男命掌权、女命独立自强" });
  }
  // 十恶大败日
  if (SHIE_DAYS.includes(dayPillar)) {
    push({ name: "十恶大败", icon: "💢", type: "凶", desc: "主破财伤身、事业难成，须以修德积善化解" });
  }
  // 四废日
  if (monthSeason && SIFEI_DAYS_BY_SEASON[monthSeason] && SIFEI_DAYS_BY_SEASON[monthSeason].includes(dayPillar)) {
    push({ name: "四废日", icon: "🍂", type: "凶", desc: "主做事虎头蛇尾、半途而废，宜谨慎择业、稳中求进" });
  }
  // 阴阳差错日
  if (YYCC_DAYS.includes(dayPillar)) {
    push({ name: "阴阳差错", icon: "⚖", type: "煞", desc: "主婚姻波折、六亲缘薄，须在人际关系上多用心维护" });
  }
  // 飞刃
  if (FEIREN_TABLE[dayStem] && branches.includes(FEIREN_TABLE[dayStem])) {
    push({ name: "飞刃", icon: "🗡", type: "凶", desc: "与羊刃对冲，主脾气暴躁、易生冲突，宜修身养性" }, { kind: "branch", value: FEIREN_TABLE[dayStem] });
  }
  // 勾绞煞
  const gj = GOUJIAO_TABLE[yearBranch];
  if (gj) {
    if (branches.includes(gj.gou)) push({ name: "勾煞", icon: "⚓", type: "煞", desc: "主纠缠不清、拖延之事，忌签合同借贷" }, { kind: "branch", value: gj.gou });
    if (branches.includes(gj.jiao)) push({ name: "绞煞", icon: "🪢", type: "煞", desc: "主人际纠葛、口舌是非，宜低调处事" }, { kind: "branch", value: gj.jiao });
  }
  // 咸池（另一派桃花）
  if (XIANCHI_TABLE[dayStem] && branches.includes(XIANCHI_TABLE[dayStem])) {
    push({ name: "咸池煞", icon: "💦", type: "桃花", desc: "主异性缘重、多情善感，须防感情纠纷" }, { kind: "branch", value: XIANCHI_TABLE[dayStem] });
  }
  // 丧门
  if (SANGMEN_TABLE[yearBranch] && branches.includes(SANGMEN_TABLE[yearBranch])) {
    push({ name: "丧门", icon: "⚰", type: "凶", desc: "主孝服之事或家中长辈健康波动" }, { kind: "branch", value: SANGMEN_TABLE[yearBranch] });
  }
  // 吊客
  if (DIAOKE_TABLE[yearBranch] && branches.includes(DIAOKE_TABLE[yearBranch])) {
    push({ name: "吊客", icon: "🕯", type: "凶", desc: "主探病吊丧、亲友离合之事" }, { kind: "branch", value: DIAOKE_TABLE[yearBranch] });
  }
  // 白虎
  if (BAIHU_TABLE[yearBranch] && branches.includes(BAIHU_TABLE[yearBranch])) {
    push({ name: "白虎", icon: "🐯", type: "凶", desc: "主意外伤灾、血光之事，驾车出行需谨慎" }, { kind: "branch", value: BAIHU_TABLE[yearBranch] });
  }
  // 天狗
  if (TIANGOU_TABLE[yearBranch] && branches.includes(TIANGOU_TABLE[yearBranch])) {
    push({ name: "天狗", icon: "🐕", type: "凶", desc: "主口舌官非、小人暗算，须慎言慎行" }, { kind: "branch", value: TIANGOU_TABLE[yearBranch] });
  }
  // 披麻
  if (PIMA_TABLE[yearBranch] && branches.includes(PIMA_TABLE[yearBranch])) {
    push({ name: "披麻", icon: "🎗", type: "凶", desc: "主孝服之忧、家宅不宁" }, { kind: "branch", value: PIMA_TABLE[yearBranch] });
  }
  // 天空
  if (TIANKONG_TABLE[yearBranch] && branches.includes(TIANKONG_TABLE[yearBranch])) {
    push({ name: "天空", icon: "🌫", type: "煞", desc: "主计划落空、事与愿违，宜踏实行事" }, { kind: "branch", value: TIANKONG_TABLE[yearBranch] });
  }
  // 大耗
  if (DAHAO_TABLE[yearBranch] && branches.includes(DAHAO_TABLE[yearBranch])) {
    push({ name: "大耗", icon: "💸", type: "凶", desc: "主破财之事、大笔开销，宜节制投资" }, { kind: "branch", value: DAHAO_TABLE[yearBranch] });
  }
  // 隔角
  if (GEJIAO_TABLE[yearBranch] && branches.includes(GEJIAO_TABLE[yearBranch])) {
    push({ name: "隔角", icon: "📐", type: "煞", desc: "主六亲隔阂、手足不睦，需多沟通" }, { kind: "branch", value: GEJIAO_TABLE[yearBranch] });
  }
  // 三台
  const yearSanheKey3 = Object.keys(SANTAI_TABLE).find(k => k.includes(yearBranch));
  if (yearSanheKey3) {
    const need = SANTAI_TABLE[yearSanheKey3];
    if (need.every(b => branches.includes(b))) push({ name: "三台", icon: "🏅", type: "吉", desc: "主地位尊崇、职权显赫，有宰辅之象" });
  }
  // 八座
  const yearSanheKey4 = Object.keys(BAZUO_TABLE).find(k => k.includes(yearBranch));
  if (yearSanheKey4) {
    const need = BAZUO_TABLE[yearSanheKey4];
    if (need.every(b => branches.includes(b))) push({ name: "八座", icon: "🛋", type: "吉", desc: "主贵人拥护、尊位稳固，与三台相配则贵不可言" });
  }

  return results;
}

/* ===== 空亡系统 ===== */
function analyzeKongWang(pillars) {
  const sIdx = STEMS.indexOf(pillars[2].stem);
  const bIdx = BRANCHES.indexOf(pillars[2].branch);
  const xunStart = safeMod(bIdx - sIdx, 12);
  const kong1 = BRANCHES[safeMod(xunStart + 10, 12)];
  const kong2 = BRANCHES[safeMod(xunStart + 11, 12)];
  const names = ["年柱", "月柱", "日柱", "时柱"];
  const meanings = { 年柱: "祖业薄、早年漂泊", 月柱: "父母缘浅、中年自立", 日柱: "婚姻有波折", 时柱: "子女缘薄、晚年需规划" };
  const positions = [];
  pillars.forEach((p, i) => { if (p.branch === kong1 || p.branch === kong2) positions.push({ pillar: names[i], branch: p.branch, meaning: meanings[names[i]] || "" }); });
  return {
    kongWang: [kong1, kong2],
    kongPositions: positions,
    hasKongWang: positions.length > 0,
    desc: positions.length > 0
      ? `空亡${kong1}${kong2}，${positions.map(k => `${k.pillar}${k.branch}逢空——${k.meaning}`).join("；")}`
      : `空亡${kong1}${kong2}，四柱无逢空。`,
  };
}

/* ===== 婚姻分析（古法深度版 v2） =====
 * 关键原则：
 *  1) 男命看财（妻星）、看日支（妻宫）；女命看官杀（夫星）、看日支（夫宫）、看食伤（克夫星）
 *  2) 单一十神落在日支不能下定论，必须结合全局十神结构
 *  3) 女命最忌：伤官见官、食伤过旺、比劫争夫、官杀混杂、日支冲破
 *  4) 参数扩展：接收 tenGodResult 和 shensha 用于更深判断（向后兼容：缺省仍可工作）
 */
function analyzeMarriage(pillars, dayStem, gender, strengthResult, tenGodResult, shensha) {
  const dayBranch = pillars[2].branch;
  let score = 75;
  const factors = [];
  const risks = [];      // 警示点（告诉用户潜在风险）
  const isMale = gender === "male";
  const dayGod = getTenGod(dayStem, BRANCH_HIDDEN_STEMS[dayBranch][0].stem);
  const counts = (tenGodResult && tenGodResult.counts) ? tenGodResult.counts : {};
  const g = (k) => counts[k] || 0;

  // ========== 男命 ==========
  if (isMale) {
    // 1) 日支十神（妻宫）
    if (dayGod === "正财")       { score += 15; factors.push("日坐正财，妻星得位，配偶贤惠"); }
    else if (dayGod === "偏财")  { score += 6;  factors.push("日坐偏财，异性缘好，但易有外缘"); }
    else if (dayGod === "正官")  { score += 5;  factors.push("日坐正官，配偶稳重有担当"); }
    else if (dayGod === "正印")  { score += 3;  factors.push("日坐正印，配偶贤淑但与母亲磁场相近"); }
    else if (dayGod === "偏印")  { score -= 5;  factors.push("日坐偏印（枭神），与配偶沟通易有隔阂"); }
    else if (dayGod === "食神")  { score += 4;  factors.push("日坐食神，生活融洽，配偶性情温和"); }
    else if (dayGod === "伤官")  { score -= 10; factors.push("日坐伤官，配偶个性强，需多包容"); risks.push("伤官坐妻宫易口角"); }
    else if (dayGod === "七杀")  { score -= 8;  factors.push("日坐七杀，配偶刚烈或压力大"); }
    else if (dayGod === "比肩" || dayGod === "劫财") {
      score -= 12;
      factors.push("日坐比劫，夫妻宫有竞争，易争财或感情分薄");
      risks.push("比劫坐妻宫——慎防感情波折或第三者");
    }
    // 2) 财星数量（妻星）
    const cai = g("正财") + g("偏财");
    if (cai === 0) { score -= 8; factors.push("八字无财，妻缘较薄，晚婚为宜"); risks.push("无妻星——婚姻缘份浅"); }
    else if (cai >= 4) { score -= 10; factors.push("财多身弱，易因妻致祸或妻管严"); risks.push("财多不真——反主伤妻或散财"); }
    // 3) 比劫过重夺财
    if ((g("比肩") + g("劫财")) >= 4 && cai >= 1) {
      score -= 10;
      factors.push("比劫重叠，群劫争财，感情生波");
      risks.push("比劫夺财——慎防婚姻第三者");
    }
  }
  // ========== 女命 ==========
  else {
    // 1) 日支十神（夫宫）—— 十神全覆盖
    if (dayGod === "正官")       { score += 15; factors.push("日坐正官，夫星得位，配偶正派有担当"); }
    else if (dayGod === "七杀")  {
      // 七杀坐夫宫：有制化则刚毅得力，无制则压力大
      const hasZhi = g("食神") >= 1 || g("正印") >= 1 || g("偏印") >= 1;
      if (hasZhi) { score += 6; factors.push("日坐七杀有制化，配偶刚毅有力"); }
      else { score -= 5; factors.push("日坐七杀无制，配偶强势压力大"); risks.push("七杀无制——夫妻易冲突"); }
    }
    else if (dayGod === "正财")  { score += 2; factors.push("日坐正财，能掌家理财，婚姻属平顺（夫星须另看）"); }
    else if (dayGod === "偏财")  { score -= 2; factors.push("日坐偏财，偏重事业与人际，对夫宫助力有限"); }
    else if (dayGod === "正印")  { score += 4; factors.push("日坐正印，配偶温和有涵养，但带点长辈气质"); }
    else if (dayGod === "偏印")  { score -= 6; factors.push("日坐偏印（枭神），与配偶关系偏冷淡或聚少离多"); risks.push("偏印坐夫宫——感情易疏离"); }
    else if (dayGod === "食神")  {
      // 女命日坐食神：食神泄秀，本身克官，需看官杀强弱
      if (g("正官") + g("七杀") === 0) {
        score -= 12;
        factors.push("日坐食神且四柱无官杀，夫星隐伏，婚缘迟或淡");
        risks.push("食神透干无官杀——易有晚婚或独身倾向");
      } else {
        score -= 4;
        factors.push("日坐食神，聪明才艺，但食神克官，对夫运不利");
        risks.push("食神坐夫宫——易嫌弃配偶或主动离");
      }
    }
    else if (dayGod === "伤官")  {
      // 女命日坐伤官是婚姻最大杀手之一
      score -= 15;
      factors.push("日坐伤官，伤官克官，婚姻波折较大");
      risks.push("女命伤官坐夫宫——古法谓之\"伤官旺，克夫显\"，极易离异或配偶有损");
    }
    else if (dayGod === "比肩")  {
      score -= 10;
      factors.push("日坐比肩，夫宫被比劫占据，分夫之象");
      risks.push("比肩坐夫宫——配偶缘分薄或感情被分");
    }
    else if (dayGod === "劫财")  {
      score -= 12;
      factors.push("日坐劫财，夫宫被劫，感情易被第三者介入");
      risks.push("劫财坐夫宫——慎防感情被夺或夫缘反复");
    }

    // 2) 官杀全局分析（夫星）
    const guan = g("正官"), sha = g("七杀");
    const guanSha = guan + sha;
    if (guanSha === 0) {
      score -= 10;
      factors.push("四柱无官杀，夫星隐伏，需靠大运引发夫缘");
      risks.push("无夫星透藏——婚缘迟或不稳");
    } else if (guan >= 1 && sha >= 1) {
      score -= 8;
      factors.push("官杀混杂，夫缘复杂，易有感情纠葛");
      risks.push("官杀混杂——慎防感情中出现多人或反复");
    } else if (guanSha >= 3) {
      score -= 10;
      factors.push("官杀过多，夫星太旺反为病，婚姻易变");
      risks.push("官杀过旺——古云\"官杀混则乱，过多则无情\"");
    }

    // 3) 食伤克官（女命最重要的判断之一）
    const shishang = g("食神") + g("伤官");
    if (shishang >= 3 && guanSha >= 1) {
      score -= 15;
      factors.push("食伤过旺克制官星，克夫之象明显");
      risks.push("食伤旺克夫星——婚姻极易破裂，需修身养性化解");
    } else if (g("伤官") >= 2 && guan >= 1) {
      score -= 12;
      factors.push("伤官见官，命中大忌，婚姻易有重大波折");
      risks.push("伤官见官——古法视为女命第一破婚格");
    } else if (shishang >= 3 && guanSha === 0) {
      score -= 8;
      factors.push("食伤旺而无官杀，夫缘寡淡");
    }

    // 4) 比劫争夫
    const bijie = g("比肩") + g("劫财");
    if (bijie >= 3 && guanSha >= 1) {
      score -= 8;
      factors.push("比劫重叠争夫，感情易被分");
      risks.push("比劫争夫——慎防配偶被他人吸引");
    }

    // 5) 日主偏旺 + 官弱：压不住夫
    if (strengthResult.level >= 6 && guanSha >= 1 && guanSha <= 1 && shishang >= 1) {
      score -= 5;
      factors.push("日主偏旺，食伤又克夫星，易嫌配偶无能");
    }

    // 6) 印重泄官气
    if (g("正印") + g("偏印") >= 3 && guanSha >= 1) {
      score -= 4;
      factors.push("印星过重，官印相生反成印旺，夫星之力被泄");
    }
  }

  // ========== 通用：日支与其他支的合冲害 ==========
  [pillars[0], pillars[1], pillars[3]].forEach((p, i) => {
    const n = ["年支", "月支", "时支"][i];
    const k = dayBranch + p.branch;
    if (BRANCH_SIX_CLASH[k]) {
      score -= 12;
      factors.push(`日支与${n}相冲，夫妻宫动摇`);
      if (i === 2) risks.push("日时相冲——晚年或婚后多迁移奔波");
    }
    if (BRANCH_SIX_HARM[k]) { score -= 6; factors.push(`日支与${n}相害`); }
    if (BRANCH_SIX_COMBINE[k]) {
      // 日支逢合：感情顺但也可能合绊
      score += 3;
      factors.push(`日支与${n}六合，感情有吸引力`);
      if (!isMale && i === 1) { // 女命月日合
        risks.push("日月相合——夫妻感情好，但也易因家庭琐事纠缠");
      }
    }
  });

  // 日支自刑、自合、暗合（如申见寅冲、卯见酉冲等已涵盖）
  // 日支被三合/三会冲破（进阶）：简化处理

  // ========== 身强身弱微调 ==========
  if (strengthResult.level >= 6) { score -= 3; factors.push("日主偏旺，感情中宜学会退让"); }
  else if (strengthResult.level <= 2) { score -= 3; factors.push("日主偏弱，感情中宜培养主见"); }

  // ========== 神煞参考（桃花/红艳/孤辰寡宿） ==========
  if (Array.isArray(shensha)) {
    const shenshaNames = shensha.map(s => s && s.name).filter(Boolean);
    if (shenshaNames.includes("桃花") || shenshaNames.includes("咸池")) {
      factors.push("命带桃花，异性缘佳");
      if (!isMale && (g("伤官") >= 2 || dayGod === "伤官")) {
        risks.push("桃花+伤官——感情多选择，更易波动");
      }
    }
    if (shenshaNames.includes("红艳煞")) { factors.push("命带红艳，情感丰富"); }
    if (shenshaNames.includes("孤辰") || shenshaNames.includes("寡宿")) {
      score -= 5;
      factors.push(`命带${shenshaNames.includes("孤辰") ? "孤辰" : "寡宿"}，感情易冷淡或晚婚`);
      risks.push("孤寡之星——独立性强，婚缘较迟");
    }
  }

  // ========== 分数收敛与结论 ==========
  score = Math.min(95, Math.max(25, score));
  let rating, conclusion;

  if (score >= 85) {
    rating = "上佳";
    conclusion = "婚姻宫配置极佳，夫妻宫得力，感情基础深厚。婚后生活和谐美满，配偶对命主有正面助力。";
  } else if (score >= 70) {
    rating = "良好";
    conclusion = "婚姻格局整体不错，虽有小摩擦但无伤大雅。适婚年龄25-32岁之间，配偶条件较好。";
  } else if (score >= 55) {
    rating = "中等";
    conclusion = "婚姻格局中等，需要双方共同经营。感情中有波动期，建议晚婚（28岁后），选择性格互补的伴侣。";
  } else if (score >= 40) {
    rating = "偏弱";
    conclusion = "婚姻宫受冲害或命局不利夫（妻）星，感情之路较为坎坷。可能经历分手或离异的考验。建议慎重择偶，婚前充分了解对方家庭背景与生辰。";
  } else {
    rating = "波折";
    conclusion = "婚姻格局较弱，须格外注意感情经营。命局中存在多处破婚因素，建议晚婚（30岁后），或可经一次考验后方能稳定。平时多修身养性、行善积德以化解。";
  }

  // 女命专属补充结论
  if (!isMale && risks.length >= 2) {
    conclusion += " 女命特别提示：命中" + risks.slice(0, 2).join("、") + "，宜修养性情、择对象时避免同样命硬者。";
  }

  return { score, rating, factors, risks, conclusion, dayMainGod: dayGod };
}

/* ===== 疾病诊断 ===== */
function analyzeHealth(weightedCounts, usefulGod) {
  const organMap = {
    木: { organ: "肝胆", illness: "肝胆疾病、眼疾、头痛", nurture: "宜养肝护眼，多吃绿色蔬菜，避免熬夜和过量饮酒。春季尤须注意。" },
    火: { organ: "心脏小肠", illness: "心血管、高血压、失眠", nurture: "宜养心安神，避免过度劳累和情绪激动。夏季注意清热降火，保证充足睡眠。" },
    土: { organ: "脾胃", illness: "消化系统、糖尿病、皮肤", nurture: "宜健脾养胃，饮食规律，忌生冷油腻。换季时节注意肠胃保养。" },
    金: { organ: "肺大肠", illness: "呼吸系统、皮肤病", nurture: "宜润肺养肤，秋冬注意防寒保暖。少吃辛辣刺激，多做有氧运动。" },
    水: { organ: "肾膀胱", illness: "泌尿系统、耳鸣、肾虚", nurture: "宜补肾固本，冬季注意保暖。避免过度劳累和房事过频，适当食用黑色食物。" },
  };
  const warnings = [];
  usefulGod.dislikeElements.forEach(el => { const o = organMap[el]; if (o) warnings.push({ element: el, organ: o.organ, desc: `${el}为忌神，${o.organ}需注意`, illness: o.illness, nurture: o.nurture }); });
  const sorted = Object.entries(weightedCounts).sort((a, b) => b[1] - a[1]);
  if (sorted[0] && sorted[0][1] > 30) { const o = organMap[sorted[0][0]]; if (o) warnings.push({ element: sorted[0][0], organ: o.organ, desc: `${sorted[0][0]}过旺，${o.organ}可能过亢`, illness: o.illness, nurture: o.nurture }); }
  Object.entries(weightedCounts).forEach(([el, s]) => { if (s < 5) { const o = organMap[el]; if (o) warnings.push({ element: el, organ: o.organ, desc: `${el}极弱，${o.organ}天生较弱`, illness: o.illness, nurture: o.nurture }); } });
  // 去重
  const seen = new Set(); const uniqueWarns = [];
  warnings.forEach(w => { const k = w.element + w.organ; if (!seen.has(k)) { seen.add(k); uniqueWarns.push(w); } });
  let summary;
  if (uniqueWarns.length > 0) {
    summary = `需重点关注${uniqueWarns.map(w => w.organ).join("、")}。${uniqueWarns[0].nurture}`;
  } else {
    summary = "五行较为均衡，无明显健康隐患。日常保持规律作息、适量运动即可。";
  }
  return { warnings: uniqueWarns, summary };
}

/* ========================================================================
 * 调候用神系统 — 基于《穷通宝鉴》
 * 10天干 × 12节气月，给出精确的调候喜用神
 * ======================================================================== */
const TIAOHUO_TABLE = {
  甲: {
    寅: { use: "丙癸", desc: "初春甲木，余寒未尽。丙火解冻为先，癸水滋润为辅。有丙无癸，富而不贵；有癸无丙，贵而不富。" },
    卯: { use: "庚丙", desc: "仲春甲木当令，枝叶繁茂。庚金修剪为先（伤官生财），丙火暖局为辅。庚丙两透，定主大贵。" },
    辰: { use: "庚壬丙", desc: "暮春甲木退气，土旺。先庚后壬，庚劈甲引丁为用。无庚用壬水生木亦可。" },
    巳: { use: "癸丁庚", desc: "初夏火旺木焚。癸水滋养为先，丁火泄秀为辅。见庚劈甲引丁，格局更高。" },
    午: { use: "癸丁庚", desc: "仲夏烈火炎炎，甲木有焚之忧。癸水救焚为第一要务。无癸见壬亦可，但力量稍逊。" },
    未: { use: "癸丁庚", desc: "季夏土旺火炎，甲木根基动摇。癸水救润为先，庚金辅佐为后。三伏生寒，最喜癸水。" },
    申: { use: "丁庚丙", desc: "初秋金旺乘权克木。丁火制杀为先（食神制杀），庚金为辅。丁壬合化，须防化木不成。" },
    酉: { use: "丁丙庚", desc: "仲秋金气肃杀，甲木受克严重。丁火制杀护身为要。无丁用丙亦可，但忌壬癸破丙。" },
    戌: { use: "庚甲丁壬", desc: "季秋土旺用事，甲木困顿。先庚劈甲引丁，壬水滋润为辅。" },
    亥: { use: "庚丁丙", desc: "初冬水旺木漂。庚金劈甲引丁为先，丙火照暖为辅。水多木漂，须有戊土制水。" },
    子: { use: "庚丁丙", desc: "仲冬严寒水冻。丙火解冻为先，庚金劈甲引丁为辅。寒木向阳，丙火不可或缺。" },
    丑: { use: "丙丁庚", desc: "季冬寒凝至极。丙火解冻第一，丁火温暖辅之。有丙透天干，必然显达。" },
  },
  乙: {
    寅: { use: "丙癸", desc: "初春乙木嫩芽，寒气未退。丙火温暖为先，癸水雨露为辅。春乙向阳，丙透大吉。" },
    卯: { use: "丙癸", desc: "仲春乙木得令，花开烂漫。丙癸并用，雨露阳光兼备，方成佳造。" },
    辰: { use: "癸丙", desc: "暮春土旺，乙木根基受损。癸水滋润为先，丙火温暖为辅。" },
    巳: { use: "癸丙", desc: "初夏火旺，乙木有枯萎之象。癸水滋润为要，不可一日无水。" },
    午: { use: "癸丙", desc: "仲夏烈日炎炎，乙木焦灼。癸水为救命之源，见壬亦可。" },
    未: { use: "癸丙", desc: "季夏燥土当令，乙木根浮。癸水不可缺，丙火酌用。" },
    申: { use: "丙癸己", desc: "初秋金旺克木。丙火制金护木为先，癸水滋养为辅。" },
    酉: { use: "丙癸己", desc: "仲秋金气太过，乙木凋零。丙火回阳制杀为要，癸水辅之。" },
    戌: { use: "癸辛丙", desc: "季秋土旺，乙木困。癸水润木为先，丙火温暖为辅。" },
    亥: { use: "丙戊", desc: "初冬水多木漂。丙火照暖为先，戊土止水为辅。" },
    子: { use: "丙戊", desc: "仲冬水旺木寒。丙火不可缺，戊土制水亦重要。" },
    丑: { use: "丙", desc: "季冬寒极。丙火解冻为第一要务。有丙透干，寒木回春。" },
  },
  丙: {
    寅: { use: "壬庚", desc: "初春丙火初生，寒气犹存。壬水财星辉映为贵，庚金生壬为辅。" },
    卯: { use: "壬己", desc: "仲春木旺生火太过。壬水制火为先，己土晦火为辅。" },
    辰: { use: "壬甲", desc: "暮春火进气，土旺泄秀。壬水财星为用，甲木印星辅之。" },
    巳: { use: "壬庚", desc: "初夏丙火当令，烈焰腾空。壬水制火为要。庚金生壬辅之。" },
    午: { use: "壬庚", desc: "仲夏丙火极旺，须壬水救济。壬庚并透，富贵双全。" },
    未: { use: "壬庚", desc: "季夏火土燥烈。壬水润局为第一。无壬见癸亦可。" },
    申: { use: "壬甲", desc: "初秋丙火渐退，金水进气。壬水得令生财，甲木印星护身。" },
    酉: { use: "壬甲", desc: "仲秋金旺泄气。壬水为财，甲木为印，二者兼用。" },
    戌: { use: "壬甲", desc: "季秋土旺晦火。壬水涤荡为先，甲木疏土为辅。" },
    亥: { use: "甲壬戊", desc: "初冬水旺克火。甲木化杀生身为要。戊土制水亦可。" },
    子: { use: "甲壬戊", desc: "仲冬水旺火弱。甲木通关为先，戊土制水为辅。" },
    丑: { use: "壬甲", desc: "季冬寒湿。甲木生火，壬水辉映。调候与通关并重。" },
  },
  丁: {
    寅: { use: "甲庚", desc: "初春丁火微弱。甲木生火为第一要务。庚劈甲引丁，格局更高。" },
    卯: { use: "甲庚", desc: "仲春木旺可生丁。甲庚并用，甲木为薪，庚金劈甲，火势乃旺。" },
    辰: { use: "甲庚", desc: "暮春土旺泄火。甲木印星为用，庚金辅之。" },
    巳: { use: "甲庚壬", desc: "初夏丙夺丁光。甲木为用，壬水制丙护丁。" },
    午: { use: "壬甲庚", desc: "仲夏火旺丁弱（丙夺丁辉）。壬水制丙为先，甲木辅之。" },
    未: { use: "甲壬庚", desc: "季夏燥土泄火。甲木生身为先，壬水润局为辅。" },
    申: { use: "甲庚丙", desc: "初秋金旺泄火。甲木生身，庚劈甲引丁。丙火助势。" },
    酉: { use: "甲庚丙", desc: "仲秋金旺克木，丁火无根。甲庚并用为急。" },
    戌: { use: "甲庚丙", desc: "季秋土旺晦火。甲木疏土生火为先。" },
    亥: { use: "甲庚", desc: "初冬水旺克火。甲木通关生火为要。庚劈甲引丁。" },
    子: { use: "甲庚", desc: "仲冬寒水冻丁。甲木不可缺，庚金辅之。" },
    丑: { use: "甲庚", desc: "季冬湿寒极重。甲庚为第一用神。" },
  },
  戊: {
    寅: { use: "丙甲癸", desc: "初春寒土冻结。丙火暖土为先，甲木疏土为辅。" },
    卯: { use: "丙甲癸", desc: "仲春木旺克土。丙火通关（木生火生土）为要，甲木疏土辅之。" },
    辰: { use: "甲丙癸", desc: "暮春戊土当令。甲木疏土为先，不使土太厚。丙火辅暖。" },
    巳: { use: "甲丙癸", desc: "初夏火旺生土太过。甲木疏松为用，癸水润土辅之。" },
    午: { use: "壬甲丙", desc: "仲夏火炎土燥。壬水润局为先，甲木疏土为辅。" },
    未: { use: "癸甲丙", desc: "季夏燥土极旺。癸水润泽为第一，甲木疏土为第二。" },
    申: { use: "丙癸甲", desc: "初秋金旺泄土。丙火生土制金为用。癸水辅之。" },
    酉: { use: "丙癸", desc: "仲秋金旺泄气。丙火暖身生土为先。" },
    戌: { use: "甲丙癸", desc: "季秋土旺重叠。甲木疏土为急。丙癸辅之。" },
    亥: { use: "甲丙", desc: "初冬水旺克火弱土。丙火暖局为先，甲木疏土为辅。" },
    子: { use: "丙甲", desc: "仲冬严寒。丙火解冻第一。甲木佐之。" },
    丑: { use: "丙甲", desc: "季冬寒凝。丙火为第一用神。" },
  },
  己: {
    寅: { use: "丙甲癸", desc: "初春己土卑湿。丙火暖土为先，甲木疏土为辅。" },
    卯: { use: "丙甲癸", desc: "仲春木旺克土。丙火通关为要，甲木疏土。" },
    辰: { use: "甲丙癸", desc: "暮春土旺。甲木疏松为先，丙癸辅用。" },
    巳: { use: "癸丙", desc: "初夏火旺土燥。癸水润土为先，丙火酌用。" },
    午: { use: "癸丙", desc: "仲夏极热。癸水救润为要。无癸见壬亦可。" },
    未: { use: "癸丙", desc: "季夏燥极。癸水第一要务。" },
    申: { use: "丙癸", desc: "初秋金旺泄土。丙火生土为用，癸水辅之。" },
    酉: { use: "丙癸", desc: "仲秋金旺。丙火暖局生土为先。" },
    戌: { use: "甲丙癸", desc: "季秋土重。甲木疏土为急，丙癸辅助。" },
    亥: { use: "丙甲", desc: "初冬水旺。丙火暖局为先。" },
    子: { use: "丙甲", desc: "仲冬严寒。丙火第一。" },
    丑: { use: "丙甲", desc: "季冬极寒。丙火解冻不可缺。" },
  },
  庚: {
    寅: { use: "丙甲丁", desc: "初春庚金寒冻。丙火暖金为先，甲木引丁炼金为辅。" },
    卯: { use: "丁甲丙", desc: "仲春木旺。丁火炼金为先（百炼成钢），甲木引丁。" },
    辰: { use: "甲丁壬", desc: "暮春土旺生金。甲木疏土为先，丁火炼金为辅。" },
    巳: { use: "壬丙戊", desc: "初夏火旺金弱。壬水洗淘为先，使金更光洁。" },
    午: { use: "壬癸", desc: "仲夏烈火熔金。壬水救金为第一要务。" },
    未: { use: "丁甲", desc: "季夏土旺晦金。丁火炼金为先，甲木疏土为辅。" },
    申: { use: "丁甲壬", desc: "初秋庚金当令。丁火锻炼为先，甲木引丁，壬水洗淘。" },
    酉: { use: "丁甲丙", desc: "仲秋金旺。丁火炼金为要，甲劈引丁。" },
    戌: { use: "甲壬", desc: "季秋土旺埋金。甲木疏土为先，壬水洗金为辅。" },
    亥: { use: "丁甲丙", desc: "初冬水旺金寒。丁火炼暖为先，丙火辅之。" },
    子: { use: "丁甲丙", desc: "仲冬寒极。丁火不可缺，甲木引丁。" },
    丑: { use: "丁甲丙", desc: "季冬湿寒。丁甲为第一组合。丙火解冻辅之。" },
  },
  辛: {
    寅: { use: "壬甲丙", desc: "初春辛金柔弱。壬水洗淘为先，使辛金光洁。丙火暖局辅之。" },
    卯: { use: "壬甲", desc: "仲春木旺克金。壬水泄金通关为要。" },
    辰: { use: "壬甲", desc: "暮春土旺生金。壬水洗淘为先，甲木疏土为辅。" },
    巳: { use: "壬甲癸", desc: "初夏火旺金衰。壬水淘洗为先。癸水辅助。" },
    午: { use: "壬癸己", desc: "仲夏烈火熔金。壬癸救命为要。己土生金辅之。" },
    未: { use: "壬甲", desc: "季夏燥土。壬水润局为先，甲木疏土为辅。" },
    申: { use: "壬甲", desc: "初秋辛金得助。壬水泄秀为先（秀气流行），甲木辅用。" },
    酉: { use: "壬甲", desc: "仲秋辛金极旺。壬水泄秀为第一要务。" },
    戌: { use: "壬甲", desc: "季秋土旺。壬甲并用。" },
    亥: { use: "丙壬甲", desc: "初冬水旺。丙火暖局为先，壬水辅用。" },
    子: { use: "丙壬甲", desc: "仲冬寒极。丙火解冻为第一。" },
    丑: { use: "丙壬甲", desc: "季冬极寒。丙火不可缺。" },
  },
  壬: {
    寅: { use: "庚丙", desc: "初春壬水退气。庚金生水为源头（印星为用），丙火暖局辅之。" },
    卯: { use: "庚辛", desc: "仲春木旺泄水。庚辛金生水为先（印绶护身）。" },
    辰: { use: "甲庚", desc: "暮春土旺克水。甲木制土为先，庚金生水为辅。" },
    巳: { use: "庚辛壬", desc: "初夏火旺水弱。庚辛生水为急。壬水比劫助力。" },
    午: { use: "庚辛癸", desc: "仲夏烈火蒸水。庚辛金源源生水为第一。" },
    未: { use: "庚辛甲", desc: "季夏燥土克水。庚辛生水，甲木制土。" },
    申: { use: "戊丁", desc: "初秋金旺生水太过。戊土制水为先，丁火制金为辅。" },
    酉: { use: "甲戊", desc: "仲秋金旺。甲木疏土泄水为用，戊土制水辅之。" },
    戌: { use: "甲丙", desc: "季秋土旺克水。甲木制土为先，丙火暖局。" },
    亥: { use: "戊丙甲", desc: "初冬壬水当令。戊土堤防为先，丙火暖局为辅。" },
    子: { use: "戊丙", desc: "仲冬水旺极。戊土制水为第一，丙火暖局辅之。" },
    丑: { use: "丙甲", desc: "季冬寒湿。丙火解冻为先，甲木疏土辅之。" },
  },
  癸: {
    寅: { use: "辛丙", desc: "初春癸水弱。辛金发水源为先（印星生身），丙火暖局为辅。" },
    卯: { use: "庚辛", desc: "仲春木旺泄水。庚辛金生水为要。" },
    辰: { use: "丙辛甲", desc: "暮春土旺克水。辛金生水为先，丙火暖局辅之，甲木制土。" },
    巳: { use: "辛甲", desc: "初夏火旺水涸。辛金发源为急。甲木辅用。" },
    午: { use: "庚辛壬癸", desc: "仲夏烈火极旺。金水齐来方能救。庚辛生水第一。" },
    未: { use: "庚辛", desc: "季夏燥土。庚辛金生水为要。" },
    申: { use: "丁", desc: "初秋金旺生水。丁火制金为先（食神制杀理）。" },
    酉: { use: "丁丙甲", desc: "仲秋金旺。丁火制金为先，丙火辅暖。" },
    戌: { use: "辛甲丙", desc: "季秋土旺。辛金生水，甲木制土，丙火暖局。" },
    亥: { use: "戊丙庚", desc: "初冬水旺。戊土制水为先，丙火暖局为辅。" },
    子: { use: "丙辛", desc: "仲冬极寒。丙火解冻为第一。辛金辅之。" },
    丑: { use: "丙辛", desc: "季冬寒极。丙火解冻不可或缺。" },
  },
};

/* 获取调候用神建议 */
function getTiaohuoAdvice(dayStem, monthBranch) {
  const stemData = TIAOHUO_TABLE[dayStem];
  if (!stemData) return null;
  const monthData = stemData[monthBranch];
  if (!monthData) return null;
  return {
    useGods: monthData.use.split(""),
    desc: monthData.desc,
    monthBranch,
    dayStem,
  };
}

/* ========================================================================
 * 十二长生宫 — 基于《三命通会》
 * 五行在十二地支中的旺衰状态
 * ======================================================================== */
const TWELVE_STAGES = ["长生", "沐浴", "冠带", "临官", "帝旺", "衰", "病", "死", "墓", "绝", "胎", "养"];

const TWELVE_STAGE_MEANINGS = {
  长生: { icon: "🌱", brief: "萌芽新生", detail: "如人之初生，万物发端，主聪明好学、有创造力。逢长生运主新机遇、新开始。" },
  沐浴: { icon: "🛁", brief: "脆弱波动", detail: "如婴儿沐浴，尚不自立。主桃花旺、多变动、感情波折。又名败地、咸池。" },
  冠带: { icon: "👑", brief: "成长渐强", detail: "如人成年加冠，开始独立。主有进取心、事业起步、渐露头角。" },
  临官: { icon: "🏛️", brief: "建功立业", detail: "如人入仕做官，事业鼎盛。主有地位、收入稳定、社会认可。又名建禄。" },
  帝旺: { icon: "⭐", brief: "巅峰极盛", detail: "如帝王在位，权势最大。主精力充沛、事业巅峰，但盛极必衰，宜守不宜进。" },
  衰: { icon: "🍂", brief: "由盛转衰", detail: "如人年迈，精力渐退。主保守、稳重，适合守成。身体需注意保养。" },
  病: { icon: "🤒", brief: "力量不足", detail: "如人染疾，活力下降。主做事力不从心，需要休养调整，不宜冒进。" },
  死: { icon: "💀", brief: "气息全无", detail: "如物之死灭，五行力量归零。但命理中死≠凶，主沉静、内敛、有玄学天赋。" },
  墓: { icon: "⚱️", brief: "收藏入库", detail: "如物入墓库收藏。主有积蓄、能守财，但也有封闭保守的倾向。墓库逢冲则开。" },
  绝: { icon: "🌑", brief: "气息断绝", detail: "旧气已绝，新气将孕。主置之死地而后生，逢绝处反有转机。" },
  胎: { icon: "🤰", brief: "孕育新生", detail: "如在母胎中孕育。主有计划、在酝酿中，尚未显现。蓄势待发之象。" },
  养: { icon: "🍼", brief: "蓄养待时", detail: "如母养育胎儿，万事待时。主得人照顾、有贵人缘，但尚未独立。" },
};

/* 五行长生起始地支（阳干顺行，阴干逆行）
 * 阳干: 甲长生在亥, 丙戊长生在寅, 庚长生在巳, 壬长生在申
 * 阴干: 乙长生在午, 丁己长生在酉, 辛长生在子, 癸长生在卯 */
const CHANGSHENG_START = {
  甲: { start: 11, dir: 1 },  // 亥=11, 顺行
  乙: { start: 6, dir: -1 },  // 午=6, 逆行
  丙: { start: 2, dir: 1 },   // 寅=2, 顺行
  丁: { start: 9, dir: -1 },  // 酉=9, 逆行
  戊: { start: 2, dir: 1 },   // 寅=2, 顺行（同丙）
  己: { start: 9, dir: -1 },  // 酉=9, 逆行（同丁）
  庚: { start: 5, dir: 1 },   // 巳=5, 顺行
  辛: { start: 0, dir: -1 },  // 子=0, 逆行
  壬: { start: 8, dir: 1 },   // 申=8, 顺行
  癸: { start: 3, dir: -1 },  // 卯=3, 逆行
};

/* 计算日主在各地支的十二长生状态 */
function getTwelveStage(dayStem, branch) {
  const cfg = CHANGSHENG_START[dayStem];
  if (!cfg) return null;
  const branchIdx = BRANCHES.indexOf(branch);
  const offset = cfg.dir === 1
    ? safeMod(branchIdx - cfg.start, 12)
    : safeMod(cfg.start - branchIdx, 12);
  const stage = TWELVE_STAGES[offset];
  return { stage, ...TWELVE_STAGE_MEANINGS[stage] };
}

/* 获取四柱的十二长生状态 */
function analyzeTwelveStages(pillars, dayStem) {
  const names = ["年支", "月支", "日支", "时支"];
  const stages = pillars.map((p, i) => {
    const info = getTwelveStage(dayStem, p.branch);
    return { position: names[i], branch: p.branch, ...info };
  });

  // 找出最旺和最弱的宫位
  const stageOrder = { 帝旺: 5, 临官: 4, 冠带: 3, 长生: 3, 养: 2, 胎: 1, 沐浴: 1, 衰: -1, 病: -2, 死: -3, 墓: -2, 绝: -3 };
  let summary = `日主${dayStem}在四柱地支的长生状态：`;
  stages.forEach(s => {
    summary += `${s.position}${s.branch}为"${s.stage}"；`;
  });
  const strongStages = stages.filter(s => ["帝旺", "临官", "冠带", "长生"].includes(s.stage));
  const weakStages = stages.filter(s => ["死", "绝", "墓", "病"].includes(s.stage));
  if (strongStages.length >= 2) summary += `日主逢多处旺地，根基深厚。`;
  else if (weakStages.length >= 2) summary += `日主逢多处弱地，需后天补强。`;

  return { stages, summary };
}

/* ========================================================================
 * 大运排盘 — 基于《渊海子平》
 * 阳男阴女顺行，阴男阳女逆行
 * 从月柱起，每步大运10年
 * ======================================================================== */
function calculateDaYun(pillars, gender, birth) {
  const yearStem = pillars[0].stem;
  const monthStem = pillars[1].stem;
  const monthBranch = pillars[1].branch;

  // 判断顺逆: 阳男阴女顺行，阴男阳女逆行
  const yearYinYang = STEM_YIN_YANG[yearStem]; // "阳" 或 "阴"
  const isMale = gender === "male";
  const isForward = (yearYinYang === "阳" && isMale) || (yearYinYang === "阴" && !isMale);

  // 计算起运年龄（从出生日到下一个/上一个节气的天数÷3）
  // 简化: 用月柱节气月中间值估算
  const birthDay = birth.getDate();
  // 近似: 每月约30天，取中间值15天作为节气点
  const daysToJieqi = isForward ? Math.max(1, 30 - birthDay) : Math.max(1, birthDay);
  const startAge = Math.max(1, Math.round(daysToJieqi / 3));

  // 月柱的干支索引
  const monthStemIdx = STEMS.indexOf(monthStem);
  const monthBranchIdx = BRANCHES.indexOf(monthBranch);

  // 排8步大运
  const steps = [];
  for (let i = 1; i <= 8; i++) {
    const offset = isForward ? i : -i;
    const stemIdx = safeMod(monthStemIdx + offset, 10);
    const branchIdx = safeMod(monthBranchIdx + offset, 12);
    const stem = STEMS[stemIdx];
    const branch = BRANCHES[branchIdx];
    const ageStart = startAge + (i - 1) * 10;
    const ageEnd = ageStart + 9;
    const yearStart = birth.getFullYear() + ageStart;
    const yearEnd = birth.getFullYear() + ageEnd;

    // 大运天干十神
    const dayStem = pillars[2].stem;
    const god = getTenGod(dayStem, stem);

    // 大运地支与日主的十二长生
    const stageInfo = getTwelveStage(dayStem, branch);

    // 评分
    const dayEl = STEM_ELEMENTS[dayStem];
    const yunEl = STEM_ELEMENTS[stem];
    let score = 65;
    // 用神喜忌判断（简化版）
    if (yunEl === dayEl || ELEMENT_GENERATED_BY[dayEl] === yunEl) score += 12;
    if (ELEMENT_OVERCOME_BY[dayEl] === yunEl) score -= 8;
    if (stageInfo && ["帝旺", "临官", "冠带", "长生"].includes(stageInfo.stage)) score += 8;
    if (stageInfo && ["死", "绝", "病"].includes(stageInfo.stage)) score -= 6;
    score = Math.min(92, Math.max(38, score));

    const isGood = score >= 72;
    const isCaution = score < 55;

    steps.push({
      stem, branch, element: STEM_ELEMENTS[stem],
      ageStart, ageEnd, yearStart, yearEnd,
      god, stage: stageInfo ? stageInfo.stage : "",
      score, isGood, isCaution,
      desc: `${god}运，地支${branch}为${stageInfo ? stageInfo.stage : "—"}`,
    });
  }

  return {
    direction: isForward ? "顺行" : "逆行",
    startAge,
    steps,
    desc: `${yearYinYang}年${isMale ? "男" : "女"}命，大运${isForward ? "顺行" : "逆行"}，${startAge}岁起运。`,
  };
}

/* ===== 大运 × 流年 × 命局 三重交互分析 =====
 * 依据：《滴天髓》"大运看十年之休咎，流年看一年之吉凶"
 * 命理实战中，大运与流年的合冲生克才是真正决定一年吉凶的关键。
 *
 * 对任一流年：
 *   1. 先定位其所属大运
 *   2. 分析流年干支与大运干支的合冲关系（双层交互）
 *   3. 分析流年干支与命局四柱（尤其日柱）的合冲关系
 *   4. 综合评分调整（在原有流年评分基础上做 ±15 的微调）
 */
function analyzeLiuYunInteraction(yearPillar, dayunStep, natalPillars, dayStem) {
  const out = {
    dayun: dayunStep ? `${dayunStep.stem}${dayunStep.branch}` : "—",
    events: [],   // 交互事件列表
    scoreAdjust: 0,
    tags: [],     // 标签：合/冲/刑/害/生/克
  };
  if (!yearPillar || !yearPillar.stem || !yearPillar.branch) return out;

  const yS = yearPillar.stem, yB = yearPillar.branch;

  // === 第一层：流年 × 大运 ===
  if (dayunStep) {
    const dS = dayunStep.stem, dB = dayunStep.branch;
    // 天干合
    const sk1 = yS + dS, sk2 = dS + yS;
    if (STEM_COMBINE[sk1] || STEM_COMBINE[sk2]) {
      const combo = STEM_COMBINE[sk1] || STEM_COMBINE[sk2];
      out.events.push(`流年天干${yS}与大运天干${dS}相合（${combo.name}→化${combo.result}）`);
      out.tags.push("合");
      out.scoreAdjust += 5;
    }
    // 天干冲
    if (STEM_CLASH[sk1] || STEM_CLASH[sk2]) {
      out.events.push(`流年天干${yS}与大运天干${dS}相冲，行动易受阻`);
      out.tags.push("冲");
      out.scoreAdjust -= 6;
    }
    // 地支六合
    const bk1 = yB + dB, bk2 = dB + yB;
    if (BRANCH_SIX_COMBINE[bk1] || BRANCH_SIX_COMBINE[bk2]) {
      const c = BRANCH_SIX_COMBINE[bk1] || BRANCH_SIX_COMBINE[bk2];
      out.events.push(`流年地支${yB}与大运地支${dB}六合（${c.name}）`);
      out.tags.push("合");
      out.scoreAdjust += 6;
    }
    // 地支六冲（最需警惕）
    if (BRANCH_SIX_CLASH[bk1] || BRANCH_SIX_CLASH[bk2]) {
      out.events.push(`⚠ 流年地支${yB}与大运地支${dB}相冲（${BRANCH_SIX_CLASH[bk1] || BRANCH_SIX_CLASH[bk2]}），主大变动`);
      out.tags.push("冲");
      out.scoreAdjust -= 10;
    }
    // 地支六害
    if (BRANCH_SIX_HARM[bk1] || BRANCH_SIX_HARM[bk2]) {
      out.events.push(`流年与大运地支相害（${BRANCH_SIX_HARM[bk1] || BRANCH_SIX_HARM[bk2]}），小人暗害`);
      out.tags.push("害");
      out.scoreAdjust -= 4;
    }
    // 伏吟/反吟（干支完全相同/完全相冲）
    if (yS === dS && yB === dB) {
      out.events.push(`⚠ 流年与大运干支完全相同（伏吟），易有旧事重演、压力加倍`);
      out.tags.push("伏吟");
      out.scoreAdjust -= 6;
    }
  }

  // === 第二层：流年 × 命局四柱 ===
  const names = ["年柱", "月柱", "日柱", "时柱"];
  natalPillars.forEach((p, i) => {
    // 天干合
    const sk1 = yS + p.stem, sk2 = p.stem + yS;
    if (STEM_COMBINE[sk1] || STEM_COMBINE[sk2]) {
      const c = STEM_COMBINE[sk1] || STEM_COMBINE[sk2];
      out.events.push(`流年${yS}与${names[i]}${p.stem}相合（${c.name}）`);
      out.tags.push("合");
      out.scoreAdjust += (i === 2 ? 6 : 3); // 合日主影响最大
    }
    if (STEM_CLASH[sk1] || STEM_CLASH[sk2]) {
      out.events.push(`⚠ 流年${yS}与${names[i]}${p.stem}相冲（${STEM_CLASH[sk1] || STEM_CLASH[sk2]}）`);
      out.tags.push("冲");
      out.scoreAdjust -= (i === 2 ? 8 : 4);
    }
    // 地支六合/六冲/六害
    const bk1 = yB + p.branch, bk2 = p.branch + yB;
    if (BRANCH_SIX_COMBINE[bk1] || BRANCH_SIX_COMBINE[bk2]) {
      const c = BRANCH_SIX_COMBINE[bk1] || BRANCH_SIX_COMBINE[bk2];
      out.events.push(`流年${yB}与${names[i]}${p.branch}六合（${c.name}）`);
      out.tags.push("合");
      out.scoreAdjust += (i === 2 ? 7 : 4);
    }
    if (BRANCH_SIX_CLASH[bk1] || BRANCH_SIX_CLASH[bk2]) {
      const tag = BRANCH_SIX_CLASH[bk1] || BRANCH_SIX_CLASH[bk2];
      out.events.push(`⚠ 流年${yB}冲${names[i]}${p.branch}（${tag}），${i === 2 ? "冲日支主婚姻/健康波动" : i === 0 ? "冲年支主长辈事" : i === 1 ? "冲月支主工作调动" : "冲时支主子女或晚辈事"}`);
      out.tags.push("冲");
      out.scoreAdjust -= (i === 2 ? 10 : i === 1 ? 7 : 5);
    }
    if (BRANCH_SIX_HARM[bk1] || BRANCH_SIX_HARM[bk2]) {
      out.events.push(`流年${yB}与${names[i]}${p.branch}相害`);
      out.tags.push("害");
      out.scoreAdjust -= 3;
    }
  });

  // === 三合局触发判断（流年地支 + 大运地支 + 命局地支凑齐三合） ===
  const allBranches = natalPillars.map(p => p.branch).concat(yB);
  if (dayunStep) allBranches.push(dayunStep.branch);
  BRANCH_THREE_COMBINE.forEach(c => {
    const hit = c.branches.every(b => allBranches.includes(b));
    const hasYearBranch = c.branches.includes(yB);
    if (hit && hasYearBranch) {
      out.events.push(`✨ 流年${yB}引动三合${c.name}→化${c.result}局成，大吉之象`);
      out.tags.push("三合");
      out.scoreAdjust += 8;
    }
  });

  // 限制调整幅度，避免极端
  if (out.scoreAdjust > 15) out.scoreAdjust = 15;
  if (out.scoreAdjust < -18) out.scoreAdjust = -18;

  // 无事件时补一句
  if (out.events.length === 0) {
    out.events.push(dayunStep ? `处${dayunStep.stem}${dayunStep.branch}大运，流年${yS}${yB}与命局大运无明显合冲，平稳过渡` : `流年${yS}${yB}与命局无明显合冲`);
  }

  return out;
}

/* ========================================================================
 * 【2026-04-22 升级】理论第一/第二梯队落地
 * 基于：《滴天髓阐微》（任铁樵注）· 《穷通宝鉴补注》（余春台）· 《子平真诠》八格完整版
 * ======================================================================== */

/* ---------- T2: 调候三维深化 ----------
 * 原 getTiaohuoAdvice 只做一维查表（日主×月）。
 * 本函数再扫一遍四柱，判断调候用神是否透干 / 藏支 / 不见。
 * 输出调候"显化度"：显用/藏用/失调
 */
function getTiaohuoAdviceDeep(dayStem, monthBranch, pillars) {
  const base = getTiaohuoAdvice(dayStem, monthBranch);
  if (!base) return null;
  const useGods = base.useGods; // 如 ["壬","甲","庚"]
  const allStems = pillars.map(p => p.stem).filter(Boolean);
  const allHidden = [];
  pillars.forEach(p => {
    if (BRANCH_HIDDEN_STEMS[p.branch]) {
      BRANCH_HIDDEN_STEMS[p.branch].forEach(h => allHidden.push(h.stem));
    }
  });
  const manifestDetail = useGods.map((g, idx) => {
    const transparent = allStems.includes(g);
    const hidden = !transparent && allHidden.includes(g);
    const priority = idx === 0 ? "第一用神" : idx === 1 ? "第二用神" : "第三用神";
    let status, weight;
    if (transparent) { status = "透干"; weight = 3; }
    else if (hidden) { status = "藏支"; weight = 2; }
    else { status = "不见"; weight = 0; }
    return { god: g, element: STEM_ELEMENTS[g], priority, status, weight };
  });
  const totalWeight = manifestDetail.reduce((s, x) => s + x.weight, 0);
  const maxWeight = useGods.length * 3;
  const ratio = maxWeight > 0 ? Math.round((totalWeight / maxWeight) * 100) : 0;
  let level, summary;
  if (ratio >= 70) { level = "显用"; summary = `调候用神充分显现（${ratio}%），命局寒暖燥湿调和有力`; }
  else if (ratio >= 35) { level = "藏用"; summary = `调候用神藏于地支（${ratio}%），需大运流年引动方显其力`; }
  else { level = "失调"; summary = `调候用神缺失（${ratio}%），命局寒暖燥湿偏颇，期待大运补足`; }
  // 取主透用神（用于"实际可用用神"推断）
  const primaryManifest = manifestDetail.find(m => m.status === "透干")
    || manifestDetail.find(m => m.status === "藏支")
    || manifestDetail[0];
  return {
    ...base,
    manifestDetail,
    manifestRatio: ratio,
    manifestLevel: level,
    manifestSummary: summary,
    primaryManifest,
  };
}

/* ---------- T1: 用神三法合参 ----------
 * 《滴天髓阐微》"扶抑、调候、格局"三法综合定用神。
 * 三法各给一个推荐，若三法结果重叠→用神强确信，若分歧→按优先级取舍：
 *   - 严寒酷暑（月令处于 子丑 / 午未）→ 调候优先
 *   - 身极弱/极强（level≤2 或 ≥6）→ 扶抑优先
 *   - 中等身强弱 → 格局优先
 */
function determineUsefulGodAdvanced(strengthResult, dayStem, pillars, tiaohuoAdviceDeep, patternResult) {
  const dayEl = STEM_ELEMENTS[dayStem];
  const baseResult = determineUsefulGod(strengthResult, dayStem);
  const reasoning = [];

  // —— 第一法：扶抑（基于身强弱，已在 determineUsefulGod 里算完）——
  const fuyiElement = baseResult.useGodElement;
  const fuyiGod = baseResult.useGod;
  reasoning.push({
    method: "扶抑",
    rule: "《滴天髓》「能扶则扶，不能扶则抑」",
    dayStemState: `日主${strengthResult.label}（${strengthResult.strengthScore}分）`,
    recommendation: `${fuyiGod}（${fuyiElement}）`,
    detail: baseResult.useGodDesc,
  });

  // —— 第二法：调候（基于月令，表驱动）——
  let tiaohuoGod = null, tiaohuoElement = null, tiaohuoDetail = "";
  if (tiaohuoAdviceDeep && tiaohuoAdviceDeep.primaryManifest) {
    tiaohuoGod = tiaohuoAdviceDeep.primaryManifest.god;
    tiaohuoElement = tiaohuoAdviceDeep.primaryManifest.element;
    tiaohuoDetail = `${tiaohuoAdviceDeep.desc} 首取${tiaohuoGod}（${tiaohuoAdviceDeep.primaryManifest.status}）`;
  } else if (tiaohuoAdviceDeep) {
    tiaohuoGod = tiaohuoAdviceDeep.useGods[0];
    tiaohuoElement = STEM_ELEMENTS[tiaohuoGod];
    tiaohuoDetail = tiaohuoAdviceDeep.desc || "";
  }
  reasoning.push({
    method: "调候",
    rule: "《穷通宝鉴》「调候为急，不可一日无」",
    dayStemState: `${dayStem}日生于${pillars[1].branch}月，${tiaohuoAdviceDeep ? tiaohuoAdviceDeep.manifestLevel : "—"}`,
    recommendation: tiaohuoGod ? `${tiaohuoGod}（${tiaohuoElement}）` : "—",
    detail: tiaohuoDetail,
  });

  // —— 第三法：格局（基于月令透干）——
  let gejuGod = null, gejuElement = null, gejuDetail = "";
  if (patternResult && patternResult.mainPattern) {
    const patName = patternResult.mainPattern.name;
    // 格局喜用映射：哪些十神是当前格局的"相神/救应神"
    const patToGod = {
      正官格: { xi: ELEMENT_GENERATED_BY[dayEl], godName: "印星（官印相生）" },
      七杀格: { xi: ELEMENT_GENERATE[dayEl], godName: "食神（食神制杀）" },
      正财格: { xi: ELEMENT_OVERCOME[dayEl], godName: "财星本位（已得用）" },
      偏财格: { xi: ELEMENT_GENERATE[dayEl], godName: "食伤（食伤生财）" },
      正印格: { xi: ELEMENT_OVERCOME_BY[dayEl], godName: "官星（官印相生）" },
      偏印格: { xi: ELEMENT_OVERCOME_BY[dayEl], godName: "七杀（杀印相生）" },
      食神格: { xi: ELEMENT_OVERCOME[dayEl], godName: "财星（食神生财）" },
      伤官格: { xi: ELEMENT_GENERATED_BY[dayEl], godName: "印星（伤官配印）" },
    };
    const mapping = patToGod[patName];
    if (mapping) {
      gejuElement = mapping.xi;
      gejuGod = mapping.godName;
      gejuDetail = `${patName}成立，取${mapping.godName}为相神护格`;
    } else {
      gejuDetail = `${patName}，灵活取用`;
    }
  }
  reasoning.push({
    method: "格局",
    rule: "《子平真诠》「用神即月令所透」",
    dayStemState: patternResult?.mainPattern?.name || "—",
    recommendation: gejuGod ? `${gejuGod}（${gejuElement}）` : "—",
    detail: gejuDetail,
  });

  // —— 三法合参裁决 ——
  const votes = {};
  [fuyiElement, tiaohuoElement, gejuElement].forEach(el => {
    if (el) votes[el] = (votes[el] || 0) + 1;
  });
  const sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  let consensusElement, consensusMethod, confidence;
  const monthBranch = pillars[1].branch;
  const isExtremeClimate = ["子", "丑", "午", "未"].includes(monthBranch);
  const isExtremeStrength = strengthResult.level <= 2 || strengthResult.level >= 6;

  if (sortedVotes.length > 0 && sortedVotes[0][1] >= 2) {
    // 多法重合
    consensusElement = sortedVotes[0][0];
    confidence = sortedVotes[0][1] === 3 ? "三法合一" : "两法合参";
    const methodsHit = [
      { m: "扶抑", el: fuyiElement },
      { m: "调候", el: tiaohuoElement },
      { m: "格局", el: gejuElement },
    ].filter(x => x.el === consensusElement).map(x => x.m);
    consensusMethod = methodsHit.join(" + ");
  } else if (isExtremeClimate) {
    consensusElement = tiaohuoElement || fuyiElement;
    consensusMethod = "调候优先";
    confidence = "调候主导（严寒/酷暑月令）";
  } else if (isExtremeStrength) {
    consensusElement = fuyiElement;
    consensusMethod = "扶抑优先";
    confidence = "扶抑主导（身极强/极弱）";
  } else {
    consensusElement = gejuElement || fuyiElement;
    consensusMethod = "格局优先";
    confidence = "格局主导（身平和，以月令格取用）";
  }

  // —— 自然语言推理句（核心"可解释性"输出）——
  const narrative = buildUsefulGodNarrative({
    dayStem, dayEl, pillars, strengthResult,
    tiaohuoAdviceDeep, patternResult,
    fuyiElement, tiaohuoElement, gejuElement,
    consensusElement, consensusMethod, confidence,
  });

  return {
    ...baseResult,
    // 新增三法合参结果
    reasoning,
    consensusElement,
    consensusMethod,
    confidence,
    narrative,
    // 各法结果
    fuyiElement, tiaohuoElement, gejuElement,
    // 原 useGodElement 若与 consensus 不同，给出提示
    conflictNote: consensusElement !== baseResult.useGodElement
      ? `注：单纯扶抑推得"${baseResult.useGodElement}"，三法合参后修正为"${consensusElement}"（${consensusMethod}）`
      : null,
  };
}

/* 用神推理的自然语言生成 */
function buildUsefulGodNarrative({ dayStem, dayEl, pillars, strengthResult, tiaohuoAdviceDeep, patternResult, fuyiElement, tiaohuoElement, gejuElement, consensusElement, consensusMethod, confidence }) {
  const parts = [];
  const monthBranch = pillars[1].branch;
  // 首句：身强弱定调
  parts.push(`${dayStem}${dayEl}日主生于${monthBranch}月，${strengthResult.monthStatus || ""}，综合四柱得${strengthResult.strengthScore}分，判为「${strengthResult.label}」。`);
  // 调候定势
  if (tiaohuoAdviceDeep) {
    parts.push(`调候层面，${tiaohuoAdviceDeep.desc} 当前命局调候用神${tiaohuoAdviceDeep.manifestLevel}（${tiaohuoAdviceDeep.manifestRatio}%），${tiaohuoAdviceDeep.manifestSummary.split('，')[1] || ''}。`);
  }
  // 格局落点
  if (patternResult?.mainPattern) {
    parts.push(`格局层面，月令${monthBranch}透出${patternResult.monthMainGod || '杂气'}，成${patternResult.mainPattern.name}。`);
  }
  // 三法结论
  parts.push(`三法合参：扶抑取${fuyiElement || '—'}、调候取${tiaohuoElement || '—'}、格局取${gejuElement || '—'}——${confidence}，终以「${consensusElement}」为核心用神（${consensusMethod}）。`);
  return parts.join("");
}

/* ---------- T3: 格局扩展（正格 8 + 变格 8 + 特殊 15 + 破格救应） ---------- */
/* 变格判断：从格系列（从财/从杀/从儿/从势）+ 化气格 + 专旺格 */
function detectTransformationPattern(pillars, dayStem, strengthResult, tenGodResult) {
  const result = { hasTransform: false, name: "", desc: "", type: "" };
  const gc = tenGodResult.counts || {};
  const score = strengthResult.strengthScore;

  // —— 从格（score 极低 → 从弱）——
  if (score <= 20) {
    const officerCount = (gc["正官"] || 0) + (gc["七杀"] || 0);
    const wealthCount = (gc["正财"] || 0) + (gc["偏财"] || 0);
    const foodCount = (gc["食神"] || 0) + (gc["伤官"] || 0);
    if (officerCount >= 3 && wealthCount === 0 && foodCount === 0) {
      return { hasTransform: true, name: "从杀格", type: "从格", desc: "日主极弱，满局官杀，弃命从杀。主人虽身弱却能借势成事，常依附于强者平台而发迹，忌印比帮身破格。" };
    }
    if (wealthCount >= 3 && officerCount === 0) {
      return { hasTransform: true, name: "从财格", type: "从格", desc: "日主极弱，满局财星，弃命从财。主富而多能，以财为命，忌比劫夺财破格。" };
    }
    if (foodCount >= 3) {
      return { hasTransform: true, name: "从儿格", type: "从格", desc: "日主极弱，食伤当旺，弃命从儿。主秀气流行、才华横溢，以子女/作品为荣，忌印星夺食破格。" };
    }
    return { hasTransform: true, name: "从势格", type: "从格", desc: "日主极弱，无一力可倚，随势而行。一生成败系于外缘，顺势则通。" };
  }

  // —— 专旺格（score 极高，满局比劫印 + 无官杀克）——
  if (score >= 85) {
    const helpCount = (gc["比肩"] || 0) + (gc["劫财"] || 0) + (gc["正印"] || 0) + (gc["偏印"] || 0);
    const controlCount = (gc["正官"] || 0) + (gc["七杀"] || 0);
    if (helpCount >= 5 && controlCount === 0) {
      const dayEl = STEM_ELEMENTS[dayStem];
      const names = { 木: "曲直仁寿格", 火: "炎上格", 土: "稼穑格", 金: "从革格", 水: "润下格" };
      return { hasTransform: true, name: names[dayEl] || "专旺格", type: "专旺格", desc: `日主极强，五行归一于${dayEl}，顺其势则大富大贵，忌官杀克身破格。` };
    }
  }

  // —— 化气格（日主与月干或时干相合且合化五行得令）——
  const dayEl = STEM_ELEMENTS[dayStem];
  const combosWithDay = [
    { partner: ["甲", "己"], el: "土", name: "化土格" },
    { partner: ["乙", "庚"], el: "金", name: "化金格" },
    { partner: ["丙", "辛"], el: "水", name: "化水格" },
    { partner: ["丁", "壬"], el: "木", name: "化木格" },
    { partner: ["戊", "癸"], el: "火", name: "化火格" },
  ];
  for (const c of combosWithDay) {
    if (c.partner.includes(dayStem)) {
      const other = c.partner.find(x => x !== dayStem);
      const monthStem = pillars[1].stem;
      const hourStem = pillars[3].stem;
      if ((monthStem === other || hourStem === other) && STEM_ELEMENTS[pillars[1].branch ? BRANCH_HIDDEN_STEMS[pillars[1].branch][0].stem : ""] === c.el) {
        return { hasTransform: true, name: c.name, type: "化气格", desc: `${dayStem}${other}相合化${c.el}，且月令${c.el}旺相，化气真成。主命格奇特、成就非凡，但须一生护格不破。` };
      }
    }
  }
  return result;
}

/* 特殊格局扩展（15 种） */
function detectSpecialPatternsExtended(pillars, dayStem, strengthResult, tenGodResult) {
  const extras = [];
  const gc = tenGodResult.counts || {};
  const branches = pillars.map(p => p.branch);
  const stems = pillars.map(p => p.stem);
  const monthBranch = pillars[1].branch;
  const dayEl = STEM_ELEMENTS[dayStem];

  // 建禄格（月令为日主禄神）
  const lushenMap = { 甲: "寅", 乙: "卯", 丙: "巳", 丁: "午", 戊: "巳", 己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子" };
  if (lushenMap[dayStem] === monthBranch) {
    extras.push({ name: "建禄格", desc: "月令为日主禄神，根基深厚，主白手起家、自食其力。忌比劫过重破财。" });
  }
  // 月刃格（月令为日主羊刃）
  const yangrenMap = { 甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子" };
  if (yangrenMap[dayStem] === monthBranch) {
    extras.push({ name: "月刃格", desc: "月令为日主羊刃，气势刚猛，宜官杀制伏方成大器。忌财轻杀重或财党七杀。" });
  }
  // 天元一气（四天干或四地支完全相同）
  if (stems[0] === stems[1] && stems[1] === stems[2] && stems[2] === stems[3]) {
    extras.push({ name: "天元一气", desc: "四天干完全相同，气势纯粹，主人意志坚定、一生专注一事而成。" });
  }
  if (branches[0] === branches[1] && branches[1] === branches[2] && branches[2] === branches[3]) {
    extras.push({ name: "地支一气", desc: "四地支完全相同，气势极纯，主人格局独特、或大成或大败。" });
  }
  // 六乙鼠贵（乙日见子时）
  if (dayStem === "乙" && branches[3] === "子") {
    extras.push({ name: "六乙鼠贵", desc: "乙日子时，暗合官星，主清贵、文名。忌见午冲、见庚辛明官破格。" });
  }
  // 六阴朝阳（辛日戊子时）
  if (dayStem === "辛" && stems[3] === "戊" && branches[3] === "子") {
    extras.push({ name: "六阴朝阳", desc: "辛日戊子时，阴极而阳生，主柔中带刚、终得显达。" });
  }
  // 拱禄格（日时拱日主禄位）
  const posLushen = lushenMap[dayStem];
  if (posLushen) {
    const ahead = BRANCHES[safeMod(BRANCHES.indexOf(posLushen) - 1, 12)];
    const after = BRANCHES[safeMod(BRANCHES.indexOf(posLushen) + 1, 12)];
    if ((branches[2] === ahead && branches[3] === after) || (branches[2] === after && branches[3] === ahead)) {
      extras.push({ name: "拱禄格", desc: "日时地支拱夹日主禄位，暗藏福泽，主衣食丰足、不劳而获。" });
    }
  }
  // 井栏叉格（庚申/庚子/庚辰三合）
  if (dayStem === "庚" && ["申", "子", "辰"].filter(b => branches.includes(b)).length >= 2) {
    extras.push({ name: "井栏叉格", desc: "庚金日主得申子辰三合水局，主文学武艺俱佳、声名远扬。" });
  }
  // 魁罡格（日柱为庚辰/庚戌/壬辰/戊戌）
  const kuigang = ["庚辰", "庚戌", "壬辰", "戊戌"];
  if (kuigang.includes(dayStem + pillars[2].branch)) {
    extras.push({ name: "魁罡格", desc: "日柱逢魁罡，主人聪明果断、性烈如火。男命掌权，女命多独立自强。忌逢刑冲。" });
  }
  // 金神格（日或时见 癸酉/己巳/乙丑 且命局火旺）
  const jinshen = ["癸酉", "己巳", "乙丑"];
  const hasJinshen = [pillars[2], pillars[3]].some(p => jinshen.includes(p.stem + p.branch));
  if (hasJinshen) {
    const hasFire = pillars.some(p => ["丙", "丁"].includes(p.stem) || ["巳", "午"].includes(p.branch));
    if (hasFire) extras.push({ name: "金神格", desc: "日时见金神（癸酉/己巳/乙丑），命局火旺制金，主勇猛果决、掌兵权或大权。" });
  }
  // 日德格（日柱甲寅/丙辰/戊辰/庚辰/壬戌）
  const riDe = ["甲寅", "丙辰", "戊辰", "庚辰", "壬戌"];
  if (riDe.includes(dayStem + pillars[2].branch)) {
    extras.push({ name: "日德格", desc: "日柱逢日德，主人心性仁厚、福泽绵长、逢凶化吉。" });
  }
  // 时上一位贵（时柱独透官杀，身强有制）
  const hourStem = stems[3];
  if (hourStem) {
    const hourGod = getTenGod(dayStem, hourStem);
    if ((hourGod === "正官" || hourGod === "七杀") && strengthResult.isStrong) {
      const sameOtherPos = [stems[0], stems[1]].filter(s => s && getTenGod(dayStem, s) === hourGod).length;
      if (sameOtherPos === 0) extras.push({ name: "时上一位贵格", desc: `时柱独透${hourGod}，身强有制，主晚年贵显，子女有出息。` });
    }
  }
  // 飞天禄马（庚子日多子字 或 辛亥日多亥字 冲出官贵）
  if (dayStem === "庚" && pillars[2].branch === "子" && branches.filter(b => b === "子").length >= 3) {
    extras.push({ name: "飞天禄马", desc: "庚子日多子字，冲出午中丁火官星，主以柔克刚、一鸣惊人。" });
  }
  if (dayStem === "辛" && pillars[2].branch === "亥" && branches.filter(b => b === "亥").length >= 3) {
    extras.push({ name: "飞天禄马", desc: "辛亥日多亥字，冲出巳中丙火官星，主贵气非凡。" });
  }
  // 食神生财（食伤+财同透干）
  const foodCnt = (gc["食神"] || 0) + (gc["伤官"] || 0);
  const wealthCnt = (gc["正财"] || 0) + (gc["偏财"] || 0);
  if (foodCnt >= 1 && wealthCnt >= 1) {
    const foodInStem = stems.some(s => s && ["食神", "伤官"].includes(getTenGod(dayStem, s)));
    const wealthInStem = stems.some(s => s && ["正财", "偏财"].includes(getTenGod(dayStem, s)));
    if (foodInStem && wealthInStem && strengthResult.isStrong) {
      if (!extras.find(e => e.name === "食神生财")) {
        extras.push({ name: "食神生财", desc: "食伤与财星并透，日主有力，才华直接变现。越努力越富，靠本事赚钱。" });
      }
    }
  }
  return extras;
}

/* 破格 / 救应判断 */
function detectBreakAndRescue(pillars, dayStem, tenGodResult, mainPatternName) {
  const gc = tenGodResult.counts || {};
  const notes = [];
  // 官见伤官 → 破格；有印 → 救应
  if (mainPatternName === "正官格" && (gc["伤官"] || 0) >= 1) {
    if ((gc["正印"] || 0) >= 1 || (gc["偏印"] || 0) >= 1) {
      notes.push({ type: "救应", content: "正官格见伤官本为破格，幸有印星化伤护官，反成伤官配印之贵。" });
    } else {
      notes.push({ type: "破格", content: "正官格见伤官无制，官星受克，主功名多阻、与上级不合。" });
    }
  }
  // 七杀格无食制也无印化 → 破格
  if (mainPatternName === "七杀格") {
    const hasFood = (gc["食神"] || 0) >= 1;
    const hasSeal = (gc["正印"] || 0) + (gc["偏印"] || 0) >= 1;
    if (!hasFood && !hasSeal) {
      notes.push({ type: "破格", content: "七杀格无食制亦无印化，杀星攻身无制，一生多灾多险，须靠大运救应。" });
    } else if (hasFood) {
      notes.push({ type: "成格", content: "七杀格得食神制杀，化凶为吉，主有权威、掌实权。" });
    } else if (hasSeal) {
      notes.push({ type: "成格", content: "七杀格得印化杀，文武兼备，贵气显赫。" });
    }
  }
  // 财格逢比劫 → 破格；有官杀制比劫 → 救应
  if ((mainPatternName === "正财格" || mainPatternName === "偏财格")
    && ((gc["比肩"] || 0) + (gc["劫财"] || 0)) >= 2) {
    if ((gc["正官"] || 0) + (gc["七杀"] || 0) >= 1) {
      notes.push({ type: "救应", content: `${mainPatternName}逢比劫争财本为破格，幸有官杀制比劫护财，财官并美。` });
    } else {
      notes.push({ type: "破格", content: `${mainPatternName}逢比劫夺财无制，主财来财去、合伙纠纷，须防朋友借贷。` });
    }
  }
  // 印格遭财破 → 破格；有比劫护印 → 救应
  if ((mainPatternName === "正印格" || mainPatternName === "偏印格")
    && ((gc["正财"] || 0) + (gc["偏财"] || 0)) >= 2) {
    if ((gc["比肩"] || 0) + (gc["劫财"] || 0) >= 1) {
      notes.push({ type: "救应", content: `${mainPatternName}逢财破印本为破格，幸有比劫制财护印，反成富贵双全。` });
    } else {
      notes.push({ type: "破格", content: `${mainPatternName}逢财破印无制，主学业受阻、母缘薄、文书是非。` });
    }
  }
  // 食神格逢枭印 → 破格；有财制枭 → 救应
  if (mainPatternName === "食神格" && (gc["偏印"] || 0) >= 1) {
    if ((gc["正财"] || 0) + (gc["偏财"] || 0) >= 1) {
      notes.push({ type: "救应", content: "食神格遇枭神夺食本为破格，幸有财星制枭护食，反主富贵。" });
    } else {
      notes.push({ type: "破格", content: "食神格遇枭神夺食无制（枭印夺食），主才华被压、创业受挫、食禄不丰。" });
    }
  }
  // 伤官见官（在非配印结构下）
  if (mainPatternName === "伤官格" && (gc["正官"] || 0) >= 1) {
    if ((gc["正印"] || 0) + (gc["偏印"] || 0) >= 1) {
      notes.push({ type: "救应", content: "伤官见官得印通关，反成伤官配印，才华与地位兼备。" });
    } else {
      notes.push({ type: "破格", content: "伤官见官无印通关，为命书大忌，主是非官讼、与权威对抗。" });
    }
  }
  return notes;
}

/* 扩展格局主入口：在原 determinePattern 基础上再叠加 变格 + 特殊 + 破格救应 */
function determinePatternExtended(pillars, dayStem, strengthResult, tenGodResult) {
  const base = determinePattern(pillars, dayStem, strengthResult, tenGodResult);
  // 变格优先（从格/化气/专旺）——一旦成变格，主格退位
  const transform = detectTransformationPattern(pillars, dayStem, strengthResult, tenGodResult);
  // 特殊格局（可与正格并存）
  const extraSpecials = detectSpecialPatternsExtended(pillars, dayStem, strengthResult, tenGodResult);
  // 破格救应
  const breakRescue = detectBreakAndRescue(pillars, dayStem, tenGodResult, base.mainPattern.name);

  // 合并特殊格局
  const allSpecials = [...(base.specialPatterns || []), ...extraSpecials];

  // 如果成变格，主格以变格代替
  let finalMain = base.mainPattern;
  let displayName = base.mainPattern.name;
  if (transform.hasTransform) {
    finalMain = { name: transform.name, brief: transform.desc.split("。")[0], desc: transform.desc };
    displayName = `${transform.name}（原${base.mainPattern.name}被变格取代）`;
  }

  // 生成综合结论
  const conclusionParts = [];
  conclusionParts.push(`此命主格：${displayName}。`);
  if (allSpecials.length > 0) {
    conclusionParts.push(`另兼${allSpecials.map(s => s.name).join("、")}${allSpecials.length > 1 ? "等" : ""}特殊格局。`);
  }
  if (breakRescue.length > 0) {
    const successCount = breakRescue.filter(r => r.type === "成格" || r.type === "救应").length;
    const breakCount = breakRescue.filter(r => r.type === "破格").length;
    if (successCount > 0 && breakCount === 0) conclusionParts.push("格局清纯有成。");
    else if (breakCount > 0 && successCount > 0) conclusionParts.push("格局虽有瑕疵，得救应化解，仍属可用之局。");
    else if (breakCount > 0) conclusionParts.push("⚠ 格局有破无救，须靠大运流年补救。");
  }

  return {
    ...base,
    transformPattern: transform.hasTransform ? transform : null,
    finalMain,
    specialPatterns: allSpecials,
    hasSpecial: allSpecials.length > 0,
    breakRescue,
    extendedConclusion: conclusionParts.join(""),
  };
}

/* ---------- T5: 大运起运精确化到时辰 ----------
 * 依据：阳男阴女顺行，阴男阳女逆行；从出生时辰到下一/上一节气的"时辰数"除以 3 得起运岁数。
 * 精确到 {岁, 月, 日}，需要 lunar.js 的节气表。
 * 若 lunar 不可用则回退到原简化算法。
 */
function calculateDaYunPrecise(pillars, gender, birth) {
  // 尝试使用 lunar.js 的 SolarTerm 节气接口
  try {
    if (typeof Solar !== "undefined") {
      const yearStem = pillars[0].stem;
      const yearYinYang = STEM_YIN_YANG[yearStem];
      const isMale = gender === "male";
      const isForward = (yearYinYang === "阳" && isMale) || (yearYinYang === "阴" && !isMale);

      const solar = Solar.fromYmdHms(
        birth.getFullYear(), birth.getMonth() + 1, birth.getDate(),
        birth.getHours(), birth.getMinutes(), birth.getSeconds ? birth.getSeconds() : 0
      );
      const lunar = solar.getLunar();
      const jieQiTable = lunar.getJieQiTable();
      // 节气关键点：本月令节 → 下一个节/上一个节
      const jieNames = ["立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"];
      const allJieTimes = jieNames.map(name => ({
        name,
        date: jieQiTable[name] ? jieQiTable[name].getSolar() : null,
      })).filter(x => x.date).map(x => ({
        name: x.name,
        ms: new Date(x.date.getYear(), x.date.getMonth() - 1, x.date.getDay(), x.date.getHour() || 0, x.date.getMinute() || 0).getTime(),
      }));
      const birthMs = birth.getTime();
      let targetMs;
      if (isForward) {
        const next = allJieTimes.find(j => j.ms > birthMs);
        targetMs = next ? next.ms : null;
      } else {
        const past = [...allJieTimes].reverse().find(j => j.ms <= birthMs);
        targetMs = past ? past.ms : null;
      }
      if (targetMs) {
        const diffMs = Math.abs(targetMs - birthMs);
        const diffHours = diffMs / (1000 * 60 * 60);
        // 3 天 = 1 年 → 72 小时 = 1 年 → 每小时 = 1/72 年
        // 更传统：3 日折 1 岁，1 日折 4 月，1 时折 10 日
        const totalYears = diffHours / 72;
        const startAgeYears = Math.floor(totalYears);
        const remainMonths = Math.floor((totalYears - startAgeYears) * 12);
        const remainDays = Math.floor(((totalYears - startAgeYears) * 12 - remainMonths) * 30);
        const startAge = Math.max(1, Math.round(totalYears));
        // 月柱索引（用于排大运）
        const monthStem = pillars[1].stem;
        const monthBranch = pillars[1].branch;
        const monthStemIdx = STEMS.indexOf(monthStem);
        const monthBranchIdx = BRANCHES.indexOf(monthBranch);

        const steps = [];
        for (let i = 1; i <= 8; i++) {
          const offset = isForward ? i : -i;
          const stemIdx = safeMod(monthStemIdx + offset, 10);
          const branchIdx = safeMod(monthBranchIdx + offset, 12);
          const stem = STEMS[stemIdx];
          const branch = BRANCHES[branchIdx];
          const ageStart = startAge + (i - 1) * 10;
          const ageEnd = ageStart + 9;
          const yearStart = birth.getFullYear() + ageStart;
          const yearEnd = birth.getFullYear() + ageEnd;
          const dayStem = pillars[2].stem;
          const god = getTenGod(dayStem, stem);
          const stageInfo = getTwelveStage(dayStem, branch);
          const dayEl = STEM_ELEMENTS[dayStem];
          const yunEl = STEM_ELEMENTS[stem];
          let score = 65;
          if (yunEl === dayEl || ELEMENT_GENERATED_BY[dayEl] === yunEl) score += 12;
          if (ELEMENT_OVERCOME_BY[dayEl] === yunEl) score -= 8;
          if (stageInfo && ["帝旺", "临官", "冠带", "长生"].includes(stageInfo.stage)) score += 8;
          if (stageInfo && ["死", "绝", "病"].includes(stageInfo.stage)) score -= 6;
          score = Math.min(92, Math.max(38, score));
          steps.push({
            stem, branch, element: STEM_ELEMENTS[stem],
            ageStart, ageEnd, yearStart, yearEnd,
            god, stage: stageInfo ? stageInfo.stage : "",
            score, isGood: score >= 72, isCaution: score < 55,
            desc: `${god}运，地支${branch}为${stageInfo ? stageInfo.stage : "—"}`,
          });
        }

        return {
          direction: isForward ? "顺行" : "逆行",
          startAge,
          startAgePrecise: { years: startAgeYears, months: remainMonths, days: remainDays },
          precise: true,
          steps,
          desc: `${yearYinYang}年${isMale ? "男" : "女"}命，大运${isForward ? "顺行" : "逆行"}，精确起运：${startAgeYears}岁${remainMonths}月${remainDays}日（约${startAge}岁）。`,
        };
      }
    }
  } catch (e) {
    // 节气数据获取失败，回退
  }
  // 回退：使用原简化版
  const fallback = calculateDaYun(pillars, gender, birth);
  return { ...fallback, precise: false };
}

/* ---------- T7: 补齐辅助盘位（胎元/命宫/身宫/小运/童限） ---------- */
function calculateAuxiliaryPoints(pillars, gender, birth) {
  const monthStem = pillars[1].stem;
  const monthBranch = pillars[1].branch;
  const dayBranch = pillars[2].branch;
  const hourBranch = pillars[3].branch;

  // —— 胎元 ——《三命通会》：月干进一位，月支进三位
  const taiStemIdx = safeMod(STEMS.indexOf(monthStem) + 1, 10);
  const taiBranchIdx = safeMod(BRANCHES.indexOf(monthBranch) + 3, 12);
  const taiyuan = { stem: STEMS[taiStemIdx], branch: BRANCHES[taiBranchIdx], desc: "月干进一位、月支进三位，为受孕之月，主先天禀赋与胎教影响。" };

  // —— 命宫 ——《渊海子平》：以月支 + 时支 安命
  // 口诀：子位起正月数到生月，再从卯时起逆数到生时
  const monthIdx = BRANCHES.indexOf(monthBranch); // 月支序号（寅=0 为正月？此处按 子=0 等天干地支序）
  const hourIdx = BRANCHES.indexOf(hourBranch);
  // 传统算法：命宫 = (14 - 生月地支序 - 生时地支序) mod 12，其中月支以寅为 1（正月）
  const yinStartIdx = 2; // 寅
  const monthFromYin = safeMod(monthIdx - yinStartIdx + 1, 12) + 1; // 正月=1
  const hourFromZi = hourIdx + 1; // 子=1
  const mingGongBranchIdx = safeMod(14 - monthFromYin - hourFromZi, 12);
  const mingGongBranch = BRANCHES[mingGongBranchIdx];
  // 命宫天干（五虎遁年起月法，按年干）
  const yearStem = pillars[0].stem;
  const wuhuMap = { 甲: "丙", 己: "丙", 乙: "戊", 庚: "戊", 丙: "庚", 辛: "庚", 丁: "壬", 壬: "壬", 戊: "甲", 癸: "甲" };
  const yinStem = wuhuMap[yearStem] || "丙";
  const mingGongStemIdx = safeMod(STEMS.indexOf(yinStem) + (mingGongBranchIdx - yinStartIdx + 12) % 12, 10);
  const mingGong = { stem: STEMS[mingGongStemIdx], branch: mingGongBranch, desc: "命宫为后天运势枢纽，主人性格倾向与一生事业重心。" };

  // —— 身宫 —— 月支 + 时支顺数（与命宫相对）
  const shenGongBranchIdx = safeMod(monthFromYin + hourFromZi + 1, 12);
  const shenGongBranch = BRANCHES[shenGongBranchIdx];
  const shenGongStemIdx = safeMod(STEMS.indexOf(yinStem) + (shenGongBranchIdx - yinStartIdx + 12) % 12, 10);
  const shenGong = { stem: STEMS[shenGongStemIdx], branch: shenGongBranch, desc: "身宫主中晚年归宿，看内在志向与晚年依托。" };

  // —— 小运 —— 阳男阴女从丙寅起顺行，阴男阳女从壬申起逆行；每年一步，1-8岁最关键
  const yearYinYang = STEM_YIN_YANG[yearStem];
  const isMale = gender === "male";
  const isForward = (yearYinYang === "阳" && isMale) || (yearYinYang === "阴" && !isMale);
  const xiaoYunStart = isForward ? { s: "丙", b: "寅" } : { s: "壬", b: "申" };
  const xsIdx = STEMS.indexOf(xiaoYunStart.s), xbIdx = BRANCHES.indexOf(xiaoYunStart.b);
  const xiaoyun = [];
  for (let i = 0; i < 8; i++) {
    const offset = isForward ? i : -i;
    xiaoyun.push({
      age: i + 1,
      stem: STEMS[safeMod(xsIdx + offset, 10)],
      branch: BRANCHES[safeMod(xbIdx + offset, 12)],
    });
  }

  // —— 童限 —— 起运前的过渡期，以小运为主
  const tongxian = { ageEnd: xiaoyun.length || 8, desc: "起运前（约 1-8 岁）以小运为主，逐年流转，主童年体质与学业早慧程度。" };

  return { taiyuan, mingGong, shenGong, xiaoyun, tongxian };
}

/* 暴露到 window（浏览器直接脚本加载） */
if (typeof window !== "undefined") {
  window.getTiaohuoAdviceDeep = getTiaohuoAdviceDeep;
  window.determineUsefulGodAdvanced = determineUsefulGodAdvanced;
  window.determinePatternExtended = determinePatternExtended;
  window.detectTransformationPattern = detectTransformationPattern;
  window.detectSpecialPatternsExtended = detectSpecialPatternsExtended;
  window.detectBreakAndRescue = detectBreakAndRescue;
  window.calculateDaYunPrecise = calculateDaYunPrecise;
  window.calculateAuxiliaryPoints = calculateAuxiliaryPoints;
}
