/* VERTEX attempts — localStorage persistence for exam attempts.
   Mirrors D:\WEB registry semantics (cbt_exam_registry_v1 record shape:
   id/title/subtitle/totalQuestions/answeredCount/score/percentage/status/
   timeSpentSec/answers/marked/currentIndex/rawExamData) but keeps each
   attempt self-contained in ONE key so resume/review need no joins. */
import { gradeScore } from "./examFormat.js";

const KEY = "vertexAttemptsV1";
export const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const d = raw ? JSON.parse(raw) : {};
    return d && typeof d === "object" ? d : {};
  } catch { return {}; }
}
function writeAll(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

export function getAttempt(id) {
  return readAll()[id] || null;
}

/** Create a fresh attempt from a NORMALIZED exam + chapter link. */
export function createAttempt(exam, { chapterId = null, subjectId = null } = {}) {
  const now = Date.now();
  const attempt = {
    id: uid("att"),
    chapterId, subjectId,
    title: exam.title, subtitle: exam.subtitle,
    markPerCorrect: exam.markPerCorrect, negativeMarking: exam.negativeMarking,
    questions: exam.questions,
    sections: exam.sections.map((s) => s.title),
    answers: {}, marked: {}, currentIndex: 0,
    score: 0, timeSpentSec: 0,
    status: "in_progress", // 'in_progress' | 'completed'
    createdAt: now, updatedAt: now,
  };
  const map = readAll();
  map[attempt.id] = attempt;
  writeAll(map);
  return attempt;
}

export function saveAttempt(attempt) {
  const map = readAll();
  map[attempt.id] = { ...attempt, updatedAt: Date.now() };
  writeAll(map);
}

export function deleteAttempt(id) {
  const map = readAll();
  delete map[id];
  writeAll(map);
}

/** Latest attempt linked to a chapter (resume target). */
export function latestAttemptForChapter(chapterId) {
  if (!chapterId) return null;
  const all = Object.values(readAll()).filter((a) => a.chapterId === chapterId);
  if (!all.length) return null;
  all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  return all[0];
}

/** Registry-style derived fields for cards/lists (same names as D:\WEB). */
export function toRecord(a) {
  const answeredCount = Object.keys(a.answers || {}).length;
  const totalQuestions = (a.questions || []).length;
  const max = totalQuestions * (a.markPerCorrect || 1);
  const score = gradeScore(a.questions || [], a.answers || {}, a.markPerCorrect || 1, a.negativeMarking || 0);
  const percentage = max > 0 ? Number(((score / max) * 100).toFixed(1)) : 0;
  return {
    id: a.id, title: a.title, subtitle: a.subtitle,
    totalQuestions, answeredCount, score, max,
    percentage: `${percentage}%`, percentageNum: percentage,
    status: a.status, timeSpentSec: a.timeSpentSec || 0,
    updatedAt: a.updatedAt, createdAt: a.createdAt,
  };
}

/** Stats across attempts — mirrors D:\WEB getExamStats. */
export function getAttemptStats() {
  const all = Object.values(readAll());
  const total = all.length;
  const completed = all.filter((a) => a.status === "completed").length;
  const inProgress = total - completed;
  const avg = total ? all.reduce((s, a) => s + toRecord(a).percentageNum, 0) / total : 0;
  const best = total ? Math.max(...all.map((a) => toRecord(a).percentageNum)) : 0;
  return {
    total, inProgress, completed,
    avgScore: avg.toFixed(1), bestScore: best.toFixed(1),
    totalQuestions: all.reduce((s, a) => s + (a.questions || []).length, 0),
    totalAnswered: all.reduce((s, a) => s + Object.keys(a.answers || {}).length, 0),
  };
}

/* ---------- real analytics derived from attempts (no dummy data) ---------- */

export function listAttempts() {
  return Object.values(readAll()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function chapterAttempts(chapterId) {
  return listAttempts().filter((a) => a.chapterId === chapterId);
}

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Active-day counts for the last `weeks` weeks (heatmap). */
export function activityDays(weeks = 12) {
  const counts = {};
  Object.values(readAll()).forEach((a) => {
    [a.createdAt, a.updatedAt].forEach((ts) => {
      if (ts) counts[dayKey(ts)] = (counts[dayKey(ts)] || 0) + 1;
    });
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - (weeks * 7 - 1) * 864e5;
  const active = Object.entries(counts).filter(([k]) => {
    const [y, m, d] = k.split("-").map(Number);
    const t = new Date(y, m, d).getTime();
    return t >= start;
  });
  return { counts, activeDays: active.length, start };
}

/** Attempts started per day for the last 7 days (momentum). */
export function momentumWeek() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 6; i >= 0; i--) {
    const t = new Date(today.getTime() - i * 864e5);
    days.push({ key: dayKey(t.getTime()), label: "SMTWTFS"[t.getDay()], count: 0 });
  }
  Object.values(readAll()).forEach((a) => {
    const k = dayKey(a.createdAt || a.updatedAt || Date.now());
    const d = days.find((x) => x.key === k);
    if (d) d.count++;
  });
  return days;
}

/** Accuracy across attempts: correct / incorrect / skipped (completed only). */
export function accuracyBreakdown() {
  let correct = 0, incorrect = 0, skipped = 0;
  Object.values(readAll()).forEach((a) => {
    (a.questions || []).forEach((q) => {
      const ans = (a.answers || {})[q.id];
      if (!ans) { if (a.status === "completed") skipped++; return; }
      if (ans === q.correct_answer) correct++;
      else incorrect++;
    });
  });
  const total = correct + incorrect + skipped;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return {
    correct, incorrect, skipped, total,
    pctCorrect: total ? Number(((correct / total) * 100).toFixed(1)) : 0,
    shares: { correct: pct(correct), incorrect: pct(incorrect), skipped: pct(skipped) },
  };
}

/** Score-over-time series from completed attempts (oldest → newest). */
export function scoreSeries(limit = 8) {
  return Object.values(readAll())
    .filter((a) => a.status === "completed")
    .sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0))
    .slice(-limit)
    .map((a) => {
      const r = toRecord(a);
      const ts = a.updatedAt || Date.now();
      const d = new Date(ts);
      return {
        d: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        v: r.percentageNum, title: a.title, ts,
      };
    });
}

/** Per-topic accuracy across all attempts (weak-topic detection). */
export function topicAccuracy() {
  const map = new Map();
  Object.values(readAll()).forEach((a) => {
    (a.questions || []).forEach((q) => {
      const ans = (a.answers || {})[q.id];
      if (!ans) return;
      const key = q.topic_title || "General";
      if (!map.has(key)) map.set(key, { topic: key, answered: 0, correct: 0 });
      const t = map.get(key);
      t.answered++;
      if (ans === q.correct_answer) t.correct++;
    });
  });
  return [...map.values()]
    .map((t) => ({ ...t, pct: t.answered ? Number(((t.correct / t.answered) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => a.pct - b.pct);
}

/** Pace stats from completed attempts. */
export function timeStats() {
  const done = Object.values(readAll()).filter((a) => a.status === "completed");
  if (!done.length) return null;
  const perQ = done.flatMap((a) => {
    const n = Object.keys(a.answers || {}).length;
    return n ? [(a.timeSpentSec || 0) / n] : [];
  });
  const avg = perQ.length ? perQ.reduce((s, x) => s + x, 0) / perQ.length : 0;
  const longest = done.reduce((m, a) => Math.max(m, a.timeSpentSec || 0), 0);
  const fmt = (s) => {
    s = Math.round(s);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  };
  return { avgPerQ: fmt(avg), longest: fmt(longest), tests: done.length };
}

/** Chapter rollup: latest attempt + best score + totals. */
export function chapterRollup(chapterId) {
  const list = chapterAttempts(chapterId);
  if (!list.length) return { attempts: 0 };
  const latest = list[0];
  const rec = toRecord(latest);
  const best = Math.max(...list.map((a) => toRecord(a).percentageNum));
  return {
    attempts: list.length,
    status: latest.status,
    latestPct: rec.percentageNum,
    answered: rec.answeredCount,
    total: rec.totalQuestions,
    best,
    updatedAt: latest.updatedAt,
  };
}
