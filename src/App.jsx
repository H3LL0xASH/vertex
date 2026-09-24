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

const NAV_TABS = ["overview", "library", "analytics", "upload"];

/* Hash routes — refresh persistence + browser Back/Forward for free:
   #/overview #/library #/analytics #/upload
   #/player/<attemptId>?review=WRONG|UNATTEMPTED|MARKED
   #/result/<attemptId> */
function routeToHash(tab, payload) {
  if (tab === "player" && payload?.attemptId) {
    return `#/player/${payload.attemptId}${payload.review ? `?review=${payload.review}` : ""}`;
  }
  if (tab === "result" && payload?.attemptId) return `#/result/${payload.attemptId}`;
  if (NAV_TABS.includes(tab)) return `#/${tab}`;
  return "#/overview";
}
function parseHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  const qi = h.indexOf("?");
  const segs = (qi === -1 ? h : h.slice(0, qi)).split("/").filter(Boolean);
  const params = new URLSearchParams(qi === -1 ? "" : h.slice(qi + 1));
  if (segs[0] === "player" && segs[1]) {
    return { tab: "player", payload: { attemptId: segTranslate(segs[1]), review: params.get("review") || null } };
  }
  if (segs[0] === "result" && segs[1]) {
    return { tab: "result", payload: { attemptId: segTranslate(segs[1]) } };
  }
  if (NAV_TABS.includes(segs[0])) return { tab: segs[0], payload: {} };
  return { tab: "overview", payload: {} };
}
function segTranslate(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

function Shell() {
  const { authed } = useVertex();
  const [tab, setTab] = useState(() => (authed ? parseHash().tab : "overview"));
  // payload for focus tabs: player { attemptId, review? }, result { attemptId }
  const [payload, setPayload] = useState(() => (authed ? parseHash().payload : {}));

  const applyState = (t, p) => {
    const run = () => {
      setPayload(p || {});
      setTab(t);
      window.scrollTo(0, 0);
    };
    // buttery crossfade between tabs where supported, instant otherwise
    if (document.startViewTransition) document.startViewTransition(run);
    else run();
  };

  const go = (t, p) => {
    const target = routeToHash(t, p);
    if (window.location.hash === target) {
      // same URL (re-click, or review mode change): apply directly
      applyState(t, p);
      return;
    }
    // new URL: let the hashchange listener apply it (Back-button safe)
    window.location.hash = target;
  };

  useEffect(() => {
    const onHash = () => {
      const { tab: t, payload: p } = parseHash();
      applyState(t, p);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const withNav = NAV_TABS.includes(tab);
  return (
    <div className={withNav ? "pb-24 lg:pb-0" : ""}>
      <TabGuard key={tab + (payload.attemptId || "") + (payload.review || "")}>
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
