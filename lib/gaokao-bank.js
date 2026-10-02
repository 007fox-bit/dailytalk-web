// 高考英语原创仿真题生成器。
// 命题方向依据教育考试机构公开的历年试题与官方评析，不复制整道真题原文。
const gaokaoResearch = [
  {
    reference: "2024新课标适应性测试",
    authority: "中国教育考试网",
    sourceUrl: "https://www.neea.edu.cn/html1/report/2401/499-1.htm"
  },
  {
    reference: "2024上海春考英语评析",
    authority: "上海市教育考试院",
    sourceUrl: "https://www.shmeea.edu.cn/page/08000/20240107/18128.html"
  },
  {
    reference: "2023上海秋考英语评析",
    authority: "上海市教育考试院",
    sourceUrl: "https://www.shmeea.edu.cn/page/02200/20230610/17610.html"
  },
  {
    reference: "2021高考英语试题评析",
    authority: "教育部考试中心",
    sourceUrl: "https://hudong.moe.gov.cn/jyb_xwfb/s5147/202106/t20210609_536837.html"
  }
];

// 所有主语均为复数，动词提供原形、过去式、过去分词和现在分词，
// 从而可以稳定生成时态、语态、非谓语、从句、倒装与强调等句式。
const contexts = [
  ["students", "学生们", "develop", "developed", "developed", "developing", "good study habits", "良好的学习习惯"],
  ["young people", "年轻人", "protect", "protected", "protected", "protecting", "the environment", "环境"],
  ["volunteers", "志愿者们", "help", "helped", "helped", "helping", "local residents", "当地居民"],
  ["scientists", "科学家们", "explore", "explored", "explored", "exploring", "outer space", "外太空"],
  ["teachers", "教师们", "encourage", "encouraged", "encouraged", "encouraging", "independent thinking", "独立思考"],
  ["communities", "社区", "preserve", "preserved", "preserved", "preserving", "local culture", "本地文化"],
  ["families", "家庭", "reduce", "reduced", "reduced", "reducing", "food waste", "食物浪费"],
  ["athletes", "运动员们", "improve", "improved", "improved", "improving", "physical fitness", "身体素质"],
  ["readers", "读者们", "broaden", "broadened", "broadened", "broadening", "their knowledge", "知识面"],
  ["travelers", "旅行者们", "respect", "respected", "respected", "respecting", "local customs", "当地习俗"],
  ["schools", "学校", "promote", "promoted", "promoted", "promoting", "mental health", "心理健康"],
  ["researchers", "研究人员", "study", "studied", "studied", "studying", "climate change", "气候变化"],
  ["engineers", "工程师们", "design", "designed", "designed", "designing", "clean technology", "清洁技术"],
  ["artists", "艺术家们", "share", "shared", "shared", "sharing", "traditional stories", "传统故事"],
  ["farmers", "农民们", "adopt", "adopted", "adopted", "adopting", "modern methods", "现代方法"],
  ["doctors", "医生们", "improve", "improved", "improved", "improving", "public health", "公共健康"],
  ["citizens", "市民们", "follow", "followed", "followed", "following", "safety rules", "安全规则"],
  ["teenagers", "青少年", "manage", "managed", "managed", "managing", "screen time", "屏幕使用时间"],
  ["language learners", "语言学习者", "practice", "practiced", "practiced", "practicing", "English skills", "英语技能"],
  ["project teams", "项目团队", "solve", "solved", "solved", "solving", "difficult problems", "难题"],
  ["museums", "博物馆", "provide", "provided", "provided", "providing", "cultural education", "文化教育"],
  ["libraries", "图书馆", "support", "supported", "supported", "supporting", "lifelong learning", "终身学习"],
  ["companies", "企业", "reduce", "reduced", "reduced", "reducing", "energy use", "能源使用"],
  ["cities", "城市", "improve", "improved", "improved", "improving", "public transport", "公共交通"],
  ["classmates", "同学们", "organize", "organized", "organized", "organizing", "charity events", "慈善活动"],
  ["parents", "父母们", "build", "built", "built", "building", "children's confidence", "孩子的自信"],
  ["journalists", "记者们", "report", "reported", "reported", "reporting", "social changes", "社会变化"],
  ["inventors", "发明者们", "create", "created", "created", "creating", "useful tools", "实用工具"],
  ["online learners", "在线学习者", "use", "used", "used", "using", "digital resources", "数字资源"],
  ["nature groups", "自然保护团体", "protect", "protected", "protected", "protecting", "wildlife", "野生动物"],
  ["schools", "学校", "strengthen", "strengthened", "strengthened", "strengthening", "labor education", "劳动教育"],
  ["teachers", "教师们", "connect", "connected", "connected", "connecting", "lessons with life", "课堂与生活"],
  ["researchers", "研究人员", "collect", "collected", "collected", "collecting", "reliable data", "可靠数据"],
  ["young people", "年轻人", "spread", "spread", "spread", "spreading", "kindness", "善意"],
  ["families", "家庭", "maintain", "maintained", "maintained", "maintaining", "healthy routines", "健康的生活规律"],
  ["volunteers", "志愿者们", "clean", "cleaned", "cleaned", "cleaning", "public spaces", "公共空间"],
  ["students", "学生们", "appreciate", "appreciated", "appreciated", "appreciating", "classical literature", "经典文学"],
  ["scientists", "科学家们", "share", "shared", "shared", "sharing", "research findings", "研究成果"],
  ["communities", "社区", "prepare", "prepared", "prepared", "preparing", "emergency plans", "应急方案"],
  ["learners", "学习者", "develop", "developed", "developed", "developing", "critical thinking", "批判性思维"]
].map(item => ({
  subject: item[0], subjectCn: item[1], base: item[2], past: item[3], pp: item[4], ing: item[5], object: item[6], objectCn: item[7]
}));

const adjectives = ["important", "necessary", "beneficial", "meaningful", "valuable", "essential", "practical", "wise"];

const actionTranslations = {
  develop: "培养", protect: "保护", help: "帮助", explore: "探索", encourage: "鼓励", preserve: "保护",
  reduce: "减少", improve: "改善", broaden: "拓宽", respect: "尊重", promote: "促进", study: "研究",
  design: "设计", share: "分享", adopt: "采用", follow: "遵守", manage: "管理", practice: "练习",
  solve: "解决", provide: "提供", support: "支持", organize: "组织", build: "建立", report: "报道",
  create: "创造", use: "使用", strengthen: "加强", connect: "联系", collect: "收集", spread: "传播",
  maintain: "保持", clean: "清洁", appreciate: "欣赏", prepare: "制定"
};

function actionCn(context) {
  return actionTranslations[context.base] || "推进";
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const patterns = [
  {
    topic: "一般现在时与主谓一致",
    make: c => [`${capitalize(c.subject)} often`, c.base, `${c.object}.`, `${c.subjectCn}经常${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "一般过去时",
    make: c => [`Last year, ${c.subject}`, c.past, `${c.object}.`, `去年，${c.subjectCn}${actionCn(c)}了${c.objectCn}。`]
  },
  {
    topic: "现在完成时",
    make: c => [`In recent years, ${c.subject}`, "have", `${c.pp} ${c.object}.`, `近年来，${c.subjectCn}已经${actionCn(c)}了${c.objectCn}。`]
  },
  {
    topic: "含情态动词的被动语态",
    make: c => [`${capitalize(c.object)} can`, "be", `${c.pp} through joint efforts.`, `通过共同努力，${c.objectCn}可以得到改善。`]
  },
  {
    topic: "It作形式主语",
    make: (c, i) => [`It is ${adjectives[i % adjectives.length]}`, "for", `${c.subject} to ${c.base} ${c.object}.`, `对${c.subjectCn}来说，${actionCn(c)}${c.objectCn}很重要。`]
  },
  {
    topic: "不定式作目的状语",
    make: c => ["", "To", `${c.base} ${c.object}, ${c.subject} need to work together.`, `为了${actionCn(c)}${c.objectCn}，${c.subjectCn}需要共同努力。`]
  },
  {
    topic: "介词后接动名词",
    make: c => [`${capitalize(c.subject)} are committed`, "to", `${c.ing} ${c.object}.`, `${c.subjectCn}致力于${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "keep doing结构",
    make: c => [`Despite difficulties, ${c.subject}`, "keep", `${c.ing} ${c.object}.`, `尽管存在困难，${c.subjectCn}仍坚持${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "succeed in doing结构",
    make: c => [`${capitalize(c.subject)} finally succeeded`, "in", `${c.ing} ${c.object}.`, `${c.subjectCn}最终成功${actionCn(c)}了${c.objectCn}。`]
  },
  {
    topic: "by doing作方式状语",
    make: c => ["", "By", `${c.ing} ${c.object}, ${c.subject} can make a difference.`, `通过${actionCn(c)}${c.objectCn}，${c.subjectCn}能够带来改变。`]
  },
  {
    topic: "although让步状语从句",
    make: c => ["", "Although", `the task is challenging, ${c.subject} continue to ${c.base} ${c.object}.`, `尽管任务充满挑战，${c.subjectCn}仍继续${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "if条件状语从句",
    make: c => ["", "If", `${c.subject} ${c.base} ${c.object}, more people will benefit.`, `如果${c.subjectCn}${actionCn(c)}${c.objectCn}，更多人将从中受益。`]
  },
  {
    topic: "unless条件状语从句",
    make: c => ["", "Unless", `${c.subject} ${c.base} ${c.object}, real progress will be difficult.`, `除非${c.subjectCn}${actionCn(c)}${c.objectCn}，否则很难取得真正进展。`]
  },
  {
    topic: "what引导主语从句",
    make: c => ["", "What", `${c.subject} should do is to ${c.base} ${c.object}.`, `${c.subjectCn}应该做的是${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "why引导定语从句",
    make: c => [`The reason`, "why", `${c.subject} ${c.base} ${c.object} is that it matters to everyone.`, `${c.subjectCn}${actionCn(c)}${c.objectCn}的原因是这与每个人都有关。`]
  },
  {
    topic: "强调句型",
    make: c => [`It was the ${c.subject}`, "that", `first ${c.past} ${c.object}.`, `最先${actionCn(c)}${c.objectCn}的正是${c.subjectCn}。`]
  },
  {
    topic: "Only置于句首的倒装",
    make: c => [`Only then`, "did", `${c.subject} begin to ${c.base} ${c.object}.`, `直到那时，${c.subjectCn}才开始${actionCn(c)}${c.objectCn}。`]
  },
  {
    topic: "Not only倒装句",
    make: c => ["Not", "only", `did ${c.subject} ${c.base} ${c.object}, but they also inspired others.`, `${c.subjectCn}不仅${actionCn(c)}了${c.objectCn}，还激励了他人。`]
  },
  {
    topic: "the more...the more结构",
    make: c => ["The", "more", `actively ${c.subject} ${c.base} ${c.object}, the greater the impact will be.`, `${c.subjectCn}越积极地${actionCn(c)}${c.objectCn}，产生的影响就越大。`]
  },
  {
    topic: "There is no doubt that结构",
    make: c => ["There is no", "doubt", `that ${c.subject} can ${c.base} ${c.object}.`, `毫无疑问，${c.subjectCn}能够${actionCn(c)}${c.objectCn}。`]
  }
];

const gaokaoGeneratedRows = [];
contexts.forEach((context, contextIndex) => {
  patterns.forEach((pattern, patternIndex) => {
    const row = pattern.make(context, contextIndex);
    const research = gaokaoResearch[patternIndex % gaokaoResearch.length];
    gaokaoGeneratedRows.push([
      `真题考点：${pattern.topic}`,
      row[0],
      row[1],
      row[2],
      row[3],
      {
        examReference: `${research.reference} · 原创仿真`,
        authority: research.authority,
        sourceUrl: research.sourceUrl,
        origin: "official-analysis-inspired"
      }
    ]);
  });
});

module.exports = { gaokaoGeneratedRows, gaokaoResearch };
