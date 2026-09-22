import { useMemo, useRef, useState } from "react";
import { useVertex } from "../store.jsx";
import { uid, TINT_GRAD } from "../data/seed.js";
import { sampleProfitLoss } from "../data/sampleProfitLoss.js";
import { Card, Ico, Orb, Modal, Field, TextInput } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

const TINT_FIX = ["pink", "blue", "green", "orange", "purple", "teal"];
const DOC_FG = { pink: "#d64a56", blue: "#2f6fd0", green: "#1d9e5e", orange: "#d97a1f", purple: "#6d28d9", teal: "#149a90" };
const DOC_BG = { pink: "#fbdfe2", blue: "#dde8fa", green: "#d9f2e2", orange: "#fbe7cf", purple: "#e6dcfb", teal: "#d3efec" };
const NEON = { pink: "#f43f5e", blue: "#3b82f6", green: "#22c55e", orange: "#f97316", purple: "#8b5cf6", teal: "#14b8a6" };

export default function Library({ go }) {
  const { library, setLibrary, resetLibrary, showToast, launchChapter, startAttempt } = useVertex();
  const [q, setQ] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [menu, setMenu] = useState(null); // {x,y,subId}
  const [modal, setModal] = useState(null); // {mode, subId, ...}
  const [dsModal, setDsModal] = useState(null); // {subjectId, chapterId, title}
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
              status: c.status === "progress" ? "progress" : "not",
              pct: c.pct || 0, answered: c.answered || 0, total: c.total || 0, score: c.score || 0, tint: c.tint || "blue",
            })),
          })),
        });
        setCollapsed({});
        showToast(`Imported ${arr.length} subject(s)`);
      } catch { showToast("Could not read that JSON file"); }
    };
    r.readAsText(f);
  };

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
        {shown.length === 0 && (
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
              <div>
                <h2 className="text-xl font-extrabold">{s.title}
                  <span className="inline-block ml-2.5 align-middle text-[11.5px] font-bold text-[#5b647c] bg-[#eef1f8] border border-[var(--v-line)] rounded-full px-3 py-1">
                    {s.chapters.length} chapter{s.chapters.length === 1 ? "" : "s"}</span></h2>
                <div className="text-[12.5px] text-[var(--v-muted)] mt-1">{s.desc}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={(e) => {
                  e.stopPropagation();
                  const r = e.currentTarget.getBoundingClientRect();
                  setMenu({ x: Math.max(8, r.right + window.scrollX - 180), y: r.bottom + window.scrollY + 8, subId: s.id });
                }} style={{ "--neon": "#8b5cf6" }} className="neon w-10 h-10 rounded-xl f3d-pill font-extrabold" title="Subject options">•••</button>
                <button onClick={() => setCollapsed((c) => ({ ...c, [s.id]: !c[s.id] }))} style={{ "--neon": "#8b5cf6" }}
                  className={`neon w-10 h-10 rounded-xl f3d-pill font-extrabold transition-transform ${collapsed[s.id] ? "rotate-180" : ""}`} title="Collapse">︿</button>
              </div>
            </div>
            {!collapsed[s.id] && (
              <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}>
                {s.chapters.map((c) => (
                  <div key={c.id} onClick={() => openChapter(s.id, c)}
                    className={`neon cht cht-${c.tint || "blue"} rounded-2xl p-4 flex gap-3 items-start shadow-[0_8px_20px_rgba(35,45,80,.07)] hover:-translate-y-[3px] transition-transform cursor-pointer`}
                    style={{ "--neon": NEON[c.tint] ?? NEON.blue }}>
                    <span className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center shadow-[inset_2px_3px_6px_rgba(255,255,255,.6),0_6px_14px_rgba(0,0,0,.1)]"
                      style={{ background: DOC_BG[c.tint] ?? DOC_BG.blue, color: DOC_FG[c.tint] ?? DOC_FG.blue }}>
                      <Ico n="doc" s={26} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-bold truncate">{c.title}</h3>
                      {c.status === "progress"
                        ? <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-[#fde8d4] text-[#c2570b] border border-[#f5cfa5]">In progress · {c.pct}%</span>
                        : <span className="inline-block mt-[7px] text-[11px] font-bold rounded-full px-[11px] py-1 bg-[#eef1f7] text-[#5b647c] border border-[#dde3ee]">Not started</span>}
                      <div className="text-[11.5px] text-[#8b91a7] mt-[7px]">
                        {c.status === "progress" ? `${c.answered} / ${c.total} answered` : `0 / ${c.total} questions`} · Score {c.score}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openChapter(s.id, c); }}
                      className="ml-auto self-center w-[38px] h-[38px] rounded-full shrink-0 bg-white/90 border border-black/5 flex items-center justify-center text-[#3b4370] shadow-[0_6px_14px_rgba(35,45,80,.12)] hover:scale-110 transition-transform">→</button>
                  </div>
                ))}
                <button onClick={() => setModal({ mode: "chapter", subId: s.id })} style={{ "--neon": "#8b5cf6" }}
                  className={`neon rounded-2xl min-h-[118px] flex flex-col gap-2 items-center justify-center text-[13px] font-semibold text-[#5b647c] border-[1.5px] border-dashed border-[#c9d2e4] hover:border-violet-500 hover:text-violet-700 hover:bg-violet-500/5 transition-all ${s.chapters.length === 0 ? "[grid-column:1/-1] min-h-[96px]" : ""}`}>
                  <span className="w-[38px] h-[38px] rounded-full f3d-pill flex items-center justify-center text-xl">＋</span>
                  Add Chapter
                </button>
              </div>
            )}
          </Card>
        ))}
      </main>

      {menu && (
        <div className="fixed z-[60] f3d !rounded-[14px] min-w-[160px] p-1.5" style={{ top: menu.y, left: menu.x }} onClick={(e) => e.stopPropagation()}>
          <button onClick={() => { setModal({ mode: "rename", subId: menu.subId }); setMenu(null); }}
            className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold hover:bg-black/5">Rename subject</button>
          <button onClick={() => { setModal({ mode: "delete", subId: menu.subId }); setMenu(null); }}
            className="block w-full text-left px-3 py-2.5 rounded-[9px] text-[13px] font-semibold text-red-600 hover:bg-black/5">Delete subject</button>
        </div>
      )}
      {modal && <LibraryModal modal={modal} close={() => setModal(null)} mutate={mutate} library={library} />}
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

function LibraryModal({ modal, close, mutate, library }) {
  const { showToast } = useVertex();
  const existing = modal.subId ? library.subjects.find((s) => s.id === modal.subId) : null;
  const [title, setTitle] = useState(existing && modal.mode !== "chapter" ? existing.title : "");
  const [desc, setDesc] = useState(existing && modal.mode !== "chapter" ? existing.desc ?? "" : "");
  const [tint, setTint] = useState(existing?.tint ?? "pink");
  const [subId, setSubId] = useState(modal.subId ?? library.subjects[0]?.id);
  const [total, setTotal] = useState(50);

  if (modal.mode === "delete" && existing) {
    return (
      <Modal title="Delete subject?" okText="Delete" danger onClose={close} onOk={() => {
        mutate((d) => { d.subjects = d.subjects.filter((s) => s.id !== existing.id); });
        close(); showToast("Subject deleted");
      }}>
        <p className="mt-3 text-sm text-[var(--v-muted)]">“{existing.title}” and its {existing.chapters.length} chapter(s) will be removed.</p>
      </Modal>
    );
  }
  if (modal.mode === "chapter") {
    return (
      <Modal title="Add chapter" okText="Create" onClose={close} onOk={() => {
        if (!title.trim() || !subId) return;
        mutate((d) => {
          const s = d.subjects.find((x) => x.id === subId);
          s?.chapters.push({ id: uid("ch"), title: title.trim(), status: "not", pct: 0, answered: 0, total: Math.max(0, total | 0), score: 0, tint });
        });
        close(); showToast("Chapter added");
      }}>
        <Field label="Subject">
          <select value={subId} onChange={(e) => setSubId(e.target.value)}
            className="w-full border border-[var(--v-line)] rounded-xl px-3.5 py-3 text-sm bg-[var(--v-bg)]">{
              library.subjects.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)
            }</select>
        </Field>
        <Field label="Chapter name"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Tenses" maxLength={60} /></Field>
        <Field label="Questions"><TextInput type="number" min={0} max={1000} value={total} onChange={(e) => setTotal(+e.target.value)} /></Field>
        <TintRow tint={tint} setTint={setTint} />
      </Modal>
    );
  }
  return (
    <Modal title={modal.mode === "rename" ? "Rename subject" : "Add subject"} okText={modal.mode === "rename" ? "Save" : "Create"}
      onClose={close} onOk={() => {
        if (!title.trim()) return;
        if (existing) {
          mutate((d) => {
            const s = d.subjects.find((x) => x.id === existing.id);
            Object.assign(s, { title: title.trim(), desc: desc.trim(), tint });
          });
          showToast("Subject renamed");
        } else {
          mutate((d) => { d.subjects.push({ id: uid("sub"), title: title.trim(), desc: desc.trim(), icon: "book", tint, chapters: [] }); });
          showToast("Subject added");
        }
        close();
      }}>
      <Field label="Subject name"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. History" maxLength={60} /></Field>
      <Field label="Description"><TextInput value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What lives inside?" maxLength={120} /></Field>
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
