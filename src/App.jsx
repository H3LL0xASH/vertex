import { useEffect, useState } from "react";
import { VertexProvider } from "./store.jsx";
import { ToastHost } from "./components/ui.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Library from "./pages/Library.jsx";
import Analytics from "./pages/Analytics.jsx";
import Upload from "./pages/Upload.jsx";
import { useVertex } from "./store.jsx";

function Shell() {
  const { authed } = useVertex();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const s = document.querySelector('input[placeholder*="Search"]');
        if (s) { e.preventDefault(); s.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!authed) return (<><Login /><ToastHost /></>);

  return (
    <>
      {tab === "overview" && <Overview go={setTab} />}
      {tab === "library" && <Library go={setTab} />}
      {tab === "analytics" && <Analytics go={setTab} />}
      {tab === "upload" && <Upload go={setTab} />}
      <ToastHost />
    </>
  );
}

export default function App() {
  return (
    <VertexProvider>
      <Shell />
    </VertexProvider>
  );
}
