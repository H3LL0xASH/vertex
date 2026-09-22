import { useVertex } from "../store.jsx";
import { TINT_GRAD } from "../data/seed.js";

/* ---------- icons ---------- */
const P = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  book: <><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13" /></>,
  chart: <><path d="M3 3v18h18" /><path d="M7 15v-4M12 17V7M17 13v-2" /></>,
  bars: <><path d="M6 20v-6M11 20V8M16 20v-9M21 20V4" /></>,
  upload: <><path d="M12 16V4m0 0 4 4m-4-4L8 8" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
  calc: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 15h.01M12 15h.01M16 15h.01" /></>,
  flask: <><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /><path d="M7.5 15h9" /></>,
  doc: <><path d="M6 2h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" /><path d="M14 2v4h4M9 13h6M9 17h6" /></>,
  play: <path d="M8 5v14l11-7z" fill="currentColor" stroke="none" />,
  check: <path d="m5 13 4 4L19 7" />,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4a2 2 0 0 0 2 5h1M17 6h3a2 2 0 0 1-2 5h-1" /></>,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  flame: <><path d="M12 22c4.4 0 7.5-3 7.5-7.2 0-3.1-1.7-5.3-3.2-7C14.9 6.2 13.5 4.5 13 2c-3 2-4.5 4.3-5.3 6.5-.4-1-.6-2-.7-3.2C5 7 4.5 9.6 4.5 12 4.5 19 7.6 22 12 22Z" /><path d="M12 22c-1.8 0-3-1.3-3-2.9 0-1.2.7-2.2 1.4-3 .6-.7 1.3-1.4 1.6-2.6 1.3 1 2.9 2.3 2.9 4.5 0 2.2-1.2 4-2.9 4Z" /></>, moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  cal: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  down: <path d="M12 4v12m0 0 4-4m-4 4-4-4" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  flag: <><path d="M5 21V4" /><path d="M5 4h12l-2.5 4L17 12H5" /></>,
  star: <path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.1-5.6-3.1-5.6 3.1 1.2-6.1L3 9.6l6.3-.8L12 3Z" />,
  pie: <><path d="M12 3v9h9" /><circle cx="12" cy="12" r="8" /></>,
  chevL: <path d="m14 6-6 6 6 6" />,
  chevR: <path d="m10 6 6 6-6 6" />,
  chevU: <path d="m6 14 6-6 6 6" />,
  chevD: <path d="m6 10 6 6 6-6" />,
  dots: <><circle cx="5" cy="12" r="1.9" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.9" fill="currentColor" stroke="none" /></>,
  dotsV: <><circle cx="12" cy="5" r="1.9" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.9" fill="currentColor" stroke="none" /></>,
  arrowR: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  reset: <><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v5h-5" /></>,
  logout: <><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 8l-4 4 4 4" /><path d="M6 12h10" /></>,
};
export const Ico = ({ n, s = 20, fill = false, className = "" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth={fill ? 0 : 1.9} strokeLinecap="round" strokeLinejoin="round"
    className={`inline-block shrink-0 ${className}`} aria-hidden>
    {P[n]}
  </svg>
);

/* ---------- glossy icon orb ---------- */
export const Orb = ({ tint = "purple", icon = "book", size = 52, radius = 16 }) => (
  <span className="f3d-orb" style={{
    width: size, height: size, borderRadius: radius,
    background: TINT_GRAD[tint] ?? TINT_GRAD.purple, color: "#fff",
  }}>
    <Ico n={icon} s={Math.round(size * 0.5)} />
  </span>
);

/* ---------- floating card ---------- */
export const Card = ({ className = "", float = false, delay = 0, style, children, ...rest }) => (
  <div className={`f3d f3d-lift ${float ? "f3d-float" : ""} ${className}`}
    style={{ animationDelay: `${delay}s`, ...style }} {...rest}>
    {children}
  </div>
);

/* ---------- stat card with sparkline ---------- */
export const Stat = ({ icon, tint, grad, label, value, sub, bars, barColor, spark, sparkColor, delta, float, delay = 0 }) => (
  <Card float={float} delay={delay} className="p-[18px] flex items-start gap-[14px] overflow-hidden">
    <span className="f3d-orb rounded-full" style={{ width: 48, height: 48, background: grad, color: "#fff" }}>
      <Ico n={icon} s={22} />
    </span>
    <div className="min-w-0">
      <div className="text-[10.5px] tracking-[0.14em] font-bold text-[var(--v-muted)]">{label}</div>
      <div className="text-[30px] font-extrabold leading-[1.1]">{value}</div>
      <div className="text-xs text-[var(--v-muted)] mt-[2px]">{sub}</div>
    </div>
    <div className="ml-auto self-center">
      {bars ? (
        <div className="flex items-end gap-1 h-11">
          {bars.map((h, i) => (
            <i key={i} className="w-[7px] rounded block" style={{ height: h, background: barColor[i % barColor.length] }} />
          ))}
        </div>
      ) : (
        <svg width="110" height="40" viewBox="0 0 110 40">
          <path d={spark} fill="none" stroke={sparkColor} strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
    </div>
    {delta && (
      <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-1 rounded-full"
        style={{ background: delta.na ? "#eef1f7" : "#dcfce7", color: delta.na ? "#64748b" : "#15803d" }}>
        {delta.t}
      </span>
    )}
  </Card>
);

/* ---------- donut ---------- */
export const Donut = ({ pct }) => {
  const R = 54, C = 2 * Math.PI * R;
  return (
    <div className="relative w-[168px] h-[168px] mx-auto">
      <div className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(180deg,#fff,#eef1f7)", boxShadow: "12px 16px 30px rgba(45,55,90,.18), -8px -10px 22px #fff, inset 3px 4px 10px rgba(170,182,210,.4)" }} />
      <svg viewBox="0 0 140 140" className="absolute inset-0">
        <circle cx="70" cy="70" r={R} fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <circle cx="70" cy="70" r={R} fill="none" stroke="url(#dg)" strokeWidth="16" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 70 70)" />
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f472b6" /><stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="70" cy={70 - R} r="8" fill="#f43f5e" stroke="#fff" strokeWidth="3" />
      </svg>
      <div className="absolute inset-[26px] rounded-full flex items-center justify-center text-[30px] font-extrabold"
        style={{ background: "linear-gradient(180deg,#fff,#f1f4fa)", boxShadow: "inset 3px 4px 10px rgba(170,182,210,.4)" }}>
        {pct}%
      </div>
    </div>
  );
};

/* ---------- smooth line chart ---------- */
export function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}
export const ScoreLine = ({ data, max = 10, height = 210, tip = 3, tipLabel = "Best score" }) => {
  const W = 560, H = height, L = 36, R = 550, T = 12, B = H - 26;
  const xs = data.map((_, i) => L + ((R - L) * i) / (data.length - 1));
  const ys = data.map((p) => B - ((B - T) * p.v) / max);
  const pts = xs.map((x, i) => [x, ys[i]]);
  const line = smooth(pts);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <defs>
          <linearGradient id="sfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c3aed" stopOpacity=".32" />
            <stop offset="1" stopColor="#7c3aed" stopOpacity=".04" />
          </linearGradient>
        </defs>
        {[0.2, 0.4, 0.6, 0.8, 1].map((f) => (
          <line key={f} x1={L} y1={T + (B - T) * (1 - f)} x2={R} y2={T + (B - T) * (1 - f)} stroke="#e8ecf4" />
        ))}
        <path d={`${line} L${xs[xs.length - 1]},${B} L${xs[0]},${B} Z`} fill="url(#sfill)" />
        <path d={line} fill="none" stroke="#6d28d9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            {i === tip && (
              <g>
                <rect x={x - 8} y={y - 62} width="86" height="40" rx="12" fill="#fff" stroke="#e6eaf3" />
                <text x={x + 22} y={y - 45} fontSize="15" fontWeight="800" fill="#131a2b">{data[i].v}</text>
                <text x={x + 22} y={y - 32} fontSize="9" fill="#6d7391">{tipLabel}</text>
              </g>
            )}
            <circle cx={x} cy={y} r={i === tip ? 6 : 4.5} fill={i === tip ? "#fff" : "#6d28d9"}
              stroke="#6d28d9" strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      <div className="flex justify-between pl-9 pr-3 text-xs font-semibold text-[var(--v-muted)]">
        {data.map((p) => <span key={p.d}>{p.d}</span>)}
      </div>
    </div>
  );
};

/* ---------- segmented tabs ---------- */
export const SegTabs = ({ tabs, active, onChange }) => (
  <div className="f3d-pill flex items-center gap-1 p-1.5 flex-wrap">
    {tabs.map((t) => (
      <button key={t.k} onClick={() => onChange(t.k)} style={{ "--neon": "#8b5cf6" }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-bold transition-all ${active === t.k ? "f3d-btn-violet f3d-btn" : "neon text-[var(--v-ink)] hover:bg-black/5"}`}>
        <Ico n={t.icon} s={17} /> {t.label}
      </button>
    ))}
  </div>
);

/* ---------- modal ---------- */
export const Modal = ({ title, okText = "Create", danger, onOk, onClose, children }) => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-[18px] page-in"
    style={{ background: "rgba(20,26,45,.45)", backdropFilter: "blur(4px)" }}
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="f3d pop-in w-[min(460px,100%)] p-6" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-lg font-extrabold">{title}</h3>
      {children}
      <div className="mt-5 flex gap-2.5 justify-end">
        <button onClick={onClose} className="px-5 py-3 rounded-xl text-[13.5px] font-bold border border-[var(--v-line)]">Cancel</button>
        <button onClick={onOk} className={`f3d-btn px-5 py-3 rounded-xl text-[13.5px] font-bold ${danger ? "f3d-btn-red" : "f3d-btn-violet"}`}>{okText}</button>
      </div>
    </div>
  </div>
);

export const Field = ({ label, children }) => (
  <label className="block mt-3.5">
    <span className="block text-xs font-bold text-[var(--v-muted)] mb-1.5 tracking-wide">{label}</span>
    {children}
  </label>
);
export const TextInput = (props) => (
  <input {...props} className="w-full border border-[var(--v-line)] rounded-xl px-3.5 py-3 text-sm bg-[var(--v-bg)] text-[var(--v-ink)] outline-none focus:border-violet-500" />
);

/* ---------- toast host ---------- */
export const ToastHost = () => {
  const { toast, toastKey, dismissToast } = useVertex();
  if (!toast) return null;
  return (
    <div key={toastKey} className="f3d-toast show pl-[22px] pr-2 py-2 rounded-full text-[13.5px] font-semibold flex items-center gap-2 max-w-[min(480px,92vw)]">
      <span className="pl-1 truncate">{toast}</span>
      <button onClick={dismissToast} title="Dismiss" className="w-7 h-7 rounded-full shrink-0 bg-white/15 hover:bg-white/30 text-white transition-colors flex items-center justify-center">
        <Ico n="x" s={12} />
      </button>
    </div>
  );
};
