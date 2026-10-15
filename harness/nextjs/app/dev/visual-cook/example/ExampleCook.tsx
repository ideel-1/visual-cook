'use client';

// The example cook: where the card's action goes. Lane one is the card as it is, mounted from its
// source; each other lane moves one thing. The button's style is a pick-one, the amounts are dials.
// The lane and the pick are written to the URL here, the dials by useUrlDials, so one link opens
// one state. The card is shown on a light and a dark ground together; the sidebar pushes the page
// (sits="push"), so neither ground is covered.

import { useEffect, useState } from 'react';
import { ExampleCard, type CardButton, type CardLayout } from '@/components/ExampleCard';
import { OneDials, OneLanes, OnePick, OneSidebar, useOneSidebar, useUrlDials, type Dials } from '../chrome/one';

const URL_WRITE_MS = 250;
const LANES: { id: CardLayout; label: string; note: string }[] = [
  { id: 'stacked', label: 'As it is', note: 'The card as it ships: the action under the text, at its own width.' },
  { id: 'full', label: 'Full-width action', note: 'The action spans the card under the text.' },
  { id: 'inline', label: 'Action beside the title', note: 'The action moves up, beside the title.' },
];
const BUTTONS: { id: CardButton; label: string; note: string }[] = [
  { id: 'solid', label: 'Solid', note: 'Filled with the accent.' },
  { id: 'outline', label: 'Outline', note: 'A hairline border, no fill.' },
  { id: 'text', label: 'Text', note: 'Underlined words, no box.' },
];

const PANEL = 'The card';
// A slider is [start, min, max, step]; a boolean is a switch; a select is a pick-one.
const DIALS: Dials = {
  radius: [12, 0, 32, 1],
  padding: [24, 8, 48, 2],
  shadow: true,
  accent: { type: 'select', options: [{ value: '#2563eb', label: 'Blue' }, { value: '#16a34a', label: 'Green' }, { value: '#111111', label: 'Ink' }], default: '#2563eb' },
};
// Each dial's short name in the URL.
const IN_URL = { radius: 'r', padding: 'p', shadow: 'sh', accent: 'ac' };

export default function ExampleCook() {
  const { values: d, ready } = useUrlDials(PANEL, DIALS, IN_URL);
  const [lane, setLane] = useState<CardLayout>(LANES[0].id);
  const [button, setButton] = useState<CardButton>('solid');
  const [hydrated, setHydrated] = useState(false);
  const bar = useOneSidebar('dark');

  useEffect(() => { // the deep link: read once, then mirror
    const p = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- the URL is read after mount, once */
    const l = LANES.find(x => x.id === p.get('lane'));
    if (l) setLane(l.id);
    const b = BUTTONS.find(x => x.id === p.get('button'));
    if (b) setButton(b.id);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => { // only this cook's own parameters; the dials keep theirs
    if (!hydrated) return;
    const write = window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('lane', lane);
      if (button !== 'solid') url.searchParams.set('button', button); else url.searchParams.delete('button');
      window.history.replaceState(null, '', url);
    }, URL_WRITE_MS);
    return () => clearTimeout(write);
  }, [hydrated, lane, button]);

  const card = { layout: lane, button, radius: d.radius as number, padding: d.padding as number, shadow: d.shadow as boolean, accent: d.accent as string };
  return (
    <div className="grid min-h-dvh grid-cols-2" style={{ paddingLeft: 'var(--cook-inset)', paddingRight: 'var(--cook-inset-right)' }}>
      <div className="flex items-center justify-center bg-[#f4f4f5]" data-stage="light">
        {hydrated && ready && <ExampleCard {...card} />}
      </div>
      <div className="flex items-center justify-center bg-[#0f0f10]" data-stage="dark">
        {hydrated && ready && <ExampleCard dark {...card} />}
      </div>
      <OneSidebar bar={bar} title="Example" tags={['In progress', 'Round 1']} sits="push">
        <p className={`m-0 text-[12px] leading-[1.5] ${bar.pal.laneNote}`}>
          The real card, on a light and a dark ground. The lanes differ in where its action goes.
        </p>
        <OneLanes bar={bar} lanes={LANES} lane={lane} pick={setLane} />
        <OnePick bar={bar} title="The button" name="button" options={BUTTONS} value={button} pick={setButton} />
        <OneDials bar={bar} />
      </OneSidebar>
    </div>
  );
}
