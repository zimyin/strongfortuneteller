/* ===== 紫微斗数数据 ===== */
const ZIWEI_PALACES = [
  "命宫", "兄弟宫", "夫妻宫", "子女宫", "财帛宫", "疾厄宫",
  "迁移宫", "交友宫", "事业宫", "田宅宫", "福德宫", "父母宫"
];

const ZIWEI_STARS = {
  主星: ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"],
  吉星: ["文昌", "文曲", "左辅", "右弼", "天魁", "天钺", "禄存", "天马"],
  煞星: ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"],
};

const ZIWEI_STAR_MEANINGS = {
  紫微: { icon: "👑", nature: "尊贵之星", desc: "领导力强，有帝王之气，主高贵权威，善于统御" },
  天机: { icon: "🧠", nature: "智慧之星", desc: "思维敏捷，擅长策划，主聪明机变，善于分析" },
  太阳: { icon: "☀️", nature: "光明之星", desc: "热情大方，乐于助人，主光明磊落，贵人运强" },
  武曲: { icon: "⚔️", nature: "财星", desc: "刚毅果断，理财有方，主财运亨通，事业心强" },
  天同: { icon: "😊", nature: "福星", desc: "温和善良，人缘极好，主福气深厚，生活安逸" },
  廉贞: { icon: "🔥", nature: "桃花星", desc: "聪明能干，感情丰富，主才华出众，有艺术天分" },
  天府: { icon: "🏛️", nature: "南斗主星", desc: "稳重大器，包容力强，主富贵安稳，守成有道" },
  太阴: { icon: "🌙", nature: "财星", desc: "温柔细腻，直觉敏锐，主暗财运佳，内心丰富" },
  贪狼: { icon: "🎭", nature: "桃花星", desc: "多才多艺，交际广泛，主欲望与才华并存" },
  巨门: { icon: "👄", nature: "暗星", desc: "口才极佳，分析力强，主言语表达，适合口才行业" },
  天相: { icon: "📋", nature: "印星", desc: "正直守信，协调能力强，主辅佐之才，适合管理" },
  天梁: { icon: "🛡️", nature: "荫星", desc: "正义感强，有化解力，主逢凶化吉，长辈缘好" },
  七杀: { icon: "🗡️", nature: "将星", desc: "勇猛果敢，开拓力强，主独立奋斗，事业有成" },
  破军: { icon: "💥", nature: "耗星", desc: "敢于变革，不安现状，主先破后立，创新突破" },
  文昌: { icon: "📖", nature: "文星", desc: "学业优秀，考试运好" },
  文曲: { icon: "🎵", nature: "才艺星", desc: "艺术天赋高，感性细腻" },
  左辅: { icon: "🤝", nature: "助星", desc: "贵人相助，人缘和善" },
  右弼: { icon: "🫱", nature: "助星", desc: "暗中有助，默默支持" },
  天魁: { icon: "⭐", nature: "贵人星", desc: "阳贵人，白天得助" },
  天钺: { icon: "🌟", nature: "贵人星", desc: "阴贵人，暗中提携" },
  禄存: { icon: "💎", nature: "财禄星", desc: "主财帛俸禄，保守稳健，富而不贵" },
  天马: { icon: "🐎", nature: "动星", desc: "主奔波变动，驿马远行，宜外出发展" },
  擎羊: { icon: "🐏", nature: "煞星", desc: "刚强直冲，有冲劲但需防冲动" },
  陀罗: { icon: "🌀", nature: "煞星", desc: "纠缠拖延，需培养果断力" },
  火星: { icon: "🔥", nature: "煞星", desc: "急躁冲动，但有爆发力" },
  铃星: { icon: "🔔", nature: "煞星", desc: "内心焦虑，但有持久力" },
  地空: { icon: "🕳️", nature: "煞星", desc: "想法超前，不走寻常路" },
  地劫: { icon: "💫", nature: "煞星", desc: "意外变动，但有特殊才华" },
};

const ZIWEI_PALACE_MEANINGS = {
  命宫: "个人本质、性格与一生总体格局",
  兄弟宫: "手足缘分、同事关系与合作运势",
  夫妻宫: "婚姻感情、配偶特质与感情走向",
  子女宫: "子女缘分、后代运势与创造力",
  财帛宫: "财运格局、理财方式与收入来源",
  疾厄宫: "健康状况、体质特点与需注意的部位",
  迁移宫: "外出运势、人际交往与发展方向",
  交友宫: "朋友缘分、下属运与社交圈特质",
  事业宫: "事业方向、职业适性与成就高度",
  田宅宫: "房产运势、家庭环境与不动产投资",
  福德宫: "精神世界、兴趣爱好与晚年运势",
  父母宫: "与长辈关系、家学渊源与早年运势",
};

/* ===== 紫微斗数排盘（正统安星法 v2.1 · lunar-javascript 基础版）=====
 * 基于《紫微斗数全书》正统排盘规则
 * v2.1 变更:
 *   - 引入 lunar-javascript 精确计算农历日/农历月（处理闰月）
 *   - 补充禄存、天马两颗辅星（完整 6 大辅星：左辅右弼文昌文曲+禄存天马，另含魁钺）
 * 命宫: 寅起正月顺数到生月，再逆数到生时
 * 五行局: 命宫干支查纳音五行局表
 * 紫微星: 生日÷局数，口诀定位
 * 14主星: 紫微系逆排 + 天府系顺排
 * ============================================ */
function calculateZiwei(birth) {
  const year = birth.getFullYear();
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const hour = birth.getHours();
  const hourIdx = getHourBranchIndex(hour);

  // === 0. 精确农历（lunar-javascript）===
  // 优先使用 lunar-javascript 取真农历月日；失败则退回节气月+公历日（老逻辑）
  let lunarMonth, lunarDay;
  try {
    if (typeof Solar !== "undefined" && Solar.fromDate) {
      const solar = Solar.fromDate(birth);
      const lunar = solar.getLunar();
      lunarMonth = Math.abs(lunar.getMonth()); // 闰月返回负数，紫微排盘按对应正月处理
      lunarDay = lunar.getDay();
    } else {
      throw new Error("lunar-javascript not loaded");
    }
  } catch (e) {
    console.warn("[ziwei] lunar-javascript 未加载，回退节气月+公历日近似", e);
    lunarMonth = getSolarMonthOffset(birth) + 1;
    lunarDay = day;
  }

  // === 1. 安命宫 ===
  // 寅宫起正月顺数到生月，再逆数到生时
  // 公式: 命宫地支index = (14 + lunarMonth - hourIdx) % 12
  // (14 = 2 + 12，其中2是寅的索引)
  const mingGongBranchIdx = safeMod(14 + lunarMonth - hourIdx, 12);

  // === 2. 安身宫 ===
  const shenGongBranchIdx = safeMod(2 + lunarMonth - 1 + hourIdx, 12);

  // === 3. 十二宫天干（五虎遁） ===
  const yearStemIdx = safeMod(year - 4, 10);
  const yearStem = STEMS[yearStemIdx];
  const yinGongStemMap = { 甲: "丙", 己: "丙", 乙: "戊", 庚: "戊", 丙: "庚", 辛: "庚", 丁: "壬", 壬: "壬", 戊: "甲", 癸: "甲" };
  const yinStemIdx = STEMS.indexOf(yinGongStemMap[yearStem]);

  function getPalaceStem(branchIdx) {
    // 寅宫=yinStemIdx，从寅顺排
    const offset = safeMod(branchIdx - 2, 12);
    return STEMS[safeMod(yinStemIdx + offset, 10)];
  }

  // === 4. 定五行局 ===
  const mingGongStem = getPalaceStem(mingGongBranchIdx);
  const mingGongBranch = BRANCHES[mingGongBranchIdx];
  const wuxingJuTable = {
    // [天干组][地支组] → 局数
    // 天干组: 甲乙=0, 丙丁=1, 戊己=2, 庚辛=3, 壬癸=4
    // 地支组: 子丑午未=0, 寅卯申酉=1, 辰巳戌亥=2
    0: { 0: 4, 1: 2, 2: 6 }, // 甲乙: 金四局, 水二局, 火六局
    1: { 0: 2, 1: 6, 2: 5 }, // 丙丁: 水二局, 火六局, 土五局
    2: { 0: 6, 1: 5, 2: 3 }, // 戊己: 火六局, 土五局, 木三局
    3: { 0: 5, 1: 3, 2: 4 }, // 庚辛: 土五局, 木三局, 金四局
    4: { 0: 3, 1: 4, 2: 2 }, // 壬癸: 木三局, 金四局, 水二局
  };
  const juNames = { 2: "水二局", 3: "木三局", 4: "金四局", 5: "土五局", 6: "火六局" };
  const stemGroup = Math.floor(STEMS.indexOf(mingGongStem) / 2);
  const branchGroupMap = { 子: 0, 丑: 0, 午: 0, 未: 0, 寅: 1, 卯: 1, 申: 1, 酉: 1, 辰: 2, 巳: 2, 戌: 2, 亥: 2 };
  const branchGroup = branchGroupMap[mingGongBranch];
  const juNum = wuxingJuTable[stemGroup][branchGroup];

  // === 5. 定紫微星位置（30×5查表法） ===
  const ziweiPosTable = {
    2:[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,1,1,2,2,3,3,4],
    3:[2,2,3,1,3,4,4,5,2,5,6,6,7,4,7,8,8,9,6,9,10,10,11,8,11,12,12,1,10,1],
    4:[3,2,1,4,3,2,5,4,3,6,5,4,7,6,5,8,7,6,9,8,7,10,9,8,11,10,9,12,11,10],
    5:[4,2,3,1,5,3,4,2,6,4,5,3,7,5,6,4,8,6,7,5,9,7,8,6,10,8,9,7,11,9],
    6:[5,2,4,1,3,6,3,5,2,4,7,4,6,3,5,8,5,7,4,6,9,6,8,5,7,10,7,9,6,8],
  };
  const ziweiGongIdx = (ziweiPosTable[juNum] && ziweiPosTable[juNum][lunarDay - 1]) || 1;
  // 转换为地支索引 (1=寅, 2=卯, ..., 12=丑)
  const ziweiBranchIdx = safeMod(ziweiGongIdx + 1, 12); // 1→寅(2), 2→卯(3), ...

  // === 6. 安14主星 ===
  // 紫微星系（逆排）: 紫微→天机→(空)→太阳→武曲→天同→(空)(空)→廉贞
  const ziweiStarOffsets = { 紫微: 0, 天机: -1, 太阳: -3, 武曲: -4, 天同: -5, 廉贞: -8 };
  // 天府与紫微对宫关系
  const tianfuMap = [4,3,2,1,0,11,10,9,8,7,6,5]; // 紫微在index i → 天府在 tianfuMap[i]
  const tianfuBranchIdx = tianfuMap[ziweiBranchIdx];
  // 天府星系（顺排）: 天府→太阴→贪狼→巨门→天相→天梁→七杀→(空)(空)(空)→破军
  const tianfuStarOffsets = { 天府: 0, 太阴: 1, 贪狼: 2, 巨门: 3, 天相: 4, 天梁: 5, 七杀: 6, 破军: 10 };

  // 初始化12宫星曜数组
  const palaceStars = Array.from({ length: 12 }, () => []);

  // 安紫微系
  for (const [star, offset] of Object.entries(ziweiStarOffsets)) {
    const pos = safeMod(ziweiBranchIdx + offset, 12);
    palaceStars[pos].push(star);
  }
  // 安天府系
  for (const [star, offset] of Object.entries(tianfuStarOffsets)) {
    const pos = safeMod(tianfuBranchIdx + offset, 12);
    palaceStars[pos].push(star);
  }

  // === 7. 安辅星 ===
  // 左辅: 辰(4)起正月顺数到生月
  const zuofuIdx = safeMod(4 + lunarMonth - 1, 12);
  palaceStars[zuofuIdx].push("左辅");
  // 右弼: 戌(10)起正月逆数到生月
  const youbiIdx = safeMod(10 - lunarMonth + 1, 12);
  palaceStars[youbiIdx].push("右弼");
  // 文昌: 戌(10)起子时逆数到生时
  const wenchangIdx = safeMod(10 - hourIdx, 12);
  palaceStars[wenchangIdx].push("文昌");
  // 文曲: 辰(4)起子时顺数到生时
  const wenquIdx = safeMod(4 + hourIdx, 12);
  palaceStars[wenquIdx].push("文曲");

  // 天魁天钺（按年干）
  const kuiyueTable = {
    甲: [1, 7], 戊: [1, 7], 庚: [1, 7],
    乙: [0, 8], 己: [0, 8],
    丙: [11, 9], 丁: [11, 9],
    辛: [2, 6], 壬: [3, 5], 癸: [3, 5],
  };
  const ky = kuiyueTable[yearStem];
  if (ky) {
    palaceStars[ky[0]].push("天魁");
    palaceStars[ky[1]].push("天钺");
  }

  // 煞星: 擎羊陀罗（基于禄存位置±1）；同时安禄存主星
  const lucunTable = { 甲: 2, 乙: 3, 丙: 5, 丁: 6, 戊: 5, 己: 6, 庚: 8, 辛: 9, 壬: 11, 癸: 0 };
  const lucunIdx = lucunTable[yearStem];
  if (lucunIdx !== undefined) {
    palaceStars[lucunIdx].push("禄存");
    palaceStars[safeMod(lucunIdx + 1, 12)].push("擎羊");
    palaceStars[safeMod(lucunIdx - 1, 12)].push("陀罗");
  }

  // 天马（按年支三合）: 寅午戌→申、申子辰→寅、巳酉丑→亥、亥卯未→巳
  const yearBranchIdx = safeMod(year - 4, 12);
  const tianmaTable = {
    2: 8, 6: 8, 10: 8,  // 寅午戌 → 申
    8: 2, 0: 2, 4: 2,   // 申子辰 → 寅
    5: 11, 9: 11, 1: 11,// 巳酉丑 → 亥
    11: 5, 3: 5, 7: 5,  // 亥卯未 → 巳
  };
  const tianmaIdx = tianmaTable[yearBranchIdx];
  if (tianmaIdx !== undefined) {
    palaceStars[tianmaIdx].push("天马");
  }

  // === 8. 构建宫位数据 ===
  const palaces = ZIWEI_PALACES.map((name, i) => {
    const branchIdx = safeMod(mingGongBranchIdx - i, 12); // 逆排十二宫
    const stars = palaceStars[branchIdx] || [];
    const mainStars = stars.filter(s => ZIWEI_STARS["主星"].includes(s));
    const mainStar = mainStars[0] || "";

    // 评分: 基于主星吉凶 + 辅星加减
    let score = 65;
    if (["紫微", "天府", "太阳", "太阴", "天同", "武曲"].includes(mainStar)) score += 12;
    else if (["天机", "天梁", "天相"].includes(mainStar)) score += 8;
    else if (["廉贞", "贪狼", "巨门"].includes(mainStar)) score += 3;
    else if (["七杀", "破军"].includes(mainStar)) score -= 2;
    if (stars.some(s => ZIWEI_STARS["吉星"].includes(s))) score += 6;
    if (stars.some(s => ZIWEI_STARS["煞星"].includes(s))) score -= 5;
    if (mainStars.length >= 2) score += 5; // 双星同宫加分
    score = Math.min(95, Math.max(35, score));

    return {
      name,
      meaning: ZIWEI_PALACE_MEANINGS[name],
      stars,
      mainStar: mainStar || (mainStars.length > 0 ? mainStars.join("·") : "无主星"),
      score,
      branch: BRANCHES[branchIdx],
    };
  });

  // === 9. 四化飞星（禄权科忌）===
  // 基于年干确定四化
  const SIHUA_TABLE = {
    甲: { 禄: "廉贞", 权: "破军", 科: "武曲", 忌: "太阳" },
    乙: { 禄: "天机", 权: "天梁", 科: "紫微", 忌: "太阴" },
    丙: { 禄: "天同", 权: "天机", 科: "文昌", 忌: "廉贞" },
    丁: { 禄: "太阴", 权: "天同", 科: "天机", 忌: "巨门" },
    戊: { 禄: "贪狼", 权: "太阴", 科: "右弼", 忌: "天机" },
    己: { 禄: "武曲", 权: "贪狼", 科: "天梁", 忌: "文曲" },
    庚: { 禄: "太阳", 权: "武曲", 科: "太阴", 忌: "天同" },
    辛: { 禄: "巨门", 权: "太阳", 科: "文曲", 忌: "文昌" },
    壬: { 禄: "天梁", 权: "紫微", 科: "左辅", 忌: "武曲" },
    癸: { 禄: "破军", 权: "巨门", 科: "太阴", 忌: "贪狼" },
  };

  const sihua = SIHUA_TABLE[yearStem] || {};
  const sihuaResult = [];
  const huaNames = ["禄", "权", "科", "忌"];
  const huaDescs = {
    禄: { icon: "💰", meaning: "主财禄、顺利、人缘好", effect: "增强该星的正面力量，带来财运和好运" },
    权: { icon: "👊", meaning: "主权势、竞争、掌控力", effect: "增强该星的权威力量，事业上有突破" },
    科: { icon: "📖", meaning: "主名声、学业、贵人", effect: "增强该星的文雅之气，利考试和声誉" },
    忌: { icon: "⚠️", meaning: "主阻碍、纠结、执着", effect: "使该星的负面能量放大，该宫位需要注意" },
  };

  for (const hua of huaNames) {
    const starName = sihua[hua];
    if (!starName) continue;
    // 找到这颗星所在的宫位
    let inPalace = null;
    for (const p of palaces) {
      if (p.stars.includes(starName)) {
        inPalace = p.name;
        break;
      }
    }
    sihuaResult.push({
      hua,
      star: starName,
      palace: inPalace || "（未入正宫）",
      ...huaDescs[hua],
    });
  }

  const mingMainStar = palaces[0].mainStar;
  const mingStarInfo = ZIWEI_STAR_MEANINGS[mingMainStar] || { nature: "特殊格局", desc: "命宫无主星坐守，借对宫星曜，格局特殊，主人生灵活多变" };

  return {
    palaces,
    mingMainStar,
    mingStarInfo,
    sihua: sihuaResult,
    juName: juNames[juNum] || `${juNum}局`,
    mingGong: mingGongBranch,
    shenGong: BRANCHES[shenGongBranchIdx],
    summary: `紫微斗数命盘${juNames[juNum]}，命宫在${mingGongBranch}，${mingMainStar !== "无主星" ? `${mingMainStar}坐命，${mingStarInfo.nature}入命宫，${mingStarInfo.desc}` : "命宫无主星，借对宫星力，主灵活变通"}。结合十二宫星曜分布，可以更全面地了解一生的格局与机遇。`,
  };
}

