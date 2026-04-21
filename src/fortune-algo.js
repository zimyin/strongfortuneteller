/* ===== 五行生克关系 ===== */
const ELEMENT_GENERATE = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const ELEMENT_OVERCOME = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
const ELEMENT_GENERATED_BY = { 木: "水", 火: "木", 土: "火", 金: "土", 水: "金" };
const ELEMENT_OVERCOME_BY = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };

/* ===== 十神映射 ===== */
const STEM_YIN_YANG = {
  甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳",
  己: "阴", 庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴",
};

function getTenGod(dayStem, otherStem) {
  const dayEl = STEM_ELEMENTS[dayStem];
  const otherEl = STEM_ELEMENTS[otherStem];
  const dayYY = STEM_YIN_YANG[dayStem];
  const otherYY = STEM_YIN_YANG[otherStem];
  const same = dayYY === otherYY;

  if (dayEl === otherEl) return same ? "比肩" : "劫财";
  if (ELEMENT_GENERATE[dayEl] === otherEl) return same ? "食神" : "伤官";
  if (ELEMENT_OVERCOME[dayEl] === otherEl) return same ? "偏财" : "正财";
  if (ELEMENT_OVERCOME_BY[dayEl] === otherEl) return same ? "七杀" : "正官";
  if (ELEMENT_GENERATED_BY[dayEl] === otherEl) return same ? "偏印" : "正印";
  return "";
}

const TEN_GOD_MEANINGS = {
  比肩: { icon: "🤝", brief: "同类相助", detail: "代表兄弟朋友、竞争伙伴，主独立自主、意志坚定，旺则人脉广但主观强" },
  劫财: { icon: "⚔️", brief: "争夺竞争", detail: "代表竞争对手、破财因素，主果敢冒险，旺则行动力强但易冲动耗财" },
  食神: { icon: "🎨", brief: "才华表达", detail: "代表才艺灵感、口福享受，主温和聪慧，旺则创造力强、生活有品味" },
  伤官: { icon: "💡", brief: "创新突破", detail: "代表叛逆创新、技术才能，主聪明犀利，旺则才华横溢但个性尖锐" },
  偏财: { icon: "💰", brief: "意外之财", detail: "代表横财投资、父亲缘分，主慷慨大方，旺则财运亨通、社交能力强" },
  正财: { icon: "🏦", brief: "稳定收入", detail: "代表工薪收入、妻缘（男命），主勤俭踏实，旺则收入稳定、理财有方" },
  七杀: { icon: "🗡️", brief: "权威压力", detail: "代表压力挑战、权威贵人，主刚毅果断，旺则事业心强但压力大" },
  正官: { icon: "👔", brief: "规矩地位", detail: "代表职位名誉、丈夫缘（女命），主端正守规，旺则有贵人提携、社会地位高" },
  偏印: { icon: "📚", brief: "偏门学问", detail: "代表特殊技能、非主流知识，主思维独特，旺则悟性高但性格孤僻" },
  正印: { icon: "🎓", brief: "学历庇护", detail: "代表学业文凭、母亲庇护，主仁慈博学，旺则学业有成、贵人运好" },
};

/* ===== 纳音五行 ===== */
const NAYIN_TABLE = [
  "海中金", "海中金", "炉中火", "炉中火", "大林木", "大林木",
  "路旁土", "路旁土", "剑锋金", "剑锋金", "山头火", "山头火",
  "涧下水", "涧下水", "城头土", "城头土", "白蜡金", "白蜡金",
  "杨柳木", "杨柳木", "泉中水", "泉中水", "屋上土", "屋上土",
  "霹雳火", "霹雳火", "松柏木", "松柏木", "长流水", "长流水",
  "砂石金", "砂石金", "山下火", "山下火", "平地木", "平地木",
  "壁上土", "壁上土", "金箔金", "金箔金", "覆灯火", "覆灯火",
  "天河水", "天河水", "大驿土", "大驿土", "钗钏金", "钗钏金",
  "桑柘木", "桑柘木", "大溪水", "大溪水", "沙中土", "沙中土",
  "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海水",
];

const NAYIN_DESCRIPTIONS = {
  海中金: "如珠藏海底，含蓄内敛，潜力深厚，大器晚成之象",
  炉中火: "如洪炉烈焰，热情奔放，行事果断，光芒万丈之象",
  大林木: "如森林参天，根基深厚，格局宏大，栋梁之材之象",
  路旁土: "如大道通途，包容厚重，务实稳健，承载万物之象",
  剑锋金: "如利剑出鞘，锐利果决，才华出众，锋芒毕露之象",
  山头火: "如日照山巅，光明正大，志向高远，照耀四方之象",
  涧下水: "如山涧清泉，清澈灵动，聪慧敏捷，润物无声之象",
  城头土: "如城墙坚固，稳重可靠，有担当有责任，守护之象",
  白蜡金: "如珠玉温润，外柔内刚，品性高洁，气质不凡之象",
  杨柳木: "如柳枝随风，柔韧灵活，适应力强，随遇而安之象",
  泉中水: "如泉涌不竭，智慧丰沛，思维活跃，源源不断之象",
  屋上土: "如屋顶覆盖，安稳庇护，居家有道，安居乐业之象",
  霹雳火: "如雷电交加，爆发力强，出手不凡，一鸣惊人之象",
  松柏木: "如松柏常青，坚毅不屈，经冬不凋，长寿吉祥之象",
  长流水: "如江河奔涌，气势磅礴，志在远方，奔流不息之象",
  砂石金: "如沙中淘金，经磨历练，越挫越勇，终成大器之象",
  山下火: "如夕阳暖照，温和明亮，不争不抢，光而不耀之象",
  平地木: "如平原绿洲，生机盎然，亲和包容，欣欣向荣之象",
  壁上土: "如墙壁粉饰，外表光鲜，注重面子，装点门面之象",
  金箔金: "如金箔闪耀，精致华丽，审美出众，点缀人生之象",
  覆灯火: "如灯烛微明，温暖柔和，默默付出，照亮身边之象",
  天河水: "如银河璀璨，眼界开阔，不拘小节，胸怀天下之象",
  大驿土: "如通衢大道，四通八达，人缘广阔，行走四方之象",
  钗钏金: "如首饰精美，品味高雅，注重细节，精致生活之象",
  桑柘木: "如蚕桑织锦，勤勉实干，默默耕耘，终有收获之象",
  大溪水: "如溪流汇聚，灵活变通，善于整合，汇集成河之象",
  沙中土: "如沙中含玉，看似平凡，内藏珍宝，不可小觑之象",
  天上火: "如日月高悬，光明磊落，正气凛然，普照万方之象",
  石榴木: "如石榴多籽，多才多艺，热情饱满，硕果累累之象",
  大海水: "如大海汪洋，心胸浩瀚，包容万象，深不可测之象",
};

/* ===== 性格与建议文案 ===== */
const DOMINANT_PROFILE = {
  木: {
    title: "木气偏盛 · 思路生发型",
    copy: "木旺的人通常重视成长与原则，反应快，愿意为理想投入行动。优点是有规划感、有韧性；需要注意的是别把高标准变成对自己和他人的压力。",
    career: "适合教育培训、策划设计、文化创意、园林环保等需要创造力和成长性的领域。",
    health: "木主肝胆，注意疏肝理气，避免长期情绪压抑，宜多运动、少熬夜。",
    lucky: { color: "绿色、青色", number: "3、8", direction: "东方", season: "春季" },
  },
  火: {
    title: "火气偏盛 · 表达驱动型",
    copy: "火旺的人感染力强、行动果断，容易带动氛围与节奏。优点是热情、执行快；需要留意情绪上头、节奏过快或消耗过度。",
    career: "适合销售市场、演艺传媒、餐饮烹饪、能源电力等需要热情和表现力的领域。",
    health: "火主心脏小肠，注意养心安神，避免过度兴奋劳累，宜静心冥想。",
    lucky: { color: "红色、紫色", number: "2、7", direction: "南方", season: "夏季" },
  },
  土: {
    title: "土气偏盛 · 稳定承载型",
    copy: "土旺的人重视安全感与责任边界，做事踏实、讲究结果。优点是耐心与稳健；要避免的是过度保守，或者背负过多压力。",
    career: "适合房地产、农业、建筑工程、人力资源等需要稳定和耐心的领域。",
    health: "土主脾胃，注意饮食规律，避免思虑过度，宜调理消化系统。",
    lucky: { color: "黄色、棕色", number: "5、0", direction: "中央", season: "四季交替之际" },
  },
  金: {
    title: "金气偏盛 · 判断秩序型",
    copy: "金旺的人通常逻辑清楚、标准明确，擅长取舍与判断。优点是效率高、边界感强；提醒是避免过于苛刻，留一点弹性更顺。",
    career: "适合金融法律、机械制造、医疗手术、科技研发等需要精准和判断力的领域。",
    health: "金主肺与大肠，注意呼吸系统保养，避免悲伤过度，宜呼吸锻炼。",
    lucky: { color: "白色、金色", number: "4、9", direction: "西方", season: "秋季" },
  },
  水: {
    title: "水气偏盛 · 感知流动型",
    copy: "水旺的人感受力强、适应变化快，也更擅长洞察趋势。优点是思维灵活、共情力好；需要注意犹豫摇摆，别让想法淹没行动。",
    career: "适合航运物流、旅游服务、咨询策划、互联网科技等需要灵活和流动性的领域。",
    health: "水主肾与膀胱，注意泌尿系统健康，避免恐惧担忧过度，宜温补养肾。",
    lucky: { color: "黑色、深蓝", number: "1、6", direction: "北方", season: "冬季" },
  },
};

const WEAK_ELEMENT_ADVICE = {
  木: {
    brief: "木偏弱，适合多接触自然、清晨活动、学习新技能，用稳定成长感补足能量。",
    detail: "建议：多穿青绿色衣物，在居所东方摆放绿植，饮食多吃蔬菜水果。工作中培养规划能力，清晨起床有助补木气。",
  },
  火: {
    brief: "火偏弱，适合增加表达、社交、运动与日照，让生活更有热度。",
    detail: "建议：多穿红色暖色系衣物，增加户外运动和阳光接触时间，培养演讲表达能力。在居所南方可放红色装饰物。",
  },
  土: {
    brief: "土偏弱，适合建立规律作息、整理空间、做好储蓄与计划，用秩序感稳住节奏。",
    detail: "建议：注意饮食规律，建立稳定的作息习惯，居住环境保持整洁。可在居所中央区域放置陶瓷摆件，穿黄棕色衣物。",
  },
  金: {
    brief: "金偏弱，适合练习决策、断舍离和执行清单，把目标收束得更明确。",
    detail: "建议：培养果断的决策习惯，练习列清单和执行力。可佩戴金属饰品，穿白色金色衣物，居所西方放金属装饰。",
  },
  水: {
    brief: "水偏弱，适合留出独处、阅读、复盘与思考的时间，让判断更从容。",
    detail: "建议：增加阅读和独处思考时间，多饮水，居所北方可放小型水景。穿黑色深蓝色衣物，培养冷静深思的习惯。",
  },
};

/* ===== 出生地五行与风水数据 ===== */
const REGION_ELEMENT_MAP = {
  // 华北
  北京: { element: "火", direction: "北方偏东", terrain: "平原", desc: "京畿之地，龙脉汇聚，帝王之气深厚，火土并旺", feature: "故都紫气，利权贵仕途，适合从政经商", advice: "北京属火中带金，适合果断有魄力之人发展" },
  天津: { element: "水", direction: "北方沿海", terrain: "滨海平原", desc: "河海交汇，水运亨通，商贾之气旺盛", feature: "九河下梢，水旺利财运，商业气息浓", advice: "天津水气充沛，宜从事贸易流通行业" },
  石家庄: { element: "土", direction: "北方", terrain: "平原", desc: "华北腹地，土气厚实，稳健务实", feature: "沃野千里，土气厚载，适合稳扎稳打", advice: "石家庄土气深厚，利房产基建行业" },
  太原: { element: "金", direction: "北方偏西", terrain: "盆地", desc: "表里山河，金气凝聚，坚韧刚毅", feature: "龙城宝地，金气刚健，利制造和矿业", advice: "太原金气旺盛，适合技术和实业发展" },
  呼和浩特: { element: "土", direction: "北方", terrain: "高原", desc: "塞外草原，天阔地广，土气浩瀚", feature: "草原沃土，胸襟开阔利格局宏大之事", advice: "呼和浩特土木并旺，宜牧业、旅游相关" },
  // 东北
  沈阳: { element: "金", direction: "东北", terrain: "平原", desc: "清朝龙兴之地，金气凌厉，有肃杀之威", feature: "龙兴故都，金水相生，利军工制造", advice: "沈阳金气凛冽，适合重工业、装备制造" },
  大连: { element: "水", direction: "东北沿海", terrain: "半岛", desc: "三面环海，水气旺盛，灵活通达", feature: "明珠港城，水木相生，利贸易旅游", advice: "大连水气充沛，适合外贸、航运、旅游" },
  长春: { element: "木", direction: "东北", terrain: "平原", desc: "北国春城，木气初生，蓄势待发", feature: "春城之名，木气向上，利汽车教育", advice: "长春木气渐旺，适合制造业和教育行业" },
  哈尔滨: { element: "水", direction: "东北", terrain: "平原", desc: "冰城水韵，寒水凝结，坚毅深沉", feature: "冰雪之都，水气极旺，利冷链物流", advice: "哈尔滨水气极强，宜从事与水相关行业" },
  // 华东
  上海: { element: "水", direction: "东方沿海", terrain: "滨海平原", desc: "十里洋场，水木交汇，财气鼎盛，国际化气场极强", feature: "东方明珠，水旺生财，金融之都", advice: "上海水金并旺，极利金融贸易、时尚创意" },
  南京: { element: "火", direction: "东方", terrain: "丘陵", desc: "六朝古都，虎踞龙蟠，王气沉厚，文脉昌隆", feature: "十朝都会，火土相生，利学术仕途", advice: "南京火气深蕴，适合学术研究、文化教育" },
  杭州: { element: "水", direction: "东南", terrain: "丘陵与平原", desc: "上有天堂下有苏杭，水秀山明，灵气萦绕，文旺财丰", feature: "人间天堂，水木清华，利电商创业", advice: "杭州水木交融，极利互联网和创新创业" },
  苏州: { element: "水", direction: "东方", terrain: "水乡平原", desc: "江南水乡，水木并茂，温润灵秀", feature: "园林之城，水气蕴秀，利制造科技", advice: "苏州水土相融，适合精密制造和科技产业" },
  合肥: { element: "土", direction: "东方偏中", terrain: "平原", desc: "淝水之畔，土气稳健，后发潜力大", feature: "创新之都，土火相生，利科技制造", advice: "合肥土气渐旺，适合科技创新和高端制造" },
  济南: { element: "水", direction: "东方偏北", terrain: "丘陵", desc: "泉城灵韵，水脉丰沛，灵动秀雅", feature: "泉水之都，水土并济，利文教商贸", advice: "济南水气灵动，适合文化教育和服务业" },
  青岛: { element: "水", direction: "东方沿海", terrain: "丘陵沿海", desc: "山海相依，水木交融，清朗大气", feature: "海滨名城，水气开阔，利航运外贸", advice: "青岛水气宽广，适合海洋经济和旅游" },
  福州: { element: "木", direction: "东南沿海", terrain: "盆地", desc: "有福之州，木气繁荣，温暖舒适", feature: "榕城绿韵，木气旺盛，利软件外贸", advice: "福州木气充盈，适合软件开发和对外贸易" },
  厦门: { element: "水", direction: "东南沿海", terrain: "海岛", desc: "海上花园，水气清灵，文艺浪漫", feature: "鹭岛灵秀，水火既济，利旅游文创", advice: "厦门水气秀美，适合旅游、文创、服务业" },
  宁波: { element: "水", direction: "东方沿海", terrain: "沿海丘陵", desc: "港通天下，水运亨通，实业兴旺", feature: "东海名港，水金相生，利航运贸易", advice: "宁波水气汹涌，适合港口贸易和制造业" },
  无锡: { element: "水", direction: "东方", terrain: "水乡", desc: "太湖明珠，水润物丰，富甲一方", feature: "太湖灵秀，水旺生财，利物联科技", advice: "无锡水气丰润，适合科技产业和现代制造" },
  温州: { element: "火", direction: "东南沿海", terrain: "沿海丘陵", desc: "商人之乡，火气旺盛，开拓进取", feature: "商都火气，敢拼敢闯，利创业经商", advice: "温州火气刚烈，极利自主创业和商贸" },
  // 华中
  武汉: { element: "水", direction: "中部", terrain: "江湖平原", desc: "九省通衢，长江汉水交汇，水运极盛，大气磅礴", feature: "江城水韵，水木交融，利教育科技", advice: "武汉水气浩荡，适合教育科研和光电产业" },
  长沙: { element: "火", direction: "中南", terrain: "丘陵", desc: "楚汉名城，火气旺盛，热情奔放，创新活力足", feature: "星城热土，火旺利文娱科技", advice: "长沙火气充盈，极利文娱传媒和消费产业" },
  郑州: { element: "土", direction: "中原", terrain: "平原", desc: "中原腹地，天地之中，土气最厚，四通八达", feature: "天下之中，土气浩厚，利物流交通", advice: "郑州土气中正，适合物流枢纽和商贸流通" },
  南昌: { element: "火", direction: "中部偏南", terrain: "盆地", desc: "英雄城池，火气昂扬，正义勇毅", feature: "军旗升起处，火气刚正，利军工科技", advice: "南昌火土相生，适合制造业和科技创新" },
  // 华南
  广州: { element: "火", direction: "南方", terrain: "三角洲", desc: "南国商都，火气炽盛，商业气场极强，包容开放", feature: "千年商都，火旺生土利财运", advice: "广州火气鼎盛，极利贸易批发、餐饮服务" },
  深圳: { element: "火", direction: "南方沿海", terrain: "沿海丘陵", desc: "改革前沿，火木交融，创新之气蓬勃，年轻有活力", feature: "创新之城，火木相生，利科技创业", advice: "深圳火气创新，极利高科技和互联网创业" },
  珠海: { element: "水", direction: "南方沿海", terrain: "沿海", desc: "百岛之市，水气清雅，宜居宜业", feature: "海滨花园，水气宜人，利旅游休闲", advice: "珠海水气清新，适合休闲旅游和高端制造" },
  东莞: { element: "火", direction: "南方", terrain: "丘陵", desc: "制造名城，火土并旺，实干苦干", feature: "世界工厂，火土相生，利制造加工", advice: "东莞火土气旺，适合制造业和产业升级" },
  佛山: { element: "金", direction: "南方", terrain: "三角洲", desc: "武术之乡，金气凛然，制造业发达", feature: "铸造名城，金火淬炼，利陶瓷建材", advice: "佛山金气铸就，适合建材家居和先进制造" },
  海口: { element: "水", direction: "南方岛屿", terrain: "沿海", desc: "椰城海韵，水气充沛，热带风情", feature: "自贸港口，水火交融，利旅游外贸", advice: "海口水气温暖，适合自由贸易和旅游开发" },
  南宁: { element: "木", direction: "南方偏西", terrain: "盆地", desc: "绿城风光，木气盎然，亚热带气候温和", feature: "绿城木韵，木火相生，利东盟贸易", advice: "南宁木气繁茂，适合东盟贸易和特色农业" },
  // 西南
  成都: { element: "土", direction: "西南", terrain: "盆地", desc: "天府之国，土气丰饶，安逸富足，文化底蕴深厚", feature: "天府沃土，土金相生，利美食科技", advice: "成都土气丰厚，极利游戏科技、文创美食" },
  重庆: { element: "火", direction: "西南", terrain: "山地", desc: "山城雾都，火土交汇，刚毅热烈，性格豪爽", feature: "巴渝火气，刚烈直爽，利制造汽车", advice: "重庆火气刚烈，适合汽车制造和重工业" },
  昆明: { element: "木", direction: "西南", terrain: "高原", desc: "春城花都，四季如春，木气长青，灵气汇聚", feature: "春城木韵，木水相涵，利旅游花卉", advice: "昆明木气常青，适合旅游和生态产业" },
  贵阳: { element: "木", direction: "西南", terrain: "高原山地", desc: "爽爽贵阳，山木并秀，空气清新", feature: "林城木气，水木相滋，利大数据旅游", advice: "贵阳木水相生，适合大数据和生态旅游" },
  拉萨: { element: "金", direction: "西南高原", terrain: "高原", desc: "日光之城，金气纯净，灵性至高", feature: "雪域净土，金水相映，利灵修文旅", advice: "拉萨金气至纯，适合文化旅游和心灵产业" },
  // 西北
  西安: { element: "金", direction: "西北", terrain: "关中平原", desc: "千年帝都，金气凝厚，皇家气象，文脉绵长", feature: "十三朝古都，金土相生，利军工科教", advice: "西安金气庄重，极利军工科技和文化教育" },
  兰州: { element: "金", direction: "西北", terrain: "河谷", desc: "金城玉关，黄河穿城，金水相生", feature: "金城汤池，金水并济，利石化能源", advice: "兰州金水交融，适合能源化工行业" },
  银川: { element: "金", direction: "西北", terrain: "平原", desc: "塞上江南，金土相映，富饶宜居", feature: "塞上明珠，金水灌溉，利枸杞葡萄", advice: "银川金水并旺，适合特色农业和新能源" },
  西宁: { element: "水", direction: "西北高原", terrain: "河谷", desc: "西海锁钥，水气清冽，纯净高远", feature: "高原水韵，水金相生，利盐湖能源", advice: "西宁水气纯净，适合新能源和高原生态" },
  乌鲁木齐: { element: "土", direction: "西北", terrain: "盆地", desc: "丝路明珠，土气广袤，连通东西", feature: "丝路要冲，土金并旺，利能源贸易", advice: "乌鲁木齐土气辽阔，适合能源和中亚贸易" },
  // 特别行政区/台湾
  香港: { element: "水", direction: "南方沿海", terrain: "半岛与岛屿", desc: "东方之珠，水气汇聚全球财运，金融中心", feature: "港岛水气，水金相生，利金融贸易", advice: "香港水气旺财，极利国际金融和贸易" },
  澳门: { element: "水", direction: "南方沿海", terrain: "半岛", desc: "莲花宝地，水气灵秀，小而精致", feature: "莲城水韵，水火交映，利旅游博彩", advice: "澳门水气灵巧，适合旅游娱乐和服务业" },
  // 台湾地区
  台北: { element: "水", direction: "东方沿海", terrain: "盆地", desc: "宝岛明珠，水木交融，科技文创发达", feature: "科技之都，水木相滋，利半导体文创", advice: "台北水木并旺，适合高科技和文化创意" },
  新北: { element: "水", direction: "东方沿海", terrain: "丘陵与平原", desc: "环抱台北，水气丰沛，人口众多，商业繁荣", feature: "卫星城市，水土相生，利商贸服务", advice: "新北水气深厚，适合零售服务和中小企业" },
  桃园: { element: "木", direction: "东方沿海", terrain: "台地", desc: "桃花源里，木气盎然，工业重镇，航空枢纽", feature: "航空门户，木火相生，利制造物流", advice: "桃园木气旺盛，适合制造业和物流产业" },
  台中: { element: "火", direction: "东方沿海", terrain: "盆地", desc: "宝岛之心，火气温暖，文化气息浓厚，宜居之城", feature: "文化之都，火土相生，利文创设计", advice: "台中火气温润，适合文创产业和精密机械" },
  台南: { element: "火", direction: "东方沿海", terrain: "平原", desc: "府城古韵，火气深厚，历史文化底蕴最深", feature: "古都文脉，火气绵长，利科技文教", advice: "台南火气悠远，适合半导体产业和文化旅游" },
  高雄: { element: "火", direction: "东方沿海偏南", terrain: "平原与港口", desc: "港都雄风，火气炽烈，工业气息浓厚，阳刚大气", feature: "南方重镇，火金淬炼，利重工港运", advice: "高雄火气刚烈，适合重工业、港口贸易和造船" },
  新竹: { element: "金", direction: "东方沿海", terrain: "丘陵", desc: "风城硅谷，金气凛冽，科技创新能量极强", feature: "科技重镇，金水相生，利半导体IC", advice: "新竹金气精锐，极利半导体和高科技研发" },
  基隆: { element: "水", direction: "东方沿海", terrain: "港口丘陵", desc: "雨都港城，水气充沛，港口要塞", feature: "雨港水韵，水气旺盛，利航运贸易", advice: "基隆水气浓郁，适合港口物流和海洋产业" },
  嘉义: { element: "木", direction: "东方沿海", terrain: "平原与山地", desc: "阿里山下，木气清新，农业与观光并重", feature: "山城木韵，木火相生，利农业观光", advice: "嘉义木气清幽，适合农业加工和生态旅游" },
  花莲: { element: "木", direction: "东方沿海", terrain: "纵谷与海岸", desc: "后山净土，木水交融，自然灵气充沛", feature: "山海灵秀，木水相涵，利观光疗愈", advice: "花莲木气灵动，适合观光旅游和身心灵产业" },
  台东: { element: "木", direction: "东方沿海", terrain: "纵谷", desc: "宝岛后花园，木气天然，质朴原始", feature: "自然净土，木气纯粹，利有机农业", advice: "台东木气纯净，适合有机农业和深度旅游" },
  屏东: { element: "火", direction: "东方沿海偏南", terrain: "平原", desc: "国境之南，火气炽热，热带风情浓厚", feature: "南国热情，火水交融，利农渔观光", advice: "屏东火气热烈，适合热带农业和海洋观光" },
  宜兰: { element: "水", direction: "东方沿海", terrain: "平原", desc: "兰阳平原，水气氤氲，温泉之乡", feature: "水乡灵气，水木相生，利温泉观光", advice: "宜兰水气滋润，适合观光休闲和有机农业" },
  苗栗: { element: "木", direction: "东方沿海", terrain: "丘陵", desc: "山城客乡，木气蕴秀，客家文化深厚", feature: "客家山城，木土相融，利农业文化", advice: "苗栗木气淳朴，适合特色农业和客家文创" },
  彰化: { element: "土", direction: "东方沿海", terrain: "平原", desc: "半线古城，土气丰饶，传统产业根基深", feature: "沃野平原，土金相生，利传统制造", advice: "彰化土气厚实，适合传统制造业和农业" },
  南投: { element: "木", direction: "东方内陆", terrain: "山地", desc: "台湾唯一不靠海的县，木气深幽，山林灵秀", feature: "山中秘境，木水相养，利茶业观光", advice: "南投木气幽深，适合茶产业和山林观光" },
  云林: { element: "土", direction: "东方沿海", terrain: "平原", desc: "农业大县，土气浑厚，朴实勤劳", feature: "粮仓沃土，土气深厚，利农业加工", advice: "云林土气浓郁，适合农业深加工和食品产业" },
  澎湖: { element: "水", direction: "东方海上", terrain: "群岛", desc: "菊岛风光，水气包围，海洋气息浓郁", feature: "海岛水韵，水火交映，利渔业观光", advice: "澎湖水气环绕，适合海洋旅游和渔业" },
  金门: { element: "金", direction: "东方海上", terrain: "岛屿", desc: "浯岛雄关，金气刚毅，战地风情独特", feature: "前线要塞，金水相生，利酒业文旅", advice: "金门金气凛然，适合酒业品牌和战地旅游" },
};

/* ===== 城市经度表（用于真太阳时修正） =====
 * 公式：真太阳时 = 北京时间 + (当地经度 − 120°) × 4 分钟
 * 东经大于120°的城市（如上海）时间比北京时间"快"，小于120°（如拉萨）"慢"
 */
const CITY_LONGITUDE = {
  // 华北
  北京: 116.41, 天津: 117.20, 石家庄: 114.52, 太原: 112.55, 呼和浩特: 111.75,
  // 东北
  沈阳: 123.43, 大连: 121.61, 长春: 125.32, 哈尔滨: 126.53,
  // 华东
  上海: 121.47, 南京: 118.78, 杭州: 120.15, 苏州: 120.62, 合肥: 117.28,
  济南: 117.00, 青岛: 120.38, 福州: 119.30, 厦门: 118.08, 宁波: 121.55,
  无锡: 120.30, 温州: 120.65,
  // 华中
  武汉: 114.30, 长沙: 112.93, 郑州: 113.62, 南昌: 115.90,
  // 华南
  广州: 113.26, 深圳: 114.06, 珠海: 113.58, 东莞: 113.75, 佛山: 113.12,
  海口: 110.33, 南宁: 108.37,
  // 西南
  成都: 104.07, 重庆: 106.55, 昆明: 102.72, 贵阳: 106.63, 拉萨: 91.13,
  // 西北
  西安: 108.95, 兰州: 103.82, 银川: 106.28, 西宁: 101.78, 乌鲁木齐: 87.62,
  // 特别行政区
  香港: 114.17, 澳门: 113.55,
  // 台湾
  台北: 121.51, 新北: 121.47, 桃园: 121.30, 台中: 120.68, 台南: 120.20,
  高雄: 120.31, 新竹: 120.97, 基隆: 121.74, 嘉义: 120.45, 花莲: 121.61,
  台东: 121.14, 屏东: 120.49, 宜兰: 121.76, 苗栗: 120.82, 彰化: 120.54,
  南投: 120.68, 云林: 120.54, 澎湖: 119.56, 金门: 118.33,
};

/* 真太阳时修正
 * @param {Date} birth - 原始北京时间
 * @param {string} cityName - 标准化后的城市名
 * @returns {{adjusted: Date, offsetMin: number, longitude: number, note: string} | null}
 */
function applyTrueSolarTime(birth, cityName) {
  if (!cityName || !birth) return null;
  const lng = CITY_LONGITUDE[cityName];
  if (typeof lng !== "number") return null;
  // 当地经度与东经120°（北京时间基准）的时差（分钟）
  const offsetMin = (lng - 120) * 4;
  const adjusted = new Date(birth.getTime() + offsetMin * 60 * 1000);
  const sign = offsetMin >= 0 ? "+" : "−";
  const absMin = Math.abs(offsetMin);
  const m = Math.floor(absMin);
  const s = Math.round((absMin - m) * 60);
  const note = `出生地${cityName}经度${lng.toFixed(2)}°E，与北京时间时差${sign}${m}分${s}秒，已自动修正为真太阳时`;
  return { adjusted, offsetMin, longitude: lng, note };
}

/* 模糊匹配出生地 */
function matchBirthplace(input) {
  if (!input) return null;
  const clean = input.trim().replace(/[市省区县镇乡村]/g, "");
  
  // 精确匹配
  if (REGION_ELEMENT_MAP[clean]) return { city: clean, ...REGION_ELEMENT_MAP[clean] };
  
  // 模糊匹配（包含关系）
  for (const [city, data] of Object.entries(REGION_ELEMENT_MAP)) {
    if (clean.includes(city) || city.includes(clean)) {
      return { city, ...data };
    }
  }
  
  // 省份匹配
  const PROVINCE_CITY = {
    广东: "广州", 浙江: "杭州", 江苏: "南京", 山东: "济南", 河南: "郑州",
    四川: "成都", 湖北: "武汉", 湖南: "长沙", 福建: "福州", 安徽: "合肥",
    江西: "南昌", 河北: "石家庄", 辽宁: "沈阳", 吉林: "长春", 黑龙江: "哈尔滨",
    陕西: "西安", 山西: "太原", 甘肃: "兰州", 云南: "昆明", 贵州: "贵阳",
    广西: "南宁", 海南: "海口", 内蒙古: "呼和浩特", 宁夏: "银川",
    青海: "西宁", 新疆: "乌鲁木齐", 西藏: "拉萨", 台湾: "台北",
  };
  
  for (const [prov, city] of Object.entries(PROVINCE_CITY)) {
    if (clean.includes(prov) || prov.includes(clean)) {
      return { city, ...REGION_ELEMENT_MAP[city] };
    }
  }
  
  return null;
}

/* 分析出生地对命格的影响 */
function analyzeBirthplaceInfluence(regionInfo, dayElement, dominant, weak, counts) {
  const regionEl = regionInfo.element;
  
  // 地域五行与日主的关系
  let relation = "";
  let harmony = 0; // -2 到 2 的和谐度
  
  if (regionEl === dayElement) {
    relation = "比助";
    harmony = 1;
  } else if (ELEMENT_GENERATE[regionEl] === dayElement) {
    relation = "生助";
    harmony = 2;
  } else if (ELEMENT_GENERATED_BY[regionEl] === dayElement) {
    relation = "泄气";
    harmony = -1;
  } else if (ELEMENT_OVERCOME[regionEl] === dayElement) {
    relation = "克制";
    harmony = -2;
  } else if (ELEMENT_OVERCOME_BY[regionEl] === dayElement) {
    relation = "受克";
    harmony = 0;
  }
  
  // 是否补足了弱元素
  const fillWeak = regionEl === weak;
  
  // 综合评语
  let summary = "";
  if (harmony >= 2) {
    summary = `你的出生地${regionInfo.city}五行属${regionEl}，与你的日主${dayElement}形成"${relation}"关系，这是非常吉利的格局！${regionEl}生${dayElement}，如同大地滋养根苗，出生地为你的命格注入了天然的能量加持。`;
  } else if (harmony === 1) {
    summary = `出生地${regionInfo.city}五行属${regionEl}，与你的日主${dayElement}同属一气，形成"${relation}"关系。同气相求，出生地加强了你的本命气场，让你的${dayElement}属性更加鲜明有力。`;
  } else if (harmony === 0) {
    summary = `出生地${regionInfo.city}五行属${regionEl}，与你的日主${dayElement}之间存在张力。这种紧张感反而能激发潜能，让你在挑战中成长，历练出更强的适应力。`;
  } else if (harmony === -1) {
    summary = `出生地${regionInfo.city}五行属${regionEl}，你的日主${dayElement}生${regionEl}，有一定的能量外泄。不过这也意味着你天生愿意付出，容易获得他人认可和回报。`;
  } else {
    summary = `出生地${regionInfo.city}五行属${regionEl}，对你的日主${dayElement}有一定的克制作用。但古语说"玉不琢不成器"，适当的约束反而能让你更加沉稳内敛，大器晚成。`;
  }
  
  if (fillWeak) {
    summary += `\n\n特别有利的是：${regionInfo.city}的${regionEl}气恰好补足了你八字中偏弱的${weak}，这是天时地利的好配置，出生地为你的命格形成了天然的调和！`;
  }
  
  // 发展建议
  let devAdvice = "";
  if (harmony >= 1) {
    devAdvice = `出生地对你的加持很强，在${regionInfo.city}及${regionInfo.direction}发展会如鱼得水。${regionInfo.advice}`;
  } else {
    const goodDir = DOMINANT_PROFILE[dayElement]?.lucky?.direction || "本命有利方位";
    devAdvice = `虽然出生地气场与日主有些张力，但这锻炼了你的适应力。建议在${goodDir}方向寻找发展机会，也可以考虑前往五行属${ELEMENT_GENERATED_BY[dayElement]}的城市发展。${regionInfo.advice}`;
  }
  
  return {
    regionEl,
    relation,
    harmony,
    fillWeak,
    summary,
    devAdvice,
    harmonyStar: harmony >= 2 ? "★★★★★" : harmony >= 1 ? "★★★★☆" : harmony >= 0 ? "★★★☆☆" : harmony >= -1 ? "★★☆☆☆" : "★☆☆☆☆",
    harmonyLabel: harmony >= 2 ? "极佳" : harmony >= 1 ? "良好" : harmony >= 0 ? "中等" : harmony >= -1 ? "偏弱" : "需调和",
  };
}


const YEARLY_RANGE_START = 2015;
const YEARLY_RANGE_END = 2035;

const YEARLY_ELEMENT_INFLUENCE = {
  木: {
    木: { score: 75, desc: "比劫之年，同类相助，人脉扩展但需防竞争加剧" },
    火: { score: 85, desc: "食伤之年，才华绽放，创意与表达的黄金期" },
    土: { score: 70, desc: "财星之年，求财有道，适合投资理财和拓展收入" },
    金: { score: 55, desc: "官杀之年，压力与机遇并存，事业有挑战亦有突破" },
    水: { score: 80, desc: "印星之年，学业有成，贵人运旺，适合进修充电" },
  },
  火: {
    木: { score: 80, desc: "印星之年，获得支持与庇护，学业事业有贵人" },
    火: { score: 75, desc: "比劫之年，行动力旺盛但要防过度消耗" },
    土: { score: 85, desc: "食伤之年，表达力强，艺术创造的高光时刻" },
    金: { score: 70, desc: "财星之年，正财偏财均有机会，把握时机" },
    水: { score: 55, desc: "官杀之年，外在压力大但有助于成长突破" },
  },
  土: {
    木: { score: 55, desc: "官杀之年，有管束和考验，也有贵人提携" },
    火: { score: 80, desc: "印星之年，长辈庇护，适合沉淀积累" },
    土: { score: 75, desc: "比劫之年，稳固根基的一年，守成为主" },
    金: { score: 85, desc: "食伤之年，技能输出期，适合展示实力" },
    水: { score: 70, desc: "财星之年，财运渐好，但需稳健理财" },
  },
  金: {
    木: { score: 70, desc: "财星之年，收入有增，适合拓展财源" },
    火: { score: 55, desc: "官杀之年，职场压力大但有晋升机会" },
    土: { score: 80, desc: "印星之年，有长辈贵人支持，适合深造" },
    金: { score: 75, desc: "比劫之年，同行相助但注意竞争" },
    水: { score: 85, desc: "食伤之年，灵感迸发，创新创业的好时机" },
  },
  水: {
    木: { score: 85, desc: "食伤之年，思维活跃，表达与创造力达到巅峰" },
    火: { score: 70, desc: "财星之年，财来财往，注意把握赚钱节奏" },
    土: { score: 55, desc: "官杀之年，有约束和压力，也有成长机遇" },
    金: { score: 80, desc: "印星之年，学业运佳，容易获得提携和指导" },
    水: { score: 75, desc: "比劫之年，人缘广但需防小人，合作共赢" },
  },
};

/* ===== 流年财运评分 ===== */
const YEARLY_WEALTH_INFLUENCE = {
  木: {
    木: { score: 60, desc: "同类之年，财运平稳，不宜激进投资" },
    火: { score: 70, desc: "食伤生财，创意变现机会多" },
    土: { score: 88, desc: "财星当令，正财偏财两旺，把握良机" },
    金: { score: 55, desc: "官星制身，花销增大，量入为出" },
    水: { score: 65, desc: "印星护身，财运稳健但增长有限" },
  },
  火: {
    木: { score: 65, desc: "印星之年，财运平稳，宜守不宜攻" },
    火: { score: 60, desc: "比劫争财，防合作纠纷和破财" },
    土: { score: 70, desc: "食伤生财，才华转化财富的好时机" },
    金: { score: 88, desc: "财星大旺，收入丰厚，投资有利" },
    水: { score: 55, desc: "官杀耗财，需谨慎理财防意外支出" },
  },
  土: {
    木: { score: 55, desc: "官杀克身，财运受压，守成为上" },
    火: { score: 65, desc: "印星之年，财运平稳，贵人助财" },
    土: { score: 60, desc: "比劫之年，同行竞争激烈，防破财" },
    金: { score: 70, desc: "食伤泄秀，技能变现收入增加" },
    水: { score: 88, desc: "财星当旺，求财顺利，偏财运尤佳" },
  },
  金: {
    木: { score: 88, desc: "财星大利，正偏财运双旺，大胆求财" },
    火: { score: 55, desc: "官杀克身，花费增多，控制开支" },
    土: { score: 65, desc: "印星之年，财运尚可，稳中有升" },
    金: { score: 60, desc: "比劫争财，投资需谨慎防亏损" },
    水: { score: 70, desc: "食伤生财，灵感变现能力强" },
  },
  水: {
    木: { score: 70, desc: "食伤旺盛，创意创业带来收入" },
    火: { score: 88, desc: "财星当令，财运亨通，投资理财旺季" },
    土: { score: 55, desc: "官杀制身，破财风险高，保守为佳" },
    金: { score: 65, desc: "印星护财，收入平稳，贵人助财" },
    水: { score: 60, desc: "比劫之年，钱财易散，合作需谨慎" },
  },
};

/* ===== 流年事业评分 ===== */
const YEARLY_CAREER_INFLUENCE = {
  木: {
    木: { score: 72, desc: "比肩之年，同行助力但竞争也大" },
    火: { score: 80, desc: "食伤泄秀，才华展示期，利创新创业" },
    土: { score: 65, desc: "财星耗身，工作忙碌收效一般" },
    金: { score: 85, desc: "官星当权，升职加薪良机，贵人提拔" },
    水: { score: 78, desc: "印星助力，学业进修利，资质认证好时机" },
  },
  火: {
    木: { score: 78, desc: "印星助力，获得上级支持和资源" },
    火: { score: 72, desc: "比劫之年，团队合作但主导权需争取" },
    土: { score: 80, desc: "食伤泄秀，创新表现突出利晋升" },
    金: { score: 65, desc: "财星耗身，事业进展平缓需耐心" },
    水: { score: 85, desc: "官杀当权，职场突破大好时机" },
  },
  土: {
    木: { score: 85, desc: "官星高照，仕途顺利，领导赏识" },
    火: { score: 78, desc: "印星加持，专业提升期，利考证进修" },
    土: { score: 72, desc: "比肩之年，稳固现有地位为主" },
    金: { score: 80, desc: "食伤生辉，展现实力的好机会" },
    水: { score: 65, desc: "财星耗身，工作量大但成效有限" },
  },
  金: {
    木: { score: 65, desc: "财星分心，事业发展受限需专注" },
    火: { score: 85, desc: "官杀当令，事业大跃升之年，抓住机遇" },
    土: { score: 78, desc: "印星扶持，深造充电利长远发展" },
    金: { score: 72, desc: "比肩并肩，同事助力但竞争同在" },
    水: { score: 80, desc: "食伤展才，创新项目获认可" },
  },
  水: {
    木: { score: 80, desc: "食伤得力，创新突破获成就" },
    火: { score: 65, desc: "财星分神，事业节奏放缓需沉淀" },
    土: { score: 85, desc: "官杀主事，职场大好机遇，高层关注" },
    金: { score: 78, desc: "印星庇护，领导培养重用之年" },
    水: { score: 72, desc: "比肩之年，人脉拓展利合作发展" },
  },
};

/* ===== 流月运势关键词 ===== */
const MONTHLY_KEYWORDS = {
  比肩: { keyword: "合作", advice: "适合团队协作，但要注意利益分配" },
  劫财: { keyword: "竞争", advice: "有竞争压力，守住底线不冒进" },
  食神: { keyword: "创造", advice: "灵感充沛，适合创作和社交" },
  伤官: { keyword: "突破", advice: "有创新想法，注意控制情绪和言辞" },
  偏财: { keyword: "机遇", advice: "意外收获可能出现，但不可贪多" },
  正财: { keyword: "收获", advice: "正财稳定进账，适合理财规划" },
  七杀: { keyword: "挑战", advice: "压力较大，迎难而上反能成长" },
  正官: { keyword: "规矩", advice: "贵人运好，遵循规则做事" },
  偏印: { keyword: "学习", advice: "适合研究新知，留意非主流机会" },
  正印: { keyword: "贵人", advice: "有人帮扶，适合求学和考试" },
};

/* ===== 十神柱位差异化含义 ===== */
const TEN_GOD_PILLAR_MEANINGS = {
  比肩: {
    年柱: { meaning: "祖辈多兄弟姐妹，童年独立性强，早年靠自己打拼", tag: "自立" },
    月柱: { meaning: "朋友多、社交广，事业上多竞争伙伴，适合合伙经营", tag: "社交" },
    日支: { meaning: "配偶性格独立、有主见，婚姻中双方势均力敌", tag: "平等" },
    时柱: { meaning: "子女独立能干，晚年朋友多但经济上需自力更生", tag: "自强" },
  },
  劫财: {
    年柱: { meaning: "祖业难守或早年破财，兄弟姐妹间有竞争", tag: "争夺" },
    月柱: { meaning: "事业竞争激烈，易因朋友破财，合作需慎选对象", tag: "防损" },
    日支: { meaning: "配偶个性强势或花钱大方，婚姻中财务需协商", tag: "磨合" },
    时柱: { meaning: "晚年花销较大，子女有魄力但可能让你操心经济", tag: "耗散" },
  },
  食神: {
    年柱: { meaning: "祖辈福泽深厚，童年生活优渥，自幼才思敏捷", tag: "福泽" },
    月柱: { meaning: "才华横溢、表达力强，适合创意、文化、餐饮行业", tag: "才华" },
    日支: { meaning: "配偶温厚善良、懂生活情趣，家庭和睦有口福", tag: "温馨" },
    时柱: { meaning: "子女聪慧有才艺，晚年安逸享福、生活有品质", tag: "安逸" },
  },
  伤官: {
    年柱: { meaning: "少年叛逆、不服管教，与长辈有代沟但思维超前", tag: "叛逆" },
    月柱: { meaning: "技术出众、创新力强，适合专业技术或自由职业领域", tag: "专精" },
    日支: { meaning: "配偶才华横溢但个性尖锐，婚姻中需要包容与沟通", tag: "才子" },
    时柱: { meaning: "子女有才但个性强，晚年追求精神层面的满足", tag: "求新" },
  },
  偏财: {
    年柱: { meaning: "祖上经商或家境殷实，早年有意外财运或长辈馈赠", tag: "家底" },
    月柱: { meaning: "人缘极佳、社交生财，适合销售、投资、商贸行业", tag: "人脉" },
    日支: { meaning: "（男命）配偶温柔大方、会持家；异性缘佳但需守分寸", tag: "桃花" },
    时柱: { meaning: "晚年财运亨通，子女孝顺且经济条件好", tag: "晚福" },
  },
  正财: {
    年柱: { meaning: "家境务实稳定，自幼受勤俭家风熏陶，理财意识早", tag: "勤俭" },
    月柱: { meaning: "事业稳健、收入稳定，适合金融、财务、实业等领域", tag: "稳健" },
    日支: { meaning: "（男命）配偶贤惠持家、踏实可靠，家庭经济有保障", tag: "贤内" },
    时柱: { meaning: "晚年积蓄丰厚，子女务实孝顺、经济独立", tag: "积蓄" },
  },
  七杀: {
    年柱: { meaning: "童年管教严格或祖辈有军政背景，早年压力大但磨砺意志", tag: "磨砺" },
    月柱: { meaning: "事业心极强、有领导力和魄力，适合管理、军警、法律", tag: "权威" },
    日支: { meaning: "配偶能力强、有压迫感，婚姻中需互相尊重避免冲突", tag: "强势" },
    时柱: { meaning: "子女有出息但管不住，晚年仍有事业追求和挑战", tag: "不歇" },
  },
  正官: {
    年柱: { meaning: "家风端正、祖辈有社会地位，自幼受良好教育", tag: "家教" },
    月柱: { meaning: "仕途光明、贵人多助，适合公务员、管理层、大企业", tag: "仕途" },
    日支: { meaning: "（女命）丈夫正派有担当；（男命）自律性强、重视规矩", tag: "正派" },
    时柱: { meaning: "子女品学兼优、有出息，晚年受人尊敬、名声好", tag: "声望" },
  },
  偏印: {
    年柱: { meaning: "祖辈有特殊才能或非常规经历，童年环境较特殊", tag: "独特" },
    月柱: { meaning: "悟性极高、直觉灵敏，适合研究、IT、玄学、中医", tag: "悟性" },
    日支: { meaning: "配偶有独特才华但性格内敛，精神世界丰富", tag: "内秀" },
    时柱: { meaning: "子女有特殊天赋，晚年转向修身养性、追求精神价值", tag: "修行" },
  },
  正印: {
    年柱: { meaning: "家庭教育优良、母亲影响深远，自幼受呵护", tag: "庇荫" },
    月柱: { meaning: "学业运佳、有贵人提携，适合教育、学术、文化行业", tag: "学术" },
    日支: { meaning: "配偶仁慈包容、善解人意，家庭温馨和谐", tag: "慈爱" },
    时柱: { meaning: "子女孝顺、学业好，晚年安享清福、衣食无忧", tag: "清福" },
  },
};

/* ===== 十神组合解读 ===== */
const TEN_GOD_COMBOS = [
  { name: "官印相生", gods: ["正官", "正印"], quality: "吉",
    desc: "官星生印星，官得印护、印得官引，仕途文凭两得意。命主既有管理能力又有学识修养，适合体制内或大企业担任要职。" },
  { name: "杀印相生", gods: ["七杀", "正印"], quality: "吉",
    desc: "七杀配印星，化压力为动力。命主在高压环境中反而能超常发挥，适合竞争激烈的高端领域，如法律、金融、军事。" },
  { name: "食伤生财", gods: ["食神", "正财"], altGods: [["食神", "偏财"], ["伤官", "正财"], ["伤官", "偏财"]], quality: "吉",
    desc: "才华转化为财富的黄金组合。命主靠技艺、创意、口才赚钱，事业与财运相辅相成，是自由职业者和创业者的最佳格局。" },
  { name: "财官相生", gods: ["正财", "正官"], altGods: [["偏财", "正官"], ["正财", "七杀"]], quality: "吉",
    desc: "以财养官、以官护财，财权兼得。命主既有经济基础又有社会地位，事业步步高升，适合经商从政两手发展。" },
  { name: "伤官配印", gods: ["伤官", "正印"], quality: "吉",
    desc: "才华配修养，刚柔并济。命主有过人才气又不失沉稳，在学术、艺术、技术领域能达到很高成就。" },
  { name: "伤官见官", gods: ["伤官", "正官"], quality: "凶",
    desc: "伤官克官，口舌是非之象。命主才高气傲容易得罪上司权贵，事业上需收敛锋芒、低调做人，否则招祸。" },
  { name: "枭神夺食", gods: ["偏印", "食神"], quality: "凶",
    desc: "偏印克食神，创意受阻。命主有才华却施展不开，容易起步后又中途而废。须防投资被骗、合作翻脸。" },
  { name: "比劫夺财", gods: ["比肩", "正财"], altGods: [["劫财", "正财"], ["比肩", "偏财"], ["劫财", "偏财"]], quality: "凶",
    desc: "兄弟争财之象，人际关系带来经济损失。命主不宜与人合伙经营、不宜借贷担保，理财需独立自主。" },
  { name: "食神制杀", gods: ["食神", "七杀"], quality: "吉",
    desc: "以食制杀、化敌为友。命主能巧妙化解压力和竞争，以智慧和才华征服对手。属于高层次的命格配置。" },
  { name: "官杀混杂", gods: ["正官", "七杀"], quality: "凶",
    desc: "正官与七杀齐现，号令不一、立场矛盾。命主在事业上容易左右为难、受多方牵制。需要合杀留官或合官留杀来化解。" },
];

/* ===== 十神五分类映射 ===== */
const TEN_GOD_CATEGORIES = {
  比肩: "比劫", 劫财: "比劫",
  食神: "食伤", 伤官: "食伤",
  偏财: "财星", 正财: "财星",
  七杀: "官杀", 正官: "官杀",
  偏印: "印星", 正印: "印星",
};

const CATEGORY_MEANINGS = {
  比劫: { icon: "🤝", label: "比劫（自我·竞争）", desc: "代表自身力量、兄弟朋友和竞争能力。旺则人脉广、行动力强；过旺则刚愎自用、争财夺利。" },
  食伤: { icon: "🎨", label: "食伤（才华·表达）", desc: "代表才华输出、创造力和口才。旺则才思敏捷、创意丰富；过旺则恃才傲物、桀骜不驯。" },
  财星: { icon: "💰", label: "财星（财富·欲望）", desc: "代表财运、物质追求和异性缘（男命）。旺则财运亨通、生活富足；过旺则物欲重、劳碌奔波。" },
  官杀: { icon: "👔", label: "官杀（事业·权力）", desc: "代表事业地位、管理能力和约束力。旺则有权有势、受人尊重；过旺则压力大、是非多。" },
  印星: { icon: "🎓", label: "印星（学识·庇护）", desc: "代表学历、贵人、母亲和保护力量。旺则学识渊博、贵人运好；过旺则依赖心重、缺乏行动力。" },
};

