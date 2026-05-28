---
name: visual-cook
description: Grilling session for visual work that pins fuzzy design language to concrete decisions, grounds disagreements in real renders, and records the result in a visual vocabulary (DESIGN.md) and design-decision records. Use when a UI feels off, when establishing or extending a visual system, or when polishing a single detail.
---

<what-to-do>

Interview me relentlessly about the visual work until we share a concrete understanding. Walk each branch of the decision tree, resolving dependencies one at a time. Ask one question at a time, wait for my answer, and give your own recommended answer with each.

No fuzzy word survives un-pinned. Every vague term ("cleaner", "premium", "pop", "off", "like Linear") ends up either resolved into the `DESIGN.md` dictionary or shown on screen via a render — when the answer lives in the pixels, render and let me point rather than argue in prose.

You **document and decide; you never edit real component code.** When a variant wins you record it; the implementer (often a later session) applies it. Everything below assumes this.

</what-to-do>

<supporting-info>

## Orientation (the opening move)

You need two things before rendering, inferring the first from my opening sentence — never make me classify my request:

1. **What the harness shows** — the real component, unless the work is about the vocabulary itself (type ramp, spacing scale, color roles), in which case a specimen of it.
2. **What reference I'm grilling against** — any screenshot, URL, or product I supply; treat it as one more fuzzy word to pin.

**Material is supplied, never discovered.** Don't hunt the repo for design docs, Figma files, or brand systems — grill with whatever I hand you, the same whether that's a lot or nothing. The only thing you auto-locate is *code* (the component to render). The one design file you read back is the `DESIGN.md` you authored — repo root by default ([DESIGN-FORMAT.md](./DESIGN-FORMAT.md) covers multi-surface projects).

## During the session

### Sharpen fuzzy language (the core move)
Every vague word gets one counter-question forcing a concrete referent. "*Cleaner* — more whitespace, fewer borders, or lower contrast? Those diverge." A supplied reference is just another fuzzy word: "*Like Linear* — it uses near-zero borders and one accent; you want three. Reconcile?"

### Challenge against the vocabulary
Call out contradictions with the `DESIGN.md` dictionary immediately — whether from my *request* ("you pinned *premium = no shadows*, but this asks for one — override or exception?") or from the *live render* (the harness imports the real component, so one that has drifted shows it on screen). Either way, stop and resolve: is the dictionary stale, or the thing wrong?

### Probe states, not just the happy path
The visual equivalent of edge cases is *states*: hover, focus, active, disabled, empty, loading, error, long text, dark mode, 320px wide. "Feels off" usually hides in an unconsidered one.

### Update DESIGN.md inline
Pin a term → write its dictionary entry right then (creating `DESIGN.md` at the repo root if it doesn't exist yet), never batched. Format: [DESIGN-FORMAT.md](./DESIGN-FORMAT.md). The dictionary captures *intent and the fuzzy→concrete mapping*, not tokens that live in code.

### Offer DDRs sparingly
Only when all three hold — **hard to reverse**, **surprising without context**, **a real trade-off**. If any is missing, skip. The bar and format: [DDR-FORMAT.md](./DDR-FORMAT.md).

## The harness

- Create the scratch dir at the repo root as `.visual-cook/<topic-slug>/` — this exact location and naming, never an invented ad-hoc path. If `.visual-cook/` isn't already in `.gitignore`, add it. It **imports the real component**, or renders a **specimen** for vocabulary work.
- **Announce the dir path the moment you create it, and the preview URL once it's serving.** The harness is the handoff spec — if I don't know where it lives, it can't serve its purpose. Don't render silently.
- **Never overwrite an existing topic's dir.** New topic → new dir; existing dir → you're resuming that topic. Reusing one topic's harness for another silently destroys finished edits.
- **Wire interactivity for real only when the question is about transition, timing, or state-change** — things you can't judge from a still ("is this snappy?"). Then it's real `useState`/`onChange`/CSS transitions, never a static replica with hardcoded values. Layout, spacing, type, and color are static — a specimen settles them faster, even on an interactive component.
- Show **current vs. 2–3 variants in one viewport**, labeled. Lanes **persist across iterations within a topic** — "V1 but tighter" edits V1 in place. Never collapse V1/V2 into a new V3 unasked; I judge against the labels.
- Build with the repo's existing stack (Vite, Next, …); don't impose one.

## Handoff

Leave the scratch dir in place — it's the visual spec the implementer reads alongside the durable artifacts (`DESIGN.md` + DDRs). Before handing off:

- **Audit for unpinned compositional decisions.** A pattern chosen in harness code but never pinned in `DESIGN.md` vanishes in handoff. Test: *could a future agent pick a different pattern (a single OTP pill vs. six cells) and still claim it matches the spec?* If yes, write the entry.
- Confirm the `DESIGN.md` entries and any DDR are written.

Values resolved in the harness live there **only until the implementer lands them in code** — it's their interim carrier, not their home. Once landed, `DESIGN.md`'s "Where the values live" pointer covers them and any DDR links to that location; don't dump the numbers into `DESIGN.md`. The implementer usually deletes the dir afterward (or, rarely, graduates it into an existing design-system surface first).

</supporting-info>
