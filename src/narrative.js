/* ===== 十神深度分析生成 ===== */
function generateTenGodAnalysis(ctx) {
  const { completeTenGods, tenGods, pillars, dayStem, gender, strengthResult, usefulGod } = ctx;

  // ① 四柱十神明细表（天干+藏干）
  const pillarDetails = [];
  const pillarNames = ["年柱", "月柱", "日柱", "时柱"];
  pillars.forEach((p, i) => {
    const name = pillarNames[i];
    // 天干十神（日柱天干是日主本身）
    let stemGod = null, stemMeaning = null;
    if (i !== 2) {
      stemGod = getTenGod(dayStem, p.stem);
      const pillarKey = i === 0 ? "年柱" : i === 1 ? "月柱" : "时柱";
      stemMeaning = TEN_GOD_PILLAR_MEANINGS[stemGod]?.[pillarKey] || null;
    }
    // 地支藏干十神
    const hiddenGods = [];
    if (BRANCH_HIDDEN_STEMS[p.branch]) {
      BRANCH_HIDDEN_STEMS[p.branch].forEach((h, hIdx) => {
        const god = getTenGod(dayStem, h.stem);
        const label = hIdx === 0 ? "本气" : hIdx === 1 ? "中气" : "余气";
        const pillarKey = i === 0 ? "年柱" : i === 1 ? "月柱" : i === 2 ? "日支" : "时柱";
        const meaning = TEN_GOD_PILLAR_MEANINGS[god]?.[pillarKey] || null;
        hiddenGods.push({ stem: h.stem, weight: h.weight, label, god, meaning, element: STEM_ELEMENTS[h.stem] });
      });
    }
    pillarDetails.push({
      name, stem: p.stem, branch: p.branch,
      stemElement: p.stemElement, branchElement: p.branchElement,
      stemGod, stemMeaning, hiddenGods, isDayPillar: i === 2,
    });
  });

  // ② 十神能量分布（五大类统计）
  const catScores = { 比劫: 0, 食伤: 0, 财星: 0, 官杀: 0, 印星: 0 };
  const catGodDetails = { 比劫: [], 食伤: [], 财星: [], 官杀: [], 印星: [] };
  completeTenGods.all.forEach(g => {
    const cat = TEN_GOD_CATEGORIES[g.god];
    if (cat) {
      // 用权重：天干算1.0，本气0.6，中气0.3，余气0.1
      const w = g.isHidden ? (g.hiddenLabel === "本气" ? 0.6 : g.hiddenLabel === "中气" ? 0.3 : 0.1) : 1.0;
      catScores[cat] += w;
      catGodDetails[cat].push(g);
    }
  });
  const totalCatScore = Object.values(catScores).reduce((s, v) => s + v, 0);
  const catDistribution = Object.entries(catScores)
    .map(([cat, score]) => ({
      cat, score: Math.round(score * 100) / 100,
      pct: totalCatScore > 0 ? Math.round((score / totalCatScore) * 100) : 0,
      info: CATEGORY_MEANINGS[cat],
      gods: catGodDetails[cat],
    }))
    .sort((a, b) => b.score - a.score);

  // ③ 十神组合检测
  const presentGods = new Set(completeTenGods.all.map(g => g.god));
  const detectedCombos = [];
  TEN_GOD_COMBOS.forEach(combo => {
    const mainMatch = combo.gods.every(g => presentGods.has(g));
    if (mainMatch) {
      detectedCombos.push(combo);
      return;
    }
    if (combo.altGods) {
      for (const alt of combo.altGods) {
        if (alt.every(g => presentGods.has(g))) {
          detectedCombos.push({ ...combo, matchedGods: alt });
          return;
        }
      }
    }
  });

  // ④ 十神总评文字
  const dominantCat = catDistribution[0];
  const weakestCat = catDistribution[catDistribution.length - 1];
  let conclusion = "";
  conclusion += `命盘十神以「${dominantCat.info.label.split("（")[0]}」为主导（占${dominantCat.pct}%），`;
  conclusion += `${dominantCat.info.desc.split("。")[0]}。`;
  if (weakestCat.pct <= 5) {
    conclusion += `「${weakestCat.info.label.split("（")[0]}」几乎缺失（仅${weakestCat.pct}%），`;
    conclusion += `${weakestCat.info.desc.split("；")[1]?.replace("过旺则", "不足则易") || "需后天补足"}。`;
  }
  if (detectedCombos.length > 0) {
    const goodCombos = detectedCombos.filter(c => c.quality === "吉");
    const badCombos = detectedCombos.filter(c => c.quality === "凶");
    if (goodCombos.length > 0) {
      conclusion += ` 命局形成「${goodCombos.map(c => c.name).join("」「")}」的吉利组合，${goodCombos[0].desc.split("。")[0]}。`;
    }
    if (badCombos.length > 0) {
      conclusion += ` 同时需注意「${badCombos.map(c => c.name).join("」「")}」的不利组合，${badCombos[0].desc.split("。").slice(-2, -1)[0]}。`;
    }
  }
  // 缺失十神提示
  if (completeTenGods.absentGods.length > 0 && completeTenGods.absentGods.length <= 3) {
    conclusion += ` 命局缺少${completeTenGods.absentGods.join("、")}，`;
    const absentCats = [...new Set(completeTenGods.absentGods.map(g => TEN_GOD_CATEGORIES[g]))];
    conclusion += `${absentCats.join("、")}能量需通过大运流年或后天努力来补充。`;
  }

  return { pillarDetails, catDistribution, detectedCombos, conclusion, absentGods: completeTenGods.absentGods, dominantGod: completeTenGods.dominantGod };
}

/* ===== 综合命格总评生成 ===== */
function generateOverallConclusion(ctx) {
  const {
    name, gender, zodiac, dayElement, dominant, weak, balance,
    strengthResult, usefulGod, pattern, shensha, interactions,
    marriage, birthplaceAnalysis, regionInfo, profile,
    weightedCounts, yearlyFortunes, currentYear,
  } = ctx;

  const sections = [];
  const genderWord = gender === "male" ? "男" : "女";
  const strengthWord = strengthResult.isStrong ? "偏旺" : "偏弱";

  // ① 命格总论
  let overviewText = `${name}命属${dayElement}，日主${strengthResult.label}（${strengthResult.strengthScore}分），`;
  overviewText += `${strengthResult.monthStatus}。`;
  overviewText += `八字中${dominant}气最旺（${Math.round(weightedCounts[dominant])}分），${weak}气最弱（${Math.round(weightedCounts[weak])}分）`;
  const zeroElements = ELEMENTS.filter(e => weightedCounts[e] < 2);
  if (zeroElements.length > 0) {
    overviewText += `，${zeroElements.join("、")}几近缺失`;
  }
  overviewText += `。格局为${pattern.mainPattern.name}`;
  if (pattern.hasSpecial) {
    overviewText += `，兼有${pattern.specialPatterns.map(s => s.name).join("、")}`;
  }
  overviewText += `——${pattern.mainPattern.brief}。`;
  overviewText += `整体来看，此命${strengthResult.isStrong ? "精力充沛、主观意识强，适合主导型角色" : "性情温润、善于协作，适合借力借势发展"}。`;
  sections.push({ heading: "🔮 命格总论", text: overviewText });

  // ② 核心优势与短板
  let strengthText = "";
  // 优势
  const goodShensha = shensha.filter(s => s.type === "吉");
  const goodInteractions = (interactions.stemCombines.length + interactions.branchCombines.length + interactions.branchThreeCombines.length);
  strengthText += `【天赋优势】`;
  strengthText += `${dominant}气充沛赋予${name}${profile.copy.split("。")[0]}。`;
  if (goodShensha.length > 0) {
    strengthText += `命带${goodShensha.map(s => s.name).join("、")}，${goodShensha[0].desc}。`;
  }
  if (goodInteractions > 0) {
    strengthText += `四柱合局${goodInteractions > 2 ? "丰富" : "有利"}，人际贵人运${goodInteractions > 2 ? "极佳" : "不错"}。`;
  }
  // 短板
  strengthText += ` 【需要注意】`;
  strengthText += `${weak}偏弱提示在${WEAK_ELEMENT_ADVICE[weak].brief.split("，")[0]}方面需要后天补足。`;
  const badInteractions = (interactions.branchClashes.length + interactions.branchPunishes.length + interactions.branchHarms.length);
  if (badInteractions > 0) {
    strengthText += `四柱存在${interactions.branchClashes.length ? "六冲" : ""}${interactions.branchPunishes.length ? "三刑" : ""}${interactions.branchHarms.length ? "六害" : ""}，`;
    strengthText += `人生中可能有阶段性波动，但只要把握好节奏，波动反而是跃升的契机。`;
  }
  sections.push({ heading: "⚡ 核心优势与短板", text: strengthText });

  // ③ 用神与人生策略
  let strategyText = `此命取"${usefulGod.useGod}（${usefulGod.useGodElement}）"为用神，核心策略为「${usefulGod.strategy}」。`;
  strategyText += `喜${usefulGod.likeElements.join("、")}，忌${usefulGod.dislikeElements.join("、")}。`;
  strategyText += `在职业选择上宜向${usefulGod.useGodElement}相关行业靠拢——${profile.career}`;
  strategyText += ` 日常生活中，多接触${usefulGod.useGodElement}属性的颜色（${DOMINANT_PROFILE[usefulGod.useGodElement]?.lucky?.color || profile.lucky.color}）、方位（${DOMINANT_PROFILE[usefulGod.useGodElement]?.lucky?.direction || profile.lucky.direction}），`;
  strategyText += `能持续为命格注入正向能量。`;
  sections.push({ heading: "🎯 用神与人生策略", text: strategyText });

  // ④ 感情与婚姻概览
  if (marriage) {
    let marriageText = `婚姻格局评分 ${marriage.score} 分（${marriage.rating}）。`;
    marriageText += marriage.factors.slice(0, 3).join("；") + "。";
    marriageText += ` ${marriage.conclusion.split("。").slice(0, 2).join("。")}。`;
    sections.push({ heading: "💕 感情与婚姻", text: marriageText });
  }

  // ⑤ 流年走势概览
  const thisYearFortune = yearlyFortunes.find(yf => yf.year === currentYear);
  const nextYearFortune = yearlyFortunes.find(yf => yf.year === currentYear + 1);
  const bestYears = [...yearlyFortunes].sort((a, b) => b.score - a.score).slice(0, 3);
  const worstYears = [...yearlyFortunes].sort((a, b) => a.score - b.score).slice(0, 2);
  let yearlyText = "";
  if (thisYearFortune) {
    yearlyText += `${currentYear}年为${thisYearFortune.god}之年（综合${thisYearFortune.score}分），${thisYearFortune.desc}`;
  }
  if (nextYearFortune) {
    yearlyText += ` ${currentYear + 1}年转入${nextYearFortune.god}（${nextYearFortune.score}分），${nextYearFortune.desc}`;
  }
  yearlyText += ` 在2015-2035年间，最旺的年份为${bestYears.map(y => `${y.year}年（${y.score}分）`).join("、")}，`;
  yearlyText += `需多加留意的年份为${worstYears.map(y => `${y.year}年（${y.score}分）`).join("、")}。`;
  yearlyText += `总体节奏：${bestYears[0].score - worstYears[0].score > 25 ? "起伏较大，要善用高峰期、稳过低谷期" : "波动适中，稳步前进即可"}。`;
  sections.push({ heading: "📅 流年走势概览", text: yearlyText });

  // ⑥ 综合寄语
  let closingText = `综合而言，${name}的命盘${balance <= 5 ? "五行较为均衡，是难得的稳健格局" : `${dominant}旺${weak}弱，特长鲜明`}。`;
  closingText += `${pattern.mainPattern.name}${pattern.hasSpecial ? "配合" + pattern.specialPatterns[0].name : ""}的格局，`;
  closingText += `${strengthResult.isStrong
    ? "赋予了命主充沛的行动力和主导权，事业上宜大胆开拓，但也要学会倾听和退让"
    : "决定了命主需要善借外力、以柔克刚，在合适的平台和团队中更能绽放光芒"}。`;
  closingText += ` 命理是参考而非定论——善用天赋、补足短板、顺应时势，方能行稳致远。`;
  sections.push({ heading: "✨ 总评寄语", text: closingText });

  return sections;
}

/* ===== 五行分布文字总结生成 ===== */
function generateElementSummary(ctx) {
  const { weightedCounts, dominant, weak, dayElement, strengthResult, usefulGod } = ctx;

  const items = [];
  const total = Object.values(weightedCounts).reduce((s, v) => s + v, 0);
  const sorted = Object.entries(weightedCounts).sort((a, b) => b[1] - a[1]);

  // 偏旺分析
  const strongEl = sorted[0];
  const pct = total > 0 ? Math.round((strongEl[1] / total) * 100) : 0;
  if (pct >= 40) {
    items.push({ type: "warn", icon: "🔥", text: `${strongEl[0]}气独大（占${pct}%），能量过于集中，需要${ELEMENT_GENERATE[strongEl[0]]}（泄）或${ELEMENT_OVERCOME_BY[strongEl[0]]}（克）来制衡。` });
  } else if (pct >= 30) {
    items.push({ type: "info", icon: "📊", text: `${strongEl[0]}气偏旺（占${pct}%），是命盘的主导力量，${DOMINANT_PROFILE[strongEl[0]]?.copy.split("。")[0] || ""}。` });
  } else {
    items.push({ type: "good", icon: "✅", text: `五行分布相对均匀，最旺的${strongEl[0]}也仅占${pct}%，属于难得的均衡格局。` });
  }

  // 偏弱/缺失分析
  const weakElements = sorted.filter(([el, score]) => score < 5);
  if (weakElements.length > 0) {
    const weakNames = weakElements.map(([el, score]) => `${el}（${Math.round(score)}分）`).join("、");
    items.push({ type: "warn", icon: "⚠️", text: `${weakNames}严重偏弱${weakElements.some(([_, s]) => s < 1) ? "甚至近乎缺失" : ""}，对应的身体和运势领域需重点关注和后天补足。` });
  }

  // 日主与五行关系
  const dayScore = weightedCounts[dayElement];
  const dayPct = total > 0 ? Math.round((dayScore / total) * 100) : 0;
  if (dayPct >= 25) {
    items.push({ type: "good", icon: "💪", text: `日主${dayElement}在五行中占比${dayPct}%，${strengthResult.label}，自身能量充足，行事有主见、有底气。` });
  } else if (dayPct >= 15) {
    items.push({ type: "info", icon: "⚖️", text: `日主${dayElement}占比${dayPct}%，${strengthResult.label}，需借助${ELEMENT_GENERATED_BY[dayElement]}（印星）来增强自身气场。` });
  } else {
    items.push({ type: "warn", icon: "🛡️", text: `日主${dayElement}仅占${dayPct}%，自身能量薄弱，宜找靠山、入大平台，避免独自扛压。` });
  }

  // 喜忌对照
  const likeScore = usefulGod.likeElements.reduce((s, el) => s + (weightedCounts[el] || 0), 0);
  const dislikeScore = usefulGod.dislikeElements.reduce((s, el) => s + (weightedCounts[el] || 0), 0);
  if (likeScore >= dislikeScore) {
    items.push({ type: "good", icon: "🎉", text: `喜用神五行（${usefulGod.likeElements.join("、")}）总能量${Math.round(likeScore)}分 ≥ 忌神（${usefulGod.dislikeElements.join("、")}）${Math.round(dislikeScore)}分，先天格局对你有利。` });
  } else {
    items.push({ type: "info", icon: "🔄", text: `忌神五行（${usefulGod.dislikeElements.join("、")}）能量${Math.round(dislikeScore)}分偏强于喜用（${usefulGod.likeElements.join("、")}）${Math.round(likeScore)}分，后天补足更为关键。` });
  }

  return items;
}

/* ===== 重点关注模块 ===== */
const FOCUS_GUIDE = {
  overall: {
    title: "综合运势深度解析",
    template: (dominant, weak, balance, counts) => {
      const lines = [];
      if (balance <= 1) {
        lines.push(`你的五行分布相对均衡，这是非常难得的格局。主线气质偏向"${dominant}"，表明你有自己鲜明的优势，同时各方面发展较为平衡。`);
        lines.push(`建议在保持 ${dominant} 优势的同时，适当补足 ${weak} 的能量，做到攻守兼备、进退有度。`);
      } else {
        lines.push(`当前命盘呈现"${dominant}强${weak}弱"的格局，这种偏向性格鲜明，优势突出。`);
        lines.push(`核心策略：先充分发挥 ${dominant} 的天赋优势，在此基础上有意识地用环境、习惯和选择来补足 ${weak}，让整体运势更加顺畅。`);
      }
      const zeroElements = ELEMENTS.filter(e => counts[e] === 0);
      if (zeroElements.length > 0) {
        lines.push(`特别注意：八字中完全缺少"${zeroElements.join("、")}"，需要通过后天努力重点补足。`);
      }
      return lines.join("\n");
    },
  },
  career: {
    title: "事业发展深度解析",
    template: (dominant, weak) =>
      `${dominant} 是你职场上最大的天赋武器，适合发挥在核心竞争力和个人品牌建设上。\n${weak} 较弱提醒你：在团队协作、资源整合或执行收尾方面需要有意识地补强，可以通过找互补型搭档来弥补。\n事业建议：选择与 ${dominant} 属性匹配的行业，同时有意识地培养 ${weak} 相关的能力，做到扬长补短。`,
  },
  love: {
    title: "情感关系深度解析",
    template: (dominant, weak) =>
      `在感情中你更自然地展现 ${dominant} 的特质——这是你的魅力核心，也决定了你的沟通风格和爱情观。\n${weak} 较弱时，容易在某些维度上缺乏敏感度。建议在表达与倾听之间找到平衡，关系才能走得更远。\n感情建议：找能量互补的伴侣会更加和谐，同时注意在关系中补足 ${weak} 的特质。`,
  },
  wealth: {
    title: "财运节奏深度解析",
    template: (dominant, weak) =>
      `财运格局与你的五行能量密切相关：${dominant} 强说明你擅长用自身优势吸引财富，天赋赚钱能力不错。\n${weak} 弱则提醒在风险控制、储备意识或出手时机上需要更加审慎。\n理财建议：在 ${dominant} 对应的行业求财更顺利，同时用 ${weak} 的能量特质来做风控，两者配合效果最佳。`,
  },
};
