/* VERTEX store — localStorage-backed state for the Library.
   Classic script (file:// safe). React port: turn into a hook/context. */
window.VertexStore = (function () {
  var KEY = "vertexLibraryV1";

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid(p) { return p + "-" + Math.random().toString(36).slice(2, 8); }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        if (d && Array.isArray(d.subjects)) return d;
      }
    } catch (e) { /* storage unavailable — fall through to seed */ }
    return clone(window.VertexSeed);
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function reset() {
    var d = clone(window.VertexSeed);
    save(d);
    return d;
  }

  return { load: load, save: save, reset: reset, uid: uid };
})();
