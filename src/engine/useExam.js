/* useExam — React owner of one live attempt. Ports D:\WEB js/app.js
   state machine 1:1 (select locks, clear unlocks, mark+next, filtered
   nav, section/tag filters reset review, review modes, submit, reset).
   Autosaves after every mutation; timer ticks active seconds. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gradeScore, reviewIndices } from "./examFormat.js";
import { getAttempt, saveAttempt } from "./attempts.js";

export function useExam(attemptId, initialReview = null) {
  // malformed records (e.g. hand-edited storage) behave as "not found"
  const [attempt, setAttempt] = useState(() => {
    const a = getAttempt(attemptId);
    return a && Array.isArray(a.questions) ? a : null;
  });
  const [section, setSection] = useState("ALL");
  const [tag, setTag] = useState(null);
  const [review, setReview] = useState(initialReview); // 'WRONG' | 'UNATTEMPTED' | 'MARKED' | null
  const [submitted, setSubmitted] = useState(() => !!getAttempt(attemptId) && getAttempt(attemptId).status === "completed");
  const timerRef = useRef(null);

  // persist after every mutation (D:\WEB saves after every action)
  const commit = useCallback((mut) => {
    setAttempt((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      mut(next);
      next.score = gradeScore(next.questions, next.answers, next.markPerCorrect, next.negativeMarking);
      saveAttempt(next);
      return next;
    });
  }, []);

  // active-time ticker (paused once submitted)
  useEffect(() => {
    if (!attempt || submitted) return;
    timerRef.current = setInterval(() => {
      setAttempt((prev) => {
        if (!prev) return prev;
        const next = { ...prev, timeSpentSec: (prev.timeSpentSec || 0) + 1 };
        saveAttempt(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [attempt?.id, submitted]);

  const indices = useMemo(() => {
    if (!attempt) return [];
    if (review) return reviewIndices(
      { questions: attempt.questions }, attempt.answers, attempt.marked, review);
    let list = attempt.questions.map((_, i) => i);
    if (section !== "ALL") {
      const q0 = attempt.questions;
      list = list.filter((i) => (q0[i].section_title || "General") === section);
    }
    if (tag) list = list.filter((i) => (attempt.questions[i].tags || []).includes(tag));
    return list;
  }, [attempt, section, tag, review]);

  const sections = useMemo(() => {
    if (!attempt) return [];
    const map = new Map();
    attempt.questions.forEach((q, i) => {
      const t = q.section_title || "General";
      if (!map.has(t)) map.set(t, []);
      map.get(t).push(i);
    });
    return [...map.entries()].map(([title, idx]) => ({ title, indices: idx }));
  }, [attempt]);

  const tags = useMemo(() => {
    if (!attempt) return [];
    return [...new Set(attempt.questions.flatMap((q) => q.tags || []))];
  }, [attempt]);

  const topics = useMemo(() => {
    if (!attempt) return [];
    const map = new Map();
    indices.forEach((i) => {
      const q = attempt.questions[i];
      const key = `${q.section_title || "General"}__${q.topic_title || "General"}`;
      if (!map.has(key)) map.set(key, { section: q.section_title || "General", topic: q.topic_title || "General", indices: [] });
      map.get(key).indices.push(i);
    });
    return [...map.values()];
  }, [attempt, indices]);

  const currentQ = attempt ? attempt.questions[attempt.currentIndex] : null;

  const gotoIndex = useCallback((i) => {
    commit((d) => {
      d.currentIndex = i;
      const qq = d.questions[i];
      if (qq) {
        d.visited = d.visited || {};
        d.visited[qq.id] = true; // visiting counts, answered or not
      }
    });
  }, [commit]);

  const step = useCallback((dir) => {
    const pos = indices.indexOf(attempt.currentIndex);
    const next = indices[pos + dir];
    if (next !== undefined) gotoIndex(next);
  }, [attempt, indices, gotoIndex]);

  const select = useCallback((opt) => {
    const q = attempt?.questions[attempt.currentIndex];
    if (!q || submitted) return;
    if (attempt.answers[q.id]) return; // locked until cleared (D:\WEB)
    commit((d) => { d.answers[q.id] = opt; });
  }, [attempt, submitted, commit]);

  const clear = useCallback(() => {
    const q = attempt?.questions[attempt.currentIndex];
    if (!q || submitted) return;
    if (!attempt.answers[q.id]) return;
    commit((d) => { delete d.answers[q.id]; });
  }, [attempt, submitted, commit]);

  const toggleMark = useCallback(() => {
    const q = attempt?.questions[attempt.currentIndex];
    if (!q || submitted) return;
    commit((d) => {
      if (d.marked[q.id]) delete d.marked[q.id];
      else d.marked[q.id] = true;
    });
  }, [attempt, submitted, commit]);

  const markNext = useCallback(() => {
    const q = attempt?.questions[attempt.currentIndex];
    if (!q || submitted) return;
    commit((d) => { d.marked[q.id] = true; });
    step(1);
  }, [attempt, submitted, commit, step]);

  const pickSection = useCallback((t) => {
    setReview(null);
    setSection(t);
    // keep position if visible, else jump to first of filter
    const q0 = attempt.questions;
    let list = q0.map((_, i) => i);
    if (t !== "ALL") list = list.filter((i) => (q0[i].section_title || "General") === t);
    if (tag) list = list.filter((i) => (q0[i].tags || []).includes(tag));
    if (!list.includes(attempt.currentIndex) && list.length) gotoIndex(list[0]);
  }, [attempt, tag, gotoIndex]);

  const pickTag = useCallback((t) => {
    setReview(null);
    setTag(t);
  }, []);

  const enterReview = useCallback((mode) => {
    const list = reviewIndices({ questions: attempt.questions }, attempt.answers, attempt.marked, mode);
    if (!list.length) return false;
    setReview(mode);
    gotoIndex(list[0]);
    return true;
  }, [attempt, gotoIndex]);

  const exitReview = useCallback(() => setReview(null), []);

  const submit = useCallback(() => {
    commit((d) => { d.status = "completed"; });
    setSubmitted(true);
  }, [commit]);

  const restart = useCallback(() => {
    commit((d) => {
      d.answers = {}; d.marked = {}; d.visited = {}; d.currentIndex = 0; d.score = 0; d.status = "in_progress";
    });
    setSubmitted(false);
    setReview(null);
    setSection("ALL");
    setTag(null);
  }, [commit]);

  // opening an attempt counts as visiting the landing question
  useEffect(() => {
    const a = getAttempt(attemptId);
    const qq = a?.questions[a.currentIndex];
    if (qq && !(a.visited || {})[qq.id]) {
      commit((d) => {
        d.visited = d.visited || {};
        d.visited[qq.id] = true;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  return {
    attempt, currentQ, indices, sections, tags, topics,
    section, tag, review, submitted,
    answeredCount: attempt ? Object.keys(attempt.answers).length : 0,
    select, clear, toggleMark, markNext, step, gotoIndex,
    pickSection, pickTag, enterReview, exitReview, submit, restart,
  };
}
