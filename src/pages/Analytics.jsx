import { useState } from "react";
import { useVertex } from "../store.jsx";
import { scoreWeek } from "../data/seed.js";
import { Card, Ico, Orb, Stat, Donut, ScoreLine, SegTabs } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

const TABS = [
  { k: "trends", label: "Trends", icon: "chart" },
  { k: "subjects", label: "Subjects", icon: "doc" },
  { k: "weak", label: "Weak topics", icon: "target" },
  { k: "time", label: "Time", icon: "clock" },
];

export default function Analytics({ go }) {
  const { showToast, library } = useVertex();
  const [tab, setTab] = useState("trends");
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("Last 7 days");
  const [showReco, setShowReco] = useState(false);

  const totalAnswered = 8, completed = 0, inProgress = 5;

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
              {/* glass 3D bar chart */}
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
              <button onClick={() => showToast(`Range: ${range} — more ranges soon`)} style={{ "--neon": "#8b5cf6" }}
                className="neon ml-auto rounded-full px-5 py-3 text-[13.5px] font-bold f3d-pill flex gap-2 items-center">
                <Ico n="cal" s={17} /> {range} <span className="text-[var(--v-muted)]">▾</span>
              </button>
            </div>
          </Card>
        </div>

        {tab === "trends" && (
          <>
            {/* STAT ROW */}
            <section className="mt-3.5 grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3.5">
              <Stat icon="target" grad="linear-gradient(180deg,#a855f7,#7c3aed)" label="AVG. SCORE" value="0.6" sub="Across all completed tests"
                spark="M4,32 C20,30 30,22 45,24 C60,26 70,14 90,10 L106,6" sparkColor="#a855f7" delta={{ t: "↑ +12%" }} float delay={0} />
              <Stat icon="trophy" grad="linear-gradient(180deg,#38bdf8,#0284c7)" label="BEST SCORE" value="3" sub="Top attempt"
                bars={[10, 18, 24, 34]} barColor={["#bae6fd", "#7dd3fc"]} delta={{ t: "↑ +50%" }} float delay={0.6} />
              <Stat icon="check" grad="linear-gradient(180deg,#34d399,#10b981)" label="QUESTIONS ANSWERED" value="8" sub="Across all attempts"
                bars={[12, 20, 26, 38]} barColor={["#bbf7d0", "#6ee7b7"]} delta={{ t: "↑ +0%" }} float delay={1.2} />
              <Stat icon="chart" grad="linear-gradient(180deg,#fbbf24,#f97316)" label="RECENT TREND" value="0" sub="Finish two tests to compare"
                spark="M4,20 C30,18 60,22 106,20" sparkColor="#f97316" delta={{ t: "— N/A", na: true }} float delay={1.8} />
            </section>

            {/* CHARTS */}
            <section className="mt-3.5 grid grid-cols-2 max-lg:grid-cols-1 gap-3.5">
              <Card float delay={0.3} className="p-[22px]">
                <div className="flex items-start gap-3">
                  <div><h3 className="text-[19px] font-extrabold">Overall accuracy</h3>
                    <div className="text-[13px] text-[var(--v-muted)] mt-1">Average score across completed tests</div></div>
                  <button onClick={() => showToast("Filtered: all subjects")} style={{ "--neon": "#8b5cf6" }}
                    className="neon ml-auto border border-[var(--v-line)] rounded-full px-4 py-2 text-[13px] font-semibold f3d-pill whitespace-nowrap">All subjects ▾</button>
                </div>
                <div className="mt-4 flex items-center gap-6 max-md:flex-col">
                  <Donut pct={1} />
                  <div className="text-sm space-y-3 min-w-[170px]">
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Correct
                      <b className="ml-auto">0 (0%)</b></div>
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Incorrect
                      <b className="ml-auto">5 (100%)</b></div>
                    <div className="flex items-center gap-2"><i className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Skipped
                      <b className="ml-auto">0 (0%)</b></div>
                  </div>
                </div>
                <div className="mt-5 flex gap-2.5 flex-wrap">
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-violet-100 text-violet-700 border border-violet-200">🗎 {inProgress} attempts</span>
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">✓ {completed} completed</span>
                  <span className="text-[13px] font-bold px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-200">▷ {inProgress} in progress</span>
                </div>
              </Card>

              <Card float delay={0.9} className="p-[22px]">
                <div className="flex items-start gap-3">
                  <div><h3 className="text-[19px] font-extrabold">Score over time</h3>
                    <div className="text-[13px] text-[var(--v-muted)] mt-1">Completed tests, oldest → newest — hover for details</div></div>
                  <div className="ml-auto flex gap-2">
                    <button onClick={() => showToast(`Range: ${range}`)} style={{ "--neon": "#8b5cf6" }}
                      className="neon border border-[var(--v-line)] rounded-full px-4 py-2 text-[13px] font-semibold f3d-pill whitespace-nowrap">🗓 {range} ▾</button>
                    <button onClick={() => showToast("Chart options soon")} style={{ "--neon": "#8b5cf6" }}
                      className="neon w-9 h-9 rounded-full f3d-pill font-extrabold">⋮</button>
                  </div>
                </div>
                <div className="mt-3">
                  <ScoreLine data={scoreWeek.map((p) => ({ d: p.d.slice(0, 3), v: p.d === "Thu" ? 3 : p.v }))} max={10} height={210} tip={3} tipLabel="Best score" />
                </div>
              </Card>
            </section>

            {/* INSIGHT */}
            <Card float delay={1.4} className="mt-3.5 p-5 flex items-center gap-4 flex-wrap">
              <Orb tint="orange" icon="flask" size={48} radius={14} />
              <div className="min-w-[220px] flex-1">
                <b className="text-[15px]">Insight</b>
                <p className="text-[13.5px] text-[var(--v-muted)] mt-0.5">
                  You've completed 0% of your attempts. Keep going to see detailed trends and topic-wise analysis.
                </p>
              </div>
              <button onClick={() => setShowReco((s) => !s)}
                className="f3d-btn f3d-btn-violet rounded-xl px-6 py-3.5 text-sm font-bold flex gap-2 items-center">
                {showReco ? "Hide recommendations" : "View recommendations"} →
              </button>
              {showReco && (
                <div className="basis-full grid md:grid-cols-3 gap-2.5 page-in">
                  {[["Finish “Verb”", "3/106 answered — one sitting could lift avg score."], ["Attempt “Noun”", "Untouched chapter, 85 questions waiting."], ["Retry weakest day", "Sunday scores dip — schedule a 15-min drill."]].map(([t, s]) => (
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
            <p className="text-[13px] text-[var(--v-muted)] mt-1">Answered share per subject — all floating live from your library.</p>
            <div className="mt-4 space-y-3">
              {library.subjects.map((s) => {
                const tot = s.chapters.reduce((a, c) => a + (c.total || 0), 0);
                const ans = s.chapters.reduce((a, c) => a + (c.answered || 0), 0);
                const pct = tot ? Math.round((ans / tot) * 100) : 0;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <Orb tint={s.tint} icon={s.icon} size={42} radius={12} />
                    <div className="flex-1 min-w-0">
                      <div className="flex text-sm"><b>{s.title}</b><span className="ml-auto text-[var(--v-muted)]">{ans}/{tot} · {pct}%</span></div>
                      <div className="mt-1.5 h-3 rounded-full bg-[var(--v-bg)] border border-[var(--v-line)] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, background: "linear-gradient(90deg,#c4b5fd,#6d28d9)", boxShadow: "0 2px 8px rgba(124,58,237,.5)" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {tab === "weak" && (
          <Card float className="mt-3.5 p-[22px] page-in">
            <h3 className="text-[19px] font-extrabold">Weak topics</h3>
            <p className="text-[13px] text-[var(--v-muted)] mt-1">Lowest accuracy first — tap Practice to queue a drill.</p>
            <div className="mt-4 grid gap-2.5 md:grid-cols-2">
              {library.subjects.flatMap((s) => s.chapters.map((c) => ({ ...c, subject: s.title })))
                .sort((a, b) => (a.answered / Math.max(a.total, 1)) - (b.answered / Math.max(b.total, 1)))
                .slice(0, 4).map((c) => (
                  <div key={c.id} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] p-4 flex items-center gap-3">
                    <Orb tint={c.tint} icon="doc" size={42} radius={12} />
                    <div className="min-w-0"><b className="text-sm">{c.title}</b>
                      <div className="text-xs text-[var(--v-muted)]">{c.subject} · {c.answered}/{c.total} answered</div></div>
                    <button onClick={() => showToast(`Queued “${c.title}” drill`)}
                      className="f3d-btn f3d-btn-violet ml-auto rounded-full px-4 py-2 text-xs font-bold">Practice</button>
                  </div>
                ))}
            </div>
          </Card>
        )}

        {tab === "time" && (
          <div className="mt-3.5 grid md:grid-cols-3 gap-3.5 page-in">
            {[["Avg / question", "1m 12s", "Across 8 answered", "clock"], ["Fastest chapter", "Verb", "48s per question", "play"], ["Longest streak", "12 min", "Single sitting focus", "flame"]].map(([t, v, s, icon], i) => (
              <Card key={t} float delay={i * 0.5} className="p-[22px] text-center">
                <div className="text-[11px] tracking-[0.14em] font-bold text-[var(--v-muted)]">{t.toUpperCase()}</div>
                <div className="font-brand text-[34px] font-extrabold mt-1">{v}</div>
                <div className="text-xs text-[var(--v-muted)] mt-1">{s}</div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
