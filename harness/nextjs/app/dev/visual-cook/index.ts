// The cook index: one entry per cook, added when the cook starts, `wip` until it is ruled.
export type CookStatus = 'settled' | 'superseded' | 'abandoned' | 'wip';

export type CookEntry = {
  date: string;       // YYYY-MM-DD, when the cook started
  topic: string;      // the cook's folder name under app/dev/visual-cook/
  component: string;  // the real component or region it cooks; say so when it does not exist yet
  question?: string;  // what the cook asks, one sentence, readable by someone who was not there
  summary?: string;   // the card's face: what it was for and where it got to, in plain sentences
  settled: string[];  // one sentence per ruling
  status: CookStatus;
  applied?: string;   // when a settled cook landed: YYYY-MM-DD, 'pending' or 'partial' (then `owed`)
  owed?: string;      // what has not landed yet, and why
  unruled?: string;   // what the cook did not settle, carried forward
  route: string;      // the cook's route, with its state in the URL
};

export const COOK_INDEX: CookEntry[] = [
  {
    date: '2026-10-15',
    topic: 'example',
    component: 'components/ExampleCard.tsx',
    question: 'Where does the card’s action sit best?',
    summary: 'The example that comes with the harness: three lanes for the action’s place, a pick-one for the button’s style, and dials for the radius, the padding, the shadow and the accent.',
    settled: [],
    status: 'wip',
    route: '/dev/visual-cook/example?lane=stacked',
  },
];
