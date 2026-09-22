import { useMemo, useState } from "react";
import { useVertex } from "../store.jsx";
import {
  listAttempts, toRecord, getAttemptStats, accuracyBreakdown,
  scoreSeries, topicAccuracy, timeStats,
} from "../engine/attempts.js";
import { Card, Orb, Stat, Donut, ScoreLine, SegTabs } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

const TABS = [
  { k: "trends", label: "Trends", icon: "chart" },
  { k: "subjects", label: "Subjects", icon: "doc" },
  { k: "weak", label: "Weak topics", icon: "target" },
  { k: "time", label: "Time", icon: "clock" },
];

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 0, label: "All time" },
];

export default function Analytics({ go }) {
  const { showToast, library, startAttempt: launch } = useVertex();
  const [tab, setTab] = useState("trends");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(RANGES[0]);
  const [showReco, setShowReco] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);

  const stats = useMemo(() => getAttemptStats(), []);
  const acc = useMemo(() => accuracyBreakdown(), []);
  const topics = useMemo(() => topicAccuracy(), []);
  const pace = useMemo(() => timeStats(), []);
  const series = useMemo(() => {
    const all = scoreSeries(40);
    if (!range.days) return all.slice(-8);
    const cutoff = Date.now() - range.days * 864e5;
    return all.filter((p) => p.ts >= cutoff).slice(-8);
  }, [range]);

  // honest recent-trend: last completed vs the one before
  const trend = useMemo(() => {
    const done = listAttempts().filter((a) => a.status === "completed");
    if (done.length < 2) return { t: "— N/A", na: true };
    const [last, prev] = [toRecord(done[0]).percentageNum, toRecord(done[1]).percentageNum];
    const d = Number((last - prev).toFixed(1));
    return { t: `${d >= 0 ? "↑ +" : "↓ "}${d}%` };
  }, []);

  const bestIdx = useMemo(() => {
    if (!series.length) return -1;
    return series.reduce((bi, p, i) => (p.v > series[bi].v ? i : bi), 0);
  }, [series]);

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const practiceTopic = (topic) => {
    // find the newest attempt carrying this topic, relaunch its chapter
    const att = listAttempts().find((a) => (a.questions || []).some((q) => (q.topic_title || "General") === topic));
    const chId = att?.chapterId;
    const sub = chId ? library.subjects.find((s) => s.chapters.some((c) => c.id === chId)) : null;
    const ch = sub?.chapters.find((c) => c.id === chId);
    if (ch?.dataset) {
      const r = launch(sub.id, ch.id, ch.dataset);
      if (r.attemptId) { go("player", { attemptId: r.attemptId }); return; }
    }
    showToast("Open that chapter in the Library to practice it.");
    go("library");
  };

  const subjectRows = useMemo(() => library.subjects.map((s) => {
    const chs = s.chapters.map((c) => {
      const atts = listAttempts().filter((a) => a.chapterId === c.id);
      const best = atts.length ? Math.max(...atts.map((a) => toRecord(a).percentageNum)) : null;
      const latest = atts[0] ? toRecord(atts[0]) : null;
      return { id: c.id, title: c.title, tint: c.tint, hasDs: !!c.dataset, best, latest };
    });
    const scored = chs.filter((c) => c.best !== null);
    return { ...s, chapters: chs, avg: scored.length ? scored.reduce((a, c) => a + c.best, 0) / scored.length : null };
  }), [library]);

  return (
    <div className="flex min-h-screen">
      <BgBlobs />
      <Sidebar tab="analytics" go={go} />
      <main className="flex-1 min-w-0 p-4 px-[22px] pb-10 page-in">
        <Topbar searchPh="Search for subjects, tests, or commands..." search={search} setSearch={setSearch} onLibrary={() => go("library")} />

        {/* HERO */}
        <div className="mt-3.5 relative">
          <Card float className="px-[30px] py-7 min-h-[150px] overflow-hidden">
            <div className="absolute right-[6%] top-0 bottom-0 w-[380px] pointer-events-none max-lg:hidden" aria-hidden>
              <div className="f3d-sphere w-[110px] h-[110px] left-[10px] top-[6px]" />
              <div className="f3d-sphere w-[72px] h-[72px] right-[30px] top-[30px]" style={{ animationDelay: "1.4s", background: "radial-gradient(circle at 32% 28%,#fff 0%,#eef1f7 30%,#c3cede 65%,#e8eef7 90%)" }} />
              <div className="absolute right-[86px] top-[14px] w-[190px] h-[120px] rounded-2xl border border-white/70 rotate-[-4deg] p-3 flex items-end gap-2.5"
                style={{ background: "linear-gradient(160deg,rgba(255,255,255,.65),rgba(200,190,255,.25))", boxShadow: "0 22px 44px rgba(90,100,200,.35), inset 2px 2px 8px rgba(255,255,255,.8)", backdropFilter: "blur(6px)" }}>
                {[46, 66, 56, 84].map((h, i) => (
                  <div key={i} className="flex-1 rounded-md"
                    style={{ height: h, background: "linear-gradient(180deg,#c4b5fd,#7c3aed)", boxShadow: "0 8px 16px rgba(124,58,237,.4), inset 0 2px 2px rgba(255,255,255,.6)" }} />
                ))}
                <svg viewBox="0 0 120 50" className="absolute left-2 right-2 top-1 w-[calc(100%-16px)]">
                  <path d="M4,40 L36,28 L64,30 L94,8" fill="none" stroke="#6d28d9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M94,8 l-12,2 M94,8 l-2,12" stroke="#6d28d9" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute right-[60px] bottom-[8px] w-[240px] h-[26px] rounded-xl bg-white/80 rotate-[-4deg]"
                style={{ boxShadow: "0 16px 30px rgba(90,100,200,.3)" }} />
            </div>
            <h1 className="text-[34px] font-extrabold tracking-tight relative z-[2]">Performance Analytics</h1>
            <p className="mt-2 text-[15px] text-[var(--v-muted)] relative z-[2]">Where your marks come from, and where they leak.</p>
            <div className="mt-5 flex items-center gap-2.5 flex-wrap relative z-[2]">
              <SegTabs tabs={TABS} active={tab} onChange={setTab} />
              <div className="ml-auto relative">
                <button onClick={() => setRangeOpen((o) => !o)} style={{ "--neon": "#8b5cf6" }}
                  className="neon rounded-full px-5 py-3 text-[13.5px] font-bold f3d-pill flex gap-2 items-center">
                  <Ico n="cal" s={16} /> {range.label} <Ico n="chevD" s={13} />
                </button>
                {rangeOpen && (
                  <div className="f3d absolute right-0 top-[54px] z-30 min-w-[170px] p-1.5 !rounded-[14px]">
                    {RANGES.map((r) => (
                      <button key={r.label} onClick={() => { setRange(r); setRangeOpen(false); }}
                        className={`block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5 ${r.label === range.label ? "text-violet-600" : ""}`}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {tab === "trends" && (
          <>
            <section className="mt-3.5 grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3.5">
              <Stat icon="target" grad="linear-gradient(180deg,#a855f7,#7c3aed)" label="AVG. SCORE" value={`${stats.avgScore}%`}
                sub={`Across ${stats.total} attempt${stats.total === 1 ? "" : "s"}`}
                spark="M4,32 C20,30 30,22 45,24 C60,26 70,14 90,10 L106,6" sparkColor="#a855f7" float delay={0} />
              <Stat icon="trophy" grad="linear-gradient(180deg,#38bdf8,#0284c7)" label="BEST SCORE" value={`${stats.bestScore}%`}
                sub={stats.total ? "Top attempt" : "No attempts yet"}
                bars={[10, 18, 24, 34]} barColor={["#bae6fd", "#7dd3fc"]} float delay={0.6} />
              <Stat icon="check" grad="linear-gradient(180deg,#34d399,#10b981)" label="QUESTIONS ANSWERED" value={stats.totalAnswered}
                sub="Across all attempts"
                bars={[12, 20, 26, 38]} barColor={["#bbf7d0", "#6ee7b7"]} float delay={1.2} />
              <Stat icon="chart" grad="linear-gradient(180deg,#fbbf24,#f97316)" label="RECENT TREND" value={trend.na ? "–" : trend.t.replace("↑ +", "+").replace("↓ ", "-")}
                sub={trend.na ? "Finish two tests to compare" : "Last vs previous completed"}
                spark="M4,20 C30,18 60,22 106,20" sparkColor="#f97316" delta={trend.na ? { t: "— N/A", na: true } : { t: trend.t }} float delay={1.8} />
            </section>

            <section className="mt-3.5 grid grid-cols-2 max-lg:grid-cols-1 gap-3.5">
              <Card float delay={0.3} className="p-[22px]">
                <div className="flex items-start gap-3">
                  <div><h3 className="text-[19px] font-extrabold">Overall accuracy</h3>
                    <div className="text-[13px] text-[var(--v-muted)] mt-1">
                      {acc.total === 0 ? "Answer questions to fill this ring" : `${acc.correct} correct of ${acc.total} graded responses`}</div></div>
                </div>
                <div className="mt-4 flex items-center gap-6 max-md:flex-col">
                  <Donut pct={acc.pctCorrect} />
                  <div className="text-sm space-y-3 min-w-[170px]">
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Correct
                      <b className="ml-auto">{acc.correct} ({acc.shares.correct}%)</b></div>
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Incorrect
                      <b className="ml-auto">{acc.incorrect} ({acc.shares.incorrect}%)</b></div>
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Skipped
                      <b className="ml-auto">{acc.skipped} ({acc.shares.skipped}%)</b></div>
                  </div>
                </div>
                <div className="mt-5 flex gap-2.5 flex-wrap">
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-violet-100 text-violet-700 border border-violet-200 flex items-center gap-1.5"><Ico n="doc" s={13} /> {stats.total} attempts</span>
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5"><Ico n="check" s={13} /> {stats.completed} completed</span>
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1.5"><Ico n="play" s={11} /> {stats.inProgress} in progress</span>
                </div>
              </Card>

              <Card float delay={0.9} className="p-[22px]">
                <div className="flex items-start gap-3">
                  <div><h3 className="text-[19px] font-extrabold">Score over time</h3>
                    <div className="text-[13px] text-[var(--v-muted)] mt-1">Completed tests, oldest to newest — {range.label.toLowerCase()}</div></div>
                </div>
                <div className="mt-3">
                  {series.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-[var(--v-muted)]">No completed tests in this range yet.</p>
                      <button onClick={() => go("library")}
                        className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Practice <Ico n="arrowR" s={13} /></button>
                    </div>
                  ) : (
                    <ScoreLine data={series.map((p) => ({ d: p.d, v: p.v }))} max={100} height={210} tip={bestIdx} tipLabel={series[bestIdx]?.title || "Best"} />
                  )}
                </div>
              </Card>
            </section>

            <Card float delay={1.4} className="mt-3.5 p-5 flex items-center gap-4 flex-wrap">
              <Orb tint="orange" icon="flask" size={48} radius={14} />
              <div className="min-w-[220px] flex-1">
                <b className="text-[15px]">Insight</b>
                <p className="text-[13.5px] text-[var(--v-muted)] mt-0.5">
                  {stats.total === 0
                    ? "Nothing to analyze yet — link a dataset in the Library and take your first test."
                    : `You've completed ${completionRate}% of your attempts${topics[0] ? `, and “${topics[0].topic}” is your leakiest topic at ${topics[0].pct}%.` : "."}`}
                </p>
              </div>
                <button onClick={() => setShowReco((s) => !s)}
                className="f3d-btn f3d-btn-violet rounded-xl px-6 py-3.5 text-sm font-bold flex gap-2 items-center">
                {showReco ? "Hide recommendations" : "View recommendations"} <Ico n="arrowR" s={14} />
              </button>
              {showReco && (
                <div className="basis-full grid md:grid-cols-3 gap-2.5 page-in">
                  {(stats.total === 0
                    ? [["Link a dataset", "Library, then any chapter, then Upload JSON or the sample set."],
                       ["Take the sample test", "12 real Profit & Loss questions, ~10 minutes."],
                       ["Come back here", "Trends, weak topics and pace fill in automatically."]]
                    : [
                        topics[0]
                          ? [`Drill “${topics[0].topic}”`, `${topics[0].pct}% accuracy across ${topics[0].answered} answered — your biggest leak.`]
                          : ["Keep answering", "Topic accuracy appears after your first answers."],
                        (() => {
                          const ip = listAttempts().find((a) => a.status === "in_progress");
                          return ip ? [`Resume “${ip.title}”`, `${Object.keys(ip.answers).length}/${ip.questions.length} answered — finish it to unlock trends.`]
                            : ["Start a new attempt", "Fresh attempts keep your streak alive."];
                        })(),
                        [`Protect your streak`, pace ? `Averaging ${pace.avgPerQ} per question across ${pace.tests} test${pace.tests === 1 ? "" : "s"}.` : "Timed practice builds exam-day pace."],
                      ]
                  ).map(([t, s]) => (
                    <div key={t} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] p-4 text-sm">
                      <b>{t}</b><p className="text-[var(--v-muted)] mt-1 text-[13px]">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {tab === "subjects" && (
          <Card float className="mt-3.5 p-[22px] page-in">
            <h3 className="text-[19px] font-extrabold">Mastery by subject</h3>
            <p className="text-[13px] text-[var(--v-muted)] mt-1">Best score per chapter, from your real attempts.</p>
            {subjectRows.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-[var(--v-muted)]">No subjects yet.</p>
                <button onClick={() => go("library")}
                  className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Open Library <Ico n="arrowR" s={13} /></button>
              </div>
            )}
            <div className="mt-4 space-y-5">
              {subjectRows.map((s) => (
                <div key={s.id}>
                  <div className="flex items-center gap-2.5">
                    <Orb tint={s.tint} icon={s.icon} size={38} radius={11} />
                    <b>{s.title}</b>
                    <span className="ml-auto text-[13px] text-[var(--v-muted)]">
                      {s.avg === null ? "No attempts yet" : `Avg best ${s.avg.toFixed(1)}%`}</span>
                  </div>
                  <div className="mt-2.5 space-y-2.5 pl-[48px]">
                    {s.chapters.map((c) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex text-sm"><span className="truncate">{c.title}</span>
                            <span className="ml-auto text-[var(--v-muted)] text-[13px] pl-3 whitespace-nowrap">
                              {!c.hasDs ? "No dataset" : c.best === null ? "Unattempted" : `${c.latest.answeredCount}/${c.latest.totalQuestions} · best ${c.best}%`}</span></div>
                          <div className="mt-1.5 h-2.5 rounded-full bg-[var(--v-bg)] border border-[var(--v-line)] overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${Math.max(c.best ?? 0, 2)}%`, background: "linear-gradient(90deg,#c4b5fd,#6d28d9)", boxShadow: "0 2px 8px rgba(124,58,237,.5)" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "weak" && (
          <Card float className="mt-3.5 p-[22px] page-in">
            <h3 className="text-[19px] font-extrabold">Weak topics</h3>
            <p className="text-[13px] text-[var(--v-muted)] mt-1">Lowest accuracy first — tap Practice to queue a drill.</p>
            {topics.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-[var(--v-muted)]">Answer questions to reveal your weak topics.</p>
                <button onClick={() => go("library")}
                  className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Practice <Ico n="arrowR" s={13} /></button>
              </div>
            ) : (
              <div className="mt-4 grid gap-2.5 md:grid-cols-2">
                {topics.slice(0, 6).map((t) => (
                  <div key={t.topic} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] p-4 flex items-center gap-3">
                    <span className="font-brand font-extrabold text-[22px] w-14 shrink-0"
                      style={{ color: t.pct < 40 ? "#dc2626" : t.pct < 70 ? "#d97706" : "#059669" }}>{t.pct}%</span>
                    <div className="min-w-0"><b className="text-sm">{t.topic}</b>
                      <div className="text-xs text-[var(--v-muted)]">{t.correct}/{t.answered} correct</div></div>
                    <button onClick={() => practiceTopic(t.topic)}
                      className="f3d-btn f3d-btn-violet ml-auto rounded-full px-4 py-2 text-xs font-bold">Practice</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "time" && (
          pace ? (
            <>
              <div className="mt-3.5 grid md:grid-cols-3 gap-3.5 page-in">
                {[
                  ["Avg / question", pace.avgPerQ, `Across ${pace.tests} completed test${pace.tests === 1 ? "" : "s"}`],
                  ["Longest sitting", pace.longest, "Single-test focus time"],
                  ["Tests timed", pace.tests, "Completed with the clock running"],
                ].map(([t, v, s], i) => (
                  <Card key={t} float delay={i * 0.5} className="p-[22px] text-center">
                    <div className="text-[11px] tracking-[0.14em] font-bold text-[var(--v-muted)]">{t.toUpperCase()}</div>
                    <div className="font-brand text-[34px] font-extrabold mt-1">{v}</div>
                    <div className="text-xs text-[var(--v-muted)] mt-1">{s}</div>
                  </Card>
                ))}
              </div>
              <Card float className="mt-3.5 p-[22px] page-in">
                <h3 className="text-[19px] font-extrabold">Pace per test</h3>
                <p className="text-[13px] text-[var(--v-muted)] mt-1">Time per answered question, newest first.</p>
                <div className="mt-3 space-y-2">
                  {listAttempts().filter((a) => a.status === "completed").slice(0, 6).map((a) => {
                    const n = Object.keys(a.answers || {}).length;
                    const per = n ? (a.timeSpentSec || 0) / n : 0;
                    const m = Math.floor(per / 60), s = Math.round(per % 60);
                    return (
                      <div key={a.id} className="flex items-center gap-3 text-sm rounded-xl border border-[var(--v-line)] bg-[var(--v-bg)] px-4 py-2.5">
                        <b className="truncate">{a.title}</b>
                        <span className="ml-auto text-[var(--v-muted)]">{n} answered · {m > 0 ? `${m}m ` : ""}{s}s / question</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </>
          ) : (
            <Card float className="mt-3.5 p-10 text-center page-in">
              <p className="text-sm text-[var(--v-muted)]">No timed tests yet — finish a test to see your pace.</p>
              <button onClick={() => go("library")}
                className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Practice <Ico n="arrowR" s={13} /></button>
            </Card>
          )
        )}
      </main>
    </div>
  );
}
