# DESIGN.md Format

`DESIGN.md` is the visual vocabulary. Its heart is the **fuzzy→concrete dictionary**: every vague design word, pinned to what it concretely means *in this project*. It is not a value dump — it points at where the values live in code rather than copying them.

## Where DESIGN.md lives

One `DESIGN.md` at the repo root, by default — same as a single-context glossary.

If the project has genuinely distinct visual surfaces with their own vocabularies (e.g. a marketing site and an internal dashboard that share no design language), give each its own `DESIGN.md` alongside that surface, and infer which one the current work belongs to. Don't split pre-emptively — start at root and only split when two surfaces are demonstrably pulling the same word in different directions.

## Structure

```md
# {Project} — Visual Vocabulary

{One or two sentences on the overall intent. e.g. "Dense and utilitarian, not airy. Clinical precision over warmth."}

## Dictionary

**Premium**
More whitespace, one accent color max, zero drop shadows, 150ms ease-out on interactive states.
_Not_: gradients, soft material depth, multiple accents.

**Clean**
Fewer borders (use spacing to separate, not lines), contrast no higher than needed to read.
_Not_: more whitespace — that's a separate axis.

**Snappy**
Motion ≤150ms, ease-out. Anything slower reads as sluggish here.

## Relationships

Fuzzy words interact — record how, so a later session doesn't pin one in a way that quietly breaks another.

- **Premium** constrains **Clean**: both forbid visual noise, but Premium also caps accent colors.
- **Snappy** governs every interactive state that **Premium** touches (hover, focus, active).

## Where the values live

- Spacing scale, type ramp, color roles: `src/styles/tokens.css`
- Motion curves: `tailwind.config.ts` → `transitionTimingFunction`

## Flagged ambiguities

- "clean" was used to mean both *fewer borders* and *more whitespace* — resolved: these are distinct axes, see entries above.
```

## Example pinning

A fuzzy word goes in only after it has been pinned. The move that pins it:

> **User:** "Make the dashboard feel more premium."
> **You:** "*Premium* is fuzzy — more whitespace, fewer accents, or softer material depth? Those diverge."
> **User:** "Fewer accents, and lose the shadows."
> → Dictionary entry **Premium**: one accent max, zero drop shadows. _Not_: more whitespace (separate axis — flagged).

## Rules

- **Pin, don't describe.** A dictionary entry says what the word *concretely resolves to* (numbers, directions, yes/no), not a vibe.
- **One axis per entry.** If a word smuggles two ideas ("clean" = borders + whitespace), split them and flag it.
- **Be opinionated.** State what the word means here and what it explicitly does *not* (`_Not_:`).
- **Don't copy values.** If a value lives in code, point at the file. The dictionary captures *intent and meaning*, which has no home in code.
- **Name the real location, whatever the stack.** "Where the values live" is not Tailwind-specific — the example above happens to be a Tailwind project. Point at wherever *this* project actually keeps its concrete values: CSS custom properties in `:root`, a SwiftUI `Color`/`Theme` asset catalog, a JS theme object, design tokens in a JSON file. Name what's there; don't impose a structure.
- **Record relationships.** When two words constrain or depend on each other, note it under "Relationships" so a future pinning doesn't contradict an existing one.
- **Only project-specific meaning.** General design knowledge ("ease-out feels natural") doesn't belong — only how *this* project resolves its own fuzzy words.
- **Flag conflicts explicitly.** When a word was used two ways, record the resolution under "Flagged ambiguities".
- **Write entries inline during the session**, the moment a term is pinned. Never batch.
