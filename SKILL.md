---
name: visual-cook
description: Generate new options for how something could look, build each one for real, and put them side by side with the live version so the user picks one by eye instead of having to describe or make it themselves. Use when a look or a feel has several defensible answers (size, weight, spacing, colour, timing, density), when they say something is off without saying how, or when they ask for versions.
---

# visual-cook

A cook is how you propose what something could look like: you come up with the options and build them, the user picks. Each option is a lane, each amount is a dial; the page carries them and almost no words.

## When

- Cook "how much" questions. A vague word ("cleaner", "off", "premium") becomes lanes along what it could mean.
- Do not cook what a thing is or which direction to take: ask that in words, one question. A clear instruction is just done.
- When every lane is refused, or a refusal names nothing on the screen, stop rendering: the premise is wrong. Say so.

## The harness

- One cook chrome per project, at one fixed path. Every cook imports it; never a page's own bar, never a copy inside the cook.
- A Next.js App Router + Tailwind v4 project without one gets `harness/nextjs/` from this skill's repo, copied once into the app root:
  - `app/dev/visual-cook/chrome/`: `chrome.tsx`, the sidebar `one.tsx` and `dialkit-dress.css`.
  - `app/dev/pointed/`, `cook-versions/`, `cook-decided/` and `cook-drift/`: the notes, versions and decisions, into a gitignored `.cook/` at the app root; each answers 404 in production.
  - `components/dev/DevTools.tsx`, Agentation's mount, rendered once in the root layout's `<body>`.
  - `app/dev/visual-cook/page.tsx` and `index.ts`, the cook index; `example/` and `components/ExampleCard.tsx` show the page shape.
  - The packages `dialkit`, `agentation`, `lucide-react` and `motion` (dialkit needs it).
  - A cook's `page.tsx` keeps the production `notFound()` guard, or the cook ships to the live site. `cook-drift` assumes cooks at `app/dev/visual-cook/<cook>` and `@/` at the app root; with a `src/` dir, set its `SRC` to `'src/'`.
- A copy does not follow later changes to the skill's harness; bring it current when a cook there starts.
- A cook mounts `OneSidebar` and puts `OneLanes`, `OnePick` and `OneDials` inside it; never its own aside, lane list or slider.
- Every cook has an entry in the project's cook index, `wip` until ruled.
- The whole state is in the URL, in the form the chrome uses, so one link opens one state.

## Lanes

- Lane one is what is live now, mounted from the current source, never from an old cook.
- A lane is the real component with one named difference, visible at a glance. If you cannot name how two lanes differ, drop one.
- Every lane is live: controls open, type, hover and focus as they would shipped. Nothing drawn, no faked states.
- Real size, one part per view, light and dark together when the part has both.
- If the user judges with Reduce Motion on, a motion lane plays under prefers-reduced-motion: reduce, and its check runs with reducedMotion: 'reduce'.
- Anything that could be photographed is a real file.
- Round one is the thing itself with a few lanes; more when asked.

## Dials and pointing

- Lanes differ in structure; an amount (a size, a gap, a blur, a duration, a strength) is a dial on the lane, never a lane per value.
- Dials are DialKit set into the sidebar, declared once with `useUrlDials`, so every value is in the URL and a dial back at its start leaves it.
- A pick among a few named things is `OnePick`, each with one line saying what it is.
- The user answers a dial with the link: read the values from the URL they send, never ask them to type them.
- They save a version of the whole cook from the sidebar's Versions; each is the cook's URL, numbered per cook, in `.cook/versions.json`. "Version 2" means that URL.
- They decide a pick-one and retire a lane from the sidebar; both land in `.cook/decided.json` (`/dev/cook-decided`), per cook page. Read it when you return to a cook: a decided question is settled at its value, a retired lane is a loser to take out of the next round.
- A line under the sidebar's header says when the surface moved since the cook was last committed (`/dev/cook-drift`). Before a new round on such a cook, bring its lanes forward onto the current surface.
- They point with the Agentation toolbar in the sidebar's foot. Each note lands in `.cook/pointed.jsonl` (`/dev/pointed` on the dev server) with the page's URL, their words and the element; read it when they say they pointed, and before acting on a verdict that names nothing.

## Words

- The page says which surface it is and what differs from the real one, in one line. Each lane has a label of a few words and, when needed, one line with its value.
- Nothing else on the page: no rationale, no round history, no quotes of the user, no measurements, no instructions. Those go in the chat.

## Hand it over

- Check it headless on the server and branch they look at: it loads, no console errors, every lane renders, its controls respond.
- One link, and one line on what differs.
- The verdict comes as "3", "row 5", a URL, a version number or a pointed note. Write it down in their words where the project keeps its state, flip the index entry to `settled`, retire the losers from the view without deleting them.
- Before landing, show the winner in its real surface beside the current version.
- Land it; before reporting, list every ruled detail and where it landed.
