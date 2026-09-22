import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { librarySeed, attemptsSeed } from "./data/seed.js";

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
  const [library, setLibrary] = useState(() => {
    try {
      const raw = get("vertexLibraryV1", "");
      if (raw) { const d = JSON.parse(raw); if (d?.subjects) return d; }
    } catch { /* fall through */ }
    return structuredClone(librarySeed);
  });
  const [toast, setToast] = useState("");
  const [toastKey, setToastKey] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    set("vertexTheme", theme);
  }, [theme]);

  useEffect(() => {
    set("vertexLibraryV1", JSON.stringify(library));
  }, [library]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setToastKey((k) => k + 1);
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

  const value = useMemo(() => ({
    user, authed, login, logout, theme,
    toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    library, setLibrary,
    resetLibrary: () => setLibrary(structuredClone(librarySeed)),
    attempts: attemptsSeed,
    toast, toastKey, showToast,
  }), [user, authed, login, logout, theme, library, toast, toastKey, showToast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useVertex = () => useContext(Ctx);
