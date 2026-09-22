/* VERTEX shared shell — sidebar / topbar / theme / user / shortcuts.
   Every page includes this AFTER store.js and calls VertexLayout.init().
   Classic script (file:// safe). React port: <AppShell> component. */
window.VertexLayout = (function () {
  var ROUTES = { overview: "dashboard.html", library: "library.html" };
  var SOON = { analytics: "Analytics — coming next", upload: "Upload dataset — coming next" };

  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast"; t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  function user() {
    var n = "";
    try {
      n = new URLSearchParams(location.search).get("name") ||
          localStorage.getItem("vertexName") || "admin";
    } catch (e) { n = "admin"; }
    return (n || "admin").trim() || "admin";
  }

  function paintThemeBtn() {
    var db = document.getElementById("darkBtn");
    if (db) db.innerHTML = document.documentElement.dataset.theme === "dark" ? "☀️ Light" : "🌙 Dark";
  }

  function init(opts) {
    opts = opts || {};
    var name = user();

    var un = document.getElementById("userName");
    if (un) un.textContent = name;
    var av = document.getElementById("avatarLetter");
    if (av) av.textContent = name.charAt(0).toUpperCase();

    // persisted theme (login/dashboard predate this; default light)
    try {
      if (localStorage.getItem("vertexTheme") === "dark") {
        document.documentElement.dataset.theme = "dark";
      }
    } catch (e) { /* ignore */ }
    paintThemeBtn();
    var db = document.getElementById("darkBtn");
    if (db) db.addEventListener("click", function () {
      var dark = document.documentElement.dataset.theme !== "dark";
      document.documentElement.dataset.theme = dark ? "dark" : "light";
      try { localStorage.setItem("vertexTheme", dark ? "dark" : "light"); } catch (e) { /* ignore */ }
      paintThemeBtn();
    });

    // sidebar navigation (static markup, wired here)
    Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"), function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-nav");
        if (ROUTES[k]) {
          if (!b.classList.contains("active")) window.location.href = ROUTES[k];
        } else if (SOON[k]) {
          toast(SOON[k]);
        }
      });
    });

    var lib = document.getElementById("libBtn");
    if (lib) lib.addEventListener("click", function () {
      if (!/library\.html$/.test(location.pathname)) window.location.href = "library.html";
    });

    var st = document.getElementById("streakBtn");
    if (st) st.addEventListener("click", function () {
      toast("🔥 1-day streak — solve a test today to keep it alive!");
    });

    var pf = document.getElementById("profile");
    if (pf) {
      pf.addEventListener("click", function (e) {
        if (e.target.closest(".profile-menu")) return;
        pf.classList.toggle("open");
      });
      document.addEventListener("click", function (e) {
        if (!pf.contains(e.target)) pf.classList.remove("open");
      });
      var lo = document.getElementById("logoutBtn");
      if (lo) lo.addEventListener("click", function () { window.location.href = "index.html"; });
    }

    // Cmd/Ctrl+K focuses the page search
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        var s = document.getElementById(opts.searchId || "searchInput");
        if (s) { e.preventDefault(); s.focus(); }
      }
    });

    return { toast: toast, user: user, name: name };
  }

  return { init: init, toast: toast, user: user };
})();
