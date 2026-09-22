import { useState } from "react";
import { useVertex } from "../store.jsx";
import { Ico } from "../components/ui.jsx";

const NAMES = ["Aarav Sharma", "Sophia Lee", "John Carter"];

export default function Login() {
  const { login, showToast } = useVertex();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState(0);

  const go = () => {
    const n = name.trim();
    if (!n) { setShake((s) => s + 1); return; }
    showToast(`✓ Signed in as ${n}`);
    setTimeout(() => login(n), 450);
  };

  return (
    <div className="min-h-screen flex max-lg:flex-col page-in">
      {/* LEFT 3D SCENE */}
      <section className="relative w-[58%] max-lg:w-full max-lg:min-h-[54vh] min-h-screen overflow-hidden flex items-center justify-center"
        style={{ background: "radial-gradient(110% 70% at 8% 0%,#d9e7ff 0%,#e8efff 30%,transparent 62%), linear-gradient(180deg,#edf2ff 0%,#ebe9f6 34%,#f8e7e4 68%,#f0d9d2 100%)" }}>
        <div className="absolute w-[80%] h-[64%] left-[-24%] top-[-20%] rounded-full rotate-[-10deg]"
          style={{ background: "radial-gradient(circle at 34% 30%,#e2ecfd 0%,#b9cdec 28%,#93aed9 52%,#7e9ccb 62%,#c3d4ee 82%,#e9f0fd 100%)", boxShadow: "inset -34px -46px 90px rgba(255,255,255,.65), 30px 40px 90px rgba(130,150,195,.35)" }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <linearGradient id="sheet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f7e0e4" /><stop offset=".45" stopColor="#f1d2d7" /><stop offset="1" stopColor="#f8e9e3" />
            </linearGradient>
            <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4d9d8" /><stop offset=".5" stopColor="#fae6e1" /><stop offset="1" stopColor="#f6c3bd" />
            </linearGradient>
            <linearGradient id="front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e6c2bd" /><stop offset=".22" stopColor="#f2d3cd" /><stop offset=".55" stopColor="#ffded7" /><stop offset="1" stopColor="#ff9d95" />
            </linearGradient>
            <filter id="ss" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="26" floodColor="#8a7f9a" floodOpacity="0.28" />
            </filter>
          </defs>
          <path filter="url(#ss)" fill="url(#sheet)" d="M-40,330 C120,240 300,230 440,300 C540,350 600,430 620,560 L640,900 L-40,900 Z" />
          <path filter="url(#ss)" fill="url(#mid)" d="M-40,560 C120,540 220,500 330,540 C430,578 480,640 560,700 C610,738 640,780 650,900 L-40,900 Z" />
          <path filter="url(#ss)" fill="url(#front)" d="M-40,640 C80,620 170,600 260,630 C360,664 420,730 500,800 C550,844 600,870 640,900 L-40,900 Z" />
        </svg>
        <div className="f3d-sphere w-[116px] h-[116px] right-[17%] top-[19%]" />
        <div className="f3d-sphere w-[108px] h-[108px] left-[6.5%] bottom-[13.5%]" style={{ animationDelay: "1.6s" }} />
        <div className="relative z-[6] text-center -translate-y-[7%] pr-[7%]">
          <h1 className="f3d-text text-[clamp(76px,8.4vw,136px)] leading-none">vertex</h1>
          <p className="mt-5 text-[12.5px] tracking-[0.6em] indent-[0.6em] font-semibold text-[#7c6a8b]">BEYOND POSSIBILITIES</p>
          <div className="mt-[26px] mx-auto w-[62%] h-5 rounded-full blur-[14px] bg-[rgba(90,85,120,.25)]" />
        </div>
        {/* inflated seam */}
        <div className="absolute right-[-2px] top-0 h-full w-[104px] z-[7] max-lg:hidden pointer-events-none" aria-hidden>
          <svg viewBox="0 0 104 900" preserveAspectRatio="none" className="w-full h-full block overflow-visible">
            <path d="M60,0 C32,150 80,280 52,420 C26,552 64,680 38,900 L64,900 C90,680 50,552 76,420 C104,280 58,150 88,0 Z" fill="#ffb6b3" />
            <path d="M72,0 C44,150 90,280 62,420 C36,552 74,680 48,900 L104,900 L104,0 Z" fill="#f5f7fc" className="seam-w" />
          </svg>
        </div>
      </section>

      {/* RIGHT LOGIN — floating 3D */}
      <section className="w-[42%] max-lg:w-full flex items-center justify-center relative py-8"
        style={{ background: "radial-gradient(65% 55% at 50% 36%,#fff 0%,transparent 70%)" }}>
        <div className="w-[min(430px,88%)] flex flex-col items-center text-center">
          <h2 className="f3d-text-dark text-[clamp(58px,4.9vw,80px)] leading-none">vertex</h2>
          <p className="mt-3 text-[12.5px] tracking-[0.64em] indent-[0.64em] text-[var(--v-muted)] font-semibold">WELCOME BACK</p>

          <div className="mt-10 rounded-full p-2 f3d-float"
            style={{ width: 134, height: 134, background: "linear-gradient(180deg,#f2f4f9,#e3e8f2)", boxShadow: "16px 16px 34px #cfd7e8,-14px -14px 30px #fff" }}>
            <div className="rounded-full w-full h-full flex items-center justify-center overflow-hidden relative text-white"
              style={{ background: "radial-gradient(circle at 35% 28%,#f7c6ca 0%,#ec9fa6 30%,#d87f88 62%,#c86a74 100%)", boxShadow: "inset 7px 9px 16px rgba(255,255,255,.55), inset -9px -11px 20px rgba(120,30,40,.28)" }}>
              <svg viewBox="0 0 24 24" className="w-[56%] h-[56%] fill-white drop-shadow"><path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.1c-3.3 0-9.8 1.6-9.8 4.9v2.8c0 .6.4 1 1 1h17.6c.6 0 1-.4 1-1V19c0-3.3-6.5-4.9-9.8-4.9z" /></svg>
            </div>
          </div>

          <div className="mt-9 w-full max-w-[368px] relative">
            <div className="f3d-pill neon-focus f3d-float w-full h-16 flex items-center gap-3.5 pl-6 pr-5 cursor-pointer" style={{ animationDelay: ".8s", "--neon": "#e11d2e" }}
              onClick={(e) => { if (e.target.tagName !== "INPUT") setOpen((o) => !o); }}>
              <span className="text-gray-500"><Ico n="doc" s={26} /></span>
              <input value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setOpen(true)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Enter name" autoComplete="off"
                className="flex-1 border-0 outline-0 bg-transparent text-lg font-medium min-w-0" />
              <svg viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                className={`login-chev w-[26px] h-[26px] transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
            </div>
            {open && (
              <div className="f3d absolute left-2 right-2 top-[74px] !rounded-[18px] overflow-hidden z-20 text-left page-in">
                {NAMES.map((n) => (
                  <button key={n} onClick={() => { setName(n); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-[18px] py-[13px] text-[15px] font-medium hover:bg-violet-50">
                    <span className="w-8 h-8 rounded-full inline-flex items-center justify-center text-white font-bold text-sm f3d-orb"
                      style={{ background: "linear-gradient(180deg,#f2aeb4,#cf707a)" }}>{n[0]}</span>{n}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button key={shake} onClick={go}
            className={`f3d-btn f3d-btn-red mt-11 w-[258px] h-[60px] rounded-full text-[19px] font-medium flex items-center justify-center gap-4 ${shake ? "shake" : ""}`}>
            <span className="shine" />
            <span>Continue</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </button>
          <div className="mt-2.5 text-[11.5px] tracking-[0.14em] text-[var(--v-muted)] font-semibold">3D SECURE · VERTEX ID</div>
        </div>
      </section>
    </div>
  );
}
