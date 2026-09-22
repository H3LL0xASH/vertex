import { useEffect, useState, Component } from "react";
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

/* Safety net: a crashing tab shows a fallback instead of a blank page. */
class TabGuard extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error("Tab crashed:", err); }
  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="f3d p-10 text-center max-w-md">
            <h2 className="text-xl font-extrabold">Something glitched on this tab</h2>
            <p className="text-sm text-[var(--v-muted)] mt-2">Your data is safe. Reload to get back in.</p>
            <button onClick={() => window.location.reload()}
              className="f3d-btn f3d-btn-violet mt-5 rounded-xl px-6 py-3 text-sm font-bold">Reload app</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Shell() {
  const { authed } = useVertex();
  const [tab, setTab] = useState("overview");
  // payload for focus tabs: player { attemptId, review? }, result { attemptId }
  const [payload, setPayload] = useState({});

  const go = (t, p) => {
    const apply = () => {
      setPayload(p || {});
      setTab(t);
      window.scrollTo(0, 0);
    };
    // buttery crossfade between tabs where supported, instant otherwise
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
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
      <TabGuard key={tab}>
        {tab === "overview" && <Overview go={go} />}
        {tab === "library" && <Library go={go} />}
        {tab === "analytics" && <Analytics go={go} />}
        {tab === "upload" && <Upload go={go} />}
        {tab === "player" && (
          <Player attemptId={payload.attemptId} initialReview={payload.review || null} go={go} />
        )}
        {tab === "result" && <Result attemptId={payload.attemptId} go={go} />}
      </TabGuard>
      {withNav && <MobileNav tab={tab} go={go} />}
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
