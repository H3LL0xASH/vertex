// VERTEX seed — the library starts EMPTY. No dummy subjects, attempts or
// chart points: every number in the UI is derived from real user data
// (linked datasets + attempts).
export const librarySeed = { subjects: [] };

export const TINT_GRAD = {
  pink: "linear-gradient(180deg,#f9a8b0,#e56570)",
  blue: "linear-gradient(180deg,#8db4f0,#2f6fd0)",
  green: "linear-gradient(180deg,#8fe3b6,#34b87a)",
  orange: "linear-gradient(180deg,#f5bd7d,#d97a1f)",
  purple: "linear-gradient(180deg,#b39df7,#7c4de8)",
  teal: "linear-gradient(180deg,#8adcd6,#149a90)",
};

export const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 8)}`;
