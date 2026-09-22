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

export default function Player({ attemptId, initialReview, go }) {
  const { showToast, theme, toggleTheme } = useVertex();
  const ex = useExam(attemptId, initialReview || null);
  const [showAnswer, setShowAnswer] = useState(true);
  const [explainOpen, setExplainOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [paletteOpen, setPaletteOpen] = useState(false);

  const { attempt } = ex;
  useEffect(() => { setExplainOpen(false); }, [attempt?.currentIndex]);

  // keyboard flow — D:\WEB map: arrows/P/N, A–D/1–4, M mark, C clear
  useEffect(() => {
    const onKey = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "")) return;
      const k = e.key;
      if (k === "ArrowLeft" || k === "p" || k === "P") ex.step(-1);
      else if (k === "ArrowRight" || k === "n" || k === "N") ex.step(1);
      else if (["a", "A", "1"].includes(k)) ex.select("A");
      else if (["b", "B", "2"].includes(k)) ex.select("B");
      else if (["c", "C", "3"].includes(k)) ex.select("C");
      else if (["d", "D", "4"].includes(k)) ex.select("D");
      else if (k === "m" || k === "M") ex.toggleMark();
      else if (k === "C" && e.shiftKey) ex.clear();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ex]);

  const counts = useMemo(() => {
    let un = 0, co = 0, wr = 0, mk = 0;
    attempt?.questions.forEach((q) => {
      const s = questionStatus(q, attempt.answers, attempt.marked);
      if (s.marked) mk++;
      if (!s.answered) un++;
      else if (s.correct) co++;
      else wr++;
    });
    return { un, co, wr, mk };
  }, [attempt]);

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md">
          <h2 className="text-xl font-extrabold">Attempt not found</h2>
          <p className="text-sm text-[var(--v-muted)] mt-2">It may have been deleted in another tab.</p>
          <button onClick={() => go("library")} className="f3d-btn f3d-btn-violet mt-5 rounded-xl px-6 py-3 text-sm font-bold">Back to Library →</button>
        </Card>
      </div>
    );
  }

  const q = ex.currentQ;
  const st = q ? questionStatus(q, attempt.answers, attempt.marked) : null;
  const pos = ex.indices.indexOf(attempt.currentIndex);
  const total = attempt.questions.length;

  const palBtn = (qi) => {
    const qq = attempt.questions[qi];
    const s = questionStatus(qq, attempt.answers, attempt.marked);
    const cur = qi === attempt.currentIndex;
    let cls = "bg-white text-slate-700 border-black/10";
    if (s.correct) cls = "text-white border-transparent";
    if (s.wrong) cls = "text-white border-transparent";
    if (s.marked && !s.answered) cls = "text-violet-700 border-violet-400";
    if (cur) cls += " ring-2 ring-violet-500";
    const bg = s.correct
      ? { background: "linear-gradient(180deg,#34d399,#059669)", boxShadow: "0 6px 14px rgba(16,185,129,.4)" }
      : s.wrong
        ? { background: "linear-gradient(180deg,#f87171,#dc2626)", boxShadow: "0 6px 14px rgba(220,38,38,.4)" }
        : cur
          ? { background: "linear-gradient(180deg,#a78bfa,#6d28d9)", boxShadow: "0 6px 14px rgba(124,58,237,.45)" }
          : { background: "#fff", boxShadow: "0 4px 10px rgba(35,45,80,.1)" };
    return (
      <button key={qq.id} onClick={() => { ex.gotoIndex(qi); setPaletteOpen(false); }}
        title={`Question ${qq.global_no}`}
        className={`neon h-10 rounded-xl text-sm font-bold border flex items-center justify-center gap-1 ${cls}`}
        style={{ ...bg, "--neon": "#8b5cf6" }}>
        {qq.global_no}
        {s.marked && <span className="text-[9px]">⚑</span>}
      </button>
    );
  };

  const palette = (
    <div>
      <div className="flex items-center gap-2">
        <h3 className="text-[17px] font-extrabold">Question Palette</h3>
        <span className="ml-auto text-[13px] font-bold text-[var(--v-muted)]">Total: <b className="text-[var(--v-ink)]">{total}</b></span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2.5 text-[12.5px] font-medium">
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full bg-slate-200 border border-black/10 inline-block" /> Not Answered ({counts.un})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold inline-flex items-center justify-center">✓</i> Correct ({counts.co})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-full inline-block" style={{ background: "linear-gradient(180deg,#f87171,#dc2626)" }} /> Wrong ({counts.wr})</span>
        <span className="flex items-center gap-2"><i className="w-4 h-4 rounded-md bg-violet-600 text-white text-[10px] font-bold inline-flex items-center justify-center">✓</i> Marked ({counts.mk})</span>
      </div>
      <div className="mt-4 space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
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
            const done = list.reduce((a, t) => a + t.indices.filter((i) => attempt.answers[attempt.questions[i].id]).length, 0);
            const n = list.reduce((a, t) => a + t.indices.length, 0);
            return (
              <div key={sec} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] overflow-hidden">
                <button onClick={() => setCollapsed((c) => ({ ...c, [sec]: open ? true : false }))}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[13.5px] font-bold">
                  <span className="w-5 h-5 rounded-md bg-violet-600 text-white text-[11px] inline-flex items-center justify-center">▣</span>
                  <span className="truncate">{sec}</span>
                  <span className={`ml-auto text-[var(--v-muted)] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                </button>
                {open && list.map((t) => (
                  <div key={t.section + t.topic} className="px-3 pb-3">
                    <div className="flex items-center text-[12.5px] font-semibold text-[var(--v-muted)] py-1.5">
                      <span className="truncate">{t.topic}</span>
                      <span className="ml-auto">{t.indices.filter((i) => attempt.answers[attempt.questions[i].id]).length}/{t.indices.length}</span>
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
    <div className="min-h-screen page-in">
      <BgBlobs />
      <div className="max-w-[1400px] mx-auto px-4 py-4 pb-10">
        {/* HEADER */}
        <Card float className="px-5 py-3.5 flex items-center gap-4 flex-wrap">
          <button onClick={() => go("library")} title="Back to Library"
            className="neon w-10 h-10 rounded-xl f3d-pill font-extrabold" style={{ "--neon": "#8b5cf6" }}>←</button>
          <span className="f3d-orb rounded-[14px]" style={{ width: 46, height: 46, background: "linear-gradient(180deg,#8b9ff0,#5b63e8)" }}>
            <span className="font-brand font-extrabold text-white text-[24px]">V</span>
          </span>
          <span>
            <b className="font-brand text-[22px] tracking-tight block leading-none">vertex</b>
            <small className="text-[9px] tracking-[0.3em] text-[var(--v-muted)] font-semibold">EXAM SIMULATOR</small>
          </span>
          <div className="mx-2">
            <b className="text-[16px] block leading-tight">{attempt.title}</b>
            <span className="text-xs text-[var(--v-muted)]">{attempt.subtitle || "Practice attempt"}</span>
          </div>
          <div className="f3d-pill px-5 py-2 text-sm">Answered <b className="text-blue-600 text-[17px]"> {ex.answeredCount} / {total}</b></div>
          <div className="f3d-pill px-5 py-2 text-sm">Score <b className="text-emerald-500 text-[17px]"> {attempt.score}</b></div>
          <div className="f3d-pill px-5 py-2 text-sm">Time Left <b className="text-violet-600 text-[17px] font-mono"> {formatClock(attempt.timeSpentSec)}</b></div>
          <div className="ml-auto flex items-center gap-2.5">
            <button onClick={() => showToast("Question reported — thanks for flagging it.")} style={{ "--neon": "#8b5cf6" }}
              className="neon h-[46px] px-5 rounded-full f3d-pill text-[13.5px] font-bold">⚑ Report</button>
            <button onClick={toggleTheme} style={{ "--neon": "#8b5cf6" }}
              className="neon h-[46px] px-5 rounded-full f3d-pill text-[13.5px] font-bold">{theme === "dark" ? "☀️" : "🌙"} Dark</button>
            <button onClick={() => setConfirmReset(true)} style={{ "--neon": "#f43f5e" }}
              className="neon h-[46px] px-5 rounded-full text-[13.5px] font-bold text-red-500 border border-red-200 bg-red-50">⟳ Reset</button>
          </div>
        </Card>

        {/* REVIEW BANNER */}
        {ex.review && (
          <div className="f3d mt-3 px-5 py-3 flex items-center gap-3 text-sm font-bold text-violet-700"
            style={{ background: "linear-gradient(90deg,#ede9fe,#f5f1fe)" }}>
            <span>◉ Review Mode: viewing {ex.indices.length} {ex.review.toLowerCase()} question(s)</span>
            <button onClick={ex.exitReview} className="ml-auto f3d-btn f3d-btn-violet rounded-full px-4 py-1.5 text-xs font-bold">Exit review ✕</button>
          </div>
        )}

        {/* SECTION TABS */}
        <Card className="mt-3 px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
          {["ALL", ...ex.sections.map((s) => s.title)].map((t) => {
            const count = t === "ALL" ? total : ex.sections.find((s) => s.title === t).indices.length;
            const active = ex.section === t;
            return (
              <button key={t} onClick={() => ex.pickSection(t)} style={{ "--neon": "#8b5cf6" }}
                className={`${active ? "f3d-btn f3d-btn-violet" : "neon border border-[var(--v-line)]"} rounded-full px-5 py-2.5 text-[13.5px] font-bold flex items-center gap-2 whitespace-nowrap`}>
                {t === "ALL" ? "All" : t}
                <span className={`text-xs rounded-full px-2 py-0.5 ${active ? "bg-white/25" : "bg-[var(--v-bg)] text-[var(--v-muted)]"}`}>{count}</span>
              </button>
            );
          })}
        </Card>

        {/* WORKSPACE */}
        <div className="mt-3 grid gap-3.5 lg:grid-cols-[330px_1fr] grid-cols-1 items-start">
          <Card float className="p-5 max-lg:hidden">{palette}</Card>
          <div className="lg:hidden">
            <button onClick={() => setPaletteOpen((o) => !o)} style={{ "--neon": "#8b5cf6" }}
              className="neon w-full f3d-pill px-5 py-3 text-sm font-bold">▦ Question Palette {paletteOpen ? "▾" : "▸"}</button>
            {paletteOpen && <Card className="mt-2.5 p-5">{palette}</Card>}
          </div>

          <div>
            <Card float delay={0.3} className="p-6">
              {q ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11.5px] font-extrabold tracking-wide px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      {(q.section_title || "General").toUpperCase()}
                    </span>
                    <span className="text-[11.5px] font-extrabold tracking-wide px-3.5 py-1.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                      {(q.topic_title || "General").toUpperCase()}
                    </span>
                    <b className="ml-auto text-[14px]">Question {pos >= 0 ? pos + 1 : "–"} of {ex.indices.length}</b>
                    <span className="flex gap-2">
                      <button onClick={() => ex.step(-1)} style={{ "--neon": "#8b5cf6" }} className="neon w-10 h-10 rounded-xl f3d-pill font-extrabold">‹</button>
                      <button onClick={() => ex.step(1)} style={{ "--neon": "#8b5cf6" }} className="neon w-10 h-10 rounded-xl f3d-pill font-extrabold">›</button>
                    </span>
                  </div>
                  <p className="mt-4 text-[16.5px] leading-relaxed font-medium">Q{q.global_no}. {q.question}</p>

                  {/* instant feedback banner (D:\WEB bannerStatus) */}
                  {st.answered && (
                    <div className={`mt-3 rounded-2xl px-4 py-2.5 text-sm font-bold flex items-center gap-2 page-in ${st.correct ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                      {st.correct ? "✓ Correct" : `✗ Wrong — correct answer: ${q.correct_answer}`}
                    </div>
                  )}

                  <div className="mt-4 space-y-3">
                    {OPT_KEYS.map((k) => {
                      const picked = attempt.answers[q.id] === k;
                      const isRight = q.correct_answer === k;
                      const locked = st.answered;
                      let cls = "border-[var(--v-line)] bg-[var(--v-card-hi)] hover:-translate-y-[2px]";
                      if (locked && picked && st.correct) cls = "border-emerald-400 bg-emerald-50";
                      else if (locked && picked) cls = "border-red-400 bg-red-50";
                      else if (locked && isRight) cls = "border-emerald-400 bg-emerald-50/60";
                      return (
                        <button key={k} disabled={locked} onClick={() => ex.select(k)} style={{ "--neon": "#8b5cf6" }}
                          className={`${locked ? "" : "neon"} w-full rounded-2xl border-2 px-4 py-3.5 flex items-center gap-4 text-left transition-all ${cls}`}>
                          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${picked ? (st.correct || !locked ? "border-violet-600" : "border-red-500") : "border-slate-300"}`}>
                            {picked && <span className={`w-3.5 h-3.5 rounded-full ${st.correct || !locked ? "bg-violet-600" : "bg-red-500"}`} />}
                          </span>
                          <span className="w-9 h-9 rounded-lg bg-[var(--v-bg)] border border-[var(--v-line)] font-extrabold flex items-center justify-center shrink-0">{k}</span>
                          <span className="text-[15px] font-medium">{q.options[k]}</span>
                          {locked && isRight && <span className="ml-auto text-emerald-500 font-extrabold">✓</span>}
                          {locked && picked && !isRight && <span className="ml-auto text-red-500 font-extrabold">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={() => setExplainOpen((o) => !o)} style={{ "--neon": "#f59e0b" }}
                    className="neon mt-4 rounded-xl px-4 py-2.5 text-sm font-bold f3d-pill flex items-center gap-2">
                    💡 Explanation <span className={`transition-transform ${explainOpen ? "rotate-180" : ""}`}>▾</span>
                  </button>
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

            {/* FOOTER ACTIONS */}
            <div className="mt-3.5 flex items-center justify-center gap-3 flex-wrap">
              <button onClick={ex.clear} style={{ "--neon": "#64748b" }}
                className="neon rounded-xl px-5 py-3.5 text-[13.5px] font-bold f3d-pill flex gap-2 items-center">🧹 Clear Response</button>
              <button onClick={ex.toggleMark} style={{ "--neon": "#8b5cf6" }}
                className={`neon rounded-xl px-5 py-3.5 text-[13.5px] font-bold f3d-pill flex gap-2 items-center ${st?.marked ? "!bg-violet-600 !text-white !border-transparent" : ""}`}>
                <span className={st?.marked ? "" : "text-violet-600"}>★</span> {st?.marked ? "Marked ✓" : "Mark for Review"}</button>
              <button onClick={() => ex.step(1)} className="f3d-btn f3d-btn-violet rounded-xl px-6 py-3.5 text-[13.5px] font-bold flex gap-2 items-center">
                Save &amp; Next →</button>
              <button onClick={() => go("result", { attemptId })} className="f3d-btn f3d-btn-green rounded-xl px-6 py-3.5 text-[13.5px] font-bold flex gap-2 items-center">
                ➤ Submit Test</button>
            </div>
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
