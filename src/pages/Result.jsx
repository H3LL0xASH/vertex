import { useEffect, useMemo } from "react";
import { useVertex } from "../store.jsx";
import { computeSummary, formatClock, reviewIndices } from "../engine/examFormat.js";
import { getAttempt, saveAttempt } from "../engine/attempts.js";
import { Card, Ico } from "../components/ui.jsx";
import { BgBlobs } from "../components/Shell.jsx";

/* VERTEX Test Result Summary — mirrors D:\WEB showSummaryModal numbers,
   dressed in our floating-3D UI. Review modes jump back into the
   player filtered to wrong / unattempted / marked. */

export default function Result({ attemptId, go }) {
  const { showToast } = useVertex();
  const attempt = getAttempt(attemptId);

  // opening the summary finalizes the attempt (D:\WEB syncs 'completed')
  useEffect(() => {
    if (attempt && attempt.status !== "completed") {
      saveAttempt({ ...attempt, status: "completed" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const summary = useMemo(() => {
    if (!attempt) return null;
    const exam = { questions: attempt.questions, markPerCorrect: attempt.markPerCorrect, negativeMarking: attempt.negativeMarking };
    return computeSummary(exam, attempt.answers, attempt.marked);
  }, [attempt]);

  if (!attempt || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-10 text-center max-w-md">
          <h2 className="text-xl font-extrabold">No result to show</h2>
          <button onClick={() => go("library")} className="f3d-btn f3d-btn-violet mt-5 rounded-xl px-6 py-3 text-sm font-bold flex items-center gap-2">Back to Library <Ico n="arrowR" s={14} /></button>
        </Card>
      </div>
    );
  }

  const reviewCount = (mode) => reviewIndices(
    { questions: attempt.questions }, attempt.answers, attempt.marked, mode).length;

  const startReview = (mode) => {
    if (!reviewCount(mode)) { showToast(`No ${mode.toLowerCase()} questions to review.`); return; }
    go("player", { attemptId, review: mode });
  };

  const restart = () => {
    saveAttempt({ ...getAttempt(attemptId), answers: {}, marked: {}, visited: {}, currentIndex: 0, score: 0, status: "in_progress" });
    go("player", { attemptId });
    showToast("Test restarted — fresh attempt.");
  };

  const tiles = [
    { label: "TOTAL QUESTIONS", value: summary.total, icon: "doc", bg: "linear-gradient(180deg,#8db4f0,#2f6fd0)" },
    { label: "ANSWERED", value: summary.answered, icon: "check", bg: "linear-gradient(180deg,#34d399,#059669)" },
    { label: "UNATTEMPTED", value: summary.unattempted, icon: "clock", bg: "linear-gradient(180deg,#8db4f0,#2f6fd0)" },
    { label: "CORRECT", value: summary.correct, icon: "star", bg: "linear-gradient(180deg,#b39df7,#7c4de8)" },
    { label: "WRONG", value: summary.wrong, icon: "x", bg: "linear-gradient(180deg,#f87171,#dc2626)" },
    { label: "MARKED FOR REVIEW", value: summary.marked, icon: "flag", bg: "linear-gradient(180deg,#b39df7,#7c4de8)" },
    { label: "TOTAL SCORE", value: `${summary.score} / ${summary.max}`, icon: "trophy", bg: "linear-gradient(180deg,#b39df7,#7c4de8)", accent: true },
    { label: "PERCENTAGE", value: `${summary.percentage}%`, icon: "pie", bg: "linear-gradient(180deg,#38bdf8,#0284c7)" },
  ];

  const modes = [
    { mode: "WRONG", label: "Review Wrong Questions", icon: "x", neon: "#f43f5e", orb: "linear-gradient(180deg,#f87171,#dc2626)" },
    { mode: "UNATTEMPTED", label: "Review Unattempted", icon: "clock", neon: "#3b82f6", orb: "linear-gradient(180deg,#8db4f0,#2f6fd0)" },
    { mode: "MARKED", label: "Review Marked", icon: "flag", neon: "#8b5cf6", orb: "linear-gradient(180deg,#b39df7,#7c4de8)" },
  ];

  return (
    <div className="min-h-screen page-in">
      <BgBlobs />
      <div className="max-w-[1060px] mx-auto px-4 py-8">
        <Card float className="overflow-hidden">
          {/* header with trophy art */}
          <div className="relative px-7 pt-6 pb-5 overflow-hidden"
            style={{ background: "linear-gradient(120deg,#4c1d95,#6d28d9 55%,#8b5cf6)" }}>
            <div className="absolute right-[8%] top-0 bottom-0 w-[380px] pointer-events-none max-md:hidden" aria-hidden>
              <div className="f3d-sphere w-[64px] h-[64px] left-[10px] top-[14px]" />
              <div className="f3d-sphere w-[44px] h-[44px] right-[40px] top-[44px]" style={{ animationDelay: "1.2s" }} />
              <div className="absolute right-[120px] top-[6px] w-[120px] h-[120px] rounded-full flex items-center justify-center text-violet-200"
                style={{ background: "radial-gradient(circle at 35% 30%,#c4b5fd,#7c3aed 70%)", boxShadow: "0 20px 40px rgba(0,0,0,.35), inset 4px 6px 12px rgba(255,255,255,.5)" }}>
                <Ico n="trophy" s={64} />
              </div>
              <div className="absolute right-[30px] top-[20px] w-[86px] h-[100px] rounded-xl bg-white/85 rotate-[8deg] p-2.5 space-y-1.5"
                style={{ boxShadow: "0 16px 30px rgba(0,0,0,.3)" }}>
                {[70, 55, 62].map((w, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="text-violet-600 text-xs font-extrabold">✓</span>
                    <span className="h-1.5 rounded-full bg-violet-300" style={{ width: w }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-[2]">
              <span className="f3d-orb rounded-2xl" style={{ width: 56, height: 56, background: "linear-gradient(180deg,#a78bfa,#4f46e5)" }}>
                <span className="font-brand font-extrabold text-white text-[30px]">V</span>
              </span>
              <div>
                <h1 className="font-brand font-extrabold text-white text-[28px] leading-tight">Test Result Summary</h1>
                <p className="text-violet-200 text-sm">Here's how you performed in this test.</p>
              </div>
              <button onClick={() => go("player", { attemptId })} title="Back to test"
                className="ml-auto w-10 h-10 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center"><Ico n="x" s={15} /></button>
            </div>
          </div>

          <div className="p-6">
            {/* stat tiles */}
            <div className="grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3.5">
              {tiles.map((t, i) => (
                <div key={t.label} className="f3d f3d-lift f3d-float rounded-2xl p-4 flex items-center gap-3" style={{ animationDelay: `${i * 0.4}s` }}>
                  <span className="f3d-orb rounded-2xl" style={{ width: 48, height: 48, background: t.bg, color: "#fff" }}>
                    <Ico n={t.icon} s={24} />
                  </span>
                  <span>
                    <span className="block text-[10px] tracking-[0.12em] font-bold text-[var(--v-muted)]">{t.label}</span>
                    <b className={`text-[26px] leading-tight ${t.accent ? "text-violet-600" : ""}`}>{t.value}</b>
                  </span>
                </div>
              ))}
            </div>

            {/* time bar */}
            <div className="f3d mt-3.5 rounded-2xl px-5 py-3.5 flex items-center justify-center gap-3 text-sm font-bold text-[var(--v-muted)]">
              <span className="text-violet-600 flex"><Ico n="clock" s={20} /></span> TOTAL TIME TAKEN
              <b className="text-violet-600 text-[22px] font-mono">{formatClock(attempt.timeSpentSec)}</b>
            </div>

            {/* section breakdown */}
            <div className="mt-5 flex items-center gap-3">
              <b className="text-[12px] tracking-[0.22em] text-[var(--v-muted)]">SECTION BREAKDOWN</b>
              <span className="flex-1 h-px bg-[var(--v-line)]" />
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-2.5">
              {(() => {
                const bySec = new Map();
                attempt.questions.forEach((q) => {
                  const t = q.section_title || "General";
                  if (!bySec.has(t)) bySec.set(t, { correct: 0, answered: 0, total: 0 });
                  const r = bySec.get(t);
                  r.total++;
                  const a = attempt.answers[q.id];
                  if (a) { r.answered++; if (a === q.correct_answer) r.correct++; }
                });
                return [...bySec.entries()].map(([t, r]) => (
                  <div key={t} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm"><b className="truncate">{t}</b>
                      <span className="ml-auto text-[var(--v-muted)] text-[13px]">{r.correct}/{r.answered} correct · {r.total} Qs</span></div>
                    <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${r.answered ? Math.max(3, Math.round((r.correct / r.answered) * 100)) : 0}%`, background: "linear-gradient(90deg,#6ee7b7,#059669)" }} />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* review modes */}
            <div className="mt-5 flex items-center gap-3">
              <b className="text-[12px] tracking-[0.22em] text-[var(--v-muted)]">REVIEW MODES</b>
              <span className="flex-1 h-px bg-[var(--v-line)]" />
            </div>
            <div className="mt-3 grid md:grid-cols-3 gap-3">
              {modes.map((m) => (
                <button key={m.mode} onClick={() => startReview(m.mode)} style={{ "--neon": m.neon }}
                  className="neon f3d f3d-lift rounded-2xl p-4 flex items-center gap-3 text-left">
                  <span className="f3d-orb rounded-xl" style={{ width: 42, height: 42, background: m.orb, color: "#fff" }}>
                    <Ico n={m.icon} s={22} />
                  </span>
                  <b className="text-[14px]">{m.label}</b>
                  <span className="ml-auto text-[var(--v-muted)] flex"><Ico n="chevR" s={16} /></span>
                </button>
              ))}
            </div>

            {/* footer */}
            <div className="mt-5 pt-4 border-t border-[var(--v-line)] flex items-center gap-4 flex-wrap">
              <p className="text-[13px] text-[var(--v-muted)] italic max-w-[300px]">
                “Every attempt brings you closer to your goal. Keep going!”
              </p>
              <div className="ml-auto flex gap-3">
                <button onClick={() => go("overview")} style={{ "--neon": "#64748b" }}
                  className="neon rounded-xl px-6 py-3.5 text-sm font-bold f3d-pill flex gap-2 items-center"><Ico n="home" s={17} /> Go to Dashboard</button>
                <button onClick={restart} className="f3d-btn rounded-xl px-6 py-3.5 text-sm font-bold text-orange-600 border border-orange-200 bg-orange-50 flex gap-2 items-center"
                  style={{ "--neon": "#f97316" }}><Ico n="reset" s={15} /> Restart Test</button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
