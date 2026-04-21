/* ================================================================
   AI 问答对话模块 — 接入 CodeBuddy API (OpenAI 兼容格式)
   ================================================================ */

const CHAT_API_KEY = "ck_ffrdj75n2ebk.fw9UhRxUcEvcuTXyyiTt7R59u-ePTSQyQWPmxZGJk6Y";

// CodeBuddy API 端点列表（按优先级尝试）
const API_ENDPOINTS = [
  "https://api.codebuddy.cn/v1/chat/completions",
  "https://copilot.tencent.com/v1/chat/completions",
  "https://api.copilot.tencent.com/v1/chat/completions",
];

let chatHistory = [];
let lastFortuneResult = null;
let currentEndpoint = API_ENDPOINTS[0];

// 保存最新测算结果供 AI 使用
const originalRenderResult = renderResult;
renderResult = function (result) {
  lastFortuneResult = result;
  originalRenderResult(result);
};

// 构建命理上下文
function buildFortuneContext() {
  if (!lastFortuneResult) return "";
  const r = lastFortuneResult;
  const pillarsStr = r.pillars.map(p => `${p.label}:${p.stem}${p.branch}(${p.stemElement}/${p.branchElement})`).join("，");
  const countsStr = ELEMENTS.map(el => `${el}:${r.counts[el]}/8`).join("，");
  const yearlyStr = r.yearlyFortunes.map(yf => `${yf.year}年(${yf.stem}${yf.branch}，${yf.element}年，${yf.god}，${yf.score}分)：${yf.desc}`).join("\n");
  const monthlyStr = r.monthlyFortunes.map(mf => `${mf.month}月(${mf.stem}${mf.branch}，${mf.god})：${mf.keyword}—${mf.advice}`).join("\n");
  
  return `用户"${r.name}"的八字命盘信息：
- 四柱：${pillarsStr}
- 日主：${r.dayStem}${r.dayBranch}（${r.dayElement}）
- 生肖：${r.zodiac || "未知"}
- 出生地：${r.birthplace || "未填写"}${r.regionInfo ? `（五行属${r.regionInfo.element}，${r.regionInfo.desc}）` : ""}
- 年纳音：${r.yearNayin}，日纳音：${r.dayNayin}
- 五行分布：${countsStr}
- 主导五行：${r.dominant}，偏弱五行：${r.weak}，强弱差：${r.balance}
- 十神：${r.tenGods.map(tg => `${tg.pillar}→${tg.god}`).join("，")}
- 性格：${r.personality.title}
- 开运色：${r.personality.lucky.color}，幸运数字：${r.personality.lucky.number}，方位：${r.personality.lucky.direction}
- 适合行业：${r.personality.career}
- 健康提醒：${r.personality.health}${r.birthplaceAnalysis ? `\n- 出生地风水：${r.regionInfo.city}属${r.regionInfo.element}，与日主${r.dayElement}关系为"${r.birthplaceAnalysis.relation}"，和谐度${r.birthplaceAnalysis.harmonyLabel}` : ""}

流年运势（${r.currentYear}-${r.currentYear + 4}）：
${yearlyStr}

流月运势（${r.currentYear}年）：
${monthlyStr}`;
}

// 系统提示词
const SYSTEM_PROMPT = `你是一位精通中国传统命理学的AI大师。你深谙八字（四柱）命理、五行生克、十神关系、纳音五行、流年流月运势等知识。

你的职责：
1. 根据用户的八字命盘数据，给出详细、个性化的命理解读
2. 结合流年流月运势，给出具体的时间节点建议
3. 语言要通俗易懂但不失专业感，像一位亲切的命理老师
4. 回答要具体，给出可操作的建议（比如具体的颜色、方位、时间段等）
5. 适当引用八字中的具体干支来增加说服力
6. 每次回答控制在 200-400 字左右

重要提醒：
- 不要做出健康诊断或投资理财的具体建议
- 保持积极正面的语气，即使遇到不太好的格局也要给出化解方法
- 回答要专业自信，体现命理学的深厚底蕴`;

// DOM
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");
const chatSendBtn = document.querySelector("#chat-send-btn");
const clearChatBtn = document.querySelector("#clear-chat");
const chatSuggestions = document.querySelector("#chat-suggestions");

// 初始化事件
if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = chatInput.value.trim();
    if (!msg) return;
    sendMessage(msg);
  });
}

if (clearChatBtn) {
  clearChatBtn.addEventListener("click", () => {
    chatHistory = [];
    chatMessages.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">—</div>
        <p>对话已清空。输入新问题继续提问。</p>
        <div class="chat-suggestions" id="chat-suggestions">
          <button class="chat-suggest-btn" type="button">我今年的事业运势怎么样？</button>
          <button class="chat-suggest-btn" type="button">我的财运什么时候最好？</button>
          <button class="chat-suggest-btn" type="button">我适合做什么行业？</button>
          <button class="chat-suggest-btn" type="button">我和哪种五行的人最配？</button>
        </div>
      </div>
    `;
    bindSuggestions();
  });
}

function bindSuggestions() {
  document.querySelectorAll(".chat-suggest-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.textContent;
      chatInput.value = text;
      sendMessage(text);
    });
  });
}

// 初始绑定
bindSuggestions();

function appendMessage(role, content) {
  // 移除欢迎信息
  const welcome = chatMessages.querySelector(".chat-welcome");
  if (welcome) welcome.remove();

  const div = document.createElement("div");
  div.className = `chat-msg ${role}`;
  const avatarEmoji = role === "user" ? "U" : "AI";
  div.innerHTML = `
    <div class="chat-avatar">${avatarEmoji}</div>
    <div class="chat-bubble">${escapeHtml(content)}</div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function appendTypingIndicator() {
  const welcome = chatMessages.querySelector(".chat-welcome");
  if (welcome) welcome.remove();

  const div = document.createElement("div");
  div.className = "chat-msg assistant";
  div.id = "typing-msg";
  div.innerHTML = `
    <div class="chat-avatar">AI</div>
    <div class="chat-bubble typing"></div>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function sendMessage(userMsg) {
  if (!lastFortuneResult) {
    appendMessage("assistant", "请先在上方完成八字测算，我才能根据你的命盘来回答问题。");
    chatInput.value = "";
    return;
  }

  // 显示用户消息
  appendMessage("user", userMsg);
  chatInput.value = "";
  chatSendBtn.disabled = true;

  // 显示typing
  const typingDiv = appendTypingIndicator();

  // 模拟思考延迟，让体验更自然
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

  // 先尝试 API，失败则用本地回答
  let reply = "";
  try {
    const fortuneContext = buildFortuneContext();
    const messages = [
      { role: "system", content: SYSTEM_PROMPT + "\n\n以下是当前用户的命盘数据：\n" + fortuneContext },
      ...chatHistory,
      { role: "user", content: userMsg },
    ];
    reply = await callAPI(messages);
  } catch (error) {
    console.log("API unavailable, using local reply");
    reply = generateLocalReply(userMsg);
  }

  // 移除typing
  typingDiv.remove();

  // 显示回复
  appendMessage("assistant", reply);

  // 保存历史
  chatHistory.push({ role: "user", content: userMsg });
  chatHistory.push({ role: "assistant", content: reply });

  // 限制历史长度（保留最近10轮）
  if (chatHistory.length > 20) {
    chatHistory = chatHistory.slice(-20);
  }

  chatSendBtn.disabled = false;
  chatInput.focus();
}

async function callAPI(messages) {
  // 尝试多个端点
  let lastError = null;
  
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${CHAT_API_KEY}`,
        },
        body: JSON.stringify({
          model: "hunyuan-turbos-latest",
          messages: messages,
          temperature: 0.8,
          max_tokens: 800,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        currentEndpoint = endpoint;
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        throw new Error("Unexpected response format");
      }
      
      // 如果是认证错误，不再尝试其他端点
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication failed (${response.status})`);
      }
      
      lastError = new Error(`API returned ${response.status}`);
    } catch (err) {
      lastError = err;
      if (err.message.includes("Authentication")) throw err;
      continue;
    }
  }
  
  throw lastError || new Error("All API endpoints failed");
}

// 本地智能回答（API 不可用时的回退）
function generateLocalReply(question) {
  const r = lastFortuneResult;
  if (!r) return "请先完成测算再来提问哦~";

  const q = question.toLowerCase();
  
  // 事业相关
  if (q.includes("事业") || q.includes("工作") || q.includes("职业") || q.includes("行业")) {
    const currentYF = r.yearlyFortunes.find(yf => yf.isCurrent);
    return `根据你的八字，日主${r.dayStem}${r.dayBranch}属${r.dayElement}，${r.personality.title}。

${r.personality.career}

${currentYF ? `结合页面展示的年份区间来看，${currentYF.year}年（${currentYF.stem}${currentYF.branch}年），${currentYF.desc}。` : ""}

从十神来看，${r.tenGods.map(tg => `${tg.pillar}为${tg.god}`).join("，")}，整体格局${r.balance <= 1 ? "比较均衡，适合稳扎稳打" : `偏向${r.dominant}，适合发挥${r.dominant}的优势领域`}。

建议多用${r.personality.lucky.color}系的物品提升气场，${r.personality.lucky.direction}方位对你有利。`;
  }

  // 财运相关
  if (q.includes("财") || q.includes("钱") || q.includes("投资") || q.includes("收入")) {
    const bestYear = r.yearlyFortunes.reduce((best, yf) => yf.score > best.score ? yf : best, r.yearlyFortunes[0]);
    const wealthMonths = r.monthlyFortunes.filter(mf => ["偏财", "正财"].includes(mf.god));
    return `从你的八字来看，${r.dayElement}克${ELEMENT_OVERCOME[r.dayElement]}为财星。

在 2015-2035 这段年份里，${bestYear.year}年运势最佳（${bestYear.score}分），${bestYear.desc}。

${wealthMonths.length > 0 ? `今年的财运月份：${wealthMonths.map(m => `${m.month}月(${m.god})`).join("、")}，这些月份适合关注收入和理财。` : "今年的财运需要稳健经营。"}

开运建议：幸运数字${r.personality.lucky.number}，多穿${r.personality.lucky.color}系衣物，${r.personality.lucky.direction}方位有利于财运。`;
  }

  // 感情相关
  if (q.includes("感情") || q.includes("恋爱") || q.includes("婚姻") || q.includes("配") || q.includes("另一半")) {
    const complement = ELEMENT_GENERATED_BY[r.dayElement];
    return `你的日主为${r.dayElement}，在感情中自然展现${r.dominant}的特质——${DOMINANT_PROFILE[r.dominant].copy.slice(0, 30)}...

五行互补原则：与${complement}属性偏强的人在一起会比较和谐，因为${complement}生${r.dayElement}，能给你带来支持和滋养。

${r.weak}偏弱提醒你在感情中要注意${WEAK_ELEMENT_ADVICE[r.weak].brief.slice(0, 30)}...

${r.personality.lucky.season}是你的旺运季节，社交运也会更好。`;
  }

  // 健康相关
  if (q.includes("健康") || q.includes("身体") || q.includes("养生")) {
    return `从你的八字五行来看，${r.dominant}偏旺、${r.weak}偏弱。

${r.personality.health}

五行调理建议：
- ${WEAK_ELEMENT_ADVICE[r.weak].detail}
- ${r.personality.lucky.season}注意保养对应的脏腑

日常建议：在${r.personality.lucky.direction}方位活动有助于补气，多用${r.personality.lucky.color}系物品。`;
  }

  // 流年相关
  if (q.includes("今年") || q.includes("明年") || q.includes("运势") || q.includes("流年")) {
    const targetYear = q.includes("明年") ? r.currentYear + 1 : r.currentYear;
    const yf = r.yearlyFortunes.find(y => y.year === targetYear);
    if (yf) {
      const godInfo = TEN_GOD_MEANINGS[yf.god] || { detail: "" };
      return `${yf.year}年（${yf.stem}${yf.branch}年），纳音"${yf.nayin}"，五行属${yf.element}。

对你而言，这是${yf.god}之年（${yf.score}分）：${yf.desc}

${yf.god}的含义：${godInfo.detail}

${yf.score >= 80 ? "总体来看这是个不错的年份，要积极把握机会！" : yf.score >= 65 ? "这一年平稳中有机遇，稳中求进是关键。" : "这一年挑战较多，但也是成长的好时机，稳住心态最重要。"}`;
    }
  }

  // 月份相关
  if (q.includes("月") && (q.includes("几") || q.includes("哪") || q.includes("什么时候"))) {
    const bestMonths = r.monthlyFortunes.filter(m => ["食神", "正财", "偏财", "正印"].includes(m.god));
    const challengeMonths = r.monthlyFortunes.filter(m => ["七杀", "劫财"].includes(m.god));
    return `根据你今年的流月运势分析：

较好的月份：${bestMonths.map(m => `${m.month}月(${m.god}·${m.keyword})`).join("、") || "整体平稳"}
需注意的月份：${challengeMonths.map(m => `${m.month}月(${m.god}·${m.keyword})`).join("、") || "无特别需要注意的"}

${bestMonths.length > 0 ? `特别推荐${bestMonths[0].month}月：${bestMonths[0].advice}` : ""}

整体来看，每个月都有其特点，关键是顺势而为，好的月份积极行动，不太好的月份沉淀积累。`;
  }

  // 通用回答
  return `根据你的八字（${r.pillars.map(p => p.stem + p.branch).join(" ")}），日主${r.dayStem}${r.dayBranch}属${r.dayElement}。

你的命盘特点：${r.personality.title}
${r.personality.copy.slice(0, 60)}...

五行格局：${r.dominant}旺${r.weak}弱，${r.balance <= 1 ? "整体较为均衡" : "需要注意补足" + r.weak}。
${WEAK_ELEMENT_ADVICE[r.weak].brief}

开运提示：颜色${r.personality.lucky.color}，数字${r.personality.lucky.number}，方位${r.personality.lucky.direction}。

如果你有更具体的问题，可以问我关于事业、财运、感情、健康或流年月运势等方面的问题。`;
}
