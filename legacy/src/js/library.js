/* VERTEX Library page — subjects & chapters.
   Depends on: seed.js, store.js, layout.js (classic scripts, file:// safe).
   React port: <LibraryPage> + <SubjectSection> + <ChapterCard> + <LibraryModal>. */
(function () {
  "use strict";
  var toast = window.VertexLayout.toast;
  var Store = window.VertexStore;

  var ICONS = {
    book: '<svg viewBox="0 0 24 24"><path d="M4 19V6a2 2 0 0 1 2-2h13v13H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13"/></svg>',
    calc: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>',
    flask: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v4h4M9 13h6M9 17h6"/></svg>'
  };
  var TINTS = ["pink", "blue", "green", "orange", "purple", "teal"];
  var ORB_GRAD = {
    pink: "linear-gradient(180deg,#f9a8b0,#e56570)", blue: "linear-gradient(180deg,#8db4f0,#2f6fd0)",
    green: "linear-gradient(180deg,#8fe3b6,#34b87a)", orange: "linear-gradient(180deg,#f5bd7d,#d97a1f)",
    purple: "linear-gradient(180deg,#b39df7,#7c4de8)", teal: "linear-gradient(180deg,#8adcd6,#149a90)"
  };

  var state = Store.load();
  var collapsed = {};
  var query = "";

  var list = document.getElementById("subjectList");
  var modalRoot = document.getElementById("modalRoot");
  var filterInput = document.getElementById("filterInput");
  var topSearch = document.getElementById("searchInput");
  var fileInput = document.getElementById("fileInput");

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function statusPill(ch) {
    if (ch.status === "progress") return '<span class="st progress">In progress · ' + (ch.pct || 0) + '%</span>';
    return '<span class="st not">Not started</span>';
  }
  function chapterMeta(ch) {
    if (ch.status === "progress") return esc(ch.answered || 0) + " / " + esc(ch.total || 0) + " answered · Score " + esc(ch.score || 0);
    return "0 / " + esc(ch.total || 0) + " questions · Score " + esc(ch.score || 0);
  }

  function chapterCard(ch) {
    return '<div class="ch ' + esc(ch.tint || "blue") + '">' +
      '<span class="doc ' + esc(ch.tint || "blue") + '">' + ICONS.doc + "</span>" +
      "<div><h3>" + esc(ch.title) + "</h3>" + statusPill(ch) +
      '<div class="meta">' + chapterMeta(ch) + "</div></div>" +
      '<button class="go" data-act="go-chapter" data-id="' + esc(ch.id) + '" title="Open ' + esc(ch.title) + '">→</button>' +
      "</div>";
  }

  function subjectBlock(sub) {
    var n = sub.chapters.length;
    var isCollapsed = !!collapsed[sub.id];
    var chapters = sub.chapters.map(chapterCard).join("");
    return '<section class="subject' + (isCollapsed ? " collapsed" : "") + '" data-sub="' + esc(sub.id) + '">' +
      '<div class="sub-head">' +
      '<span class="orb ' + esc(sub.tint || "pink") + '">' + (ICONS[sub.icon] || ICONS.book) + "</span>" +
      "<div><h2>" + esc(sub.title) +
      '<span class="count-pill">' + n + " chapter" + (n === 1 ? "" : "s") + "</span></h2>" +
      '<div class="sub-desc">' + esc(sub.desc || "") + "</div></div>" +
      '<div class="sub-actions">' +
      '<button class="icon-btn" data-act="sub-menu" title="Subject options">•••</button>' +
      '<button class="icon-btn chev" data-act="toggle" title="Collapse">︿</button>' +
      "</div></div>" +
      '<div class="ch-grid">' + chapters +
      '<button class="add-ch' + (n === 0 ? " wide" : "") + '" data-act="add-chapter"><span class="plus">＋</span>Add Chapter</button>' +
      "</div></section>";
  }

  function matches(sub, q) {
    if (!q) return sub;
    var copy = { id: sub.id, title: sub.title, desc: sub.desc, icon: sub.icon, tint: sub.tint, chapters: [] };
    var inSub = (sub.title + " " + (sub.desc || "")).toLowerCase().indexOf(q) !== -1;
    copy.chapters = sub.chapters.filter(function (c) {
      return inSub || c.title.toLowerCase().indexOf(q) !== -1;
    });
    if (inSub || copy.chapters.length) return copy;
    return null;
  }

  function render() {
    var q = query.trim().toLowerCase();
    var shown = [];
    state.subjects.forEach(function (s) {
      var m = matches(s, q);
      if (m) shown.push(m);
    });
    if (!shown.length) {
      list.innerHTML = '<div class="empty">No subjects or chapters match “' + esc(query.trim()) + '”.' +
        '<br><button class="btn-ghost" data-act="reset-seed">Reset to sample data</button></div>';
      return;
    }
    list.innerHTML = shown.map(subjectBlock).join("");
  }

  function findSub(id) {
    for (var i = 0; i < state.subjects.length; i++) {
      if (state.subjects[i].id === id) return { sub: state.subjects[i], index: i };
    }
    return null;
  }
  function persist() { Store.save(state); }

  /* ---------- popover ---------- */
  var popEl = null;
  function closePop() { if (popEl) { popEl.remove(); popEl = null; } }
  function openSubMenu(btn, subId) {
    closePop();
    popEl = document.createElement("div");
    popEl.className = "pop";
    popEl.innerHTML = '<button data-pop="rename">Rename subject</button>' +
      '<button data-pop="delete" class="danger">Delete subject</button>';
    document.body.appendChild(popEl);
    var r = btn.getBoundingClientRect();
    popEl.style.top = r.bottom + window.scrollY + 8 + "px";
    popEl.style.left = Math.max(8, r.right + window.scrollX - 180) + "px";
    popEl.addEventListener("click", function (e) {
      var a = e.target.getAttribute("data-pop");
      if (!a) return;
      closePop();
      if (a === "rename") openSubjectModal("rename", subId);
      if (a === "delete") openDeleteModal(subId);
    });
    setTimeout(function () {
      document.addEventListener("click", function h(e) {
        if (popEl && !popEl.contains(e.target)) { closePop(); document.removeEventListener("click", h); }
      });
    }, 0);
  }

  /* ---------- modal ---------- */
  function closeModal() { modalRoot.innerHTML = ""; }
  function modalShell(title, body, okText, danger) {
    modalRoot.innerHTML = '<div class="overlay"><div class="modal" role="dialog" aria-modal="true">' +
      "<h3>" + esc(title) + "</h3>" + body +
      '<div class="mfoot"><button class="btn-cancel" data-m="cancel">Cancel</button>' +
      '<button class="' + (danger ? "btn-danger" : "btn-primary") + '" data-m="ok">' + esc(okText) + "</button></div>" +
      "</div></div>";
    var overlay = modalRoot.firstChild;
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.getAttribute("data-m") === "cancel") closeModal();
    });
    var first = modalRoot.querySelector("input, select");
    if (first) setTimeout(function () { first.focus(); }, 30);
    return overlay;
  }

  function tintSwatches(sel) {
    return '<div class="swatches">' + TINTS.map(function (t) {
      return '<span class="sw' + (t === sel ? " sel" : "") + '" data-tint="' + t + '" title="' + t + '" style="background:' + ORB_GRAD[t] + '"></span>';
    }).join("") + "</div>";
  }

  function openSubjectModal(mode, subId) {
    var existing = mode === "rename" ? findSub(subId).sub : null;
    var tint = existing ? existing.tint : "pink";
    var body = '<div class="frow"><label>Subject name</label><input id="mTitle" maxlength="60" value="' + esc(existing ? existing.title : "") + '" placeholder="e.g. History"></div>' +
      '<div class="frow"><label>Description</label><input id="mDesc" maxlength="120" value="' + esc(existing ? existing.desc : "") + '" placeholder="What lives inside?"></div>' +
      '<div class="frow"><label>Colour</label><div id="mTints">' + tintSwatches(tint) + "</div></div>";
    var ov = modalShell(mode === "rename" ? "Rename subject" : "Add subject", body, mode === "rename" ? "Save" : "Create");
    var picked = tint;
    ov.querySelector("#mTints").addEventListener("click", function (e) {
      var s = e.target.closest("[data-tint]");
      if (!s) return;
      picked = s.getAttribute("data-tint");
      Array.prototype.forEach.call(ov.querySelectorAll(".sw"), function (x) {
        x.classList.toggle("sel", x === s);
      });
    });
    ov.querySelector('[data-m="ok"]').addEventListener("click", function () {
      var title = ov.querySelector("#mTitle").value.trim();
      var desc = ov.querySelector("#mDesc").value.trim();
      if (!title) { ov.querySelector("#mTitle").focus(); return; }
      if (existing) {
        existing.title = title; existing.desc = desc; existing.tint = picked;
        toast("Subject renamed");
      } else {
        state.subjects.push({ id: Store.uid("sub"), title: title, desc: desc, icon: "book", tint: picked, chapters: [] });
        toast("Subject added");
      }
      persist(); closeModal(); render();
    });
  }

  function openChapterModal(preSubId) {
    var opts = state.subjects.map(function (s) {
      return '<option value="' + esc(s.id) + '"' + (s.id === preSubId ? " selected" : "") + ">" + esc(s.title) + "</option>";
    }).join("");
    if (!opts) { toast("Add a subject first"); openSubjectModal("new"); return; }
    var body = '<div class="frow"><label>Subject</label><select id="mSub">' + opts + "</select></div>" +
      '<div class="frow"><label>Chapter name</label><input id="mTitle" maxlength="60" placeholder="e.g. Tenses"></div>' +
      '<div class="frow"><label>Questions</label><input id="mTotal" type="number" min="0" max="1000" value="50"></div>' +
      '<div class="frow"><label>Colour</label><div id="mTints">' + tintSwatches("blue") + "</div></div>";
    var ov = modalShell("Add chapter", body, "Create");
    var picked = "blue";
    ov.querySelector("#mTints").addEventListener("click", function (e) {
      var s = e.target.closest("[data-tint]");
      if (!s) return;
      picked = s.getAttribute("data-tint");
      Array.prototype.forEach.call(ov.querySelectorAll(".sw"), function (x) {
        x.classList.toggle("sel", x === s);
      });
    });
    ov.querySelector('[data-m="ok"]').addEventListener("click", function () {
      var sid = ov.querySelector("#mSub").value;
      var title = ov.querySelector("#mTitle").value.trim();
      var total = Math.max(0, parseInt(ov.querySelector("#mTotal").value, 10) || 0);
      if (!title) { ov.querySelector("#mTitle").focus(); return; }
      var found = findSub(sid);
      if (!found) return;
      found.sub.chapters.push({ id: Store.uid("ch"), title: title, status: "not", pct: 0, answered: 0, total: total, score: 0, tint: picked });
      delete collapsed[sid];
      persist(); closeModal(); render();
      toast("Chapter added to " + found.sub.title);
    });
  }

  function openDeleteModal(subId) {
    var found = findSub(subId);
    if (!found) return;
    var ov = modalShell("Delete subject?",
      '<p style="margin-top:12px;font-size:14px;color:var(--v-muted)">“' + esc(found.sub.title) + "” and its " +
      found.sub.chapters.length + " chapter(s) will be removed.</p>",
      "Delete", true);
    ov.querySelector('[data-m="ok"]').addEventListener("click", function () {
      state.subjects.splice(found.index, 1);
      persist(); closeModal(); render();
      toast("Subject deleted");
    });
  }

  /* ---------- import / export ---------- */
  function downloadExport() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "vertex-library.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 300);
    toast("Library exported");
  }
  function handleImportFile(f) {
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        var arr = Array.isArray(d) ? d : d.subjects;
        if (!Array.isArray(arr)) throw new Error("bad shape");
        var norm = arr.map(function (s, i) {
          return {
            id: s.id || Store.uid("sub"), title: String(s.title || "Untitled"),
            desc: s.desc || "", icon: s.icon || "book", tint: s.tint || "pink",
            chapters: (Array.isArray(s.chapters) ? s.chapters : []).map(function (c) {
              return {
                id: c.id || Store.uid("ch"), title: String(c.title || "Untitled"),
                status: c.status === "progress" ? "progress" : "not",
                pct: c.pct || 0, answered: c.answered || 0,
                total: c.total || 0, score: c.score || 0, tint: c.tint || "blue"
              };
            })
          };
        });
        state = { subjects: norm };
        collapsed = {};
        persist(); render();
        toast("Imported " + norm.length + " subject(s)");
      } catch (e) { toast("Could not read that JSON file"); }
      fileInput.value = "";
    };
    r.readAsText(f);
  }

  /* ---------- events ---------- */
  list.addEventListener("click", function (e) {
    var reset = e.target.closest('[data-act="reset-seed"]');
    if (reset) { state = Store.reset(); collapsed = {}; persist(); render(); toast("Sample data restored"); return; }
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var section = e.target.closest("[data-sub]");
    var subId = section ? section.getAttribute("data-sub") : null;
    var act = btn.getAttribute("data-act");
    if (act === "toggle" && subId) {
      collapsed[subId] = !collapsed[subId];
      section.classList.toggle("collapsed", !!collapsed[subId]);
    } else if (act === "sub-menu" && subId) {
      openSubMenu(btn, subId);
    } else if (act === "add-chapter" && subId) {
      openChapterModal(subId);
    } else if (act === "go-chapter") {
      var title = "";
      state.subjects.forEach(function (s) {
        s.chapters.forEach(function (c) { if (c.id === btn.getAttribute("data-id")) title = c.title; });
      });
      toast("Starting “" + (title || "test") + "”… — test player is next");
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closePop(); closeModal(); }
  });

  filterInput.addEventListener("input", function () {
    query = filterInput.value;
    if (topSearch && topSearch.value !== query) topSearch.value = query;
    render();
  });
  if (topSearch) topSearch.addEventListener("input", function () {
    query = topSearch.value;
    filterInput.value = query;
    render();
  });

  document.getElementById("addSubjectBtn").addEventListener("click", function () { openSubjectModal("new"); });
  document.getElementById("addChaptersBtn").addEventListener("click", function () { openChapterModal(state.subjects[0] && state.subjects[0].id); });
  document.getElementById("exportBtn").addEventListener("click", downloadExport);
  document.getElementById("importBtn").addEventListener("click", function () { fileInput.click(); });
  document.getElementById("uploadJsonBtn").addEventListener("click", function () { fileInput.click(); });
  fileInput.addEventListener("change", function () { handleImportFile(fileInput.files[0]); });

  /* ---------- boot ---------- */
  window.VertexLayout.init();
  render();
})();
