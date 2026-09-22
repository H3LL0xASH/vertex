/* VERTEX exam format — port of D:\WEB dataset contract + normalize/grade math.
   SAME JSON FORMAT (docs/exam-json-format.md):
     { title*, subtitle?, mark_per_correct?=1, negative_marking?=0,
       questions*: [{ question*, options* {A..D}, correct_answer*,
                      solution?, section?, topic?, tags? }] }
   SAME RULES: answers lock once selected (Clear to change), +mark for
   correct, -negative for wrong, palette = answered?correct/wrong + marked. */

const VALID_KEYS = ["A", "B", "C", "D"];

export function validateExam(data) {
  const errors = [];
  if (!data || typeof data !== "object") return { valid: false, errors: ["File is not a JSON object."] };
  const rawQuestions = Array.isArray(data.questions) ? data.questions : [];
  if (!rawQuestions.length) errors.push("No questions found (need a non-empty `questions` array).");
  rawQuestions.forEach((q, idx) => {
    const n = idx + 1;
    if (!q || typeof q.question !== "string" || !q.question.trim()) errors.push(`Q${n}: missing question text.`);
    const opts = q?.options && typeof q.options === "object" ? q.options : {};
    VALID_KEYS.forEach((k) => {
      if (typeof opts[k] !== "string" || !opts[k].trim()) errors.push(`Q${n}: option ${k} is missing.`);
    });
    const ans = q?.correct_answer ? String(q.correct_answer).trim().toUpperCase() : "";
    if (!VALID_KEYS.includes(ans)) errors.push(`Q${n}: correct_answer must be one of A–D.`);
  });
  return { valid: errors.length === 0, errors };
}

let qSeq = 0;

export function normalizeExam(raw) {
  const title = raw.title || "Untitled Test";
  const subtitle = raw.subtitle || (raw.source_file ? `Source: ${raw.source_file}` : "");
  const markPerCorrect = Number(raw.mark_per_correct) > 0 ? Number(raw.mark_per_correct) : 1;
  const negativeMarking = Number(raw.negative_marking) > 0 ? Number(raw.negative_marking) : 0;

  const questions = (raw.questions || []).map((q, idx) => ({
    id: `q_${++qSeq}_${idx}`,
    index: idx,
    global_no: q.global_no !== undefined ? Number(q.global_no) : idx + 1,
    question: String(q.question || ""),
    options: { A: q.options?.A ?? "", B: q.options?.B ?? "", C: q.options?.C ?? "", D: q.options?.D ?? "" },
    correct_answer: String(q.correct_answer || "").trim().toUpperCase(),
    solution: q.solution || q.explanation || "",
    section_title: q.section_title || q.section || q.part || "General",
    topic_title: q.topic_title || q.topic || "General",
    tags: Array.isArray(q.tags) ? q.tags.map((t) => String(t).trim()).filter(Boolean) : [],
  }));

  // Sections preserve first-seen order, each with its question indices.
  const sections = [];
  const seen = new Map();
  questions.forEach((q, i) => {
    if (!seen.has(q.section_title)) { seen.set(q.section_title, sections.length); sections.push({ title: q.section_title, indices: [] }); }
    sections[seen.get(q.section_title)].indices.push(i);
  });
  const tags = [...new Set(questions.flatMap((q) => q.tags))];

  return { title, subtitle, markPerCorrect, negativeMarking, questions, sections, tags };
}

/** Score math — identical to D:\WEB recalculateScore. */
export function gradeScore(questions, answers, markPerCorrect, negativeMarking) {
  let s = 0;
  questions.forEach((q) => {
    const a = answers[q.id];
    if (!a) return;
    if (a === q.correct_answer) s += markPerCorrect;
    else if (negativeMarking > 0) s -= negativeMarking;
  });
  return Number.isInteger(s) ? s : Number(s.toFixed(2));
}

/** Palette status of one question — mirrors D:\WEB renderPalette classes. */
export function questionStatus(q, answers, marked) {
  const ans = answers[q.id];
  return {
    answered: !!ans,
    correct: ans === q.correct_answer,
    wrong: !!ans && ans !== q.correct_answer,
    marked: !!marked[q.id],
  };
}

/** Summary math — mirrors D:\WEB showSummaryModal. */
export function computeSummary(exam, answers, marked) {
  let answered = 0, correct = 0, wrong = 0, markedCount = 0;
  exam.questions.forEach((q) => {
    if (marked[q.id]) markedCount++;
    const a = answers[q.id];
    if (!a) return;
    answered++;
    if (a === q.correct_answer) correct++;
    else wrong++;
  });
  const total = exam.questions.length;
  const unattempted = total - answered;
  const max = total * exam.markPerCorrect;
  const score = gradeScore(exam.questions, answers, exam.markPerCorrect, exam.negativeMarking);
  const percentage = max > 0 ? Number(((score / max) * 100).toFixed(1)) : 0;
  return { total, answered, correct, wrong, marked: markedCount, unattempted, score, max, percentage };
}

/** Review index lists — mirrors D:\WEB enterReviewMode. */
export function reviewIndices(exam, answers, marked, mode) {
  const out = [];
  exam.questions.forEach((q, idx) => {
    const a = answers[q.id];
    if (mode === "MARKED" && marked[q.id]) out.push(idx);
    else if (mode === "UNATTEMPTED" && !a) out.push(idx);
    else if (mode === "WRONG" && a && a !== q.correct_answer) out.push(idx);
  });
  return out;
}

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
}
