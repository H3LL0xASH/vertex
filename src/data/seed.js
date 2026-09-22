// VERTEX seed — library subjects/chapters + analytics attempts.
export const librarySeed = {
  subjects: [
    {
      id: "sub-english", title: "English",
      desc: "Language, grammar and comprehension tests.",
      icon: "book", tint: "pink",
      chapters: [
        { id: "ch-verb", title: "Verb", status: "progress", pct: 3, answered: 3, total: 106, score: 0, tint: "pink" },
        { id: "ch-noun", title: "Noun", status: "not", pct: 0, answered: 0, total: 85, score: 0, tint: "blue" },
        { id: "ch-adjective", title: "Adjective", status: "not", pct: 0, answered: 0, total: 64, score: 0, tint: "green" },
      ],
    },
    {
      id: "sub-maths", title: "Maths",
      desc: "Numbers, algebra, geometry and more.",
      icon: "calc", tint: "purple",
      chapters: [
        { id: "ch-percentage", title: "Percentage", status: "not", pct: 0, answered: 0, total: 72, score: 0, tint: "orange" },
        { id: "ch-mixture", title: "Mixture & Alligation", status: "progress", pct: 0, answered: 0, total: 86, score: 0, tint: "purple" },
      ],
    },
    {
      id: "sub-science", title: "Science",
      desc: "Explore the world through questions.",
      icon: "flask", tint: "green",
      chapters: [
        { id: "ch-motion", title: "Motion", status: "not", pct: 0, answered: 0, total: 58, score: 0, tint: "teal" },
      ],
    },
  ],
};

// 5 attempts, 0 completed — matches Overview + Analytics screenshots.
export const attemptsSeed = [
  { id: "a1", chapter: "Verb", subject: "English", answered: 3, total: 106, score: 3, status: "progress", day: "Mon", when: "Sep 22, 05:05 PM" },
  { id: "a2", chapter: "Noun", subject: "English", answered: 0, total: 85, score: 0, status: "progress", day: "Tue", when: "Sep 22, 04:12 PM" },
  { id: "a3", chapter: "Percentage", subject: "Maths", answered: 0, total: 72, score: 0, status: "progress", day: "Wed", when: "Sep 21, 06:40 PM" },
  { id: "a4", chapter: "Mixture & Alligation", subject: "Maths", answered: 0, total: 86, score: 0, status: "progress", day: "Thu", when: "Sep 21, 02:15 PM" },
  { id: "a5", chapter: "Motion", subject: "Science", answered: 0, total: 58, score: 0, status: "progress", day: "Fri", when: "Sep 20, 11:02 AM" },
];

export const scoreWeek = [
  { d: "Mon", v: 1.0 }, { d: "Tue", v: 1.8 }, { d: "Wed", v: 4.6 },
  { d: "Thu", v: 3.4 }, { d: "Fri", v: 2.4 }, { d: "Sat", v: 2.6 }, { d: "Sun", v: 0.8 },
];

export const TINT_GRAD = {
  pink: "linear-gradient(180deg,#f9a8b0,#e56570)",
  blue: "linear-gradient(180deg,#8db4f0,#2f6fd0)",
  green: "linear-gradient(180deg,#8fe3b6,#34b87a)",
  orange: "linear-gradient(180deg,#f5bd7d,#d97a1f)",
  purple: "linear-gradient(180deg,#b39df7,#7c4de8)",
  teal: "linear-gradient(180deg,#8adcd6,#149a90)",
};

export const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
