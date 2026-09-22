import { useVertex } from "../store.jsx";
import { Ico } from "./ui.jsx";

const NAV = [
  { k: "overview", t: "Overview", s: "Your command deck", icon: "home" },
  { k: "library", t: "Library", s: "Tests & subjects", icon: "book" },
  { k: "analytics", t: "Analytics", s: "Mastery & trends", icon: "chart" },
  { k: "upload", t: "Upload dataset", s: "Add your own data", icon: "upload" },
];

export function Sidebar({ tab, go }) {
  return (
    <aside className="w-[248px] shrink-0 max-lg:hidden border-r border-[var(--v-line)] flex flex-col px-4 pt-[22px] pb-4 sticky top-0 h-screen overflow-hidden backdrop-blur-xl"
      style={{ background: "color-mix(in srgb, var(--v-card-hi) 78%, transparent)" }}>
      <div className="flex items-center gap-2.5 px-2">
        <span className="f3d-orb rounded-[14px]" style={{ width: 44, height: 44, background: "linear-gradient(180deg,#8b9ff0,#5b63e8)" }}>
          <span className="font-brand font-extrabold text-white text-[22px]">V</span>
        </span>
        <span>
          <span className="font-brand font-extrabold text-[26px] tracking-tight block leading-none">vertex</span>
          <span className="text-[9px] tracking-[0.4em] text-[var(--v-muted)] font-semibold">EXAM SIMULATOR</span>
        </span>
      </div>
      <div className="mt-7 mb-2.5 mx-2.5 text-[11px] tracking-[0.22em] text-[var(--v-muted)] font-bold">WORKSPACE</div>
      <nav className="flex flex-col gap-2.5">
        {NAV.map((n) => (
          <button key={n.k} onClick={() => go(n.k)} style={{ "--neon": "#8b5cf6" }}
            className={`neon flex gap-3 items-start p-3 rounded-2xl border text-left w-full transition-all hover:-translate-y-[1px] ${tab === n.k ? "bg-violet-100 border-violet-300 shadow-[0_8px_20px_rgba(124,58,237,.14)]" : "border-transparent"}`}>
            <span className={`f3d-orb rounded-xl ${tab === n.k ? "text-white" : ""}`}
              style={tab === n.k
                ? { width: 38, height: 38, background: "linear-gradient(180deg,#a78bfa,#6d28d9)" }
                : { width: 38, height: 38, background: "linear-gradient(180deg,#fff,#eef1f7)", color: "#5b647c", border: "1px solid var(--v-line)" }}>
              <Ico n={n.icon} s={20} />
            </span>
            <span>
              <span className={`text-[14.5px] font-bold ${tab === n.k ? "text-violet-700" : ""}`}>{n.t}</span>
              <div className="text-xs text-[var(--v-muted)] mt-0.5">{n.s}</div>
            </span>
          </button>
        ))}
      </nav>
      {/* restored reference art: mini 3D scene above the practice card */}
      <div className="mt-auto relative h-[120px] shrink-0" aria-hidden>
        <div className="absolute w-[130px] h-[130px] rounded-full left-[-30px] bottom-[-40px] opacity-90"
          style={{ background: "radial-gradient(circle at 35% 30%,#e2ecfd 0%,#9db6e0 45%,#7e9ccb 70%)", boxShadow: "inset -12px -16px 30px rgba(255,255,255,.5)" }} />
        <div className="absolute w-[150px] h-[90px] rounded-full left-[30px] bottom-[-30px] rotate-[-8deg]"
          style={{ background: "linear-gradient(180deg,#f6dee3,#f2b8c0)", boxShadow: "inset 6px 8px 16px rgba(255,255,255,.7)" }} />
        <div className="f3d-sphere w-[44px] h-[44px] left-[104px] top-[6px]" />
      </div>
      <div className="f3d f3d-float p-4 flex items-center gap-2.5 text-[15px] leading-snug font-medium">
        <span>Practice<br />smarter.<br />Go beyond.</span>
        <span className="ml-auto w-9 h-9 rounded-full f3d-pill flex items-center justify-center shrink-0">→</span>
      </div>
      <button onClick={() => go("upload")} className="mt-3 mx-1 flex items-center gap-2.5 text-left text-[13px] text-[var(--v-muted)] hover:text-[var(--v-ink)]">
        <span className="w-8 h-8 rounded-full f3d-pill flex items-center justify-center font-bold">?</span>
        <span>Need help?<br />Documentation</span>
      </button>
    </aside>
  );
}

export function Topbar({ searchPh, search, setSearch, onLibrary }) {
  const { user, theme, toggleTheme, logout, showToast } = useVertex();
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="f3d-pill neon-focus flex-1 min-w-[200px] max-w-[640px] h-[52px] flex items-center gap-2.5 px-5 text-[var(--v-muted)]" style={{ "--neon": "#8b5cf6" }}>
        <Ico n="search" s={20} />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPh}
          className="border-0 outline-0 bg-transparent flex-1 text-[14px] text-[var(--v-ink)] min-w-0" />
        <kbd className="max-sm:hidden font-sans text-[11.5px] font-bold text-[var(--v-muted)] bg-[var(--v-bg)] border border-[var(--v-line)] rounded-lg px-2 py-1 whitespace-nowrap">⌘ K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-2.5">
        <button onClick={() => showToast("🔥 1-day streak — solve a test today to keep it alive!")} style={{ "--neon": "#f97316" }}
          className="neon h-[46px] px-[18px] rounded-full bg-[#fff4e8] border border-[#ffd9b8] text-[#c2570b] flex items-center gap-2 text-[13.5px] font-bold shadow-[0_6px_18px_rgba(35,45,80,.1)] hover:-translate-y-[2px] transition-transform">🔥 1 day</button>
        <button onClick={toggleTheme} style={{ "--neon": "#8b5cf6" }}
          className="neon max-md:hidden h-[46px] px-[18px] rounded-full f3d-pill flex items-center gap-2 text-[13.5px] font-bold hover:-translate-y-[2px] transition-transform">
          {theme === "dark" ? "☀️ Light" : <><Ico n="moon" s={18} /> Dark</>}
        </button>
        <button onClick={onLibrary} style={{ "--neon": "#8b5cf6" }}
          className="neon max-md:hidden h-[46px] px-[18px] rounded-full f3d-pill flex items-center gap-2 text-[13.5px] font-bold hover:-translate-y-[2px] transition-transform">
          <Ico n="book" s={18} /> Library
        </button>
        <div className="relative group">
          <div className="h-[52px] pl-[5px] pr-3 rounded-full f3d-pill neon flex items-center gap-2.5 cursor-pointer" style={{ "--neon": "#fb7185" }}>
            <span className="w-[42px] h-[42px] rounded-full text-white font-extrabold flex items-center justify-center text-lg"
              style={{ background: "linear-gradient(180deg,#ff6b6b,#d81b28)", boxShadow: "inset 2px 3px 5px rgba(255,255,255,.45)" }}>
              {user.charAt(0).toUpperCase()}
            </span>
            <span className="max-[480px]:hidden"><b className="text-sm block leading-tight">{user}</b><small className="text-[10.5px] tracking-wider text-violet-600 font-extrabold">BRONZE</small></span>
            <span className="max-[480px]:hidden text-xs text-[var(--v-muted)]">▼</span>
          </div>
          <div className="absolute right-0 top-[60px] f3d min-w-[170px] overflow-hidden hidden group-hover:block z-50 !rounded-[14px]">
            <button onClick={logout} className="w-full px-4 py-3 text-left text-[13.5px] font-semibold hover:bg-black/5">⎋ Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* bottom nav for <lg screens (sidebar is hidden there) */
export function MobileNav({ tab, go }) {
  const items = [
    { k: "overview", t: "Home", icon: "home" },
    { k: "library", t: "Library", icon: "book" },
    { k: "analytics", t: "Stats", icon: "chart" },
    { k: "upload", t: "Upload", icon: "upload" },
  ];
  return (
    <nav className="mobilenav f3d items-center justify-around" aria-label="Primary">
      {items.map((n) => (
        <button key={n.k} onClick={() => go(n.k)} style={{ "--neon": "#8b5cf6" }}
          className={`neon flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-[11px] font-bold ${tab === n.k ? "text-violet-600" : "text-[var(--v-muted)]"}`}>
          <Ico n={n.icon} s={22} />
          {n.t}
        </button>
      ))}
    </nav>
  );
}

/* ambient FIXED 3D background — reference-art scene.
   Content scrolls OVER it. One markup adapts to light/dark. */
export function BgBlobs() {
  return (
    <div className="backdrop" aria-hidden>
      <div className="bd-blob bd-dome" />
      <div className="bd-blob bd-rose" />
      <div className="bd-blob bd-lav" />
      {/* rolling pink wave along the bottom, like the reference art */}
      <svg className="bd-wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bdWaveG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f4d9d8" />
            <stop offset=".55" stopColor="#fae6e1" />
            <stop offset="1" stopColor="#f6b3ae" />
          </linearGradient>
          <linearGradient id="bdWaveG2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6c2bd" />
            <stop offset="1" stopColor="#ff9d95" />
          </linearGradient>
        </defs>
        <path fill="url(#bdWaveG)" opacity=".85"
          d="M0,180 C240,120 420,200 720,150 C1020,100 1200,170 1440,120 L1440,320 L0,320 Z" />
        <path fill="url(#bdWaveG2)" opacity=".7"
          d="M0,240 C260,190 520,250 820,210 C1100,175 1280,230 1440,200 L1440,320 L0,320 Z" />
      </svg>
      {/* glossy spheres floating over the scene */}
      <div className="f3d-sphere w-[110px] h-[110px] left-[5%] bottom-[16%]" />
      <div className="f3d-floor w-[130px] h-6 left-[5%] bottom-[calc(16%-30px)]" />
      <div className="f3d-sphere w-[72px] h-[72px] right-[7%] top-[12%]" style={{ animationDelay: "1.8s" }} />
      <div className="f3d-floor w-[88px] h-4 right-[7%] top-[calc(12%+78px)]" />
      <div className="f3d-sphere w-[54px] h-[54px] right-[22%] bottom-[10%]" style={{ animationDelay: "3.1s" }} />
      <div className="f3d-floor w-[66px] h-3.5 right-[22%] bottom-[calc(10%-24px)]" />
    </div>
  );
}
