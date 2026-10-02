const REVIEW_INTERVALS = [0, 1, 3, 7, 15, 30];
const DAY_MS = 24 * 60 * 60 * 1000;

function todayKey(date = new Date()) {
  return new Date(date.getTime() + 8 * 3600000).toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
  const date = new Date(Date.parse(dateKey + 'T00:00:00+08:00') + days * DAY_MS);
  return todayKey(date);
}

function stableHash(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function getQuestionId(sceneId, question) {
  const signature = [sceneId, question.sourceKey || "", question.before || "", question.answer || "", question.after || ""].join("|").toLowerCase();
  return `${sceneId}_${stableHash(signature)}`;
}

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[.!?。！？]+$/g, "")
    .replace(/\s+/g, " ");
}

function isAnswerCorrect(input, question) {
  const candidates = question.acceptedAnswers && question.acceptedAnswers.length ? question.acceptedAnswers : [question.answer];
  const normalizedInput = normalizeAnswer(input);
  return candidates.some(candidate => normalizeAnswer(candidate) === normalizedInput);
}

function ensureLearningState(state) {
  if (!state.wrongBook || Array.isArray(state.wrongBook)) state.wrongBook = {};
  if (!state.studyHistory) state.studyHistory = {};
  if (!state.dailyActivity) state.dailyActivity = { date: "", answered: 0 };
  return state;
}

function ensureDayRecord(state, dateKey = todayKey()) {
  ensureLearningState(state);
  if (!state.studyHistory[dateKey]) {
    state.studyHistory[dateKey] = { attempts: 0, correct: 0, wrong: 0, reviews: 0, sessions: 0, xp: 0 };
  }
  return state.studyHistory[dateKey];
}

function recordAttempt(state, scene, question, correct, mode = "scene") {
  ensureLearningState(state);
  const date = todayKey();
  const day = ensureDayRecord(state, date);
  const id = question.id || getQuestionId(scene.id, question);
  day.attempts += 1;

  if (correct) {
    day.correct += 1;
    if (state.dailyActivity.date !== date) state.dailyActivity = { date, answered: 0 };
    state.dailyActivity.answered += 1;
    const existing = state.wrongBook[id];
    if (existing) {
      existing.lastCorrectAt = Date.now();
      if (mode === "review") {
        day.reviews += 1;
        existing.reviewCount = (existing.reviewCount || 0) + 1;
        existing.stage = Math.min((existing.stage || 0) + 1, REVIEW_INTERVALS.length);
        if (existing.stage >= REVIEW_INTERVALS.length) {
          existing.status = "mastered";
          existing.nextReviewAt = "";
        } else {
          existing.status = "learning";
          existing.nextReviewAt = addDays(date, REVIEW_INTERVALS[existing.stage]);
        }
      }
    }
    return id;
  }

  day.wrong += 1;
  const previous = state.wrongBook[id] || {};
  state.wrongBook[id] = {
    ...previous,
    id,
    sceneId: scene.id,
    sceneName: scene.name,
    question: {
      id,
      situation: question.situation || "",
      before: question.before || "",
      answer: question.answer,
      acceptedAnswers: question.acceptedAnswers || [question.answer],
      after: question.after || "",
      cn: question.cn || "",
      sourceKey: question.sourceKey || "",
      examReference: question.examReference || ""
    },
    wrongCount: (previous.wrongCount || 0) + 1,
    reviewCount: previous.reviewCount || 0,
    stage: 0,
    status: "learning",
    nextReviewAt: date,
    lastWrongAt: Date.now()
  };
  return id;
}

function recordSession(state, mode, correct, total) {
  const day = ensureDayRecord(state);
  day.sessions += 1;
  day.xp += correct * 10;
  if (mode === "review") day.reviewSessions = (day.reviewSessions || 0) + 1;
  else day.practiceSessions = (day.practiceSessions || 0) + 1;
  day.lastSessionScore = total ? Math.round(correct / total * 100) : 0;
}

function getWrongItems(state) {
  ensureLearningState(state);
  return Object.values(state.wrongBook).sort((left, right) => (right.lastWrongAt || 0) - (left.lastWrongAt || 0));
}

function getDueReviews(state, date = todayKey()) {
  return getWrongItems(state).filter(item => item.status !== "mastered" && (!item.nextReviewAt || item.nextReviewAt <= date));
}

function getWeeklyReport(state) {
  ensureLearningState(state);
  const today = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * DAY_MS);
    const key = todayKey(date);
    const record = state.studyHistory[key] || { attempts: 0, correct: 0, wrong: 0, reviews: 0, sessions: 0, xp: 0 };
    days.push({ key, label: `周${weekdays[new Date(date.getTime() + 8 * 3600000).getUTCDay()]}`, isToday: offset === 0, ...record });
  }
  const totals = days.reduce((sum, item) => ({
    attempts: sum.attempts + item.attempts,
    correct: sum.correct + item.correct,
    wrong: sum.wrong + item.wrong,
    reviews: sum.reviews + item.reviews,
    sessions: sum.sessions + item.sessions,
    xp: sum.xp + item.xp
  }), { attempts: 0, correct: 0, wrong: 0, reviews: 0, sessions: 0, xp: 0 });
  const maxAttempts = Math.max(...days.map(item => item.attempts), 1);
  return {
    days: days.map(item => ({ ...item, height: Math.max(Math.round(item.attempts / maxAttempts * 100), item.attempts ? 12 : 4) })),
    totals,
    accuracy: totals.attempts ? Math.round(totals.correct / totals.attempts * 100) : 0,
    activeDays: days.filter(item => item.attempts > 0 || item.sessions > 0).length
  };
}

module.exports = {
  REVIEW_INTERVALS,
  todayKey,
  addDays,
  getQuestionId,
  normalizeAnswer,
  isAnswerCorrect,
  ensureLearningState,
  recordAttempt,
  recordSession,
  getWrongItems,
  getDueReviews,
  getWeeklyReport
};
