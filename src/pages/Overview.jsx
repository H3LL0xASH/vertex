import { useMemo } from "react";
import { useVertex } from "../store.jsx";
import { Card, Ico, Stat, ScoreLine } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";
import { getAttemptStats, listAttempts, toRecord, activityDays, momentumWeek } from "../engine/attempts.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LVL = ["", "bg-violet-200", "bg-violet-300", "bg-violet-500", "bg-violet-700"];

const fmtDate = (ts) => {
  try {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};
/** Map 0..100 values to bar heights (honest mini-bars, never fake). */
const barsFrom = (vals) => vals.map((v) => 8 + Math.round((Math.max(0, Math.min(100, v)) / 100) * 28));

export default function Overview({ go }) {
  const { user, showToast } = useVertex();

  const stats = useMemo(() => getAttemptStats(), []);
  const recents = useMemo(() => listAttempts().slice(0, 4), []);
  const activity = useMemo(() => activityDays(12), []);
  const week = useMemo(() => momentumWeek(), []);
  const lastFive = useMemo(() => listAttempts().slice(0, 5).reverse().map((a) => toRecord(a).percentageNum), []);

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  // heatmap grid: 12 week-columns ending this week, Mon..Sun rows
  const monday = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const dow = (t.getDay() + 6) % 7; // Mon = 0
    return t.getTime() - dow * 864e5;
  }, []);
  const cellLevel = (w, di) => {
    const date = new Date(monday - (11 - w) * 7 * 864e5 + di * 864e5);
    if (date.getTime() > Date.now()) return -1; // future
    const n = activity.counts[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`] || 0;
    const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { n, label, level: n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 5 ? 3 : 4 };
  };

  // current day-streak from real active days
  const streak = useMemo(() => {
    const has = (t) => {
      const d = new Date(t);
      return !!activity.counts[`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`];
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let s = 0;
    let t = has(today.getTime()) ? today.getTime() : today.getTime() - 864e5;
    while (has(t)) { s++; t -= 864e5; }
    return s;
  }, [activity]);

  const maxWeek = Math.max(4, ...week.map((d) => d.count));
  const weekTotal = week.reduce((a, d) => a + d.count, 0);

  return (
    <div className="flex min-h-screen">
      <BgBlobs />
      <Sidebar tab="overview" go={go} />
      <main className="flex-1 min-w-0 p-3 sm:p-4 sm:px-[22px] pb-[30px] page-in">
        <Topbar hideSearch onLibrary={() => go("library")} />

        {/* hero */}
        <Card float className="mt-3.5 p-5 sm:p-7 flex items-center min-h-[132px] overflow-hidden">
          <div className="absolute right-[8%] top-0 bottom-0 w-[46%] pointer-events-none overflow-hidden max-md:hidden" aria-hidden>
            <div className="absolute w-[130%] h-[220px] right-[-30%] top-[-40px] rounded-full rotate-[-8deg] bg-indigo-200/50" />
            <div className="f3d-sphere w-[130px] h-[130px] right-[38%] top-[-20px]" />
            <div className="f3d-sphere w-[54px] h-[54px] right-[12%] bottom-[10px]" style={{ animationDelay: "2s" }} />
            <div className="absolute w-[70%] h-[90px] right-[-10%] bottom-[-46px] rounded-full rotate-[-6deg] bg-white/60" />
          </div>
          <div className="relative z-[2]">
            <h1 className="text-[30px] font-extrabold tracking-tight">Welcome back, {user} 👋</h1>
            <p className="mt-1.5 text-[13.5px] text-[var(--v-muted)]">Your practice at a glance — today, this week, all-time.</p>
          </div>
          <div className="ml-auto text-right relative z-[2] max-lg:hidden">
            <b className="font-brand text-[34px] tracking-tight">vertex</b>
            <span className="block text-[9px] tracking-[0.42em] text-[var(--v-muted)] font-semibold mt-1">BEYOND POSSIBILITIES</span>
          </div>
        </Card>

        {/* stats — all live */}
        <section className="mt-3.5 grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3.5">
          <Stat icon="play" grad="linear-gradient(180deg,#a855f7,#7c3aed)" label="TOTAL ATTEMPTS" value={stats.total}
            sub={`${stats.inProgress} in progress`}
            bars={barsFrom(lastFive.length ? lastFive : [0])} barColor={["#e9d5ff", "#ddd6fe", "#c4b5fd"]} float delay={0} />
          <Stat icon="check" grad="linear-gradient(180deg,#34d399,#10b981)" label="COMPLETED" value={stats.completed}
            sub={`${completionRate}% completion rate`}
            bars={barsFrom(lastFive.length ? lastFive : [0])} barColor={["#bbf7d0", "#a7f3d0", "#6ee7b7"]} float delay={0.7} />
          <Stat icon="trophy" grad="linear-gradient(180deg,#38bdf8,#0284c7)" label="BEST SCORE" value={`${stats.bestScore}%`}
            sub={stats.total ? "Top attempt" : "No attempts yet"}
            bars={barsFrom(lastFive.length ? lastFive : [0])} barColor={["#bae6fd", "#7dd3fc"]} float delay={1.4} />
          <Stat icon="target" grad="linear-gradient(180deg,#fbbf24,#f97316)" label="AVG. SCORE" value={`${stats.avgScore}%`}
            sub="Across all attempts"
            bars={barsFrom(lastFive.length ? lastFive : [0])} barColor={["#fed7aa", "#fdba74"]} float delay={2.1} />
        </section>

        {/* mid */}
        <section className="mt-3.5 grid gap-3.5 grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          <Card float delay={0.4} className="p-[22px]">
            <div className="flex items-start gap-3">
              <div><h3 className="text-[19px] font-extrabold">Activity</h3>
                <div className="text-[13px] text-[var(--v-muted)] mt-1">
                  {activity.activeDays} active day{activity.activeDays === 1 ? "" : "s"} in the last 12 weeks</div></div>
              <div className="ml-auto bg-[#fff4e8] border border-[#ffd9b8] text-[#c2570b] text-[12.5px] font-extrabold px-3.5 py-2 rounded-full whitespace-nowrap">
                🔥 {streak > 0 ? `${streak}-day streak` : "Start your streak"}</div>
            </div>
            <div className="flex gap-2.5 mt-[18px] overflow-x-auto">
              <div className="flex flex-col gap-[7px] text-[11.5px] text-[var(--v-muted)]">
                {DAYS.map((d) => <span key={d} className="h-4 leading-4">{d}</span>)}
              </div>
              <div className="flex gap-[7px]">
                {Array.from({ length: 12 }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-[7px]">
                    {DAYS.map((d, di) => {
                      const c = cellLevel(w, di);
                      if (c === -1) return <span key={d} className="w-4 h-4 invisible" />;
                      return <span key={d} title={`${c.label} — ${c.n} session${c.n === 1 ? "" : "s"}`}
                        className={`w-4 h-4 rounded-[5px] border border-black/5 ${c.level ? LVL[c.level] : "bg-[#e7ebf3]"}`} />;
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3.5 flex justify-end items-center gap-1.5 text-xs text-[var(--v-muted)]">
              Less
              <i className="w-3.5 h-3.5 rounded bg-[#e7ebf3] inline-block" />
              <i className="w-3.5 h-3.5 rounded bg-violet-200 inline-block" />
              <i className="w-3.5 h-3.5 rounded bg-violet-300 inline-block" />
              <i className="w-3.5 h-3.5 rounded bg-violet-500 inline-block" />
              <i className="w-3.5 h-3.5 rounded bg-violet-700 inline-block" /> More
            </div>
          </Card>

          <Card float delay={1.1} className="p-[22px]">
            <div className="flex items-start gap-3">
              <div><h3 className="text-[19px] font-extrabold">This week's momentum</h3>
                <div className="text-[13px] text-[var(--v-muted)] mt-1">Attempts per day, last 7 days</div></div>
              <button onClick={() => showToast(`Metric: Attempts per day (${weekTotal} this week)`)} style={{ "--neon": "#8b5cf6" }}
                className="neon ml-auto border border-[var(--v-line)] rounded-full px-3.5 py-2 text-[13px] font-semibold f3d-pill flex items-center gap-1.5">Attempts <Ico n="chevD" s={13} /></button>
            </div>
            <div className="mt-2.5">
              {weekTotal === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[var(--v-muted)]">No attempts this week yet.</p>
                  <button onClick={() => go("library")}
                    className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Start practicing <Ico n="arrowR" s={13} /></button>
                </div>
              ) : (
                <ScoreLine data={week.map((d) => ({ d: d.label, v: d.count }))} max={maxWeek} height={220} tip={-1} />
              )}
            </div>
          </Card>
        </section>

        {/* recent — live attempts */}
        <Card float delay={1.8} className="mt-3.5 p-[22px]">
          <div className="flex items-start">
            <div><h3 className="text-[19px] font-extrabold">Recent tests</h3>
              <div className="text-[13px] text-[var(--v-muted)] mt-1">Resume where you stopped, or review a finished attempt</div></div>
            <button onClick={() => showToast(stats.total ? `Showing all ${stats.total} attempts` : "No attempts yet — visit the Library.")} style={{ "--neon": "#8b5cf6" }}
              className="neon ml-auto border border-[var(--v-line)] rounded-full px-[18px] py-2.5 text-[13px] font-bold f3d-pill flex items-center gap-2">View all <Ico n="arrowR" s={13} /></button>
          </div>
          {recents.length === 0 && stats.total === 0 && (
            <div className="mt-4 text-center py-8 rounded-[18px] border-[1.5px] border-dashed border-[#c9d2e4]">
              <p className="text-sm text-[var(--v-muted)]">No tests yet — your attempts will appear here.</p>
              <button onClick={() => go("library")}
                className="f3d-btn f3d-btn-violet mt-3 rounded-full px-5 py-2.5 text-[13px] font-bold flex items-center gap-2">Open Library <Ico n="arrowR" s={13} /></button>
            </div>
          )}
          {recents.map((a) => {
            const r = toRecord(a);
            const C = 163.3;
            const done = r.status === "completed";
            return (
              <div key={a.id} className="neon mt-4 bg-[#f4f6fc] border border-[var(--v-line)] rounded-[18px] p-4 flex items-center gap-4 flex-wrap" style={{ "--neon": "#8b5cf6" }}>
                <svg viewBox="0 0 64 64" className="w-16 h-16 shrink-0">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={done ? "#10b981" : "#8b5cf6"} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={C * (1 - r.percentageNum / 100)} transform="rotate(-90 32 32)" />
                  <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill="currentColor">{r.percentage}</text>
                </svg>
                <div className="min-w-0"><h4 className="text-base font-bold truncate">{a.title}</h4>
                  <div className="text-[12.5px] text-[var(--v-muted)] mt-1">
                    {r.answeredCount} / {r.totalQuestions} answered · Score {r.score} · {fmtDate(r.updatedAt)}</div></div>
                <div className="ml-auto flex items-center gap-2.5">
                  {done
                    ? <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold px-3.5 py-2 rounded-full">Completed</span>
                    : <span className="bg-[#fff4e8] border border-[#ffd9b8] text-[#b45309] text-xs font-bold px-3.5 py-2 rounded-full">In progress</span>}
                  {done
                    ? <button onClick={() => go("result", { attemptId: a.id })}
                      className="f3d-btn f3d-btn-violet px-[22px] py-3 rounded-full text-[13.5px] font-bold flex gap-2 items-center">Review <Ico n="arrowR" s={14} /></button>
                    : <button onClick={() => go("player", { attemptId: a.id })}
                      className="f3d-btn f3d-btn-violet px-[22px] py-3 rounded-full text-[13.5px] font-bold flex gap-2 items-center">Resume <Ico n="arrowR" s={14} /></button>}
                </div>
              </div>
            );
          })}
        </Card>
      </main>
    </div>
  );
}
