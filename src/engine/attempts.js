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
