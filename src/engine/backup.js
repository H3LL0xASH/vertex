/* VERTEX backup engine — one format for export/import that auto-detects.
   Export writes { kind:'vertex-library-backup', subjects, attempts }.
   Import accepts, in order:
     1. vertex backup  -> restores library + merges attempts
     2. subject list   -> replaces library ({subjects} or bare array)
     3. exam dataset   -> becomes a new subject (auto-created, dataset linked)
   Anything else is rejected with a plain-language error. */
import { validateExam } from "./examFormat.js";
import { uid } from "../data/seed.js";

export const BACKUP_KIND = "vertex-library-backup";
export const BACKUP_VERSION = 1;

function validChapter(c) {
  return c && typeof c.id === "string" && typeof c.title === "string";
}
function validSubject(s) {
  return s && typeof s.id === "string" && typeof s.name === "string" &&
    Array.isArray(s.chapters) && s.chapters.every(validChapter);
}
// our library shape uses title/subjectId instead of name — accept both
function validLibSubject(s) {
  return s && typeof s.id === "string" && typeof s.title === "string" &&
    Array.isArray(s.chapters) && s.chapters.every((c) => validChapter(c));
}

/** Strip legacy dummy stat fields; stamp creation times; keep datasets. */
export function normalizeSubjects(list) {
  const now = Date.now();
  return (list || []).map((s, si) => ({
    id: String(s.id || uid("sub")),
    title: String(s.title ?? s.name ?? "Untitled"),
    desc: s.desc || "",
    icon: s.icon || "book",
    tint: s.tint || "pink",
    createdAt: typeof s.createdAt === "number" ? s.createdAt : now - (list.length - si) * 1000,
    chapters: (s.chapters || []).map((c, ci) => {
      const out = {
        id: String(c.id || uid("ch")),
        title: String(c.title ?? c.name ?? "Untitled"),
        desc: c.desc || "",
        tint: c.tint || "blue",
        createdAt: typeof c.createdAt === "number" ? c.createdAt : now - (list.length - si) * 1000 - ci,
      };
      if (c.dataset) out.dataset = c.dataset;
      if (typeof c.total === "number") out.total = c.total;
      return out;
    }),
  }));
}

export function detectBackup(text) {
  let d;
  try {
    d = JSON.parse(String(text || ""));
  } catch {
    return { kind: "invalid", error: "That file is not valid JSON." };
  }
  if (d && d.kind === BACKUP_KIND && Array.isArray(d.subjects) &&
      d.subjects.every((s) => validLibSubject(s) || validSubject(s))) {
    return { kind: "vertex-backup", data: d };
  }
  const list = Array.isArray(d) ? d : d?.subjects;
  if (Array.isArray(list) && list.length >= 0 &&
      list.every((s) => validLibSubject(s) || validSubject(s))) {
    return { kind: "library", data: { subjects: list } };
  }
  const v = validateExam(d || {});
  if (v.valid) return { kind: "exam", data: d };
  return { kind: "invalid", error: "Unrecognized file — expected a Vertex backup, a subject list, or an exam dataset." };
}

/** selection: Map(subId -> Set(chapterIds) | "all"). Null = everything. */
export function buildBackup(library, attempts, selection) {
  const subjects = [];
  const chapterIds = new Set();
  (library.subjects || []).forEach((s) => {
    const sel = selection?.get(s.id);
    if (selection && sel === undefined) return;
    const chapters = (s.chapters || []).filter(
      (c) => !selection || sel === "all" || (sel instanceof Set && sel.has(c.id)));
    if (!chapters.length) return;
    chapters.forEach((c) => chapterIds.add(c.id));
    subjects.push({ ...s, chapters });
  });
  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    subjects,
    attempts: (attempts || []).filter((a) => chapterIds.has(a.chapterId)),
  };
}

export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 300);
}

/** Turn an exam dataset into a ready-to-test subject (auto-create path). */
export function examToSubject(raw) {
  const title = String(raw.title || "Imported test");
  const sid = uid("sub");
  const cid = uid("ch");
  return {
    subject: {
      id: sid, title, desc: "Imported question dataset.",
      icon: "doc", tint: "blue", createdAt: Date.now(),
      chapters: [{
        id: cid, title: "Full set",
        desc: `${(raw.questions || []).length} questions`,
        tint: "blue", createdAt: Date.now(), dataset: raw,
      }],
    },
    count: (raw.questions || []).length,
  };
}
