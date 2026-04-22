/* ==========================================================================
 * 八字合婚引擎 marriage-match.js
 * 输入：两个人的 calculateFortune 结果（male/female）
 * 输出：8 维评分 + 命理级合婚报告
 *
 * 理论依据：
 *  - 《三命通会》《神峰通考》：十神对位、夫星妻星
 *  - 《渊海子平》：天干五合、地支六合、夫妻宫
 *  - 《滴天髓》：喜忌互补
 *  - 《协纪辨方书》：年命相合（生肖）
 *  - 《子平真诠》：大运同步
 * ========================================================================== */
(function () {
  "use strict";

  /* -------- 自包含常量表（不依赖 bazi-core 内部 const） -------- */

  const STEM_ELEMENT = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
  };
  const STEM_YIN_YANG = {
    甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳",
    己: "阴", 庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
  };
  const BRANCH_ELEMENT = {
    子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
    午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
  };

  // 天干五合
  const STEM_COMBINE = {
    甲己: { element: "土", name: "甲己合·中正之合", grade: "正配" },
    乙庚: { element: "金", name: "乙庚合·仁义之合", grade: "正配" },
    丙辛: { element: "水", name: "丙辛合·威制之合", grade: "刚柔相济" },
    丁壬: { element: "木", name: "丁壬合·淫慝之合", grade: "多情之合" },
    戊癸: { element: "火", name: "戊癸合·无情之合", grade: "年龄差之合" },
  };
  function getStemCombine(a, b) {
    return STEM_COMBINE[a + b] || STEM_COMBINE[b + a] || null;
  }
  // 天干相克（四冲）
  const STEM_CLASH = {
    甲庚: "金克木", 乙辛: "金克木",
    丙壬: "水克火", 丁癸: "水克火",
  };
  function getStemClash(a, b) {
    return STEM_CLASH[a + b] || STEM_CLASH[b + a] || null;
  }

  // 地支六合
  const BRANCH_SIX_COMBINE = {
    子丑: { element: "土", name: "子丑合土" },
    寅亥: { element: "木", name: "寅亥合木" },
    卯戌: { element: "火", name: "卯戌合火" },
    辰酉: { element: "金", name: "辰酉合金" },
    巳申: { element: "水", name: "巳申合水" },
    午未: { element: "火", name: "午未合·日月之合" },
  };
  function getBranchSixCombine(a, b) {
    return BRANCH_SIX_COMBINE[a + b] || BRANCH_SIX_COMBINE[b + a] || null;
  }
  // 地支六冲
  const BRANCH_SIX_CLASH = {
    子午: "子午冲", 丑未: "丑未冲", 寅申: "寅申冲",
    卯酉: "卯酉冲", 辰戌: "辰戌冲", 巳亥: "巳亥冲",
  };
  function getBranchClash(a, b) {
    return BRANCH_SIX_CLASH[a + b] || BRANCH_SIX_CLASH[b + a] || null;
  }
  // 地支六害
  const BRANCH_SIX_HARM = {
    子未: "子未害", 丑午: "丑午害", 寅巳: "寅巳害",
    卯辰: "卯辰害", 申亥: "申亥害", 酉戌: "酉戌害",
  };
  function getBranchHarm(a, b) {
    return BRANCH_SIX_HARM[a + b] || BRANCH_SIX_HARM[b + a] || null;
  }
  // 地支三合
  const BRANCH_THREE_GROUPS = [
    { set: ["申", "子", "辰"], element: "水", name: "申子辰合水局" },
    { set: ["寅", "午", "戌"], element: "火", name: "寅午戌合火局" },
    { set: ["亥", "卯", "未"], element: "木", name: "亥卯未合木局" },
    { set: ["巳", "酉", "丑"], element: "金", name: "巳酉丑合金局" },
  ];
  function getBranchHalfThreeCombine(a, b) {
    if (a === b) return null;
    for (const g of BRANCH_THREE_GROUPS) {
      if (g.set.includes(a) && g.set.includes(b)) {
        return { element: g.element, name: "半" + g.name };
      }
    }
    return null;
  }
  // 生肖（地支）配对口诀
  const ZODIAC_MAP = {
    子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇",
    午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
  };

  // 十神（以日主为准对对方天干的关系）
  function getTenGod(dayStem, other) {
    if (!dayStem || !other) return "";
    const dEl = STEM_ELEMENT[dayStem];
    const oEl = STEM_ELEMENT[other];
    const dYY = STEM_YIN_YANG[dayStem];
    const oYY = STEM_YIN_YANG[other];
    const sameYY = dYY === oYY;
    // 同五行
    if (dEl === oEl) return sameYY ? "比肩" : "劫财";
    // 我生
    const gen = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
    const genBy = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
    const ctrl = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
    const ctrlBy = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };
    if (gen[dEl] === oEl) return sameYY ? "食神" : "伤官";
    if (genBy[dEl] === oEl) return sameYY ? "偏印" : "正印";
    if (ctrl[dEl] === oEl) return sameYY ? "偏财" : "正财";
    if (ctrlBy[dEl] === oEl) return sameYY ? "七杀" : "正官";
    return "";
  }

  /* -------- 辅助：取喜忌五行 -------- */
  function getLikeDislike(fortune) {
    const ug = fortune && fortune.usefulGod;
    return {
      likes: (ug && Array.isArray(ug.likeElements)) ? ug.likeElements.slice() : [],
      dislikes: (ug && Array.isArray(ug.dislikeElements)) ? ug.dislikeElements.slice() : [],
      strategy: (ug && ug.strategy) || "",
    };
  }

  /* ==========================================================================
   * 维度 1：日干五合（最核心）
   * ========================================================================== */
  function evalDayStemCombine(m, f) {
    const mStem = m.dayPillar.stem;
    const fStem = f.dayPillar.stem;

    const combine = getStemCombine(mStem, fStem);
    const clash = getStemClash(mStem, fStem);
    const sameStem = mStem === fStem;

    let score = 6;
    let title = "";
    let detail = "";

    if (combine) {
      score = 10;
      title = combine.name;
      const gradeNote = {
        "甲己合·中正之合": "夫妻合婚中最高等级的日干配。古云「甲己合而化土，夫妻和顺、正配良缘」。",
        "乙庚合·仁义之合": "柔刚相济、互相尊重的一对。乙木之柔遇庚金之刚，化金局，主有原则、讲情义。",
        "丙辛合·威制之合": "火遇金而化水，刚柔调和、情深义重；须防彼此控制欲过强。",
        "丁壬合·淫慝之合": "多情之合，情感浓烈，但易感情用事，需理性兜底。",
        "戊癸合·无情之合": "多见年龄差较大之配，相敬如宾、情感偏克制。",
      };
      detail = (gradeNote[combine.name] || "") + ` 化${combine.element}。`;
    } else if (clash) {
      score = 3;
      title = `日干相克：${clash}`;
      detail = "两人主性格层面有一层刚硬的张力，需通过生活节奏和沟通方式化解。";
    } else if (sameStem) {
      score = 5;
      title = "日干同气（比肩）";
      detail = "两人气场相似、互相理解，但也容易「像镜子」，缺少互补张力。";
    } else {
      // 看十神
      const mView = getTenGod(mStem, fStem); // 男视角
      const fView = getTenGod(fStem, mStem); // 女视角
      const goodSet = ["正官", "正印", "正财", "食神"];
      const mGood = goodSet.includes(mView);
      const fGood = goodSet.includes(fView);

      // 特殊良配：丁火炼辛（《滴天髓》《神峰通考》以丁火炼辛金为阴火成器之配，虽克而成就）
      const pair = [mStem, fStem].sort().join("");
      const SPECIAL_GOOD = {
        "丁辛": { score: 8.5, title: "丁火炼辛·阴火成器", note: "命理经典良配：丁火（灯烛之火）炼辛金（珠玉之金），看似相克实为成就，古称「丁火炼辛，器成大雅」。" },
        "乙戊": { score: 7.5, title: "乙木疏戊·阴柔之克", note: "阴木疏阴土，温和相济。" },
        "癸丙": { score: 7.5, title: "癸水润丙·阴水助阳火生机", note: "丙得癸而不燥，阴阳调济。" },
      };
      if (SPECIAL_GOOD[pair]) {
        score = SPECIAL_GOOD[pair].score;
        title = SPECIAL_GOOD[pair].title;
        detail = SPECIAL_GOOD[pair].note + `（十神：男见${mView}，女见${fView}）`;
      } else if (mGood && fGood) { score = 8.5; title = `吉神对配：男见${mView}，女见${fView}`; detail = "正格十神对位，主和顺。"; }
      else if (mGood || fGood) { score = 7.5; title = `半吉对配：男见${mView}，女见${fView}`; detail = "一方得正格十神，可为正配基础。"; }
      else if ((mView === "偏财" && fView === "七杀") || (mView === "七杀" && fView === "偏财")) {
        score = 7.5; title = `偏配：男见${mView}，女见${fView}`;
        detail = "七杀配偏财，主「能驾驭的强势配」，古云「杀得财养，威而不戾」，实为次等正配。";
      } else { score = 6.5; title = `中性对配：男见${mView}，女见${fView}`; detail = "虽无五合，但十神对位上无刑冲。"; }
    }

    return { key: "日干五合", score, max: 10, title, detail };
  }

  /* ==========================================================================
   * 维度 2：夫妻宫（日支）
   * ========================================================================== */
  function evalSpouseBranch(m, f) {
    const mBr = m.dayPillar.branch;
    const fBr = f.dayPillar.branch;
    let score = 6;
    let title = "";
    let detail = "";

    const six = getBranchSixCombine(mBr, fBr);
    const three = getBranchHalfThreeCombine(mBr, fBr);
    const clash = getBranchClash(mBr, fBr);
    const harm = getBranchHarm(mBr, fBr);
    const same = mBr === fBr;

    if (six) {
      score = 10;
      title = `夫妻宫六合：${six.name}`;
      detail = "两人在生活习惯、日常相处、起居节奏上极度合拍。古称「日支六合」为合婚顶级信号。";
    } else if (three) {
      score = 8.5;
      title = `夫妻宫${three.name}`;
      detail = "两人三合气场连通，在气质或价值观上容易形成共同圈子。";
    } else if (clash) {
      score = 4;
      title = `夫妻宫相冲：${clash}`;
      detail = "日支一冲，生活中最易在日常细节上发生摩擦，如作息、消费、家务。须多沟通。";
    } else if (harm) {
      score = 5;
      title = `夫妻宫相害：${harm}`;
      detail = "暗里有「别扭」感，容易互相不理解却讲不出具体点。";
    } else if (same) {
      score = 7;
      title = "夫妻宫同支";
      detail = "两人日支完全一致，气场同频、默契度高，但需防重复的执拗点。";
    } else {
      score = 6;
      title = "夫妻宫各居其位";
      detail = "无特殊相合相冲，属于中性配置。";
    }
    return { key: "夫妻宫", score, max: 10, title, detail };
  }

  /* ==========================================================================
   * 维度 3：夫星妻星对填
   * 依据：
   *   1.《三命通会·论夫妻》：男以正财为妻、偏财为妾，女以正官为夫、七杀为夫星。
   *   2.《渊海子平·女命章》：夫星清纯有制则贵，杀重无制则寒。
   *   3.《滴天髓·通神论》：强者宜泄宜克，弱者宜生宜助 —— 反向克不等于凶，
   *      身强者见官杀反为贵；身弱者见官杀才为病。
   *   4. 实操派（八字派/八字堂）公认：辛金男×丁火女虽属"反向克"，
   *      但丁火属阴、辛金属阴，阴阴相克较温和，有"丁火炼辛"成器之说，
   *      配合得当反为上选。
   * 因此：反向克组合不是定死分值，而要结合 日干强弱 + 通关神 + 日支配合 动态定级。
   * ========================================================================== */
  function evalSpouseStarFill(m, f) {
    const mStem = m.dayPillar.stem;
    const fStem = f.dayPillar.stem;
    // 注意：mView = 男日干看女方的十神；fView = 女日干看男方的十神
    const mView = getTenGod(mStem, fStem);
    const fView = getTenGod(fStem, mStem);

    // 身强弱（若上游未提供则按 50 中性处理）
    const mStrong = !!(m.strengthResult && m.strengthResult.isStrong);
    const fStrong = !!(f.strengthResult && f.strengthResult.isStrong);
    const mScore = (m.strengthResult && m.strengthResult.strengthScore) || 50;
    const fScore = (f.strengthResult && f.strengthResult.strengthScore) || 50;

    // 通关土：辛×丁（金火）需戊己辰丑未土；其他反向克组合同理查通关五行
    function hasElement(fortune, elements) {
      const pillars = fortune.pillars || [];
      for (const p of pillars) {
        if (p.stem && elements.includes(STEM_ELEMENT[p.stem])) return true;
        if (p.branch && elements.includes(BRANCH_ELEMENT[p.branch])) return true;
      }
      return false;
    }
    // 女方克男方 → 通关为「女方所生」的五行（泄女方、生男方）
    // 男方克女方 → 通关为「男方所生」
    const gen = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
    const mEl = STEM_ELEMENT[mStem];
    const fEl = STEM_ELEMENT[fStem];

    let score = 6;
    const parts = [];

    /* ----- A. 正向配：男以财为妻、女以官杀为夫 ----- */
    const isGoldenMatch = (mView === "正财" && fView === "正官");
    const mStarOK = mView === "正财" || mView === "偏财";
    const fStarOK = fView === "正官" || fView === "七杀";
    const isSilverMatch = !isGoldenMatch && mStarOK && fStarOK;
    const isHalfMatch = !isGoldenMatch && !isSilverMatch && (mStarOK || fStarOK);

    /* ----- B. 反向配：男视女为官杀（被女克）、女视男为财（女克男） ----- */
    const isReverseMatch =
      (mView === "七杀" || mView === "正官") &&
      (fView === "正财" || fView === "偏财");

    if (isGoldenMatch) {
      score = 10;
      parts.push("夫为正官、妻为正财——十神对位最理想的「正配」，《三命通会》所言夫妻配偶星俱全之格。");
    } else if (isSilverMatch) {
      score = 8.2;
      if (mView === "正财") score += 0.4;
      if (fView === "正官") score += 0.4;
      parts.push(
        `男方得${mView}为妻星、女方得${fView}为夫星，方向正确，属次等正配（《渊海子平》「夫妻星俱到位」格）。`
      );
    } else if (isReverseMatch) {
      /* ---------- 反向配：分情况定级 ---------- */
      // 基线：中性 6.5
      let rScore = 6.5;
      const notes = [];
      notes.push(
        `男方视女方为${mView}（女克男）、女方视男方为${fView}（男被女克）——` +
        `属十神「反向克」配。古籍对此组合态度辩证：若男身强有担当、有通关神调和，可转为吉配；若男身弱无制，则易受消耗。`
      );

      // 丁辛特例（阴火炼阴金）
      const pairKey = [mStem, fStem].sort().join("");
      if (pairKey === "丁辛") {
        rScore += 0.8;
        notes.push("且本配属「丁火炼辛」（阴火阴金），《滴天髓》云「辛金珠玉畏火炎，反喜丁火暖而不焦」，阴阴相克较温和，有成就之象。");
      }
      // 乙庚（阳金克阴木）若方向反了 —— 实际乙庚是合，不走此分支
      // 壬丙、癸丁等同理：真正"克得凶"的是阳克阳，阴克阴较温

      // 因子 1：男方身强 → 官杀为用，反为贵；身弱 → 为病，减分
      if (mStrong && mScore >= 55) {
        rScore += 0.7;
        notes.push(`男方日主${m.strengthResult?.label || "偏强"}（${mScore}分），能担此七杀之克，反主有权威、有承担。`);
      } else if (!mStrong && mScore < 45) {
        rScore -= 0.6;
        notes.push(`男方日主${m.strengthResult?.label || "偏弱"}（${mScore}分），身弱不胜官杀之克，易感被动消耗，需印星或比劫化解。`);
      }

      // 因子 2：是否有通关神（男被克时，通关 = 女所生、男所受生之五行）
      // 女克男 → 女生通关 → 通关生男
      // 五行：金克木、木克土、土克水、水克火、火克金
      // 通关神的五行 = gen[克者] （例：丁火克辛金 → 通关为土，因为火生土、土生金）
      const bridgeEl = gen[fEl]; // 女方所生 = 通关五行
      const bothHaveBridge = hasElement(m, [bridgeEl]) && hasElement(f, [bridgeEl]);
      if (bothHaveBridge) {
        rScore += 0.6;
        notes.push(`双方四柱中均见通关五行【${bridgeEl}】——${fEl}生${bridgeEl}、${bridgeEl}生${mEl}，有"通关化解"之妙，反克转为相生。`);
      } else if (hasElement(m, [bridgeEl]) || hasElement(f, [bridgeEl])) {
        rScore += 0.3;
        notes.push(`一方四柱中见通关五行【${bridgeEl}】，可部分化解反向克。`);
      }

      // 因子 3：女方夫星到位（七杀/正官也可，只是方向反了）——
      // 这里 fView 本就是 偏财/正财，不加
      // 但若 mView 恰是"正官"（不是七杀），则男方被克更温和
      if (mView === "正官") {
        rScore += 0.3;
        notes.push("所见为「正官」而非「七杀」，克中有情，较温和。");
      }

      // 因子 4：是否同时 fView = 正财（而非偏财）
      if (fView === "正财") {
        rScore += 0.2;
        notes.push("女方所见为「正财」，情份正大。");
      }

      // 夹紧区间
      rScore = Math.max(5, Math.min(8.5, rScore));
      score = rScore;
      parts.push(notes.join(""));
    } else if (isHalfMatch) {
      score = 7.2;
      if (mStarOK) parts.push(`女方为男方的${mView}（妻星），男方得妻星。`);
      if (fStarOK) parts.push(`男方为女方的${fView}（夫星），女方得夫星。`);
    } else {
      // 其他中性对位（比肩/印/食伤等非夫妻星的组合）
      score = 6;
      parts.push(`男方视角：女方为${mView || "—"}；女方视角：男方为${fView || "—"}。非夫妻星对位，属中性。`);
    }

    if (score > 10) score = 10;

    let title = "十神对位分析";
    if (isGoldenMatch) title = "正官正财·黄金对位";
    else if (isSilverMatch) title = "夫妻星俱到·次等正配";
    else if (isReverseMatch) title = "反向克配·需看身强与通关";

    return {
      key: "夫妻星对位",
      score: Math.round(score * 10) / 10,
      max: 10,
      title,
      detail: parts.join(" "),
    };
  }

  /* ==========================================================================
   * 维度 4：用忌五行互补
   * ========================================================================== */
  function evalElementComplement(m, f) {
    const mLD = getLikeDislike(m);
    const fLD = getLikeDislike(f);

    // 从对方四柱中统计对方所带的五行（粗略以天干+地支数）
    function elementPresence(fortune) {
      const pillars = fortune.pillars || [];
      const c = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
      pillars.forEach(p => {
        if (p.stem && STEM_ELEMENT[p.stem]) c[STEM_ELEMENT[p.stem]]++;
        if (p.branch && BRANCH_ELEMENT[p.branch]) c[BRANCH_ELEMENT[p.branch]]++;
      });
      return c;
    }
    const mPres = elementPresence(m);
    const fPres = elementPresence(f);

    // 女方带给男方的喜用多少
    let mSupply = 0, mNoise = 0;
    mLD.likes.forEach(el => { if (fPres[el]) mSupply += fPres[el]; });
    mLD.dislikes.forEach(el => { if (fPres[el]) mNoise += fPres[el]; });
    let fSupply = 0, fNoise = 0;
    fLD.likes.forEach(el => { if (mPres[el]) fSupply += mPres[el]; });
    fLD.dislikes.forEach(el => { if (mPres[el]) fNoise += mPres[el]; });

    // 打分：供应大于噪声则加分
    const raw = (mSupply + fSupply) - 0.6 * (mNoise + fNoise);
    // 归一化：每个人 8 个字，理论最大 ≈ 16
    let score = 5 + raw * 0.35;
    score = Math.max(2, Math.min(10, score));
    score = Math.round(score * 10) / 10;

    const parts = [];
    if (mLD.likes.length) parts.push(`男方需${mLD.likes.join("、")}，女方供${mSupply}字`);
    if (fLD.likes.length) parts.push(`女方需${fLD.likes.join("、")}，男方供${fSupply}字`);
    if (mNoise + fNoise > 0) parts.push(`互相带入忌神 ${mNoise + fNoise} 字，需留意`);

    let title = "五行用忌互补";
    if (score >= 8.5) title += "·双向补位";
    else if (score <= 4) title += "·五行偏噪";

    return {
      key: "五行用忌互补",
      score, max: 10, title,
      detail: parts.join("；") + "。",
    };
  }

  /* ==========================================================================
   * 维度 5：生肖（年支）
   * ========================================================================== */
  function evalZodiac(m, f) {
    const mBr = m.pillars[0].branch;
    const fBr = f.pillars[0].branch;

    let score = 6;
    let title = "";
    let detail = "";

    const six = getBranchSixCombine(mBr, fBr);
    const three = getBranchHalfThreeCombine(mBr, fBr);
    const clash = getBranchClash(mBr, fBr);
    const harm = getBranchHarm(mBr, fBr);

    if (six) { score = 9.5; title = `年命六合：${six.name}`; detail = `生肖${ZODIAC_MAP[mBr]}与${ZODIAC_MAP[fBr]}六合。`; }
    else if (three) { score = 8.5; title = `年命${three.name}`; detail = `生肖${ZODIAC_MAP[mBr]}与${ZODIAC_MAP[fBr]}三合。`; }
    else if (clash) { score = 4; title = `年命相冲：${clash}`; detail = `生肖${ZODIAC_MAP[mBr]}${ZODIAC_MAP[fBr]}相冲，年命层面有张力。`; }
    else if (harm) { score = 5; title = `年命相害：${harm}`; detail = `生肖${ZODIAC_MAP[mBr]}${ZODIAC_MAP[fBr]}相害。`; }
    else if (mBr === fBr) { score = 6.5; title = `同岁同肖`; detail = `同为${ZODIAC_MAP[mBr]}年，同气相求。`; }
    else { title = "年命相安"; detail = "年支无合无冲。"; }

    return { key: "年命生肖", score, max: 10, title, detail };
  }

  /* ==========================================================================
   * 维度 6：大运同步
   * ========================================================================== */
  function evalDayunSync(m, f) {
    const mSteps = (m.dayun && Array.isArray(m.dayun.steps)) ? m.dayun.steps : [];
    const fSteps = (f.dayun && Array.isArray(f.dayun.steps)) ? f.dayun.steps : [];

    if (!mSteps.length || !fSteps.length) {
      return { key: "大运同步", score: 6, max: 10, title: "大运数据不足", detail: "未成功生成双方大运。" };
    }

    // 比较两人 30-60 岁关键期同步性：按同一年比较五行
    const MY = m.birth ? m.birth.getFullYear() : null;
    const FY = f.birth ? f.birth.getFullYear() : null;
    // 这里不依赖 birth；直接按 steps.ageStart/ageEnd 对照实际年份
    // 统一以"实际年份"对比
    function stepAtYear(steps, birthYear, year) {
      if (!birthYear) return null;
      const age = year - birthYear;
      return steps.find(s => age >= s.ageStart && age <= s.ageEnd) || null;
    }

    const mBY = m.birth ? m.birth.getFullYear() : null;
    const fBY = f.birth ? f.birth.getFullYear() : null;
    if (!mBY || !fBY) {
      return { key: "大运同步", score: 6, max: 10, title: "大运同步度（简化）", detail: "出生年不足，以流年粗估。" };
    }

    const yearsWin = 0; // 重置
    let syncHits = 0, total = 0, supplyHits = 0;
    const mLD = getLikeDislike(m), fLD = getLikeDislike(f);
    for (let y = 2020; y <= 2055; y++) {
      const mStep = stepAtYear(mSteps, mBY, y);
      const fStep = stepAtYear(fSteps, fBY, y);
      if (!mStep || !fStep) continue;
      total++;
      const mStemEl = STEM_ELEMENT[mStep.stem];
      const fStemEl = STEM_ELEMENT[fStep.stem];
      // 互供喜用
      if (mLD.likes.includes(fStemEl)) supplyHits++;
      if (fLD.likes.includes(mStemEl)) supplyHits++;
      // 同向（都走喜用）
      if (mLD.likes.includes(mStemEl) && fLD.likes.includes(fStemEl)) syncHits++;
    }
    if (!total) return { key: "大运同步", score: 6, max: 10, title: "大运同步度", detail: "数据不足。" };

    const syncRate = syncHits / total;
    const supplyRate = supplyHits / (total * 2);
    // 基线 5.5（中性），同向走喜用最多 +2.5，互供喜用最多 +2
    let score = 5.5 + syncRate * 2.5 + supplyRate * 2;
    score = Math.max(4, Math.min(10, score));
    score = Math.round(score * 10) / 10;

    let title = "大运同步度";
    if (syncRate >= 0.5) title += "·同频上行";
    else if (syncRate <= 0.2) title += "·异相交错";

    const detail = `2020-2055 取样 ${total} 年：同向吉 ${syncHits} 年；互供喜用合计 ${supplyHits} 次。`;

    return { key: "大运同步", score, max: 10, title, detail };
  }

  /* ==========================================================================
   * 维度 7：四柱互动（冲/合/刑/害 全盘扫描）
   * ========================================================================== */
  function evalPillarInteraction(m, f) {
    const names = ["年柱", "月柱", "日柱", "时柱"];
    const positives = [], negatives = [];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const mB = m.pillars[i].branch;
        const fB = f.pillars[j].branch;
        const mS = m.pillars[i].stem;
        const fS = f.pillars[j].stem;

        const sc = getStemCombine(mS, fS);
        if (sc) positives.push(`男${names[i]}${mS} × 女${names[j]}${fS}：${sc.name}`);

        const bc = getBranchSixCombine(mB, fB);
        if (bc) positives.push(`男${names[i]}${mB} × 女${names[j]}${fB}：${bc.name}`);

        const btc = getBranchHalfThreeCombine(mB, fB);
        if (btc) positives.push(`男${names[i]}${mB} × 女${names[j]}${fB}：${btc.name}`);

        const cla = getBranchClash(mB, fB);
        if (cla) negatives.push(`男${names[i]}${mB} × 女${names[j]}${fB}：${cla}`);

        const hrm = getBranchHarm(mB, fB);
        if (hrm) negatives.push(`男${names[i]}${mB} × 女${names[j]}${fB}：${hrm}`);
      }
    }

    let score = 6 + Math.min(4, positives.length * 0.7) - Math.min(3, negatives.length * 0.6);
    score = Math.max(2, Math.min(10, score));
    score = Math.round(score * 10) / 10;

    let title = `四柱互动：${positives.length}合 ${negatives.length}冲害`;
    if (score >= 8) title += "·合多于冲";
    else if (score <= 4) title += "·冲害偏多";

    const detail = [
      positives.length ? "合：" + positives.slice(0, 6).join("；") : "",
      negatives.length ? "冲害：" + negatives.slice(0, 6).join("；") : "",
    ].filter(Boolean).join("｜") || "四柱间无明显合冲。";

    return { key: "四柱互动", score, max: 10, title, detail, positives, negatives };
  }

  /* ==========================================================================
   * 维度 8：纳音（民俗参考）
   * ========================================================================== */
  const NAYIN_COMPAT = {
    水火: 0.6, 火水: 0.6, // 大海水不惧炉中火
    金木: 0.4, 木金: 0.4,
    金火: 0.5, 火金: 0.5,
    水土: 0.5, 土水: 0.5,
    木土: 0.5, 土木: 0.5,
  };
  function evalNayin(m, f) {
    const mNY = m.pillars[0].nayin || "";
    const fNY = f.pillars[0].nayin || "";
    // 提取属性字（最后一字）：水/火/土/金/木
    const last = s => (s || "").slice(-1);
    const mEl = last(mNY), fEl = last(fNY);
    let score = 7;
    let note = "";
    if (mEl === fEl) { score = 7.5; note = "同属纳音，相辅相成。"; }
    else {
      const k = mEl + fEl;
      const sim = NAYIN_COMPAT[k];
      if (sim != null) { score = 5 + sim * 4; note = `${mEl}${fEl}之配，民俗参考中性偏吉。`; }
      else { score = 7; note = "纳音无冲突。"; }
    }
    score = Math.round(score * 10) / 10;
    return {
      key: "纳音参考", score, max: 10,
      title: `男${mNY}·女${fNY}`,
      detail: note + "（纳音为民俗参考，不占核心权重。）",
    };
  }

  /* ==========================================================================
   * 综合评分（加权）
   * ========================================================================== */
  const WEIGHTS = {
    日干五合: 0.20,
    夫妻宫: 0.20,
    夫妻星对位: 0.20,
    五行用忌互补: 0.15,
    年命生肖: 0.08,
    大运同步: 0.10,
    四柱互动: 0.05,
    纳音参考: 0.02,
  };

  function computeMatch(male, female) {
    if (!male || !female) throw new Error("合婚：男女双方数据必须齐全");

    const dims = [
      evalDayStemCombine(male, female),
      evalSpouseBranch(male, female),
      evalSpouseStarFill(male, female),
      evalElementComplement(male, female),
      evalZodiac(male, female),
      evalDayunSync(male, female),
      evalPillarInteraction(male, female),
      evalNayin(male, female),
    ];

    let total = 0;
    dims.forEach(d => { total += d.score * (WEIGHTS[d.key] || 0); });
    const totalScore = Math.round(total * 10) / 10;

    let grade = "";
    if (totalScore >= 9) grade = "三合级·正配良缘";
    else if (totalScore >= 8) grade = "吉配·相守无虞";
    else if (totalScore >= 7) grade = "中上·可经营之配";
    else if (totalScore >= 6) grade = "平配·互相磨合";
    else if (totalScore >= 5) grade = "下中·刚柔相攻";
    else grade = "下配·需慎重";

    // 优势/提醒自动提取
    const advantages = [];
    const cautions = [];
    dims.forEach(d => {
      if (d.score >= 8.5) advantages.push(`${d.key}：${d.title}`);
      else if (d.score <= 4.5) cautions.push(`${d.key}：${d.title}`);
    });

    // 关键年份建议：互相喜用五行的流年
    const mLD = getLikeDislike(male);
    const fLD = getLikeDislike(female);
    const sharedLikes = mLD.likes.filter(e => fLD.likes.includes(e));
    const bothAvoid = mLD.dislikes.filter(e => fLD.dislikes.includes(e));

    // 互补关系：女方带的喜用是男方所需，反之亦然
    const femaleFeedsMale = mLD.likes.filter(e => fLD.dislikes.indexOf(e) === -1 && !fLD.likes.includes(e)); // 男需 & 女无害
    const maleFeedsFemale = fLD.likes.filter(e => mLD.dislikes.indexOf(e) === -1 && !mLD.likes.includes(e));

    // 生成命理级 narrative
    const narrative = buildNarrative(male, female, dims, totalScore, grade, sharedLikes, bothAvoid, {
      maleLikes: mLD.likes, femaleLikes: fLD.likes,
      maleDislikes: mLD.dislikes, femaleDislikes: fLD.dislikes,
    });

    return {
      totalScore, grade, dimensions: dims,
      advantages, cautions,
      sharedLikes, bothAvoid,
      maleLikes: mLD.likes, femaleLikes: fLD.likes,
      maleDislikes: mLD.dislikes, femaleDislikes: fLD.dislikes,
      narrative,
      weights: WEIGHTS,
    };
  }

  /* ==========================================================================
   * 生成长文合婚报告（命理术语 + 白话解读）
   * ========================================================================== */
  function buildNarrative(m, f, dims, score, grade, sharedLikes, bothAvoid, wuxing) {
    const mName = m.name || "男方";
    const fName = f.name || "女方";
    const mStem = m.dayPillar.stem;
    const fStem = f.dayPillar.stem;
    const mBr = m.dayPillar.branch;
    const fBr = f.dayPillar.branch;
    const mEl = STEM_ELEMENT[mStem];
    const fEl = STEM_ELEMENT[fStem];

    const lines = [];
    lines.push(`${mName}（${mStem}${mBr}·${mEl}日）与 ${fName}（${fStem}${fBr}·${fEl}日），综合评分 **${score}/10**，判为「${grade}」。`);
    lines.push("");
    lines.push("## 命理解读");

    dims.forEach(d => {
      const star = "★".repeat(Math.round(d.score / 2)) + "☆".repeat(5 - Math.round(d.score / 2));
      lines.push(`- **${d.key}**（${d.score}/10）${star} — ${d.title}。${d.detail}`);
    });

    // 关键白话解读
    lines.push("");
    lines.push("## 相处建议");
    if (sharedLikes.length) {
      lines.push(`- 两人共同的喜用五行是 **${sharedLikes.join("、")}**，日常居所、穿搭、饰品、装潢偏向这几类属性，都能给彼此加分。`);
    } else if (wuxing) {
      // 场景：喜用错开但不相克 → 各取所需
      const mNeedOK = wuxing.maleLikes.filter(e => !wuxing.femaleDislikes.includes(e));
      const fNeedOK = wuxing.femaleLikes.filter(e => !wuxing.maleDislikes.includes(e));
      // 场景：一方的喜用是另一方的忌神 → 五行冲突
      const mNeedIsFAvoid = wuxing.maleLikes.filter(e => wuxing.femaleDislikes.includes(e));
      const fNeedIsMAvoid = wuxing.femaleLikes.filter(e => wuxing.maleDislikes.includes(e));

      if (mNeedIsFAvoid.length && fNeedIsMAvoid.length) {
        lines.push(`- ⚠️ 两人用忌相冲：男方所需 **${mNeedIsFAvoid.join("、")}** 恰是女方所忌，女方所需 **${fNeedIsMAvoid.join("、")}** 恰是男方所忌。这意味着利于一方的居所/方位/色调反而不利于另一方，需要**分区布置**——如公共空间走中性色调，各自办公/卧室按各自喜用来调，才能双方都得益。`);
      } else if (mNeedOK.length && fNeedOK.length) {
        lines.push(`- 两人喜用错开但**各取所需**：男方宜补 **${mNeedOK.join("、")}**，女方宜补 **${fNeedOK.join("、")}**，家居布置可以"各区侧重"：男方书房偏${mNeedOK[0]}色系，女方卧室偏${fNeedOK[0]}色系。`);
      }
    }
    if (bothAvoid.length) {
      lines.push(`- 两人共同的忌神是 **${bothAvoid.join("、")}**，尽量避开这类属性的环境与过度元素。`);
    }

    // 根据评分阶梯给实用话
    const interac = dims.find(d => d.key === "四柱互动");
    if (interac && interac.negatives && interac.negatives.length) {
      lines.push(`- 冲害提示：${interac.negatives.slice(0, 3).join("；")}。这些是日常最容易爆发摩擦的点，可通过作息、方位、交流方式化解。`);
    }

    if (score >= 9) {
      lines.push(`- 整体评价：罕见的「多重合拍」，属命理合婚中**正配良缘**一档。只要彼此坦诚、遇事不翻旧账，即可长久。`);
    } else if (score >= 8) {
      lines.push(`- 整体评价：**吉配**。合得多、冲得少，主和顺。需保持相互尊重与各自空间。`);
    } else if (score >= 7) {
      lines.push(`- 整体评价：**中上之配**，可以经营。有几处需留意，但用对方法不难化解。`);
    } else if (score >= 6) {
      lines.push(`- 整体评价：**平配**，靠磨合。两人需要共同的事业/孩子/兴趣作为"第三极"来稳住关系。`);
    } else {
      lines.push(`- 整体评价：命理层面偏**刚硬对撞**，建议双方以事业型/相敬如宾的方式相处，避免过度情绪投入。`);
    }

    return lines.join("\n");
  }

  /* -------- 暴露接口 -------- */
  window.computeMarriageMatch = computeMatch;
  window._marriageMatchHelpers = { getTenGod, getStemCombine, getBranchSixCombine };
})();
