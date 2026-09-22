import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useVertex } from "../store.jsx";
import { uid, TINT_GRAD } from "../data/seed.js";
import { sampleProfitLoss } from "../data/sampleProfitLoss.js";
import { normalizeExam } from "../engine/examFormat.js";
import { chapterRollup, chapterAttempts, deleteAttempt, toRecord } from "../engine/attempts.js";

const fmtDate = (ts) => {
  try {
    return new Date(ts).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};
import { Card, Ico, Orb, Modal, Field, TextInput } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

const TINT_FIX = ["pink", "blue", "green", "orange", "purple", "teal"];
const ICON_CHOICES = [
  { k: "book", label: "Book" }, { k: "calc", label: "Calculator" },
  { k: "flask", label: "Flask" }, { k: "doc", label: "Document" },
  { k: "target", label: "Target" }, { k: "trophy", label: "Trophy" },
];
const DOC_FG = { pink: "#d64a56", blue: "#2f6fd0", green: "#1d9e5e", orange: "#d97a1f", purple: "#6d28d9", teal: "#149a90" };
const DOC_BG = { pink: "#fbdfe2", blue: "#dde8fa", green: "#d9f2e2", orange: "#fbe7cf", purple: "#e6dcfb", teal: "#d3efec" };
const NEON = { pink: "#f43f5e", blue: "#3b82f6", green: "#22c55e", orange: "#f97316", purple: "#8b5cf6", teal: "#14b8a6" };

export default function Library({ go }) {
  const { library, setLibrary, resetLibrary, showToast, launchChapter, startAttempt } = useVertex();
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState({}); // subId -> true = full grid, default = scroll row
  const [menu, setMenu] = useState(null); // {kind:'sub'|'ch', subId, chId, rect:{bottom,right}}
  const [modal, setModal] = useState(null); // {mode, subId, chId, ...}
  const rowRefs = useRef({});
  const [dsModal, setDsModal] = useState(null); // {subjectId, chapterId, title}
  const [hist, setHist] = useState(null); // {subjectId, chapterId, title}
  const [tick, setTick] = useState(0); // bump to re-read attempts from storage
  const fileRef = useRef(null);
  const dsFileRef = useRef(null);

  /** Chapter → player. Chapters carry their own dataset JSON (D:\WEB format);
      without one we ask for an upload or the bundled sample set. */
  const openChapter = (subjectId, ch) => {
    const r = launchChapter(subjectId, ch.id);
    if (r.attemptId) go("player", { attemptId: r.attemptId });
    else setDsModal({ subjectId, chapterId: ch.id, title: ch.title });
  };

  const linkAndLaunch = (subjectId, chapterId, rawJson, label) => {
    const r = startAttempt(subjectId, chapterId, rawJson);
    if (r.error) { showToast("Invalid dataset — " + r.error); return; }
    setDsModal(null);
    showToast(`“${label}” linked (${r.count} questions).`);
    go("player", { attemptId: r.attemptId });
  };

  // menu opener — captures the button rect; the popup itself is portalled to
  // <body> as position:fixed (viewport coords, no scroll math), so it can
  // never push layout around or get clipped by scroll containers.
  const openMenu = (e, m) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    setMenu((prev) => (prev && prev.kind === m.kind && prev.subId === m.subId && prev.chId === m.chId
      ? null
      : { ...m, rect: { bottom: r.bottom, right: r.right } }));
  };

  const scrollRow = (subId, dir) => {
    rowRefs.current[subId]?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  // live subject aggregates from real attempts + linked datasets
  const subjectStats = (s) => {
    let qs = 0, atts = 0, best = null;
    s.chapters.forEach((c) => {
      qs += qcounts[c.id] ?? 0;
      const roll = chapterRollup(c.id);
      atts += roll.attempts || 0;
      if (roll.best !== undefined && (best === null || roll.best > best)) best = roll.best;
    });
    return { qs, atts, best };
  };

  const exportSubject = (subId) => {
    const s = library.subjects.find((x) => x.id === subId);
    if (!s) return;
    const blob = new Blob([JSON.stringify({ subjects: [s] }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vertex-${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
    showToast(`“${s.title}” exported.`);
  };

  const deleteChapterEverywhere = (subId, chId, title) => {
    chapterAttempts(chId).forEach((a) => deleteAttempt(a.id));
    mutate((d) => {
      const s = d.subjects.find((x) => x.id === subId);
      if (s) s.chapters = s.chapters.filter((c) => c.id !== chId);
    });
    setTick((t) => t + 1);
    showToast(`“${title}” and its attempts deleted.`);
  };

  // real question counts from linked datasets (re-normalized when library/tick changes)
  const qcounts = useMemo(() => {
    const m = {};
    library.subjects.forEach((s) => s.chapters.forEach((c) => {
      if (!c.dataset) { m[c.id] = 0; return; }
      try { m[c.id] = normalizeExam(c.dataset).questions.length; }
      catch { m[c.id] = 0; }
    }));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library, tick]);

  // one-click starter: real sample content, linked and launched
  const loadSample = () => {
    const subId = uid("sub"), chId = uid("ch");
    setLibrary((prev) => ({
      subjects: [...prev.subjects, {
        id: subId, title: "Maths", desc: "Numbers, algebra, geometry and more.",
        icon: "calc", tint: "purple",
        chapters: [{ id: chId, title: "Profit & Loss", tint: "purple" }],
      }],
    }));
    const r = startAttempt(subId, chId, sampleProfitLoss);
    if (r.attemptId) go("player", { attemptId: r.attemptId });
    else showToast("Could not start the sample test.");
  };

  const shown = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return library.subjects;
    return library.subjects.map((s) => ({
      ...s,
      chapters: s.chapters.filter((c) =>
        c.title.toLowerCase().includes(query) || `${s.title} ${s.desc ?? ""}`.toLowerCase().includes(query)),
    })).filter((s) => `${s.title} ${s.desc ?? ""}`.toLowerCase().includes(query) || s.chapters.length);
  }, [library, q]);

  const mutate = (fn) => setLibrary((prev) => {
    const d = structuredClone(prev); fn(d); return d;
  });

  const doExport = () => {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "vertex-library.json";
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
    showToast("Library exported");
  };
  const doImport = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        const arr = Array.isArray(d) ? d : d.subjects;
        if (!Array.isArray(arr)) throw new Error("bad");
        setLibrary({
          subjects: arr.map((s) => ({
            id: s.id || uid("sub"), title: String(s.title || "Untitled"), desc: s.desc || "",
            icon: s.icon || "book", tint: s.tint || "pink",
            chapters: (s.chapters ?? []).map((c) => ({
              id: c.id || uid("ch"), title: String(c.title || "Untitled"),
              tint: c.tint || "blue", total: c.total || 0,
              ...(c.dataset ? { dataset: c.dataset } : {}),
            })),
          })),
        });
        setExpanded({});
        showToast(`Imported ${arr.length} subject(s)`);
      } catch { showToast("Could not read that JSON file"); }
    };
    r.readAsText(f);
  };

  /* One chapter tile — shared by the scroll row and the expanded grid. */
  const chapterCard = (s, c, rowMode) => {
    const roll = chapterRollup(c.id);
    const nq = qcounts[c.id] ?? 0;
    const hasDs = !!c.dataset;
    const pill = !hasDs
      ? <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-[#eef1f7] text-[#5b647c] border border-[#dde3ee]">No dataset</span>
      : roll.attempts === 0
        ? <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-[#eef1f7] text-[#5b647c] border border-[#dde3ee]">Not started</span>
        : roll.status === "in_progress"
          ? <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-[#fde8d4] text-[#c2570b] border border-[#f5cfa5]">In progress · {roll.latestPct}%</span>
          : <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-emerald-50 text-emerald-600 border border-emerald-200">Best {roll.best}%</span>;
    const meta = !hasDs
      ? "Link a dataset to start testing"
      : roll.attempts === 0
        ? `${nq} questions · no attempts yet`
        : `${roll.answered} / ${roll.total} answered · ${roll.attempts} attempt${roll.attempts === 1 ? "" : "s"} · ${fmtDate(roll.updatedAt)}`;
    return (
      <div key={c.id} onClick={() => openChapter(s.id, c)}
        className={`neon cht cht-${c.tint || "blue"} rounded-2xl p-4 flex gap-3 items-start shadow-[0_8px_20px_rgba(35,45,80,.07)] hover:-translate-y-[3px] transition-transform cursor-pointer ${rowMode ? "shrink-0 w-[272px] snap-start" : ""}`}
        style={{ "--neon": NEON[c.tint] ?? NEON.blue }}>
        <span className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center shadow-[inset_2px_3px_6px_rgba(255,255,255,.6),0_6px_14px_rgba(0,0,0,.1)]"
          style={{ background: DOC_BG[c.tint] ?? DOC_BG.blue, color: DOC_FG[c.tint] ?? DOC_FG.blue }}>
          <Ico n="doc" s={26} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold truncate">{c.title}</h3>
          {c.desc ? <div className="text-[11.5px] text-[var(--v-muted)] mt-0.5 truncate">{c.desc}</div> : null}
          {pill}
          <div className="text-[11.5px] text-[#8b91a7] mt-[7px]">{meta}</div>
          {roll.attempts > 0 && (
            <div className="mt-2 h-2 rounded-full bg-black/10 overflow-hidden">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(roll.latestPct, 3)}%`, background: "linear-gradient(90deg,#c4b5fd,#6d28d9)" }} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 self-center shrink-0">
          <button onClick={(e) => openMenu(e, { kind: "ch", subId: s.id, chId: c.id })} style={{ "--neon": NEON[c.tint] ?? NEON.blue }}
            title="Chapter options"
            className="neon w-[38px] h-[38px] rounded-full bg-white/90 border border-black/5 flex items-center justify-center text-[#3b4370] font-extrabold shadow-[0_6px_14px_rgba(35,45,80,.12)] hover:scale-110 transition-transform">•••</button>
          <button onClick={(e) => { e.stopPropagation(); openChapter(s.id, c); }}
            className="w-[38px] h-[38px] rounded-full bg-white/90 border border-black/5 flex items-center justify-center text-[#3b4370] shadow-[0_6px_14px_rgba(35,45,80,.12)] hover:scale-110 transition-transform">→</button>
        </div>
      </div>
    );
  };

  const addTile = (s, rowMode, wide) => (
    <button key="__add" onClick={() => setModal({ mode: "chapter", subId: s.id })} style={{ "--neon": "#8b5cf6" }}
      className={`neon rounded-2xl flex flex-col gap-2 items-center justify-center text-[13px] font-semibold text-[#5b647c] border-[1.5px] border-dashed border-[#c9d2e4] hover:border-violet-500 hover:text-violet-700 hover:bg-violet-500/5 transition-all ${rowMode ? "shrink-0 w-[220px] snap-start min-h-[150px]" : wide ? "[grid-column:1/-1] min-h-[96px]" : "min-h-[118px]"}`}>
      <span className="w-[38px] h-[38px] rounded-full f3d-pill flex items-center justify-center text-xl">＋</span>
      Add Chapter
    </button>
  );

  return (
    <div className="flex min-h-screen" onClick={() => setMenu(null)}>
      <BgBlobs />
      <Sidebar tab="library" go={go} />
      <main className="flex-1 min-w-0 p-4 px-[22px] pb-10 page-in">
        <Topbar searchPh="Search subjects, chapters or commands..." search={q} setSearch={setQ} onLibrary={() => {}} />

        {/* hero */}
        <Card float className="mt-3.5 px-[30px] py-[26px] flex items-center min-h-[150px] overflow-hidden">
          <div className="absolute right-[20%] top-0 bottom-0 w-[340px] pointer-events-none max-lg:hidden" aria-hidden>
            <div className="f3d-sphere w-[58px] h-[58px] left-[6px] top-[40px]" />
            <div className="absolute right-5 top-[52px] w-[190px] h-16 rounded-xl rotate-[-8deg]"
              style={{ background: "linear-gradient(180deg,#8b93f8,#5b63e8)", boxShadow: "0 16px 28px rgba(90,100,230,.4), inset 0 2px 3px rgba(255,255,255,.5)" }} />
            <div className="absolute right-[34px] top-4 w-[170px] h-14 rounded-xl rotate-[-8deg]"
              style={{ background: "linear-gradient(180deg,#cdbcf7,#a78bfa)", boxShadow: "0 14px 26px rgba(140,110,240,.42), inset 0 2px 3px rgba(255,255,255,.55)" }} />
          </div>
          <div className="relative z-[2]">
            <h1 className="text-[34px] font-extrabold tracking-tight">Test Library</h1>
            <p className="mt-2 text-[13.5px] text-[var(--v-muted)]">Subjects, chapters and datasets — everything needed for practice lives here.</p>
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="f3d-btn f3d-btn-violet ml-auto relative z-[2] rounded-[14px] px-[26px] py-[15px] text-[14.5px] font-bold flex gap-2.5 items-center whitespace-nowrap">
            <Ico n="upload" s={17} /> Upload JSON
          </button>
        </Card>

        {/* toolbar */}
        <div className="mt-3.5 flex items-center gap-2.5 flex-wrap">
          <button onClick={() => setModal({ mode: "subject" })}
            className="f3d-btn f3d-btn-violet rounded-xl px-5 py-[13px] text-[13.5px] font-bold flex gap-2 items-center"><span className="text-base">＋</span> Add Subject</button>
          <button onClick={() => setModal({ mode: "chapter", subId: library.subjects[0]?.id })} style={{ "--neon": "#8b5cf6" }}
            className="neon rounded-xl px-5 py-[13px] text-[13.5px] font-bold f3d-pill flex gap-2 items-center"><span className="text-base">＋</span> Add Chapters</button>
          <div className="f3d-pill neon-focus flex-1 min-w-[200px] h-12 flex items-center gap-2.5 px-4 text-[var(--v-muted)]" style={{ "--neon": "#8b5cf6" }}>
            <Ico n="search" s={18} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter subjects / chapters..."
              className="border-0 outline-0 bg-transparent flex-1 text-[13.5px] text-[var(--v-ink)] min-w-0" />
          </div>
          <button onClick={doExport} style={{ "--neon": "#8b5cf6" }} className="neon rounded-xl px-5 py-[13px] text-[13.5px] font-bold f3d-pill flex gap-2 items-center"><Ico n="down" s={16} /> Export</button>
          <button onClick={() => fileRef.current?.click()} style={{ "--neon": "#8b5cf6" }} className="neon rounded-xl px-5 py-[13px] text-[13.5px] font-bold f3d-pill flex gap-2 items-center"><Ico n="upload" s={16} /> Import</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { doImport(e.target.files[0]); e.target.value = ""; }} />
        </div>

        {/* subjects */}
        {library.subjects.length === 0 && !q.trim() && (
          <Card float className="mt-3.5 p-10 text-center">
            <span className="f3d-orb rounded-full mx-auto" style={{ width: 72, height: 72, background: "linear-gradient(180deg,#b39df7,#7c4de8)", color: "#fff" }}>
              <Ico n="book" s={34} />
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Your library is empty</h2>
            <p className="mt-1.5 text-sm text-[var(--v-muted)] max-w-[440px] mx-auto">
              Add a subject, upload a question dataset in the Vertex JSON format, or jump straight in with the bundled sample test.
            </p>
            <div className="mt-5 flex gap-2.5 justify-center flex-wrap">
              <button onClick={() => setModal({ mode: "subject" })}
                className="f3d-btn f3d-btn-violet rounded-xl px-5 py-3 text-[13.5px] font-bold">＋ Add Subject</button>
              <button onClick={() => fileRef.current?.click()} style={{ "--neon": "#8b5cf6" }}
                className="neon rounded-xl px-5 py-3 text-[13.5px] font-bold f3d-pill">⤒ Upload JSON</button>
              <button onClick={loadSample} className="f3d-btn f3d-btn-green rounded-xl px-5 py-3 text-[13.5px] font-bold">▶ Try sample test</button>
            </div>
          </Card>
        )}
        {shown.length === 0 && (library.subjects.length > 0 || q.trim()) && (
          <div className="f3d mt-3.5 p-11 text-center text-[var(--v-muted)] text-sm border-dashed">
            No subjects or chapters match “{q}”.
            <br />
            <button onClick={() => { resetLibrary(); setQ(""); }} className="mt-3.5 rounded-xl px-5 py-[13px] text-[13.5px] font-bold f3d-pill">Reset to sample data</button>
          </div>
        )}
        {shown.map((s, si) => (
          <Card key={s.id} float delay={si * 0.5} className="mt-3.5 p-5">
            <div className="flex items-start gap-3.5 flex-wrap">
              <Orb tint={s.tint} icon={s.icon} />
              <div className="min-w-0">
                <h2 className="text-xl font-extrabold">{s.title}
                  <span className="inline-block ml-2.5 align-middle text-[11.5px] font-bold text-[#5b647c] bg-[#eef1f8] border border-[var(--v-line)] rounded-full px-3 py-1">
                    {s.chapters.length} chapter{s.chapters.length === 1 ? "" : "s"}</span></h2>
                {(() => {
                  const st = subjectStats(s);
                  const bits = [];
                  if (s.desc) bits.push(s.desc);
                  if (st.qs) bits.push(`${st.qs} questions`);
                  if (st.atts) bits.push(`${st.atts} attempt${st.atts === 1 ? "" : "s"}`);
                  if (st.best !== null) bits.push(`best ${st.best}%`);
                  return <div className="text-[12.5px] text-[var(--v-muted)] mt-1">{bits.join(" · ") || "Empty subject — add a chapter below."}</div>;
                })()}
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={(e) => openMenu(e, { kind: "sub", subId: s.id })} style={{ "--neon": "#8b5cf6" }} className="neon w-10 h-10 rounded-xl f3d-pill font-extrabold" title="Subject options">•••</button>
              </div>
            </div>
            {expanded[s.id] ? (
              <div className="mt-4 grid gap-3 page-in" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
                {s.chapters.map((c) => chapterCard(s, c, false))}
                {addTile(s, false, s.chapters.length === 0)}
              </div>
            ) : (
              <div className="mt-4 relative">
                {s.chapters.length > 1 && (
                  <>
                    <button onClick={() => scrollRow(s.id, -1)} title="Scroll left" style={{ "--neon": "#8b5cf6" }}
                      className="neon absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full f3d-pill font-extrabold">‹</button>
                    <button onClick={() => scrollRow(s.id, 1)} title="Scroll right" style={{ "--neon": "#8b5cf6" }}
                      className="neon absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full f3d-pill font-extrabold">›</button>
                  </>
                )}
                <div ref={(el) => { rowRefs.current[s.id] = el; }}
                  className="flex gap-3 overflow-x-auto no-scrollbar snap-x px-10 py-1">
                  {s.chapters.map((c) => chapterCard(s, c, true))}
                  {addTile(s, true, false)}
                </div>
              </div>
            )}
            {s.chapters.length > 0 && (
              <div className="mt-1 flex justify-center">
                <button onClick={() => setExpanded((x) => ({ ...x, [s.id]: !x[s.id] }))} style={{ "--neon": "#8b5cf6" }}
                  title={expanded[s.id] ? "Back to scrollable row" : "Expand full subject"}
                  className="neon w-11 h-11 rounded-full f3d-pill text-xl font-extrabold text-violet-600">
                  {expanded[s.id] ? "⌃" : "⌄"}</button>
              </div>
            )}
          </Card>
        ))}
      </main>

      {menu && (
        <Popup rect={menu.rect} onClose={() => setMenu(null)}>
          {menu.kind === "sub" ? (
            <>
              <button onClick={() => { setModal({ mode: "rename", subId: menu.subId }); setMenu(null); }}
                className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">✎ Edit subject</button>
              <button onClick={() => { setModal({ mode: "chapter", subId: menu.subId }); setMenu(null); }}
                className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">＋ Add chapter</button>
              <button onClick={() => { exportSubject(menu.subId); setMenu(null); }}
                className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">⤓ Export subject JSON</button>
              <button onClick={() => { setModal({ mode: "delete", subId: menu.subId }); setMenu(null); }}
                className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold text-red-600 hover:bg-black/5">Delete subject</button>
            </>
          ) : (
            <>
              <button onClick={() => {
                const c = library.subjects.find((x) => x.id === menu.subId)?.chapters.find((x) => x.id === menu.chId);
                setMenu(null);
                if (c) openChapter(menu.subId, c);
              }} className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">▶ Start / resume test</button>
              <button onClick={() => { setMenu(null); setModal({ mode: "chapter-edit", subId: menu.subId, chId: menu.chId }); }}
                className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">✎ Edit chapter</button>
              <button onClick={() => {
                const c = library.subjects.find((x) => x.id === menu.subId)?.chapters.find((x) => x.id === menu.chId);
                setMenu(null);
                if (c) { setHist({ subjectId: menu.subId, chapterId: menu.chId, title: c.title }); setTick((t) => t + 1); }
              }} className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">◷ Attempt history</button>
              <button onClick={() => {
                const c = library.subjects.find((x) => x.id === menu.subId)?.chapters.find((x) => x.id === menu.chId);
                setMenu(null);
                if (c) deleteChapterEverywhere(menu.subId, menu.chId, c.title);
              }} className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold text-red-600 hover:bg-black/5">Delete chapter</button>
            </>
          )}
        </Popup>
      )}
      {modal && <LibraryModal modal={modal} close={() => setModal(null)} mutate={mutate} library={library} />}
      {hist && <HistoryModal hist={hist} go={go}
        close={() => setHist(null)} refresh={() => setTick((t) => t + 1)} />}
      {dsModal && (
        <Modal title={`“${dsModal.title}” needs questions`} okText="Cancel" onClose={() => setDsModal(null)}
          onOk={() => setDsModal(null)}>
          <p className="mt-3 text-sm text-[var(--v-muted)]">
            Link a dataset in the Vertex exam JSON format — upload your own file or try the bundled sample set.
          </p>
          <div className="mt-4 grid gap-2.5">
            <button onClick={() => dsFileRef.current?.click()} style={{ "--neon": "#8b5cf6" }}
              className="neon f3d rounded-2xl p-4 flex items-center gap-3 text-left">
              <span className="f3d-orb rounded-xl" style={{ width: 42, height: 42, background: "linear-gradient(180deg,#8db4f0,#2f6fd0)", color: "#fff" }}>
                <Ico n="upload" s={22} />
              </span>
              <span><b className="text-sm block">Upload JSON file</b>
                <span className="text-xs text-[var(--v-muted)]">Same format as the Upload page</span></span>
            </button>
            <button onClick={() => linkAndLaunch(dsModal.subjectId, dsModal.chapterId, sampleProfitLoss, "Profit & Loss sample")} style={{ "--neon": "#22c55e" }}
              className="neon f3d rounded-2xl p-4 flex items-center gap-3 text-left">
              <span className="f3d-orb rounded-xl" style={{ width: 42, height: 42, background: "linear-gradient(180deg,#8fe3b6,#34b87a)", color: "#fff" }}>
                <Ico n="doc" s={22} />
              </span>
              <span><b className="text-sm block">Load sample: Profit &amp; Loss</b>
                <span className="text-xs text-[var(--v-muted)]">12 questions · Quick Revision / Set 1 / Set 2</span></span>
            </button>
          </div>
          <input ref={dsFileRef} type="file" accept="application/json,.json" hidden onChange={(e) => {
            const f = e.target.files[0];
            e.target.value = "";
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              try {
                linkAndLaunch(dsModal.subjectId, dsModal.chapterId, JSON.parse(r.result), f.name);
              } catch { showToast("That file is not valid JSON."); }
            };
            r.readAsText(f);
          }} />
        </Modal>
      )}
    </div>
  );
}

/* Small floating popup — portalled to <body>, position:fixed in pure
   viewport coordinates. It only ever overlays; it touches no layout. */
function Popup({ rect, onClose, children }) {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  const left = Math.max(8, Math.min(rect.right - 200, window.innerWidth - 208));
  return createPortal(
    <div className="fixed z-[80] f3d !rounded-[14px] min-w-[192px] max-w-[220px] p-1.5 page-in"
      style={{ top: rect.bottom + 8, left }} onClick={(e) => e.stopPropagation()}>
      {children}
    </div>,
    document.body
  );
}

function HistoryModal({ hist, go, close, refresh }) {
  const { showToast } = useVertex();
  const [list, setList] = useState(() => chapterAttempts(hist.chapterId));
  const reload = () => { setList(chapterAttempts(hist.chapterId)); refresh(); };
  return (
    <Modal title={`History — ${hist.title}`} okText="Done" onClose={close} onOk={close}>
      <div className="mt-3 space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
        {list.length === 0 && (
          <p className="text-sm text-[var(--v-muted)] text-center py-6">No attempts yet.</p>
        )}
        {list.map((a) => {
          const r = toRecord(a);
          return (
            <div key={a.id} className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] p-3.5">
              <div className="flex items-center gap-2 text-sm">
                <b className="text-[15px]">{r.percentage}</b>
                <span className={`text-[11px] font-bold rounded-full px-2.5 py-0.5 ${r.status === "completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-[#fff4e8] text-[#c2570b] border border-[#ffd9b8]"}`}>
                  {r.status === "completed" ? "Completed" : "In progress"}
                </span>
                <span className="ml-auto text-xs text-[var(--v-muted)]">{fmtDate(r.updatedAt)}</span>
              </div>
              <div className="mt-1 text-xs text-[var(--v-muted)]">
                {r.answeredCount} / {r.totalQuestions} answered · Score {r.score} · {Math.round(r.timeSpentSec / 60)}m {String(Math.round(r.timeSpentSec % 60)).padStart(2, "0")}s
              </div>
              <div className="mt-2.5 flex gap-2">
                {r.status === "in_progress"
                  ? <button onClick={() => { close(); go("player", { attemptId: a.id }); }}
                    className="f3d-btn f3d-btn-violet rounded-lg px-3.5 py-1.5 text-xs font-bold">Resume →</button>
                  : <button onClick={() => { close(); go("result", { attemptId: a.id }); }}
                    className="f3d-btn f3d-btn-violet rounded-lg px-3.5 py-1.5 text-xs font-bold">View result →</button>}
                <button onClick={() => { deleteAttempt(a.id); reload(); showToast("Attempt deleted."); }}
                  className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-red-600 border border-red-200">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

function LibraryModal({ modal, close, mutate, library }) {
  const { showToast, linkDatasetToChapter } = useVertex();
  const existing = modal.subId ? library.subjects.find((s) => s.id === modal.subId) : null;
  const existingCh = modal.mode === "chapter-edit" && existing
    ? existing.chapters.find((c) => c.id === modal.chId) : null;
  const [title, setTitle] = useState(existingCh ? existingCh.title : (existing && modal.mode !== "chapter" ? existing.title : ""));
  const [desc, setDesc] = useState(existingCh ? (existingCh.desc ?? "") : (existing && modal.mode !== "chapter" ? existing.desc ?? "" : ""));
  const [tint, setTint] = useState(existingCh ? existingCh.tint : (existing?.tint ?? "pink"));
  const [icon, setIcon] = useState(existing?.icon ?? "book");
  const [subId, setSubId] = useState(modal.subId ?? library.subjects[0]?.id);
  const [pendingJson, setPendingJson] = useState(null); // {raw, label} chosen in-modal
  const [pendingLabel, setPendingLabel] = useState("");
  const chFileRef = useRef(null);

  const pickJsonFile = (f, done) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const raw = JSON.parse(r.result);
        done({ raw, label: f.name });
      } catch { showToast("That file is not valid JSON."); }
    };
    r.readAsText(f);
  };

  if (modal.mode === "delete" && existing) {
    return (
      <Modal title="Delete subject?" okText="Delete" danger onClose={close} onOk={() => {
        existing.chapters.forEach((c) => chapterAttempts(c.id).forEach((a) => deleteAttempt(a.id)));
        mutate((d) => { d.subjects = d.subjects.filter((s) => s.id !== existing.id); });
        close(); showToast("Subject and its attempts deleted.");
      }}>
        <p className="mt-3 text-sm text-[var(--v-muted)]">“{existing.title}”, its {existing.chapters.length} chapter(s) and all their attempts will be removed.</p>
      </Modal>
    );
  }
  if (modal.mode === "chapter" || modal.mode === "chapter-edit") {
    const isEdit = modal.mode === "chapter-edit" && existingCh;
    let linkedInfo = null;
    if (isEdit && existingCh.dataset) {
      try {
        const nz = normalizeExam(existingCh.dataset);
        linkedInfo = `${nz.title} · ${nz.questions.length} questions`;
      } catch { linkedInfo = "Linked dataset (unreadable)"; }
    }
    return (
      <Modal title={isEdit ? "Edit chapter" : "Add chapter"} okText={isEdit ? "Save" : "Create"} onClose={close} onOk={() => {
        if (!title.trim() || (!isEdit && !subId)) return;
        if (isEdit) {
          mutate((d) => {
            const c = d.subjects.find((x) => x.id === modal.subId)?.chapters.find((x) => x.id === modal.chId);
            if (c) Object.assign(c, { title: title.trim(), desc: desc.trim(), tint });
          });
          if (pendingJson) {
            const r = linkDatasetToChapter(modal.subId, modal.chId, pendingJson.raw);
            if (r.error) { showToast("Invalid dataset — " + r.error); return; }
            showToast(`Dataset linked (${r.count} questions).`);
          } else showToast("Chapter saved.");
        } else {
          const newId = uid("ch");
          mutate((d) => {
            const s = d.subjects.find((x) => x.id === subId);
            s?.chapters.push({ id: newId, title: title.trim(), desc: desc.trim(), tint });
          });
          if (pendingJson) {
            const r = linkDatasetToChapter(subId, newId, pendingJson.raw);
            if (r.error) showToast("Chapter added, but dataset invalid — " + r.error);
            else showToast(`Chapter added with ${r.count} questions.`);
          } else showToast("Chapter added — link a dataset to start testing.");
        }
        close();
      }}>
        {!isEdit && (
          <Field label="Subject">
            <select value={subId} onChange={(e) => setSubId(e.target.value)}
              className="w-full border border-[var(--v-line)] rounded-xl px-3.5 py-3 text-sm bg-[var(--v-bg)]">{
                library.subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)
              }</select>
          </Field>
        )}
        <Field label="Chapter name"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tenses" maxLength={60} /></Field>
        <Field label="Description (optional)"><TextInput value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What does it cover?" maxLength={120} /></Field>
        <TintRow tint={tint} setTint={setTint} />
        <div className="mt-3.5">
          <span className="block text-xs font-bold text-[var(--v-muted)] mb-1.5 tracking-wide">QUESTION DATASET (JSON){isEdit ? "" : " — OPTIONAL"}</span>
          {(pendingJson || linkedInfo) && (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--v-line)] bg-[var(--v-bg)] px-3.5 py-2.5 text-[13px] mb-2">
              <b className="truncate">{pendingJson ? `${pendingLabel} (new)` : linkedInfo}</b>
              <button onClick={() => {
                if (pendingJson) { setPendingJson(null); setPendingLabel(""); }
                else mutate((d) => {
                  const c = d.subjects.find((x) => x.id === modal.subId)?.chapters.find((x) => x.id === modal.chId);
                  if (c) delete c.dataset;
                });
              }} className="ml-auto text-xs font-bold text-red-600 shrink-0">Remove</button>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => chFileRef.current?.click()} style={{ "--neon": "#8b5cf6" }}
              className="neon flex-1 rounded-xl border border-[var(--v-line)] px-3 py-2.5 text-[13px] font-bold">⤒ Upload file</button>
            <button onClick={() => { setPendingJson({ raw: sampleProfitLoss }); setPendingLabel("Profit & Loss sample"); }} style={{ "--neon": "#22c55e" }}
              className="neon flex-1 rounded-xl border border-[var(--v-line)] px-3 py-2.5 text-[13px] font-bold">✦ Use sample</button>
          </div>
          <input ref={chFileRef} type="file" accept="application/json,.json" hidden onChange={(e) => {
            const f = e.target.files[0];
            e.target.value = "";
            pickJsonFile(f, ({ raw, label }) => { setPendingJson({ raw }); setPendingLabel(label); });
          }} />
          <p className="mt-2 text-xs text-[var(--v-muted)]">Question count comes straight from the file — asked here, no second popup.</p>
        </div>
      </Modal>
    );
  }
  return (
    <Modal title={modal.mode === "rename" ? "Edit subject" : "Add subject"} okText={modal.mode === "rename" ? "Save" : "Create"}
      onClose={close} onOk={() => {
        if (!title.trim()) return;
        if (existing) {
          mutate((d) => {
            const s = d.subjects.find((x) => x.id === existing.id);
            Object.assign(s, { title: title.trim(), desc: desc.trim(), tint, icon });
          });
          showToast("Subject saved.");
        } else {
          mutate((d) => { d.subjects.push({ id: uid("sub"), title: title.trim(), desc: desc.trim(), icon, tint, chapters: [] }); });
          showToast("Subject added.");
        }
        close();
      }}>
      <Field label="Subject name"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History" maxLength={60} /></Field>
      <Field label="Description"><TextInput value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What lives inside?" maxLength={120} /></Field>
      <div className="mt-3.5">
        <span className="block text-xs font-bold text-[var(--v-muted)] mb-1.5 tracking-wide">ICON</span>
        <div className="flex gap-2 flex-wrap">
          {ICON_CHOICES.map((c) => (
            <button key={c.k} title={c.label} onClick={() => setIcon(c.k)}
              className={`w-[46px] h-[46px] rounded-[13px] flex items-center justify-center transition-all ${c.k === icon ? "ring-2 ring-offset-2 ring-violet-600 scale-105" : "opacity-70 hover:opacity-100"}`}
              style={{ background: TINT_GRAD[tint], color: "#fff", boxShadow: "inset 2px 2px 4px rgba(255,255,255,.5), 0 4px 10px rgba(0,0,0,.12)" }}>
              <Ico n={c.k} s={22} />
            </button>
          ))}
        </div>
      </div>
      <TintRow tint={tint} setTint={setTint} />
    </Modal>
  );
}

function TintRow({ tint, setTint }) {
  return (
    <div className="mt-3.5">
      <span className="block text-xs font-bold text-[var(--v-muted)] mb-1.5 tracking-wide">Colour</span>
      <div className="flex gap-2">
        {TINT_FIX.map((t) => (
          <span key={t} title={t} onClick={() => setTint(t)}
            className={`w-[34px] h-[34px] rounded-[11px] cursor-pointer ${t === tint ? "ring-2 ring-offset-2 ring-slate-800" : ""}`}
            style={{ background: TINT_GRAD[t], boxShadow: "inset 2px 2px 4px rgba(255,255,255,.5), 0 4px 10px rgba(0,0,0,.12)" }} />
        ))}
      </div>
    </div>
  );
}
