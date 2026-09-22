import { useEffect, useState } from "react";
import { VertexProvider } from "./store.jsx";
import { ToastHost } from "./components/ui.jsx";
import { MobileNav } from "./components/Shell.jsx";
import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Library from "./pages/Library.jsx";
import Analytics from "./pages/Analytics.jsx";
import Upload from "./pages/Upload.jsx";
import Player from "./pages/Player.jsx";
import Result from "./pages/Result.jsx";
import { useVertex } from "./store.jsx";

function Shell() {
  const { authed } = useVertex();
  const [tab, setTab] = useState("overview");
  // payload for focus tabs: player { attemptId, review? }, result { attemptId }
  const [payload, setPayload] = useState({});

  const go = (t, p) => {
    setPayload(p || {});
    setTab(t);
    window.scrollTo({ top: 0 });
  };

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

  const withNav = ["overview", "library", "analytics", "upload"].includes(tab);
  return (
    <div className={withNav ? "pb-24 lg:pb-0" : ""}>
      {tab === "overview" && <Overview go={go} />}
      {tab === "library" && <Library go={go} />}
      {tab === "analytics" && <Analytics go={go} />}
      {tab === "upload" && <Upload go={go} />}
      {tab === "player" && (
        <Player attemptId={payload.attemptId} initialReview={payload.review || null} go={go} />
      )}
      {tab === "result" && <Result attemptId={payload.attemptId} go={go} />}
      {withNav && <MobileNav tab={tab} go={setTab} />}
      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <VertexProvider>
      <Shell />
    </VertexProvider>
  );
}
