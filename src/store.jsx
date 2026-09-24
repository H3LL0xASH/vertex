import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { librarySeed } from "./data/seed.js";
import { normalizeExam, validateExam } from "./engine/examFormat.js";
import { createAttempt, latestAttemptForChapter, getAttempt } from "./engine/attempts.js";

const Ctx = createContext(null);
const get = (k, fb) => {
  try { return localStorage.getItem(k) ?? fb; } catch { return fb; }
};
const set = (k, v) => {
  try { localStorage.setItem(k, v); } catch { /* ignore */ }
};

export function VertexProvider({ children }) {
  const [user] = useState(() => {
    const p = new URLSearchParams(location.search).get("name");
    return (p || get("vertexName", "admin") || "admin").trim() || "admin";
  });
  const [authed, setAuthed] = useState(() => get("vertexAuthed", "") === "1");
  const [theme, setTheme] = useState(() => get("vertexTheme", "light"));
  const [navCollapsed, setNavCollapsed] = useState(() => get("vertexNavCollapsed", "") === "1");
  const toggleNav = useCallback(() => {
    setNavCollapsed((c) => {
      const n = !c;
      set("vertexNavCollapsed", n ? "1" : "");
      return n;
    });
  }, []);
  const [library, setLibrary] = useState(() => {
    try {
      const raw = get("vertexLibraryV1", "");
      if (raw) { const d = JSON.parse(raw); if (d?.subjects) return d; }
    } catch { /* fall through */ }
    return structuredClone(librarySeed);
  });
  const [toast, setToast] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const toastTimer = useRef(null);

  useEffect(() => {
    // login screen is always light; the app theme applies once authed
    document.documentElement.dataset.theme = authed ? theme : "light";
    set("vertexTheme", theme);
  }, [theme, authed]);

  useEffect(() => {
    set("vertexLibraryV1", JSON.stringify(library));
  }, [library]);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast("");
  }, []);

  const showToast = useCallback((msg, ms = 2600) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    setToastKey((k) => k + 1);
    // auto-dismiss like a native snackbar; X button dismisses instantly
    toastTimer.current = setTimeout(() => setToast(""), ms);
  }, []);

  const login = useCallback((name) => {
    set("vertexName", name);
    set("vertexAuthed", "1");
    setAuthed(true);
  }, []);
  const logout = useCallback(() => {
    set("vertexAuthed", "");
    setAuthed(false);
  }, []);

  /* ---- exam engine: chapter datasets + attempt launching ----
     Chapter.dataset holds the RAW uploaded JSON (D:\WEB format).
     launchChapter returns { attemptId } or { needDataset: true }. */
  const linkDatasetToChapter = useCallback((subjectId, chapterId, rawJson) => {
    const check = validateExam(rawJson);
    if (!check.valid) return { error: check.errors[0] };
    const exam = normalizeExam(rawJson);
    setLibrary((prev) => {
      const d = structuredClone(prev);
      const sub = d.subjects.find((s) => s.id === subjectId);
      const ch = sub?.chapters.find((c) => c.id === chapterId);
      if (ch) {
        ch.dataset = rawJson;
        ch.total = exam.questions.length;
        if (!ch.tint) ch.tint = "blue";
      }
      return d;
    });
    return { ok: true, count: exam.questions.length };
  }, []);

  const launchChapter = useCallback((subjectId, chapterId) => {
    let chapter = null;
    try {
      const lib = JSON.parse(get("vertexLibraryV1", "") || "{}");
      chapter = lib.subjects?.flatMap((s) => s.chapters.map((c) => ({ ...c, subjectId: s.id })))
        .find((c) => c.id === chapterId) || null;
    } catch { /* ignore */ }
    if (!chapter?.dataset) return { needDataset: true };
    const live = latestAttemptForChapter(chapterId);
    if (live && live.status === "in_progress") return { attemptId: live.id, resumed: true };
    const exam = normalizeExam(chapter.dataset);
    const attempt = createAttempt(exam, { chapterId, subjectId: subjectId || chapter.subjectId });
    return { attemptId: attempt.id };
  }, []);

  /* Synchronous link + launch (avoids stale localStorage reads between
     setState and persist effects). */
  const startAttempt = useCallback((subjectId, chapterId, rawJson) => {
    const check = validateExam(rawJson);
    if (!check.valid) return { error: check.errors[0] };
    const exam = normalizeExam(rawJson);
    setLibrary((prev) => {
      const d = structuredClone(prev);
      const sub = d.subjects.find((s) => s.id === subjectId);
      const ch = sub?.chapters.find((c) => c.id === chapterId);
      if (ch) {
        ch.dataset = rawJson;
        ch.total = exam.questions.length;
        if (!ch.tint) ch.tint = "blue";
      }
      return d;
    });
    const live = latestAttemptForChapter(chapterId);
    if (live && live.status === "in_progress") return { attemptId: live.id, resumed: true, count: exam.questions.length };
    const attempt = createAttempt(exam, { chapterId, subjectId });
    return { attemptId: attempt.id, count: exam.questions.length };
  }, []);

  const value = useMemo(() => ({
    user, authed, login, logout, theme, navCollapsed, toggleNav,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    library, setLibrary,
    resetLibrary: () => setLibrary(structuredClone(librarySeed)),
    toast, toastKey, showToast, dismissToast,
    linkDatasetToChapter, launchChapter, startAttempt, getAttempt,
  }), [user, authed, login, logout, theme, navCollapsed, toggleNav, library, toast, toastKey, showToast, dismissToast,
    linkDatasetToChapter, launchChapter, startAttempt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useVertex = () => useContext(Ctx);
