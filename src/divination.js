/* ===== 每日运势签数据 ===== */
const FORTUNE_STICKS = [
  { rank: "上上签", title: "鹏程万里", poem: "大鹏展翅九天上，风起云涌正当时。\n贵人指路前途明，万事亨通无忧疑。", advice: "今日大吉！适合启动重要项目、签约合作，贵人运极旺。" },
  { rank: "上上签", title: "紫气东来", poem: "紫气东来满庭芳，春风得意马蹄忙。\n天时地利人和备，一朝功成名四方。", advice: "运势极佳，事业财运双收，抓住今日机遇！" },
  { rank: "上签", title: "风调雨顺", poem: "春来花开满园香，和风细雨润心房。\n但行好事莫问果，自有天公来奖赏。", advice: "今日平顺吉祥，适合社交、洽谈，保持积极心态。" },
  { rank: "上签", title: "锦绣前程", poem: "锦绣文章天下知，才高八斗展宏志。\n耐心等待花开日，一飞冲天不需疑。", advice: "学习进修的好时机，脚踏实地终有回报。" },
  { rank: "上签", title: "金玉满堂", poem: "财源广进福星照，金玉满堂乐逍遥。\n勤俭持家添好运，一年更比一年高。", advice: "财运亨通，适合理财投资，但需量力而行。" },
  { rank: "上签", title: "否极泰来", poem: "乌云散尽见天日，否极泰来运自通。\n莫道前路多险阻，柳暗花明又一村。", advice: "困难即将过去，坚持就是胜利，转机已在眼前。" },
  { rank: "中上签", title: "步步高升", poem: "拾级而上步步高，稳扎稳打基石牢。\n虽无一步登天路，积少成多自逍遥。", advice: "稳健前进的一天，不急于求成，循序渐进为佳。" },
  { rank: "中上签", title: "贵人相助", poem: "途中偶遇贵人行，指点迷津豁然明。\n虚心请教多学习，借力使力事必成。", advice: "今日有贵人出现，多与人交流，虚心求教。" },
  { rank: "中签", title: "守正待时", poem: "万物静观皆自得，守正待时运自来。\n急流勇退藏锋芒，蓄势而发非等闲。", advice: "今日宜静不宜动，做好准备等待时机。" },
  { rank: "中签", title: "平安是福", poem: "世间百态看分明，平安二字值千金。\n不羡他人风光事，知足常乐享太平。", advice: "平淡但安稳的一天，珍惜身边人，享受当下。" },
  { rank: "中签", title: "韬光养晦", poem: "深藏不露有乾坤，韬光养晦待时辰。\n莫把锋芒轻示人，一鸣惊人在明朝。", advice: "低调行事，默默积累实力，不宜高调张扬。" },
  { rank: "中签", title: "随遇而安", poem: "水到渠成花自开，随遇而安心自在。\n不必强求天注定，顺势而为福自来。", advice: "顺其自然的一天，不必强求，随缘即安。" },
  { rank: "中下签", title: "雾里看花", poem: "雾里看花花不真，水中望月月非明。\n当局者迷须自醒，退一步来海阔天。", advice: "今日判断力稍弱，重大决定建议推迟，多听他人意见。" },
  { rank: "中下签", title: "逆水行舟", poem: "逆水行舟用力撑，一篙不慎退千寻。\n咬定青山不放松，风雨过后见彩虹。", advice: "会有些阻力和挑战，但只要坚持就能渡过。" },
  { rank: "下签", title: "风雨欲来", poem: "乌云压城城欲摧，风雨欲来雁先回。\n暂且收帆避风浪，待到雨过天自晴。", advice: "今日多有波折，宜守不宜攻，避开冲突和争执。" },
  { rank: "下签", title: "暗潮涌动", poem: "海面平静暗潮涌，表面风光内忧重。\n小心行事防暗箭，安分守己度此关。", advice: "注意防范小人，低调行事，守住本分为上策。" },
];

const ELEMENT_FORTUNE_BONUS = {
  木: { best: [0, 1, 3], good: [4, 5, 7], warn: [14, 15] },
  火: { best: [1, 2, 4], good: [0, 5, 6], warn: [13, 15] },
  土: { best: [2, 4, 6], good: [3, 7, 9], warn: [14, 12] },
  金: { best: [0, 4, 5], good: [6, 7, 8], warn: [13, 15] },
  水: { best: [1, 3, 5], good: [0, 8, 9], warn: [12, 14] },
};

function drawDailyFortune(dayElement, dominant, weak) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const elSeed = ELEMENTS.indexOf(dayElement) * 7 + ELEMENTS.indexOf(dominant) * 3 + ELEMENTS.indexOf(weak);
  const combinedSeed = seed + elSeed;

  const bonus = ELEMENT_FORTUNE_BONUS[dayElement] || ELEMENT_FORTUNE_BONUS["木"];
  const pool = [];

  // 根据五行加权抽签
  bonus.best.forEach(i => { pool.push(i, i, i); });
  bonus.good.forEach(i => { pool.push(i, i); });
  for (let i = 0; i < FORTUNE_STICKS.length; i++) pool.push(i);
  // 弱元素对应的签加权较低
  bonus.warn.forEach(i => { pool.push(i); });

  const idx = pool[safeMod(combinedSeed * 13 + 7, pool.length)];
  const stick = FORTUNE_STICKS[idx];

  // 五行解读
  let elementReading = "";
  if (stick.rank.includes("上上") || stick.rank.includes("上签")) {
    elementReading = `今日${dayElement}气旺盛，与签文吉运共振，${dominant}属性加持下运势更佳。`;
  } else if (stick.rank.includes("中")) {
    elementReading = `今日${dayElement}气平稳，宜用${weak}属性之物调和（${WEAK_ELEMENT_ADVICE[weak]?.brief || "调和身心"}），可提升整体运势。`;
  } else {
    elementReading = `今日${dayElement}气偏弱，建议多接触${ELEMENT_GENERATED_BY[dayElement]}属性的事物来补充能量，化解不利。`;
  }

  return { ...stick, elementReading, drawDate: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日` };
}

/* ===== 塔罗牌数据 ===== */
const TAROT_MAJOR = [
  { name: "愚者", emoji: "🃏", num: 0, meaning: "新的开始、无限可能、自由冒险", reverse: "鲁莽冲动、缺乏计划、盲目乐观", element: "风" },
  { name: "魔术师", emoji: "🎩", num: 1, meaning: "创造力、意志力、新的行动", reverse: "欺骗、犹豫不决、能力不足", element: "水" },
  { name: "女祭司", emoji: "🌙", num: 2, meaning: "直觉、智慧、内在声音", reverse: "忽视直觉、表面思考、秘密暴露", element: "水" },
  { name: "女皇", emoji: "👑", num: 3, meaning: "丰收、滋养、富饶与美", reverse: "匮乏、过度溺爱、创造力阻塞", element: "土" },
  { name: "皇帝", emoji: "🏛️", num: 4, meaning: "权威、秩序、稳定的领导力", reverse: "专制、僵化、失去控制", element: "火" },
  { name: "教皇", emoji: "📿", num: 5, meaning: "传统智慧、精神指引、信仰", reverse: "教条、叛逆、虚伪的权威", element: "土" },
  { name: "恋人", emoji: "💕", num: 6, meaning: "爱情、选择、和谐关系", reverse: "不和谐、错误选择、价值观冲突", element: "风" },
  { name: "战车", emoji: "⚔️", num: 7, meaning: "胜利、决心、克服困难", reverse: "失控、方向不明、受挫", element: "水" },
  { name: "力量", emoji: "🦁", num: 8, meaning: "内在力量、勇气、温柔的坚强", reverse: "软弱、自我怀疑、缺乏信心", element: "火" },
  { name: "隐士", emoji: "🏔️", num: 9, meaning: "内省、独处、寻找内在真理", reverse: "孤僻、逃避、过度封闭", element: "土" },
  { name: "命运之轮", emoji: "🎡", num: 10, meaning: "命运转折、机遇来临、变化", reverse: "厄运、抗拒改变、错失良机", element: "火" },
  { name: "正义", emoji: "⚖️", num: 11, meaning: "公平、因果、做出正确决定", reverse: "不公正、推卸责任、偏见", element: "风" },
  { name: "倒吊人", emoji: "🔮", num: 12, meaning: "牺牲、换位思考、新视角", reverse: "无谓牺牲、固执己见、拖延", element: "水" },
  { name: "死神", emoji: "🦋", num: 13, meaning: "结束与新生、转化、放下过去", reverse: "恐惧变化、停滞不前、拒绝放手", element: "水" },
  { name: "节制", emoji: "☯️", num: 14, meaning: "平衡、耐心、调和", reverse: "失衡、过度、缺乏耐心", element: "火" },
  { name: "恶魔", emoji: "🔗", num: 15, meaning: "诱惑、物质束缚、面对阴影", reverse: "挣脱束缚、觉醒、重获自由", element: "土" },
  { name: "塔", emoji: "⚡", num: 16, meaning: "突变、打破旧局、重建", reverse: "恐惧改变、苦苦支撑、逃避现实", element: "火" },
  { name: "星星", emoji: "⭐", num: 17, meaning: "希望、灵感、心灵治愈", reverse: "失望、缺乏信念、断开连接", element: "风" },
  { name: "月亮", emoji: "🌕", num: 18, meaning: "幻象、直觉、潜意识探索", reverse: "困惑、欺骗、恐惧", element: "水" },
  { name: "太阳", emoji: "☀️", num: 19, meaning: "成功、喜悦、生命力", reverse: "短暂快乐、过度乐观、倦怠", element: "火" },
  { name: "审判", emoji: "📯", num: 20, meaning: "觉醒、重生、更高的召唤", reverse: "自我怀疑、拒绝成长、旧事重提", element: "火" },
  { name: "世界", emoji: "🌍", num: 21, meaning: "完成、圆满、达成目标", reverse: "未完成、半途而废、缺乏收尾", element: "土" },
];

const WUXING_TAROT_MAP = {
  木: "风", 火: "火", 土: "土", 金: "风", 水: "水",
};

function drawTarot(dayElement, dominant, weak, birth) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const birthSeed = birth.getFullYear() + birth.getMonth() * 31 + birth.getDate();
  const elSeed = ELEMENTS.indexOf(dayElement) * 11 + ELEMENTS.indexOf(dominant) * 5;
  const combinedSeed = seed + birthSeed + elSeed;

  const matchElement = WUXING_TAROT_MAP[dayElement] || "火";

  // 抽三张不重复的牌
  const drawn = [];
  const used = new Set();
  const positions = ["过去", "现在", "未来"];

  for (let i = 0; i < 3; i++) {
    let attempt = 0;
    let cardIdx;
    do {
      cardIdx = safeMod(combinedSeed * (i + 1) * 17 + i * 31 + attempt * 13, TAROT_MAJOR.length);
      attempt++;
    } while (used.has(cardIdx) && attempt < 100);
    used.add(cardIdx);

    const card = TAROT_MAJOR[cardIdx];
    const isReversed = safeMod(combinedSeed * (i + 3) * 7, 10) < 3; // 30% 概率逆位
    const isElementMatch = card.element === matchElement;

    // 五行解读
    let elementNote = "";
    if (isElementMatch) {
      elementNote = `此牌属性与你的${dayElement}命格高度共鸣，能量加倍！`;
    } else if (card.element === WUXING_TAROT_MAP[weak]) {
      elementNote = `此牌恰好补足你命格中偏弱的${weak}能量，是难得的调和之牌。`;
    } else {
      elementNote = `此牌带来${card.element}属性的能量，为你的命格增添新的维度。`;
    }

    drawn.push({
      position: positions[i],
      card,
      isReversed,
      isElementMatch,
      elementNote,
      reading: isReversed ? card.reverse : card.meaning,
    });
  }

  // 综合解读
  const upright = drawn.filter(d => !d.isReversed).length;
  let overallReading = "";
  if (upright === 3) {
    overallReading = `三牌全部正位，整体能量流动顺畅。结合你${dominant}旺${weak}弱的格局，当前是稳步前进、积极行动的好时期。`;
  } else if (upright === 2) {
    overallReading = `两正一逆，整体运势偏好但有一处需要注意。结合你的${dayElement}日主，建议在逆位牌所指领域多加留意和调整。`;
  } else if (upright === 1) {
    overallReading = `一正两逆，当前可能面临一些内在挑战。你的${dominant}优势可以帮助你度过这段时期，同时注意补足${weak}方面的能量。`;
  } else {
    overallReading = `三牌均为逆位，提示当前处于能量调整期。不必过于担心，你命格中${dominant}的力量足以支撑，建议多内省、少冲动，等待转机。`;
  }

  return { drawn, overallReading, drawDate: `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日` };
}

