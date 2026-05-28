# DDR Format

Design Decision Records live in `docs/ddr/` with sequential numbering: `0001-slug.md`, `0002-slug.md`. Create the directory lazily — only when the first DDR is needed.

## Template

```md
# {Short title of the visual decision}

{1-3 sentences: the context, what we decided, and why. Name the alternative we rejected.}
```

That's it. A DDR can be a single paragraph. The value is recording *that* a visual decision was made and *why* — not filling out sections.

## Optional sections

Only when they add genuine value:

- **Reference** — a link to where the resolved values currently live: the harness path during the session, updated to the code location (the component or token file) once the implementer lands them. Fine to leave as a forward pointer — the implementer backfills it when they land the values. And/or the URL/product that anchored the decision. Prefer a code link over a screenshot — screenshots go stale, the code is the source of truth.
- **Status** frontmatter (`accepted | superseded by DDR-NNNN`) — when decisions get revisited.

## Numbering

Scan `docs/ddr/` for the highest existing number and increment.

## When to offer a DDR

All three must be true:

1. **Hard to reverse** — undoing it later means reworking many components, not one edit.
2. **Surprising without context** — a future designer will look at the UI and wonder "why did they do it *this* way?"
3. **The result of a real trade-off** — there were genuine alternatives and one was chosen for specific reasons.

If a choice is easy to reverse, skip it — you'll just reverse it. If it's not surprising, nobody will wonder. If there was no real alternative, there's nothing to record.

### What qualifies

- **System-wide visual stances.** "Flat — zero shadows everywhere — because the brand reads as clinical-precise; we rejected soft material depth."
- **Deliberate deviations from convention.** "Buttons have no hover color change, only a 1px lift, because X." Anything where a reasonable designer would assume the opposite.
- **Constraints not visible in the UI.** "Max one accent color because the product ships white-labeled and partners override it."
- **Rejected alternatives whose rejection is non-obvious.** Considered a gradient system and chose flat for subtle reasons — record it, or someone re-proposes gradients in six months.

### What does not qualify

- One component's spacing or a single color value — that's a dictionary entry or just code.
- Anything you'd happily change next week.
