import { useRef, useState } from "react";
import { useVertex } from "../store.jsx";
import { detectBackup, normalizeSubjects, examToSubject } from "../engine/backup.js";
import { mergeAttempts } from "../engine/attempts.js";
import { Card, Ico } from "../components/ui.jsx";
import { Sidebar, Topbar, BgBlobs } from "../components/Shell.jsx";

export default function Upload({ go }) {
  const { setLibrary, showToast, withBusy } = useVertex();
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  // same auto-detect as Library import: backup, subject list, or exam dataset
  const ingest = (f) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = async () => {
      await withBusy("Reading file…", async () => {
        const found = detectBackup(r.result);
        if (found.kind === "invalid") { showToast(found.error); return; }
        if (found.kind === "exam") {
          const made = examToSubject(found.data);
          setLibrary((prev) => ({ subjects: [...prev.subjects, made.subject] }));
          showToast(`Dataset detected — created “${made.subject.title}” (${made.count} questions). See Library.`);
          return;
        }
        setLibrary({ subjects: normalizeSubjects(found.data.subjects) });
        let extra = "";
        if (found.kind === "vertex-backup") {
          const n = mergeAttempts(found.data.attempts || []);
          if (n) extra = ` + ${n} attempt${n === 1 ? "" : "s"}`;
        }
        showToast(`Loaded ${found.data.subjects.length} subject(s)${extra}. See Library.`);
      });
    };
    r.readAsText(f);
  };

  return (
    <div className="flex min-h-screen">
      <BgBlobs />
      <Sidebar tab="upload" go={go} />
      <main className="flex-1 min-w-0 p-3 sm:p-4 sm:px-[22px] pb-10 page-in">
        <Topbar hideSearch onLibrary={() => go("library")} />
        <Card float className="mt-3.5 p-5 sm:p-[30px]">
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
