/* VERTEX seed data — Library (subjects + chapters).
   Mirrors the design reference. First port of call for a future
   React migration: `export default {...}` instead of window assign. */
window.VertexSeed = {
  subjects: [
    {
      id: "sub-english",
      title: "English",
      desc: "Language, grammar and comprehension tests.",
      icon: "book",
      tint: "pink",
      chapters: [
        { id: "ch-verb", title: "Verb", status: "progress", pct: 3, answered: 3, total: 106, score: 0, tint: "pink" },
        { id: "ch-noun", title: "Noun", status: "not", pct: 0, answered: 0, total: 85, score: 0, tint: "blue" },
        { id: "ch-adjective", title: "Adjective", status: "not", pct: 0, answered: 0, total: 64, score: 0, tint: "green" }
      ]
    },
    {
      id: "sub-maths",
      title: "Maths",
      desc: "Numbers, algebra, geometry and more.",
      icon: "calc",
      tint: "purple",
      chapters: [
        { id: "ch-percentage", title: "Percentage", status: "not", pct: 0, answered: 0, total: 72, score: 0, tint: "orange" },
        { id: "ch-mixture", title: "Mixture & Alligation", status: "progress", pct: 0, answered: 0, total: 86, score: 0, tint: "purple" }
      ]
    },
    {
      id: "sub-science",
      title: "Science",
      desc: "Explore the world through questions.",
      icon: "flask",
      tint: "green",
      chapters: [
        { id: "ch-motion", title: "Motion", status: "not", pct: 0, answered: 0, total: 58, score: 0, tint: "teal" }
      ]
    }
  ]
};
