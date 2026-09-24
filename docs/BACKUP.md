# Backup format (export / import)

Library **Export** writes one self-contained file; **Import** (Library or
Upload page) auto-detects what you drop and does the right thing.

## Exported pack

```json
{
  "kind": "vertex-library-backup",
  "version": 1,
  "exportedAt": 1727000000000,
  "subjects": [ { "id": "...", "title": "...", "chapters": [
    { "id": "...", "title": "...", "dataset": { /* exam JSON */ } }
  ] } ],
  "attempts": [ /* attempt records for the exported chapters */ ]
}
```

Use the checkbox picker to export everything or just some subjects/chapters.
Attempts travel with their chapters, so history restores too.

## Import auto-detect (in order)

1. **`vertex-library-backup`** → replaces the library, merges attempts by id.
2. **Subject list** (`{subjects: [...]}` or bare array) → replaces the library.
3. **Exam dataset** (`{title, questions}`) → auto-creates a subject with the
   dataset linked, ready to test.
4. Anything else → rejected with a plain-language error.

Single-subject export from a subject's `•••` menu is just a `{subjects: [...]}`
file, so it re-imports through path 2.
