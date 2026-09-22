import { useState } from "react";
import { useVertex } from "../store.jsx";
import { Card, Ico, Stat, ScoreLine } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Overview({ go }) {
  const { user, showToast } = useVertex();
  const [search, setSearch] = useState("");
  const [metric] = useState([1.5, 3.5, 3.1, 3.3, 7, 3.3, 3.5]);

  const activeCells = { "2-0": 3, "1-1": 2, "1-3": 2, "1-5": 1, "1-6": 1 };
  const lvl = ["", "bg-violet-200", "bg-violet-300", "bg-violet-500", "bg-violet-700"];

  return (
    <div className="flex min-h-screen">
      <BgBlobs />
      <Sidebar tab="overview" go={go} />
      <main className="flex-1 min-w-0 p-4 px-[22px] pb-[30px] page-in">
        <Topbar searchPh="Search or command..." search={search} setSearch={setSearch} onLibrary={() => go("library")} />

        {/* hero */}
        <Card float className="mt-3.5 p-7 flex items-center min-h-[132px] overflow-hidden">
          <div className="absolute right-[8%] top-0 bottom-0 w-[46%] pointer-events-none overflow-hidden" aria-hidden>
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

        {/* stats */}
        <section className="mt-3.5 grid grid-cols-4 max-lg:grid-cols-2 max-md:grid-cols-1 gap-3.5">
          <Stat icon="play" grad="linear-gradient(180deg,#a855f7,#7c3aed)" label="TOTAL ATTEMPTS" value="5" sub="5 in progress"
            bars={[16, 30, 22, 34, 26]} barColor={["#e9d5ff", "#ddd6fe", "#c4b5fd"]} float delay={0} />
          <Stat icon="check" grad="linear-gradient(180deg,#34d399,#10b981)" label="COMPLETED" value="0" sub="0% completion rate"
            bars={[14, 24, 18, 30, 34]} barColor={["#bbf7d0", "#a7f3d0", "#6ee7b7"]} float delay={0.7} />
          <Stat icon="trophy" grad="linear-gradient(180deg,#38bdf8,#0284c7)" label="BEST SCORE" value="3" sub="Top attempt"
            bars={[14, 28, 20, 34, 26]} barColor={["#bae6fd", "#7dd3fc"]} float delay={1.4} />
          <Stat icon="target" grad="linear-gradient(180deg,#fbbf24,#f97316)" label="AVG. SCORE" value="0.6" sub="Across all attempts"
            bars={[16, 24, 20, 30, 36]} barColor={["#fed7aa", "#fdba74"]} float delay={2.1} />
        </section>

        {/* mid */}
        <section className="mt-3.5 grid gap-3.5 grid-cols-1 lg:grid-cols-[1.15fr_1fr]">
          <Card float delay={0.4} className="p-[22px]">
            <div className="flex items-start gap-3">
              <div><h3 className="text-[19px] font-extrabold">Activity</h3>
                <div className="text-[13px] text-[var(--v-muted)] mt-1">1 active day in the last 12 weeks</div></div>
              <div className="ml-auto bg-[#fff4e8] border border-[#ffd9b8] text-[#c2570b] text-[12.5px] font-extrabold px-3.5 py-2 rounded-full whitespace-nowrap">🔥 1-day streak</div>
            </div>
            <div className="flex gap-2.5 mt-[18px]">
              <div className="flex flex-col gap-[7px] text-[11.5px] text-[var(--v-muted)]">
                {DAYS.map((d) => <span key={d} className="h-4 leading-4">{d}</span>)}
              </div>
              <div className="flex gap-[7px]">
                {Array.from({ length: 12 }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-[7px]">
                    {DAYS.map((d, di) => {
                      const rows = w >= 10 ? 5 : 7;
                      if (di >= rows) return <span key={d} className="w-4 h-4 invisible" />;
                      const l = activeCells[`${w}-${di}`] ?? 0;
                      return <span key={d} title={`${d} week ${w + 1}`}
                        className={`w-4 h-4 rounded-[5px] border border-black/5 ${l ? lvl[l] : "bg-[#e7ebf3]"}`} />;
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
              <button onClick={() => showToast("Metric: Attempts per day")} style={{ "--neon": "#8b5cf6" }}
                className="neon ml-auto border border-[var(--v-line)] rounded-full px-3.5 py-2 text-[13px] font-semibold f3d-pill">Attempts ▾</button>
            </div>
            <div className="mt-2.5">
              <ScoreLine data={[{ d: "W", v: metric[0] }, { d: "T", v: metric[1] }, { d: "F", v: metric[2] }, { d: "S", v: metric[3] }, { d: "S", v: metric[4] }, { d: "M", v: metric[5] }, { d: "T", v: metric[6] }]}
                max={8} height={220} tip={-1} />
            </div>
          </Card>
        </section>

        {/* recent */}
        <Card float delay={1.8} className="mt-3.5 p-[22px]">
          <div className="flex items-start">
            <div><h3 className="text-[19px] font-extrabold">Recent tests</h3>
              <div className="text-[13px] text-[var(--v-muted)] mt-1">Resume where you stopped, or review a finished attempt</div></div>
            <button onClick={() => showToast("Showing all 5 attempts")} style={{ "--neon": "#8b5cf6" }}
              className="neon ml-auto border border-[var(--v-line)] rounded-full px-[18px] py-2.5 text-[13px] font-bold f3d-pill">View all →</button>
          </div>
          {(("mixture & alligation".includes(search.toLowerCase()) || !search) && (
            <div className="neon mt-4 bg-[#f4f6fc] border border-[var(--v-line)] rounded-[18px] p-4 flex items-center gap-4 flex-wrap" style={{ "--neon": "#8b5cf6" }}>
              <svg viewBox="0 0 64 64" className="w-16 h-16 shrink-0">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor">0%</text>
              </svg>
              <div><h4 className="text-base font-bold">Mixture &amp; Alligation</h4>
                <div className="text-[12.5px] text-[var(--v-muted)] mt-1">0 / 86 answered · Score 0 · Sep 22, 05:05 PM</div></div>
              <div className="ml-auto flex items-center gap-2.5">
                <span className="bg-[#fff4e8] border border-[#ffd9b8] text-[#b45309] text-xs font-bold px-3.5 py-2 rounded-full">In progress</span>
                <button onClick={() => showToast("Resuming Mixture & Alligation…")}
                  className="f3d-btn f3d-btn-violet px-[22px] py-3 rounded-full text-[13.5px] font-bold flex gap-2 items-center">Resume →</button>
              </div>
            </div>
          )) || null}
        </Card>
      </main>
    </div>
  );
}
