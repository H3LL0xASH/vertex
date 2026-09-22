import { useRef, useState } from "react";
import { useVertex } from "../store.jsx";
import { uid } from "../data/seed.js";
import { Card, Ico } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

export default function Upload({ go }) {
  const { setLibrary, showToast } = useVertex();
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  const ingest = (f) => {
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
        showToast(`Dataset loaded — ${arr.length} subject(s). See Library.`);
      } catch { showToast("Could not read that JSON file"); }
    };
    r.readAsText(f);
  };

  return (
    <div className="flex min-h-screen">
      <BgBlobs />
      <Sidebar tab="upload" go={go} />
      <main className="flex-1 min-w-0 p-4 px-[22px] pb-10 page-in">
        <Topbar searchPh="Search or command..." search={search} setSearch={setSearch} onLibrary={() => go("library")} />
        <Card float className="mt-3.5 p-[30px]">
          <h1 className="text-[30px] font-extrabold tracking-tight">Upload dataset</h1>
          <p className="mt-2 text-sm text-[var(--v-muted)]">Drop a Vertex JSON file — subjects and chapters land straight in your Library.</p>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} style={{ "--neon": "#8b5cf6" }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`neon mt-5 rounded-3xl border-[2px] border-dashed p-8 sm:p-14 text-center cursor-pointer transition-all ${drag ? "border-violet-500 bg-violet-500/5 scale-[1.01]" : "border-[#c9d2e4]"}`}>
            <span className="f3d-orb rounded-full mx-auto" style={{ width: 72, height: 72, background: "linear-gradient(180deg,#a78bfa,#6d28d9)", color: "#fff" }}>
              <Ico n="upload" s={32} />
            </span>
            <p className="mt-4 font-bold">Drop JSON here, or click to browse</p>
            <p className="text-sm text-[var(--v-muted)] mt-1">{"{ subjects: [{ title, desc, tint, chapters: [{ title, total }] }] }"}</p>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden
              onChange={(e) => { ingest(e.target.files[0]); e.target.value = ""; }} />
          </div>
          <button onClick={() => go("library")} className="f3d-btn f3d-btn-violet mt-5 rounded-xl px-6 py-3.5 text-sm font-bold flex items-center gap-2">
            Open Library <Ico n="arrowR" s={15} />
          </button>
        </Card>
      </main>
    </div>
  );
}
