# Exam JSON format

Any file following this shape becomes a working test — upload it in Library
(chapter), the Upload page, or link it when creating a chapter. Invalid files
are rejected with a plain-language error, never a crash.

```json
{
  "title": "Profit & Loss",
  "subtitle": "Source: my-file.pdf (optional)",
  "mark_per_correct": 1,
  "negative_marking": 0,
  "questions": [
    {
      "question": "20% of a number is 45. What is the number?",
      "options": { "A": "180", "B": "225", "C": "250", "D": "270" },
      "correct_answer": "B",
      "solution": "20% of x = 45 → x = 225. (optional)",
      "section": "Quick Revision (optional)",
      "topic": "Basics (optional)",
      "tags": ["percentage"] // optional
    }
  ]
}
```

## Rules

| Field | Required | Notes |
| ----- | -------- | ----- |
| `title` | yes | Shown in the player header and attempt lists |
| `subtitle` | no | Secondary header line |
| `mark_per_correct` | no | Default `1` |
| `negative_marking` | no | Default `0` (deducted per wrong answer when > 0) |
| `questions` | yes | Non-empty array |
| `question` | yes | Plain text, preserved as-is |
| `options` | yes | Keys `A`–`D`, all four required, non-empty |
| `correct_answer` | yes | Must match an option key (case-insensitive) |
| `solution` | no | Shown in the Explanation expander after answering |
| `section` | no | Creates a filter tab (default `General`) |
| `topic` | no | Groups the palette; powers weak-topic analytics |
| `tags` | no | Reserved for future filtering |

Extras the engine tolerates (ignored for scoring): `source_question_no`,
`global_no`, `source`, `sets`.

## Engine behavior

- First selection **locks**; Clear Response unlocks.
- Score: `+mark_per_correct` per correct, `−negative_marking` per wrong.
- Palette: answered → correct (green) / wrong (red); visited-only → amber;
  marked → violet ring; current → violet fill.
- Sections/tabs filter the palette and arrow navigation; review modes
  (wrong / unattempted / marked) filter to index lists.
- Timer counts active seconds, persisted per attempt.
- Summary: answered/correct/wrong/marked/unattempted, score `x / max`,
  percentage to 1 decimal.
