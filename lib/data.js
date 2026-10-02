const { extraScenes, extraExerciseRows } = require("./extra-data");
const { getQuestionId } = require("./learning");

const scenes = [
  { id: "cafe", name: "咖啡馆", icon: "☕", subtitle: "点单与定制", color: "mint" },
  { id: "restaurant", name: "餐厅用餐", icon: "🍽", subtitle: "预订、点餐与结账", color: "peach" },
  { id: "travel", name: "出行问路", icon: "🧭", subtitle: "方向与地点", color: "blue" },
  { id: "shopping", name: "商店购物", icon: "🛍", subtitle: "尺码、价格与退换", color: "lavender" },
  { id: "hotel", name: "酒店住宿", icon: "🛎", subtitle: "入住与客房服务", color: "sand" },
  { id: "social", name: "朋友社交", icon: "💬", subtitle: "寒暄、邀约与告别", color: "rose" },
  { id: "work", name: "职场沟通", icon: "💻", subtitle: "会议、任务与协作", color: "blue" },
  { id: "emergency", name: "紧急求助", icon: "✚", subtitle: "报警与安全求助", color: "rose" },
  { id: "airport", name: "机场出行", icon: "✈", subtitle: "值机、安检与登机", color: "blue" },
  { id: "transit", name: "公共交通", icon: "🚇", subtitle: "公交、地铁与出租车", color: "mint" },
  { id: "doctor", name: "看病就医", icon: "⚕", subtitle: "症状、挂号与用药", color: "rose" },
  { id: "phone", name: "电话沟通", icon: "☎", subtitle: "接听、留言与回拨", color: "lavender" },
  { id: "home", name: "居家生活", icon: "⌂", subtitle: "家务、维修与租房", color: "sand" },
  { id: "delivery", name: "快递外卖", icon: "▣", subtitle: "收件、配送与售后", color: "peach" },
  { id: "bank", name: "银行业务", icon: "▤", subtitle: "开户、取款与转账", color: "mint" },
  { id: "salon", name: "理发美容", icon: "✂", subtitle: "预约与造型需求", color: "lavender" },
  { id: "gym", name: "运动健身", icon: "⚡", subtitle: "器械、课程与身体状态", color: "blue" },
  { id: "school", name: "校园学习", icon: "▱", subtitle: "课堂、作业与图书馆", color: "sand" },
  { id: "entertainment", name: "休闲娱乐", icon: "▶", subtitle: "电影、演出与活动", color: "peach" },
  { id: "neighborhood", name: "社区邻里", icon: "♧", subtitle: "邻居、物业与公共空间", color: "mint" }
];

scenes.push.apply(scenes, extraScenes);

const exercises = {
  cafe: [
    { situation: "你想礼貌地要一杯拿铁", before: "I'd", answer: "like", after: "a latte, please.", cn: "我想要一杯拿铁，谢谢。" },
    { situation: "店员询问你是否在店里喝", before: "Is that for here or to", answer: "go", after: "?", cn: "是在这里喝还是带走？" },
    { situation: "你想换成燕麦奶", before: "Could I have oat milk", answer: "instead", after: "?", cn: "我可以换成燕麦奶吗？" },
    { situation: "你想问一共多少钱", before: "How much is it in", answer: "total", after: "?", cn: "一共多少钱？" },
    { situation: "你准备刷卡付款", before: "Can I pay by", answer: "card", after: "?", cn: "我可以刷卡吗？" }
  ],
  restaurant: [
    { situation: "你想要一张两人桌", before: "A table for two,", answer: "please", after: ".", cn: "麻烦给我们一张两人桌。" },
    { situation: "你想看看菜单", before: "Could we see the", answer: "menu", after: "?", cn: "我们可以看看菜单吗？" },
    { situation: "你询问服务员推荐什么", before: "What do you", answer: "recommend", after: "?", cn: "你推荐什么？" },
    { situation: "你想要买单", before: "Could we have the", answer: "bill", after: "?", cn: "麻烦买单。" },
    { situation: "你问能否分开付款", before: "Can we split the", answer: "check", after: "?", cn: "我们可以分开结账吗？" }
  ],
  travel: [
    { situation: "你想问地铁站在哪里", before: "Where is the nearest subway", answer: "station", after: "?", cn: "最近的地铁站在哪里？" },
    { situation: "你不确定是否走对了", before: "Am I going the right", answer: "way", after: "?", cn: "我走的方向对吗？" },
    { situation: "你想知道需要多久", before: "How long does it", answer: "take", after: "?", cn: "需要多长时间？" },
    { situation: "你请司机在这里停车", before: "Could you stop", answer: "here", after: ", please?", cn: "可以请你停在这里吗？" },
    { situation: "你差点错过自己的站", before: "Is this my", answer: "stop", after: "?", cn: "这是我要下的站吗？" }
  ],
  shopping: [
    { situation: "你想询问更大的尺码", before: "Do you have this in a larger", answer: "size", after: "?", cn: "这件有大一码的吗？" },
    { situation: "你想试穿一件衣服", before: "Can I try this", answer: "on", after: "?", cn: "我可以试穿这件吗？" },
    { situation: "你想知道是否打折", before: "Is this on", answer: "sale", after: "?", cn: "这个在打折吗？" },
    { situation: "你只是随便看看", before: "I'm just", answer: "looking", after: ", thanks.", cn: "我只是随便看看，谢谢。" },
    { situation: "你决定买下它", before: "I'll", answer: "take", after: "it.", cn: "我要买这个。" }
  ]
};

// 用紧凑的五元数组维护大题库：[情境, 空格前, 答案, 空格后, 中文]。
// 转换后页面仍然读取 situation / before / answer / after / cn 字段。
function addExercises(sceneId, rows) {
  const questions = rows.map(row => {
    const metadata = row[5] || {};
    return {
      situation: row[0], before: row[1], answer: row[2], after: row[3], cn: row[4],
      examReference: metadata.examReference || "",
      authority: metadata.authority || "",
      sourceUrl: metadata.sourceUrl || "",
      origin: metadata.origin || "",
      acceptedAnswers: metadata.acceptedAnswers || [],
      difficulty: metadata.difficulty || "",
      grammarTag: metadata.grammarTag || ""
    };
  });
  exercises[sceneId] = (exercises[sceneId] || []).concat(questions);
}

addExercises("cafe", [
  ["你想要饮品少甜一点", "Could you make it less", "sweet", "?", "可以做得少甜一点吗？"],
  ["你不想在咖啡里加冰", "Can I get that without", "ice", "?", "可以不给我加冰吗？"],
  ["你想再要一张餐巾纸", "Could I have another", "napkin", "?", "可以再给我一张餐巾纸吗？"],
  ["你在等自己的饮品", "Is my drink", "ready", "yet?", "我的饮品做好了吗？"],
  ["你想询问无线网密码", "What's the Wi-Fi", "password", "?", "无线网密码是什么？"]
]);

addExercises("restaurant", [
  ["你对花生过敏", "I'm allergic to", "peanuts", ".", "我对花生过敏。"],
  ["你想点和朋友一样的菜", "I'll have the", "same", ", please.", "请给我来一份一样的。"],
  ["你的菜还没有上", "We're still waiting for our", "food", ".", "我们还在等餐。"],
  ["你想把剩菜打包", "Could I get a box to take this", "home", "?", "可以给我一个盒子把这个带回家吗？"],
  ["你觉得这顿饭很好吃", "Everything was", "delicious", ".", "所有东西都很好吃。"]
]);

addExercises("travel", [
  ["你想知道能不能走过去", "Is it within walking", "distance", "?", "走路能到吗？"],
  ["你请路人指出地图位置", "Could you show me on the", "map", "?", "可以在地图上指给我看吗？"],
  ["你想确认是否需要左转", "Do I turn", "left", "here?", "我是在这里左转吗？"],
  ["你想找附近的卫生间", "Is there a restroom", "nearby", "?", "附近有卫生间吗？"],
  ["你想知道入口在哪里", "Where is the main", "entrance", "?", "主入口在哪里？"]
]);

addExercises("shopping", [
  ["你想知道试衣间在哪里", "Where is the fitting", "room", "?", "试衣间在哪里？"],
  ["你觉得价格有点贵", "It's a little too", "expensive", "for me.", "对我来说有点太贵了。"],
  ["你想换一种颜色", "Do you have it in another", "color", "?", "这件有其他颜色吗？"],
  ["你想退掉昨天买的商品", "I'd like to", "return", "this item.", "我想退掉这件商品。"],
  ["店员询问你是否要收据", "Would you like a", "receipt", "?", "你需要收据吗？"]
]);

addExercises("hotel", [
  ["你到前台办理入住", "I'd like to check", "in", ".", "我想办理入住。"],
  ["你已经提前订了房间", "I have a", "reservation", "under Chen.", "我用陈这个姓订了房。"],
  ["你想知道早餐时间", "What time is", "breakfast", "served?", "早餐几点供应？"],
  ["你发现房卡打不开门", "My key card isn't", "working", ".", "我的房卡不能用了。"],
  ["你希望多拿一条毛巾", "Could I get an extra", "towel", "?", "可以再给我一条毛巾吗？"],
  ["房间里有点冷", "Could you turn up the", "heat", "?", "可以把暖气调高一点吗？"],
  ["你想延迟退房", "Could I get a late", "checkout", "?", "我可以延迟退房吗？"],
  ["你想把行李寄存在前台", "Can you store my", "luggage", "?", "你们可以帮我寄存行李吗？"],
  ["你想预约叫醒服务", "I'd like a wake-up", "call", "at seven.", "我想预约七点的叫醒服务。"],
  ["你准备退房离开", "I'd like to check", "out", ", please.", "我想办理退房。"]
]);

addExercises("social", [
  ["你第一次和对方见面", "Nice to", "meet", "you.", "很高兴认识你。"],
  ["你想问对方最近怎么样", "How have you", "been", "?", "你最近怎么样？"],
  ["你想称赞朋友的新发型", "I love your new", "haircut", ".", "我很喜欢你的新发型。"],
  ["你邀请朋友周末见面", "Are you free this", "weekend", "?", "你这周末有空吗？"],
  ["你赞同朋友的提议", "That sounds like a", "plan", ".", "听起来是个好主意。"],
  ["你需要婉拒一次邀约", "I'd love to, but I'm", "busy", ".", "我很想去，但我没空。"],
  ["你想交换联系方式", "Can I get your", "number", "?", "可以把你的电话号码给我吗？"],
  ["你暂时离开一下", "I'll be right", "back", ".", "我马上回来。"],
  ["聚会结束时表达开心", "I had a great", "time", ".", "我今天玩得很开心。"],
  ["你希望很快再见面", "Let's catch up", "soon", ".", "我们很快再聚。"]
]);

addExercises("work", [
  ["你想在会议中补充一点", "Could I add something", "here", "?", "我可以在这里补充一点吗？"],
  ["你想确认任务截止时间", "What's the", "deadline", "for this task?", "这项任务的截止时间是什么时候？"],
  ["你需要同事发一份文件", "Could you send me the", "file", "?", "可以把文件发给我吗？"],
  ["你没有听懂会议内容", "Could you explain that", "again", "?", "你可以再解释一遍吗？"],
  ["你想安排一个简短会议", "Can we schedule a quick", "meeting", "?", "我们可以安排一个短会吗？"],
  ["你会按时完成工作", "I'll have it done by", "Friday", ".", "我会在周五前完成。"],
  ["你想请同事查看文档", "Could you review this", "document", "?", "可以帮我检查一下这份文档吗？"],
  ["你同意同事的看法", "I completely", "agree", "with you.", "我完全同意你的看法。"],
  ["你需要更多时间完成任务", "I need a little more", "time", ".", "我还需要一点时间。"],
  ["你准备结束线上会议", "Thanks everyone for", "joining", ".", "谢谢大家参会。"]
]);

addExercises("emergency", [
  ["你需要立即获得帮助", "I need", "help", "right away.", "我现在需要帮助。"],
  ["你请别人呼叫救护车", "Please call an", "ambulance", ".", "请叫救护车。"],
  ["你告诉别人这里着火了", "There's a", "fire", "in the building.", "楼里着火了。"],
  ["你找不到自己的孩子", "I can't find my", "child", ".", "我找不到我的孩子了。"],
  ["你发现自己的包被偷了", "My bag was", "stolen", ".", "我的包被偷了。"],
  ["你想联系警察", "Could you call the", "police", "?", "你可以报警吗？"],
  ["有人受伤了", "Someone is", "hurt", ".", "有人受伤了。"],
  ["你提醒大家不要触碰", "Don't", "touch", "that.", "不要碰那个。"],
  ["你在询问紧急出口", "Where is the emergency", "exit", "?", "紧急出口在哪里？"],
  ["危险解除后说明自己没事", "I'm", "okay", "now.", "我现在没事了。"]
]);

addExercises("airport", [
  ["你询问值机柜台位置", "Where is the check-in", "counter", "?", "值机柜台在哪里？"],
  ["你要托运一个行李箱", "I'd like to check this", "bag", ".", "我想托运这个行李箱。"],
  ["你偏好靠窗的座位", "Could I have a window", "seat", "?", "可以给我一个靠窗座位吗？"],
  ["工作人员请你出示护照", "May I see your", "passport", "?", "可以看一下你的护照吗？"],
  ["你想确认登机口", "Which", "gate", "does the flight leave from?", "这趟航班从哪个登机口出发？"],
  ["你担心航班延误", "Is the flight", "delayed", "?", "航班延误了吗？"],
  ["你询问登机时间", "What time does boarding", "start", "?", "几点开始登机？"],
  ["你的行李超过重量限制", "Your bag is", "overweight", ".", "你的行李超重了。"],
  ["你没有找到自己的行李", "My luggage is", "missing", ".", "我的行李不见了。"],
  ["你准备通过安检", "Please take off your", "shoes", ".", "请脱下鞋子。"]
]);

addExercises("transit", [
  ["你询问公交是否去市中心", "Does this bus go", "downtown", "?", "这辆公交车去市中心吗？"],
  ["你想买一张单程票", "One", "single", "ticket, please.", "请给我一张单程票。"],
  ["你询问在哪里换乘", "Where do I", "transfer", "?", "我在哪里换乘？"],
  ["你想知道还有几站", "How many", "stops", "are left?", "还剩几站？"],
  ["你询问本站是否该下车", "Should I get", "off", "at this stop?", "我应该在这一站下车吗？"],
  ["你请司机到站提醒你", "Could you let me know when we", "arrive", "?", "到站时可以告诉我吗？"],
  ["你询问下一班车时间", "When is the next", "train", "?", "下一班车是什么时候？"],
  ["你发现座位有人坐", "Is this seat", "taken", "?", "这个座位有人吗？"],
  ["你给老人让座", "Would you like my", "seat", "?", "您要坐我的位置吗？"],
  ["你想给交通卡充值", "I'd like to top up my", "card", ".", "我想给交通卡充值。"]
]);

addExercises("doctor", [
  ["你想预约看医生", "I'd like to make an", "appointment", ".", "我想预约看医生。"],
  ["你告诉医生自己头痛", "I have a", "headache", ".", "我头痛。"],
  ["你的喉咙很痛", "My throat really", "hurts", ".", "我的喉咙很痛。"],
  ["医生询问症状持续多久", "How long have you felt this", "way", "?", "你这样多久了？"],
  ["你对青霉素过敏", "I'm allergic to", "penicillin", ".", "我对青霉素过敏。"],
  ["医生让你深呼吸", "Take a deep", "breath", ".", "深吸一口气。"],
  ["你询问一天吃几次药", "How often should I take this", "medicine", "?", "这种药多久吃一次？"],
  ["你询问药物副作用", "Are there any side", "effects", "?", "有副作用吗？"],
  ["你想知道是否需要休息", "Should I stay in", "bed", "?", "我需要卧床休息吗？"],
  ["你感觉已经好多了", "I'm feeling much", "better", "today.", "我今天感觉好多了。"]
]);

addExercises("phone", [
  ["你接起一通电话", "Hello, this is Yuan", "speaking", ".", "你好，我是Yuan。"],
  ["你想找某个人接电话", "May I speak to", "Anna", "?", "我可以和Anna通话吗？"],
  ["对方现在不方便接听", "She's not", "available", "right now.", "她现在不方便接电话。"],
  ["你询问来电者身份", "May I ask who's", "calling", "?", "请问您是哪位？"],
  ["你请求对方稍等", "Could you hold for a", "moment", "?", "你可以稍等一下吗？"],
  ["通话信号不太好", "The connection is", "bad", ".", "通话信号不好。"],
  ["你没有听清对方的话", "Could you speak more", "slowly", "?", "你可以说慢一点吗？"],
  ["你想给对方留言", "Can I leave a", "message", "?", "我可以留言吗？"],
  ["你请对方稍后回电", "Please call me", "back", "later.", "请稍后给我回电话。"],
  ["你准备结束通话", "Thanks for", "calling", ".", "感谢你的来电。"]
]);

addExercises("home", [
  ["你请室友倒垃圾", "Could you take out the", "trash", "?", "你可以把垃圾拿出去吗？"],
  ["你准备洗衣服", "I need to do the", "laundry", ".", "我需要洗衣服。"],
  ["厨房的水龙头在漏水", "The kitchen tap is", "leaking", ".", "厨房水龙头漏水了。"],
  ["家里的灯不亮了", "The light isn't", "working", ".", "这盏灯不亮了。"],
  ["你请维修人员来检查", "Could someone come and", "check", "it?", "可以派人来检查一下吗？"],
  ["你想把空调调低一点", "Could you turn down the", "air", "conditioning?", "可以把空调调低一点吗？"],
  ["你告诉朋友随便坐", "Make yourself at", "home", ".", "请随意，就像在自己家一样。"],
  ["你出门前检查门锁", "Did you lock the", "door", "?", "你锁门了吗？"],
  ["你想续租公寓", "I'd like to renew the", "lease", ".", "我想续租。"],
  ["你提醒室友小声一点", "Could you keep it", "down", "?", "你能小声一点吗？"]
]);

addExercises("delivery", [
  ["快递员确认你的地址", "Could you confirm your", "address", "?", "可以确认一下你的地址吗？"],
  ["你请快递放在门口", "Please leave it at the", "door", ".", "请把它放在门口。"],
  ["你询问订单什么时候到", "When will my order", "arrive", "?", "我的订单什么时候到？"],
  ["外卖比预计时间晚了", "My order is", "late", ".", "我的订单迟到了。"],
  ["包裹里的商品有损坏", "The item arrived", "damaged", ".", "商品送到时已经损坏。"],
  ["你收到的商品不对", "This is the", "wrong", "item.", "这个商品不对。"],
  ["你想申请退款", "I'd like a", "refund", ".", "我想申请退款。"],
  ["配送员找不到入口", "I'll meet you at the", "entrance", ".", "我在入口处和你碰面。"],
  ["你询问是否需要签收", "Do I need to", "sign", "for it?", "这个需要签收吗？"],
  ["你对配送员表达感谢", "Thanks for the", "delivery", ".", "感谢配送。"]
]);

addExercises("bank", [
  ["你想开一个银行账户", "I'd like to open an", "account", ".", "我想开一个银行账户。"],
  ["你想取一些现金", "I'd like to withdraw some", "cash", ".", "我想取一些现金。"],
  ["你想把钱存进账户", "I'd like to make a", "deposit", ".", "我想存一笔钱。"],
  ["你询问账户余额", "What's my current", "balance", "?", "我目前的余额是多少？"],
  ["你忘记了银行卡密码", "I forgot my", "PIN", ".", "我忘记银行卡密码了。"],
  ["你发现银行卡丢了", "I've lost my bank", "card", ".", "我的银行卡丢了。"],
  ["你想向另一个账户转账", "I'd like to", "transfer", "some money.", "我想转一笔钱。"],
  ["你询问是否收取手续费", "Is there a service", "fee", "?", "有服务费吗？"],
  ["你发现一笔陌生交易", "I don't recognize this", "charge", ".", "我不认识这笔扣款。"],
  ["你需要兑换一些货币", "I'd like to exchange some", "currency", ".", "我想兑换一些货币。"]
]);

addExercises("salon", [
  ["你想预约剪头发", "I'd like to book a", "haircut", ".", "我想预约剪头发。"],
  ["理发师询问你想剪多短", "How short would you like it", "cut", "?", "你想剪多短？"],
  ["你只想稍微修剪一下", "Just a", "trim", ", please.", "稍微修剪一下就好。"],
  ["你希望保留现在的长度", "Please keep the", "length", ".", "请保留现在的长度。"],
  ["你想把两侧剪短", "Could you make the sides", "shorter", "?", "可以把两侧剪短一些吗？"],
  ["水温有点太高", "The water is too", "hot", ".", "水太热了。"],
  ["你想看一下后面的效果", "Could I see the", "back", "?", "我可以看看后面吗？"],
  ["你对新发型很满意", "It looks", "great", ", thank you.", "看起来很棒，谢谢。"],
  ["你想询问护理建议", "How should I take care of my", "hair", "?", "我该怎样护理头发？"],
  ["你预约了下午三点", "I have an appointment at", "three", ".", "我预约了三点。"]
]);

addExercises("gym", [
  ["你想申请健身房会员", "I'd like to join the", "gym", ".", "我想加入这家健身房。"],
  ["你询问有没有体验课", "Do you offer a free", "trial", "?", "你们提供免费体验吗？"],
  ["你想报名瑜伽课", "I'd like to sign up for the yoga", "class", ".", "我想报名瑜伽课。"],
  ["你询问器械是否有人使用", "Are you using this", "machine", "?", "你在用这台器械吗？"],
  ["你想和别人轮流使用器械", "Can we take", "turns", "?", "我们可以轮流用吗？"],
  ["你需要调整器械高度", "How do I adjust the", "seat", "?", "我该怎么调整座椅？"],
  ["你锻炼后有点累", "I need to take a", "break", ".", "我需要休息一下。"],
  ["教练提醒你保持呼吸", "Remember to", "breathe", ".", "记得呼吸。"],
  ["你想知道更衣室位置", "Where is the locker", "room", "?", "更衣室在哪里？"],
  ["你今天完成了训练", "I'm done with my", "workout", ".", "我今天练完了。"]
]);

addExercises("school", [
  ["你上课迟到了", "Sorry I'm", "late", ".", "抱歉我迟到了。"],
  ["你想向老师提问", "May I ask a", "question", "?", "我可以问一个问题吗？"],
  ["你没有理解这一部分", "I don't understand this", "part", ".", "我不理解这一部分。"],
  ["你询问作业截止日期", "When is the homework", "due", "?", "作业什么时候交？"],
  ["你忘记带课本", "I forgot my", "textbook", ".", "我忘带课本了。"],
  ["你想借同学的笔记", "Could I borrow your", "notes", "?", "我可以借你的笔记吗？"],
  ["你想续借一本书", "I'd like to renew this", "book", ".", "我想续借这本书。"],
  ["你想找一个安静的座位", "Is there a quiet place to", "study", "?", "有安静学习的地方吗？"],
  ["你和同学分组完成任务", "Let's work in a", "group", ".", "我们分组完成吧。"],
  ["你准备参加明天的考试", "I have an exam", "tomorrow", ".", "我明天有考试。"]
]);

addExercises("entertainment", [
  ["你想买两张电影票", "Two", "tickets", "for the evening show, please.", "请给我两张晚场电影票。"],
  ["你询问电影什么时候开始", "What time does the movie", "start", "?", "电影什么时候开始？"],
  ["你想要中间的座位", "Could we sit in the", "middle", "?", "我们可以坐在中间吗？"],
  ["你询问演出还有没有票", "Are there any seats", "available", "?", "还有空座吗？"],
  ["你想买一份爆米花", "A large", "popcorn", ", please.", "请给我一份大爆米花。"],
  ["你请别人不要剧透", "Please don't", "spoil", "the ending.", "请不要剧透结局。"],
  ["你觉得这部电影很有趣", "The movie was really", "funny", ".", "这部电影真的很有趣。"],
  ["你觉得音乐有点太响", "The music is too", "loud", ".", "音乐太响了。"],
  ["你邀请朋友一起拍照", "Let's take a", "picture", ".", "我们拍张照片吧。"],
  ["你询问活动结束时间", "When does the event", "end", "?", "活动什么时候结束？"]
]);

addExercises("neighborhood", [
  ["你向新邻居打招呼", "Welcome to the", "neighborhood", ".", "欢迎搬到这个社区。"],
  ["你做自我介绍", "I live next", "door", ".", "我住在隔壁。"],
  ["你想借一个工具", "Could I borrow your", "ladder", "?", "我可以借用一下你的梯子吗？"],
  ["你提醒邻居收到一个包裹", "A package arrived for", "you", ".", "有一个你的包裹到了。"],
  ["楼上的声音太吵", "The noise upstairs is too", "loud", ".", "楼上的声音太吵了。"],
  ["你询问垃圾回收时间", "When is trash", "collection", "?", "什么时候收垃圾？"],
  ["你发现电梯坏了", "The elevator is out of", "order", ".", "电梯坏了。"],
  ["你联系物业报修", "I'd like to report a", "problem", ".", "我想报修一个问题。"],
  ["你问附近有没有超市", "Is there a grocery store", "nearby", "?", "附近有食品超市吗？"],
  ["你感谢邻居提供帮助", "Thanks for being so", "helpful", ".", "谢谢你这么热心。"]
]);

Object.keys(extraExerciseRows).forEach(sceneId => {
  addExercises(sceneId, extraExerciseRows[sceneId]);
});

// 在人工编写的完整自然句上更换挖空位置，形成同一句型的多角度复习题。
// 内容和中文释义不变，但训练的词汇、介词、动词或语法点不同。
const commonWords = new Set([
  "a", "an", "the", "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "they",
  "is", "am", "are", "was", "were", "be", "been", "to", "of", "in", "on", "at", "for", "from",
  "and", "or", "but", "if", "this", "that", "these", "those", "do", "does", "did", "can", "could",
  "would", "should", "may", "will", "have", "has", "had", "with", "what", "where", "when", "which",
  "how", "not", "too", "very", "some", "any"
]);

function createReviewVariants(question, limit) {
  const fullSentence = `${question.before} ${question.answer} ${question.after}`
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const matches = [];
  const tokenPattern = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  let match;
  while ((match = tokenPattern.exec(fullSentence)) !== null) {
    const lower = match[0].toLowerCase();
    const beforeCharacter = fullSentence[match.index - 1];
    const afterCharacter = fullSentence[match.index + match[0].length];
    const isHyphenated = beforeCharacter === "-" || afterCharacter === "-";
    if (match[0].length > 1 && !isHyphenated && lower !== question.answer.toLowerCase() && !matches.some(item => item.lower === lower)) {
      matches.push({ word: match[0], lower, index: match.index, common: commonWords.has(lower) });
    }
  }
  matches.sort((left, right) => Number(left.common) - Number(right.common));
  return matches.slice(0, limit).map(item => ({
    situation: `${question.situation} · 换词复习`,
    before: fullSentence.slice(0, item.index).replace(/\s+$/, ""),
    answer: item.word,
    after: fullSentence.slice(item.index + item.word.length).replace(/^\s+/, ""),
    cn: question.cn,
    examReference: question.examReference || "",
    authority: question.authority || "",
    sourceUrl: question.sourceUrl || "",
    origin: question.origin || "",
    review: true
  }));
}

Object.keys(exercises).forEach(sceneId => {
  const coreQuestions = exercises[sceneId].slice();
  const reviewQuestions = [];
  coreQuestions.forEach(question => {
    const sourceKey = `${question.before} ${question.answer} ${question.after}`
      .replace(/\s+([,.!?])/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    question.sourceKey = sourceKey;
    const variants = createReviewVariants(question, 3);
    variants.forEach(variant => { variant.sourceKey = sourceKey; });
    reviewQuestions.push.apply(reviewQuestions, variants);
  });
  exercises[sceneId] = coreQuestions.concat(reviewQuestions);
});

const fallback = [
  { situation: "你想礼貌地寻求帮助", before: "Could you help", answer: "me", after: ", please?", cn: "可以请你帮帮我吗？" },
  { situation: "你没有听清对方的话", before: "Could you say that", answer: "again", after: "?", cn: "你可以再说一遍吗？" },
  { situation: "你想确认某件事", before: "Is that", answer: "right", after: "?", cn: "是这样吗？" },
  { situation: "你想请对方稍等", before: "Just a", answer: "moment", after: ", please.", cn: "请稍等一下。" },
  { situation: "你向对方表达感谢", before: "Thank you for your", answer: "help", after: ".", cn: "谢谢你的帮助。" }
];

const cards = [
  { category: "咖啡馆", context: "想把饮品带走时", en: "Could I get this to go?", cn: "这个可以打包带走吗？", note: "to go 是美式英语中表示“外带”的常用说法。" },
  { category: "咖啡馆", context: "想调整饮品甜度时", en: "Could you make it less sweet?", cn: "可以帮我做得少甜一点吗？", note: "Could you… 是礼貌提出请求的万能句型。" },
  { category: "餐厅", context: "还没决定好点什么时", en: "Could we have a few more minutes?", cn: "可以再给我们几分钟吗？", note: "点餐时这样说会显得自然又礼貌。" },
  { category: "出行", context: "向路人确认方向时", en: "Is it within walking distance?", cn: "走路能到吗？", note: "walking distance 指适合步行前往的距离。" },
  { category: "购物", context: "衣服不太合身时", en: "Do you have this in a larger size?", cn: "这件有大一码的吗？", note: "将 larger 换成 smaller 就可以询问更小的尺码。" },
  { category: "酒店", context: "希望晚一点退房时", en: "Could I get a late checkout?", cn: "我可以延迟退房吗？", note: "酒店会根据当天房态决定能否延迟退房。" },
  { category: "社交", context: "婉拒邀约时", en: "I'd love to, but I already have plans.", cn: "我很想去，但我已经有安排了。", note: "先表达愿意，再说明原因，是更温和的拒绝方式。" },
  { category: "职场", context: "会议上想补充观点时", en: "Could I add something here?", cn: "我可以补充一点吗？", note: "用于礼貌地加入讨论，不会显得在打断别人。" }
];

const phrases = [
  { en: "Could I get this to go?", cn: "这个可以打包带走吗？" },
  { en: "That sounds like a plan.", cn: "听起来是个好主意。" },
  { en: "Take your time. No rush.", cn: "慢慢来，不着急。" },
  { en: "Could you give me a hand?", cn: "你能帮我一下吗？" },
  { en: "I'm just looking, thanks.", cn: "我只是随便看看，谢谢。" }
];

function prepareQuestion(sceneId, question) {
  const acceptedAnswers = [question.answer].concat(question.acceptedAnswers || [])
    .map(answer => String(answer || "").trim())
    .filter((answer, index, list) => answer && list.findIndex(item => item.toLowerCase() === answer.toLowerCase()) === index);
  question.id = getQuestionId(sceneId, question);
  question.acceptedAnswers = acceptedAnswers;
  question.difficulty = question.difficulty || (sceneId === "gaokao" || question.examReference ? "exam" : "daily");
  question.grammarTag = question.grammarTag || (/^(?:真题)?考点：/.test(question.situation) ? question.situation.replace(/^(?:真题)?考点：/, "").replace(/ · 换词复习$/, "") : "生活表达");
  if (sceneId === "gaokao" && !question.origin) question.origin = "original-curated";
  return question;
}

Object.keys(exercises).forEach(sceneId => {
  exercises[sceneId] = exercises[sceneId].map(question => prepareQuestion(sceneId, question));
});
fallback.forEach(question => prepareQuestion("fallback", question));

module.exports = { scenes, exercises, fallback, cards, phrases };
