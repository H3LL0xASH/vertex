import { useEffect, useMemo, useState } from "react";
import { useVertex } from "../store.jsx";
import { useExam } from "../engine/useExam.js";
import { formatClock, questionStatus } from "../engine/examFormat.js";
import { Card, Ico, Modal } from "../components/ui.jsx";
import { BgBlobs } from "../components/Shell.jsx";

/* VERTEX Test Player — real CBT workspace in our floating-3D UI.
   Engine behavior ported 1:1 from D:\WEB js/app.js (locked answers,
   palette states, section/topic filters, review modes, timer, scoring). */

const OPT_KEYS = ["A", "B", "C", "D"];

const readSaved = (attemptId) => {
  try {
    return (JSON.parse(localStorage.getItem("vertexSavedV1") || "[]"))
      .filter((s) => s.attemptId === attemptId).map((s) => s.qid);
  } catch { return []; }
};
const writeSaved = (attemptId, qids) => {
  try {
    const rest = JSON.parse(localStorage.getItem("vertexSavedV1") || "[]")
      .filter((s) => s.attemptId !== attemptId);
    qids.forEach((qid) => rest.push({ attemptId, qid, savedAt: Date.now() }));
    localStorage.setItem("vertexSavedV1", JSON.stringify(rest));
  } catch { /* ignore */ }
};

export default function Player({ attemptId, initialReview, go }) {
  const { showToast, theme, toggleTheme } = useVertex();
  const ex = useExam(attemptId, initialReview || null);
  const [showAnswer, setShowAnswer] = useState(true);
  const [explainOpen, setExplainOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(() => {
    try { return localStorage.getItem("vertexPaletteLegend") !== "0"; }
    catch { return true; }
  });
  const toggleLegend = () => {
    setLegendOpen((o) => {
      try { localStorage.setItem("vertexPaletteLegend", o ? "0" : "1"); } catch { /* ignore */ }
      return !o;
    });
  };
  // post-submit reattempt mode: re-answer freely with live feedback.
  // Saved record (score, answers) stays frozen; practice lives in memory.
  const [reattempt, setReattempt] = useState(false);
  const [practice, setPractice] = useState({});
  const [savedTick, setSavedTick] = useState(0);
  const [qOver, setQOver] = useState(false); // smart scrollbar: only when overflowing

  const { attempt, submitted } = ex;
  useEffect(() => { setExplainOpen(false); }, [attempt?.currentIndex]);

  // effective answers: saved record normally; practice-only in reattempt mode
  // (previous answers hidden, saved score frozen, practice lives in memory).
  const re = submitted && reattempt;
  const effAnswers = useMemo(
    () => (re && attempt ? { ...practice } : attempt?.answers || {}),
    [re, attempt, practice]
  );
  const pickPractice = (opt) => {
    const cq = ex.currentQ;
    if (!cq) return;
    setPractice((p) => ({ ...p, [cq.id]: opt }));
  };
  const savedIds = useMemo(
    () => (attempt ? readSaved(attempt.id) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempt, savedTick]
  );
  const toggleSave = () => {
    const cq = ex.currentQ;
    if (!cq) return;
    const has = savedIds.includes(cq.id);
    const next = has ? savedIds.filter((id) => id !== cq.id) : [...savedIds, cq.id];
    writeSaved(attempt.id, next);
    setSavedTick((t) => t + 1);
    showToast(has ? "Removed from saved questions." : `Question saved (${next.length} saved in this test).`);
  };

  // keyboard flow — D:\WEB map: arrows/P/N, A–D/1–4, M mark, C clear
  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "p" || k === "P") ex.step(-1);
      else if (k === "ArrowRight" || k === "n" || k === "N") ex.step(1);
      else if (["a", "A", "1"].includes(k)) submitted && reattempt ? pickPractice("A") : ex.select("A");
      else if (["b", "B", "2"].includes(k)) submitted && reattempt ? pickPractice("B") : ex.select("B");
      else if (["c", "C", "3"].includes(k)) submitted && reattempt ? pickPractice("C") : ex.select("C");
      else if (["d", "D", "4"].includes(k)) submitted && reattempt ? pickPractice("D") : ex.select("D");
      else if (k === "m" || k === "M") ex.toggleMark();
      else if (k === "C" && e.shiftKey) ex.clear();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ex, submitted, reattempt]);

  const counts = useMemo(() => {
    let un = 0, co = 0, wr = 0, mk = 0, vi = 0;
    const visited = attempt?.visited || {};
    attempt?.questions.forEach((qq) => {
      const s = questionStatus(qq, effAnswers, attempt.marked);
      if (s.marked) mk++;
      if (!s.answered) {
        un++;
        if (visited[qq.id]) vi++;
      }
      else if (s.correct) co++;
      else wr++;
    });
    return { un, co, wr, mk, vi };
  }, [attempt, effAnswers]);

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md">
          <h2 className="text-xl font-extrabold">Attempt not found</h2>
          <p className="text-sm text-[var(--v-muted)] mt-2">It may have been deleted in another tab.</p>
          <button onClick={() => go("library")} className="f3d-btn f3d-btn-violet mt-5 rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2">Back to Library <Ico n="arrowR" s={14} /></button>
        </Card>
      </div>
    );
  }

  const q = ex.currentQ;
  const st = q ? questionStatus(q, effAnswers, attempt.marked) : null;
  const pos = ex.indices.indexOf(attempt.currentIndex);
  const total = attempt.questions.length;

  // smart scrollbar: slim track only when the question card truly overflows
  useEffect(() => {
    const el = document.querySelector("[data-qcard]");
    if (!el) return;
    const check = () => setQOver(el.scrollHeight - el.clientHeight > 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => { ro.disconnect(); window.removeEventListener("resize", check); };
  }, [attempt?.currentIndex, explainOpen, st?.answered, practice, submitted, reattempt]);

  const palBtn = (qi) => {
    const qq = attempt.questions[qi];
    const s = questionStatus(qq, effAnswers, attempt.marked);
    const cur = qi === attempt.currentIndex;
    const seen = !!(attempt.visited || {})[qq.id] && !s.answered;
    const cls = [
      "pal-btn",
      s.correct ? "pal-correct" : "",
      s.wrong ? "pal-wrong" : "",
      !s.correct && !s.wrong && cur ? "pal-current" : "",
      !s.correct && !s.wrong && !cur && s.marked ? "pal-marked" : "",
      !s.correct && !s.wrong && !cur && !s.marked && seen ? "pal-visited" : "",
      cur ? "ring-2 ring-violet-500" : "",
    ].join(" ");
    return (
      <button key={qq.id} onClick={() => { ex.gotoIndex(qi); setPaletteOpen(false); }}
        title={`Question ${qq.global_no}`}
        className={`neon h-10 rounded-xl text-sm font-bold border flex items-center justify-center gap-1 ${cls}`}
        style={{ "--neon": "#8b5cf6" }}>
        {qq.global_no}
        {s.marked && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
        {savedIds.includes(qq.id) && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Saved" />}
      </button>
    );
  };

  const palette = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 shrink-0">
        <h3 className="text-[17px] font-extrabold">Question Palette</h3>
        <span className="ml-auto text-[13px] font-bold text-[var(--v-muted)]">Total: <b className="text-[var(--v-ink)]">{total}</b></span>
        <button onClick={toggleLegend} title={legendOpen ? "Hide colour key" : "Show colour key"}
          className="w-7 h-7 rounded-lg f3d-pill flex items-center justify-center text-[var(--v-muted)]">
          <Ico n="chevD" s={13} className={legendOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>
      {legendOpen && (
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-[12.5px] font-medium shrink-0 page-in">
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full bg-slate-200 border border-black/10 inline-block" /> Not Answered ({counts.un})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full bg-emerald-500 text-white inline-flex items-center justify-center"><Ico n="check" s={10} /></i> Correct ({counts.co})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full inline-block" style={{ background: "linear-gradient(180deg,#f87171,#dc2626)" }} /> Wrong ({counts.wr})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-md bg-violet-600 text-white inline-flex items-center justify-center"><Ico n="check" s={10} /></i> Marked ({counts.mk})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full bg-amber-400 inline-block" /> Visited ({counts.vi})</span>
        {savedIds.length > 0 && (
          <span className="col-span-2 flex items-center gap-2 text-amber-500"><Ico n="star" s={13} /> Saved ({savedIds.length})</span>
        )}
      </div>
      )}
      <div className="mt-4 space-y-2.5 flex-1 min-h-0 overflow-y-auto scroll-slim pr-1 max-lg:max-h-[50vh]">
        {ex.topics.length === 0 && (
          <div className="text-center text-[13px] text-[var(--v-muted)] py-6">No questions match the current filter.</div>
        )}
        {(() => {
          // group visible topics back under their section headings
          const bySec = new Map();
          ex.topics.forEach((t) => {
            if (!bySec.has(t.section)) bySec.set(t.section, []);
            bySec.get(t.section).push(t);
          });
          return [...bySec.entries()].map(([sec, list]) => {
            const open = collapsed[sec] !== false;
            const done = list.reduce((a, t) => a + t.indices.filter((i) => effAnswers[attempt.questions[i].id]).length, 0);
            const n = list.reduce((a, t) => a + t.indices.length, 0);
            return (
              <div key={sec} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] overflow-hidden">
                <button onClick={() => setCollapsed((c) => ({ ...c, [sec]: open ? true : false }))}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13.5px] font-bold">
                  <span className="w-5 h-5 rounded-md bg-violet-600 text-white text-[11px] inline-flex items-center justify-center">▣</span>
                  <span className="truncate">{sec}</span>
                  <span className={`ml-auto text-[var(--v-muted)] transition-transform ${open ? "rotate-180" : ""}`}><Ico n="chevD" s={14} /></span>
                </button>
                {open && list.map((t) => (
                  <div key={t.section + t.topic} className="px-3 pb-3">
                    <div className="flex items-center text-[12.5px] font-semibold text-[var(--v-muted)] py-1.5">
                      <span className="truncate">{t.topic}</span>
                      <span className="ml-auto">{t.indices.filter((i) => effAnswers[attempt.questions[i].id]).length}/{t.indices.length}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {t.indices.map(palBtn)}
                    </div>
                  </div>
                ))}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden page-in">
      <BgBlobs />
      <div className="max-w-[1400px] w-full mx-auto px-3 sm:px-4 py-3 pb-8 lg:pb-3 flex-1 min-h-0 flex flex-col">
        {/* HEADER — compact exam nav */}
        <Card float className="px-4 py-2.5 flex items-center gap-3 flex-wrap shrink-0">
          <button onClick={() => go("library")} title="Back to Library"
            className="neon w-9 h-9 rounded-xl f3d-pill flex items-center justify-center" style={{ "--neon": "#8b5cf6" }}><Ico n="chevL" s={17} /></button>
          <span className="f3d-orb rounded-[12px]" style={{ width: 40, height: 40, background: "linear-gradient(180deg,#8b9ff0,#5b63e8)" }}>
            <span className="font-brand font-extrabold text-white text-[20px]">V</span>
          </span>
          <span className="max-sm:hidden">
            <b className="font-brand text-[19px] tracking-tight block leading-none">vertex</b>
            <small className="text-[8.5px] tracking-[0.3em] text-[var(--v-muted)] font-semibold">EXAM SIMULATOR</small>
          </span>
          <div className="mx-1 min-w-0">
            <b className="text-[15px] block leading-tight truncate max-w-[220px]">{attempt.title}</b>
            <span className="text-xs text-[var(--v-muted)] truncate block max-w-[220px]">{attempt.subtitle || "Practice attempt"}</span>
          </div>
          <div className="f3d-pill px-4 py-1.5 text-[13px]">Answered <b className="text-blue-600 text-[15px]"> {ex.answeredCount} / {total}</b></div>
          <div className="f3d-pill px-4 py-1.5 text-[13px]">Score <b className="text-emerald-500 text-[15px]"> {attempt.score}</b></div>
          <div className="f3d-pill px-4 py-1.5 text-[13px]">Total Time <b className="text-violet-600 text-[15px] font-mono"> {formatClock(attempt.timeSpentSec)}</b></div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => showToast("Question reported — thanks for flagging it.")} style={{ "--neon": "#8b5cf6" }}
              className="neon h-10 px-4 rounded-full f3d-pill text-[13px] font-bold flex items-center gap-2"><Ico n="flag" s={15} /> <span className="max-md:hidden">Report</span></button>
            <button onClick={toggleTheme} style={{ "--neon": "#8b5cf6" }}
              className="neon h-10 px-4 rounded-full f3d-pill text-[13px] font-bold">{theme === "dark" ? "☀️" : "🌙"} <span className="max-md:hidden">Dark</span></button>
            {!submitted && (
              <button onClick={() => setConfirmReset(true)} style={{ "--neon": "#f43f5e" }}
                className="neon h-10 px-4 rounded-full text-[13px] font-bold text-red-500 border border-red-200 bg-red-50 flex items-center gap-2"><Ico n="reset" s={15} /> <span className="max-md:hidden">Reset</span></button>
            )}
          </div>
        </Card>

        {/* REVIEW BANNER */}
        {ex.review && (
          <div className="f3d review-banner mt-2.5 px-4 py-2 flex items-center gap-3 text-sm font-bold text-violet-700 shrink-0">
            <span>◉ Review Mode: viewing {ex.indices.length} {ex.review.toLowerCase()} question(s)</span>
            <button onClick={ex.exitReview} className="ml-auto f3d-btn f3d-btn-violet rounded-full px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">Exit review <Ico n="x" s={12} /></button>
          </div>
        )}

        {/* SECTION TABS */}
        <Card className="mt-2.5 px-3 py-1.5 flex items-center gap-2 overflow-x-auto scroll-slim shrink-0">
          {["ALL", ...ex.sections.map((s) => s.title)].map((t) => {
            const count = t === "ALL" ? total : ex.sections.find((s) => s.title === t).indices.length;
            const active = ex.section === t;
            return (
              <button key={t} onClick={() => ex.pickSection(t)} style={{ "--neon": "#8b5cf6" }}
                className={`${active ? "f3d-btn f3d-btn-violet" : "neon border border-[var(--v-line)]"} rounded-full px-3.5 py-1.5 text-[12.5px] font-bold flex items-center gap-2 whitespace-nowrap`}>
                {t === "ALL" ? "All" : t}
                <span className={`text-[11px] rounded-full px-2 py-0.5 ${active ? "bg-white/25" : "bg-[var(--v-bg)] text-[var(--v-muted)]"}`}>{count}</span>
              </button>
            );
          })}
        </Card>

        {/* WORKSPACE — fills the viewport, scrolls only inside panels */}
        <div className="mt-2.5 grid gap-3 lg:grid-cols-[330px_1fr] grid-cols-1 lg:flex-1 lg:min-h-0 items-start lg:items-stretch">
          <Card float className="p-5 max-lg:hidden lg:h-full lg:flex lg:flex-col lg:overflow-hidden">{palette}</Card>
          <div className="lg:hidden">
            <button onClick={() => setPaletteOpen((o) => !o)} style={{ "--neon": "#8b5cf6" }}
              className="neon w-full f3d-pill px-5 py-3 text-sm font-bold flex items-center justify-center gap-2">
              Question Palette <Ico n="chevD" s={15} className={paletteOpen ? "rotate-180 transition-transform" : "transition-transform"} /></button>
            {paletteOpen && <Card className="mt-2.5 p-5">{palette}</Card>}
          </div>

          <div className="min-h-0 flex flex-col">
            <Card float delay={0.3} data-qcard className={`p-5 sm:p-6 lg:flex-1 lg:min-h-0 lg:overflow-y-auto ${qOver ? "scroll-slim" : "no-scrollbar"}`}>
              {q ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold tracking-wide px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {(q.section_title || "General").toUpperCase()}
                    </span>
                    <span className="text-[11px] font-extrabold tracking-wide px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                      {(q.topic_title || "General").toUpperCase()}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[var(--v-bg)] text-[var(--v-muted)] border border-[var(--v-line)]" title="Marking scheme">
                      +{attempt.markPerCorrect} / −{attempt.negativeMarking}
                    </span>
                    <b className="ml-auto text-[13px]">Question {pos >= 0 ? pos + 1 : "–"} of {ex.indices.length}</b>
                    <span className="flex gap-2">
                      <button onClick={() => ex.step(-1)} style={{ "--neon": "#8b5cf6" }} className="neon w-9 h-9 rounded-xl f3d-pill flex items-center justify-center" title="Previous question"><Ico n="chevL" s={17} /></button>
                      <button onClick={() => ex.step(1)} style={{ "--neon": "#8b5cf6" }} className="neon w-9 h-9 rounded-xl f3d-pill flex items-center justify-center" title="Next question"><Ico n="chevR" s={17} /></button>
                    </span>
                  </div>
                  <p className="mt-4 text-[16.5px] leading-relaxed font-medium break-words">Q{q.global_no}. {q.question}</p>

                  {/* instant feedback banner (D:\WEB bannerStatus) */}
                  {st.answered && (
                    <div className={`mt-3 rounded-2xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 page-in ${st.correct ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                      {st.correct ? <><Ico n="check" s={16} /> Correct</> : <><Ico n="x" s={16} /> Wrong — correct answer: {q.correct_answer}</>}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {OPT_KEYS.map((k) => {
                      const picked = effAnswers[q.id] === k;
                      const isRight = q.correct_answer === k;
                      const locked = st.answered;
                      const optLocked = st.answered && !re;
                      // in blind reattempt, surface the old wrong pick with just an X
                      const prevX = re && !picked && attempt.answers[q.id] === k && attempt.answers[q.id] !== q.correct_answer;
                      let cls = "border-[var(--v-line)] bg-[var(--v-card-hi)] hover:-translate-y-[2px]";
                      if (locked && picked && st.correct) cls = "border-emerald-400 bg-emerald-50";
                      else if (locked && picked) cls = "border-red-400 bg-red-50";
                      else if (locked && isRight) cls = "border-emerald-400 bg-emerald-50/60";
                      return (
                        <button key={k} disabled={optLocked} onClick={() => (submitted && reattempt ? pickPractice(k) : ex.select(k))} style={{ "--neon": "#8b5cf6" }}
                          className={`${optLocked ? "" : "neon"} w-full rounded-2xl border-2 px-4 py-3.5 flex items-center gap-4 text-left transition-all ${cls}`}>
                          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${picked ? (st.correct || !locked ? "border-violet-600" : "border-red-500") : "border-slate-300"}`}>
                            {picked && <span className={`w-3.5 h-3.5 rounded-full ${st.correct || !locked ? "bg-violet-600" : "bg-red-500"}`} />}
                          </span>
                          <span className="w-9 h-9 rounded-lg bg-[var(--v-bg)] border border-[var(--v-line)] font-extrabold flex items-center justify-center shrink-0">{k}</span>
                          <span className="text-[15px] font-medium min-w-0 break-words">{q.options[k]}</span>
                          {locked && isRight && <span className="ml-auto text-emerald-500 font-extrabold"><Ico n="check" s={18} /></span>}
                          {locked && picked && !isRight && <span className="ml-auto text-red-500 font-extrabold"><Ico n="x" s={18} /></span>}
                          {prevX && <span className="ml-auto text-red-400 font-extrabold" title="Your previous answer"><Ico n="x" s={16} /></span>}
                        </button>
                      );
                    })}
                  </div>

                  {st.answered && (
                    <button onClick={() => setExplainOpen((o) => !o)} style={{ "--neon": "#f59e0b" }}
                      className="neon mt-4 rounded-xl px-4 py-2.5 text-sm font-bold f3d-pill flex items-center gap-2 page-in">
                      💡 Explanation <Ico n="chevD" s={15} className={explainOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                    </button>
                  )}
                  {explainOpen && (
                    <div className="mt-2.5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-sm leading-relaxed page-in">
                      {q.solution || "No explanation provided for this question."}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-[var(--v-muted)] py-10 text-sm">No question selected.</div>
              )}
            </Card>

            {/* FOOTER ACTIONS — exam controls, or review controls after submit */}
            {submitted ? (
              <div className="mt-3 shrink-0 f3d rounded-2xl px-4 py-3 flex items-center justify-center gap-2.5 flex-wrap page-in">
                <button onClick={() => {
                  if (!reattempt) {
                    setPractice({}); // fresh blind slate every time it turns on
                    setReattempt(true);
                    showToast("Reattempt mode on — previous answers hidden, score frozen.");
                  } else setReattempt(false);
                }} style={{ "--neon": "#8b5cf6" }}
                  className="neon rounded-full f3d-pill pl-4 pr-2 py-1.5 text-[13.5px] font-bold flex items-center gap-2.5" title="Answer again without touching your submitted score">
                  Reattempt
                  <span className={`w-11 h-6 rounded-full p-0.5 flex transition-colors ${reattempt ? "bg-violet-600" : "bg-slate-300"}`}>
                    <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${reattempt ? "translate-x-5" : ""}`} />
                  </span>
                  <b className={reattempt ? "text-violet-600" : "text-[var(--v-muted)]"}>{reattempt ? "ON" : "OFF"}</b>
                </button>
                <button onClick={() => go("result", { attemptId })} className="f3d-btn f3d-btn-violet rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">
                  Result <Ico n="arrowR" s={14} />
                </button>
                <button onClick={toggleSave} style={{ "--neon": "#f59e0b" }}
                  className="neon rounded-full f3d-pill px-4 py-2 text-[13px] font-bold flex items-center gap-2">
                  <span className={savedIds.includes(q?.id) ? "text-amber-500" : "text-[var(--v-muted)]"}><Ico n="star" s={15} /></span>
                  {savedIds.includes(q?.id) ? "Saved" : "Save question"}
                </button>
              </div>
            ) : (
            <div className="mt-3 shrink-0 flex items-center justify-center gap-3 flex-wrap">
              <button onClick={ex.clear} style={{ "--neon": "#64748b" }}
                className="neon rounded-xl px-5 py-3.5 text-[13.5px] font-bold f3d-pill flex gap-2 items-center"><Ico n="x" s={15} /> Clear Response</button>
              <button onClick={ex.toggleMark} style={{ "--neon": "#8b5cf6" }}
                className={`neon rounded-xl px-5 py-3.5 text-[13.5px] font-bold f3d-pill flex gap-2 items-center ${st?.marked ? "!bg-violet-600 !text-white !border-transparent" : ""}`}>
                <span className={st?.marked ? "" : "text-violet-600"}><Ico n="star" s={15} /></span> {st?.marked ? "Marked" : "Mark for Review"}</button>
              <button onClick={() => ex.step(1)} className="f3d-btn f3d-btn-violet rounded-xl px-6 py-3.5 text-[13.5px] font-bold flex gap-2 items-center">
                Save &amp; Next <Ico n="arrowR" s={15} /></button>
              <button onClick={() => go("result", { attemptId })} className="f3d-btn f3d-btn-green rounded-xl px-6 py-3.5 text-[13.5px] font-bold flex gap-2 items-center">
                <Ico n="arrowR" s={15} /> Submit Test</button>
            </div>
            )}
          </div>
        </div>
      </div>

      {confirmReset && (
        <Modal title="Reset this attempt?" okText="Reset" danger
          onClose={() => setConfirmReset(false)}
          onOk={() => { ex.restart(); setConfirmReset(false); showToast("Attempt reset — fresh start."); }}>
          <p className="mt-3 text-sm text-[var(--v-muted)]">Answers, marks and score return to zero. The timer keeps running.</p>
        </Modal>
      )}
    </div>
  );
}
