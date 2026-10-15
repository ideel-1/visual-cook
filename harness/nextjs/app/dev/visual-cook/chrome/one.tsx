'use client';

// The cook sidebar around DialKit: DialKit's type, rows and greys for everything in the sidebar,
// on either ground. A cook calls useOneSidebar, mounts OneSidebar with
// OneLanes, OneDials and its own pickers inside, and keeps its dials in the URL with useUrlDials.
// ONE_PAL has the chrome palette's names, so a cook's own pickers that take `pal` are dressed by it.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Archive, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Moon, PanelLeftClose, PanelRightClose, Sun, X } from 'lucide-react';
import { ColorControl, DialStore, Folder, Slider, TextControl, Toggle, useDialKit, type ColorConfig, type ControlMeta, type PanelConfig, type SelectConfig } from 'dialkit';
import 'dialkit/styles.css';
import './dialkit-dress.css';
import { DOCK_KEY, Grabber, PAL, PanelIcon, loadSpot, type Pal, type Polarity, type SpotId } from './chrome';

export const ONE_WIDTH = 320;
export const ONE_PAL = {
  dark: {
    ...PAL.dark,
    meta: 'text-white/75', metaSub: 'text-white/60', metaLink: 'hover:text-white',
    itemOn: 'bg-white/[0.11] text-white font-medium',
    itemOff: 'bg-white/[0.05] text-white/75 hover:bg-white/10 hover:text-white',
    laneNote: 'text-white/60', micro: 'text-white/60', microHover: 'hover:text-white',
    inkHi: 'text-white/95', inkMid: 'text-white/75',
    toggleBtn: 'bg-white/[0.08] text-white/90 hover:bg-white/[0.16]',
  },
  light: {
    ...PAL.light,
    meta: 'text-black/75', metaSub: 'text-black/60', metaLink: 'hover:text-black',
    itemOn: 'bg-black/[0.10] text-black font-medium',
    itemOff: 'bg-black/[0.04] text-black/75 hover:bg-black/[0.08] hover:text-black',
    laneNote: 'text-black/60', micro: 'text-black/60', microHover: 'hover:text-black',
    inkHi: 'text-black/95', inkMid: 'text-black/75',
    toggleBtn: 'bg-black/[0.06] text-black/90 hover:bg-black/[0.12]',
  },
} as unknown as Record<Polarity, Pal>;

// What the sidebar's own parts need past the chrome palette's names.
export const ONE_MORE = {
  dark: { tag: 'bg-white/[0.07] text-white/60', ghost: 'text-white/60 hover:bg-white/[0.08] hover:text-white', foot: 'border-white/[0.08]', menu: 'bg-[#1E1D1C] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_32px_rgba(0,0,0,0.5)]', focus: 'outline-none focus-visible:bg-white/[0.08] focus-visible:text-white' },
  light: { tag: 'bg-black/[0.06] text-black/60', ghost: 'text-black/60 hover:bg-black/[0.06] hover:text-black', foot: 'border-black/[0.08]', menu: 'bg-[#FCFBF9] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_12px_32px_rgba(0,0,0,0.16)]', focus: 'outline-none focus-visible:bg-black/[0.06] focus-visible:text-black' },
};

export const ONE_ROW = 'flex min-h-9 w-full items-center rounded-[8px] px-3 text-left text-[13px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none';
export const ONE_SECTION = 'm-0 [font-family:system-ui] text-[13px] font-semibold tracking-[-0.01em]';

// The pointing toolbar in the sidebar's foot, `off` in from the window's edge with the sidebar.
// Its box is 337 wide with the pill at its right end.
const FOOT = (side: Side, off: number) => side === 'right'
  ? `[data-feedback-toolbar]:not(aside){right:${12 + off}px!important;bottom:${8 + off}px!important;z-index:2147483647!important}`
  : `[data-feedback-toolbar]:not(aside){right:auto!important;left:${ONE_WIDTH - 12 - 337 + off}px!important;bottom:${8 + off}px!important;z-index:2147483647!important}`;
// No scrollbar anywhere in the sidebar, DialKit's own included; OneScroll's shades say what scrolls.
const NO_BARS = '[data-one] *{scrollbar-width:none}[data-one] *::-webkit-scrollbar{display:none}';
// The Decided section shows only when a question has been decided into it.
const DECIDED_EMPTY = '[data-decided]:not(:has([data-decided-line])){display:none}';
// The sidebar stands on a side. Its handle also docks at the bottom; opened from there, the
// sidebar comes up on the side it was on last.
type Side = 'left' | 'right';
// How it sits by the page: `edge`, the default, stands over the page on its edge, on its border
// alone, no shadow; `push` makes room, so the page narrows; `card` floats over it, in from the
// edges, with a shadow.
export type Sits = 'push' | 'edge' | 'card';
const CARD_GAP = 12;
const PLACE: Record<Sits, Record<Side, string>> = {
  push: { right: 'inset-y-0 right-0 border-l', left: 'inset-y-0 left-0 border-r' },
  // Over the page, the page's words would show through the ground's 3%; a blur keeps them out.
  edge: { right: 'inset-y-0 right-0 border-l backdrop-blur-xl', left: 'inset-y-0 left-0 border-r backdrop-blur-xl' },
  card: { right: 'inset-y-3 right-3 rounded-[14px] border shadow-[0_16px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl', left: 'inset-y-3 left-3 rounded-[14px] border shadow-[0_16px_48px_rgba(0,0,0,0.38)] backdrop-blur-xl' },
};
const ORIGIN: Record<SpotId, string> = { right: 'calc(100% - 15px) 50%', left: '15px 50%', bottom: '50% calc(100% - 15px)' };
// The collapse button's forms: the cross, bare (the default); the cross on a ground; the panel icon
// on a ground, two chevrons toward the side it hides to, or the word.
export type CollapseForm = 'panel' | 'chevrons' | 'cross' | 'crossGround' | 'word';
// Where the header's two buttons stand: both together at the right (`right`, the default), or the
// collapse at the left and the ground's switch at the right (`split`).
export type HeaderForm = 'split' | 'right';
const CLOSE = { right: PanelRightClose, left: PanelLeftClose };
const CHEVRONS = { right: ChevronsRight, left: ChevronsLeft };
const CHEVRON = { right: ChevronRight, left: ChevronLeft };
const ICON_BTN = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none';
// Agentation keeps its theme here and reads it when it mounts; DevTools mounts it again on the event.
const POINTING_THEME = 'feedback-toolbar-theme';
const pointingTheme = (theme: string | null) => {
  try { if (theme == null) window.localStorage.removeItem(POINTING_THEME); else window.localStorage.setItem(POINTING_THEME, theme); } catch { /* private mode */ }
  window.dispatchEvent(new Event('pointing:theme'));
};

// What a cook holds of its sidebar: open or collapsed, its ground, where its handle is docked and
// which side it stands on.
export function useOneSidebar(ground: Polarity = 'dark') {
  const [open, setOpen] = useState(true);
  const [polarity, setPolarity] = useState(ground);
  const [spot, setSpot] = useState<SpotId>('right');
  const [side, setSide] = useState<Side>('right');
  useEffect(() => { // the dock is read post-mount only (chrome.tsx)
    const docked = loadSpot();
    let last: unknown;
    try { last = JSON.parse(window.localStorage.getItem(DOCK_KEY) ?? '{}').last; } catch { /* private mode, corrupt value */ }
    /* eslint-disable react-hooks/set-state-in-effect */
    setSpot(docked);
    setSide(docked !== 'bottom' ? docked : last === 'left' ? 'left' : 'right');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const dock = (to: SpotId) => {
    const stands = to === 'bottom' ? side : to;
    setSpot(to); setSide(stands);
    try { window.localStorage.setItem(DOCK_KEY, JSON.stringify({ side: to, last: stands })); } catch { /* private mode */ }
  };
  // What was settled on this page: decided questions and retired lanes, in .cook/decided.json.
  const [kept, setKept] = useState<Kept>(NONE_KEPT);
  useEffect(() => {
    void fetch(`/dev/cook-decided?page=${encodeURIComponent(window.location.pathname)}`).then(r => r.ok ? r.json() : NONE_KEPT).then(setKept);
  }, []);
  const send = (method: 'POST' | 'DELETE', body: object, now: (k: Kept) => Kept) => {
    setKept(now);
    void fetch('/dev/cook-decided', { method, body: JSON.stringify({ page: window.location.pathname, ...body }) });
  };
  const settle = {
    kept,
    decide: (key: string, question: string, value: string) => send('POST', { key, question, value }, k => ({ ...k, decided: { ...k.decided, [key]: { question, value } } })),
    undo: (key: string) => send('DELETE', { key }, k => { const decided = { ...k.decided }; delete decided[key]; return { ...k, decided }; }),
    retire: (id: string) => send('POST', { retire: id }, k => ({ ...k, retired: [...k.retired.filter(r => r !== id), id] })),
    restore: (id: string) => send('DELETE', { retire: id }, k => ({ ...k, retired: k.retired.filter(r => r !== id) })),
  };
  // Where a decided question shows its line: the Decided section at the foot of the body.
  const [decidedBox, setDecidedBox] = useState<HTMLElement | null>(null);
  return { open, setOpen, polarity, setPolarity, spot, side, dock, pal: ONE_PAL[polarity], settle, decidedBox, setDecidedBox };
}
type Kept = { decided: Record<string, { question: string; value: string }>; retired: string[] };
const NONE_KEPT: Kept = { decided: {}, retired: [] };
export type Bar = ReturnType<typeof useOneSidebar>;

// The whole sidebar: the header, the body the cook fills, the pointed notes, and a foot for the
// pointing toolbar. It tells the page how much room it takes
// in --cook-inset (left) and --cook-inset-right.
export function OneSidebar({ bar, title, tags, sits = 'edge', collapse = 'cross', header = 'right', children }: { bar: Bar; title: string; tags: string[]; sits?: Sits; collapse?: CollapseForm; header?: HeaderForm; children: ReactNode }) {
  const { open, setOpen, polarity, setPolarity, spot, side, dock, pal, setDecidedBox } = bar;
  const more = ONE_MORE[polarity];
  const Close = { panel: CLOSE, chevrons: CHEVRONS, cross: { right: X, left: X }, crossGround: { right: X, left: X }, word: CHEVRON }[collapse][side];
  useEffect(() => {
    const root = document.documentElement.style;
    const room = open && sits === 'push' ? `${ONE_WIDTH}px` : '0px';
    root.setProperty('--cook-inset', side === 'left' ? room : '0px');
    root.setProperty('--cook-inset-right', side === 'right' ? room : '0px');
    return () => { root.removeProperty('--cook-inset'); root.removeProperty('--cook-inset-right'); };
  }, [open, side, sits]);
  useEffect(() => { // H hides and shows it, unless someone is typing; one key, the same on every keyboard layout
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"]');
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.key.toLowerCase() !== 'h' || typing) return;
      setOpen(!open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);
  useEffect(() => { // the pointing toolbar takes the sidebar's ground while the cook is open
    let was: string | null = null;
    try { was = window.localStorage.getItem(POINTING_THEME); } catch { /* private mode */ }
    pointingTheme(polarity);
    return () => pointingTheme(was);
  }, [polarity]);
  const collapseBtn = (
    <button onClick={() => setOpen(false)} aria-label="collapse cook sidebar" aria-keyshortcuts="H" title="Hide (H)" data-collapse={collapse}
        className={collapse === 'word'
          ? `flex h-8 shrink-0 items-center gap-0.5 rounded-[8px] pl-2 pr-1.5 text-[12px] font-medium cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${pal.toggleBtn}`
          : `${ICON_BTN} ${collapse === 'panel' || collapse === 'crossGround' ? pal.toggleBtn : more.ghost}`}>
      {collapse === 'word' && 'Hide'}<Close size={16} strokeWidth={1.8} />
    </button>
  );
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NO_BARS + DECIDED_EMPTY + FOOT(side, sits === 'card' ? CARD_GAP : 0) }} />
      {!open && <Grabber spot={spot} setSpot={dock} onOpen={() => setOpen(true)} />}
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="expand cook sidebar"
          className={`sm:hidden fixed right-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-[2147483647] w-10 h-10 flex items-center justify-center rounded-full active:scale-[0.96] cursor-pointer touch-manipulation transition-[scale,color] duration-150 motion-reduce:transition-none ${pal.fab}`}>
          <PanelIcon />
        </button>
      )}
      <aside style={{ transformOrigin: ORIGIN[spot] }}
        // The sidebar is the harness, never the thing pointed at: Agentation's picking skips its own toolbar, and this is marked as one.
        data-one data-dock={side} data-feedback-toolbar
        className={`fixed z-[2147483647] w-[320px] flex flex-col overflow-hidden [font-family:system-ui] motion-reduce:transition-none ${PLACE[sits][side]} ${pal.aside} ${open
          ? '[transition:transform_200ms_cubic-bezier(0,0,0.2,1),opacity_160ms_ease-out]'
          : '[transform:scale(0.94)] opacity-0 pointer-events-none [transition:transform_200ms_ease-out,opacity_160ms_ease-out]'}`}>
        {/* The collapse button, the name and its tags with "All cooks" under them, the ground's switch (or both buttons at the right). */}
        <div className={`flex shrink-0 items-start gap-2 pr-3 pt-3 pb-2 ${header === 'split' ? 'pl-3' : 'pl-4'}`}>
          {header === 'split' && collapseBtn}
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className={`truncate text-[15px] font-semibold leading-6 tracking-[-0.01em] ${pal.inkHi}`}>{title}</span>
              {/* The tags keep to one line: by the name when they fit, under it when not. */}
              <span className="flex shrink-0 gap-1">
                {tags.map(t => <span key={t} className={`whitespace-nowrap rounded-[5px] px-1.5 py-0.5 text-[11px] leading-[1.4] ${more.tag}`}>{t}</span>)}
              </span>
            </div>
            <OneLink bar={bar} href="/dev/visual-cook" back className="-ml-1.5 mt-1" data-all-cooks>All cooks</OneLink>
          </div>
          <button onClick={() => setPolarity(polarity === 'dark' ? 'light' : 'dark')} aria-label={`${polarity === 'dark' ? 'light' : 'dark'} sidebar`} title={polarity === 'dark' ? 'Light sidebar' : 'Dark sidebar'} className={`${ICON_BTN} ${more.ghost}`}>
            {polarity === 'dark' ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
          </button>
          {header === 'right' && collapseBtn}
        </div>
        <Drift bar={bar} />
        <OneScroll polarity={polarity} className="min-h-0 flex-1" inner="flex flex-col gap-5 px-4 pt-2 pb-5">
          <OneVersions bar={bar} />
          {children}
          <Pointed pal={pal} />
          <div className="flex flex-col gap-1.5" data-decided>
            <p className={`${ONE_SECTION} ${pal.inkHi}`}>Decided</p>
            <div ref={setDecidedBox} className="flex flex-col" />
          </div>
        </OneScroll>
        <div className={`h-[60px] shrink-0 border-t ${more.foot}`} data-one-foot />
      </aside>
    </>
  );
}

// A box that scrolls with no bar: a light shade and a blur at an edge with more past it.
const SHADE = { dark: 'rgba(0,0,0,0.45)', light: 'rgba(0,0,0,0.07)' };
function OneScroll({ polarity, className, inner, children }: { polarity: Polarity; className: string; inner: string; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ up: false, down: false });
  const measure = () => {
    const el = box.current;
    if (el) setMore({ up: el.scrollTop > 1, down: el.scrollTop + el.clientHeight < el.scrollHeight - 1 });
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const seen = new ResizeObserver(measure);
    seen.observe(el);
    if (el.firstElementChild) seen.observe(el.firstElementChild);
    return () => seen.disconnect();
  }, []);
  const edge = (at: 'top' | 'bottom', on: boolean) => (
    <div aria-hidden data-scroll-shade={at} className={`pointer-events-none absolute inset-x-0 z-10 h-7 backdrop-blur-[3px] transition-opacity duration-150 motion-reduce:transition-none ${at === 'top' ? 'top-0' : 'bottom-0'} ${on ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: `linear-gradient(${at === 'top' ? 'to bottom' : 'to top'}, ${SHADE[polarity]}, transparent)`, maskImage: `linear-gradient(${at === 'top' ? 'to bottom' : 'to top'}, black, transparent)` }} />
  );
  return (
    <div className={`relative flex flex-col overflow-hidden ${className}`}>
      <div ref={box} onScroll={measure} className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><div className={inner}>{children}</div></div>
      {edge('top', more.up)}
      {edge('bottom', more.down)}
    </div>
  );
}

// A link in the sidebar: a quiet button with an arrow, back before the words or onward after them.
export function OneLink({ bar, href, back, className = '', children, ...rest }: { bar: Bar; href: string; back?: boolean; className?: string; children: ReactNode } & Record<`data-${string}`, unknown>) {
  return (
    <Link href={href} {...rest} className={`inline-flex h-7 w-fit items-center gap-1 rounded-[8px] text-[12px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${back ? 'pl-1.5 pr-2' : 'pl-2 pr-1.5'} ${ONE_MORE[bar.polarity].ghost} ${className}`}>
      {back && <ArrowLeft size={14} strokeWidth={1.8} />}{children}{!back && <ArrowRight size={14} strokeWidth={1.8} />}
    </Link>
  );
}

// The whole cook saved as a version: its URL holds the lane, the picks and the dials, so a version
// is that URL, numbered per cook and kept in .cook/versions.json. Opening one loads it.
type Version = { n: number; at: string; search: string };
const sameCook = (a: string, b: string) => {
  const norm = (q: string) => { const p = new URLSearchParams(q); p.delete('chrome'); p.sort(); return p.toString(); };
  return norm(a) === norm(b);
};
const VERSION_LOOK_MS = 1000;
// DialKit's own icons for adding a preset and deleting one (dialkit/dist ICON_ADD_PRESET, ICON_TRASH).
const DIALKIT_ICON = {
  add: { width: 2.5, d: ['M4 6H20', 'M4 12H10', 'M15 15L21 15', 'M18 12V18', 'M4 18H10'] },
  trash: { width: 2, d: ['M5 6.5L5.80734 18.2064C5.91582 19.7794 7.22348 21 8.80023 21H15.1998C16.7765 21 18.0842 19.7794 18.1927 18.2064L19 6.5', 'M10 11V16', 'M14 11V16', 'M3.5 6H20.5', 'M8.07092 5.74621C8.42348 3.89745 10.0485 2.5 12 2.5C13.9515 2.5 15.5765 3.89745 15.9291 5.74621'] },
};
const DialKitIcon = ({ of, size }: { of: keyof typeof DIALKIT_ICON; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={DIALKIT_ICON[of].width} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {DIALKIT_ICON[of].d.map(d => <path key={d} d={d} />)}
  </svg>
);
function OneVersions({ bar }: { bar: Bar }) {
  const { pal, polarity } = bar;
  const more = ONE_MORE[polarity];
  const [versions, setVersions] = useState<Version[]>([]);
  const [search, setSearch] = useState('');
  useEffect(() => {
    void fetch(`/dev/cook-versions?page=${encodeURIComponent(window.location.pathname)}`).then(r => r.ok ? r.json() : []).then(setVersions);
    // The cook writes its URL with replaceState, which raises no event; the tick follows it by looking.
    const look = () => setSearch(window.location.search);
    look();
    const every = window.setInterval(look, VERSION_LOOK_MS);
    return () => clearInterval(every);
  }, []);
  const send = async (method: 'POST' | 'DELETE', body: object) => {
    const r = await fetch('/dev/cook-versions', { method, body: JSON.stringify({ page: window.location.pathname, ...body }) });
    if (r.ok) setVersions(await r.json());
  };
  const time = (at: string) => new Date(at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex flex-col gap-1.5" data-versions>
      <div className="flex items-center justify-between">
        <p className={`${ONE_SECTION} ${pal.inkHi}`}>Versions</p>
        <button onClick={() => send('POST', { search: window.location.search })} data-version-save title="Save the cook as it is now: lane, picks and dials"
          className={`-mr-1.5 inline-flex h-7 items-center gap-1 rounded-[8px] pl-1.5 pr-2 text-[12px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${more.ghost}`}>
          <DialKitIcon of="add" size={14} />Save this one
        </button>
      </div>
      {versions.length > 0 && (
        <div className="flex flex-col">
          {versions.map(v => {
            const on = sameCook(v.search, search);
            return (
              <div key={v.n} className={`group flex min-h-8 items-center rounded-[7px] text-[13px] ${on ? pal.itemOn : more.ghost}`}>
                <button onClick={() => window.location.assign(window.location.pathname + v.search)} data-version={v.n} className="flex min-h-8 flex-1 items-center justify-between gap-2 pl-3 pr-1 text-left cursor-pointer">
                  <span>Version {v.n}</span><span className="text-[12px] opacity-60">{time(v.at)}</span>
                </button>
                <button onClick={() => send('DELETE', { n: v.n })} aria-label={`remove version ${v.n}`} data-version-remove={v.n}
                  className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] opacity-0 group-hover:opacity-60 hover:!opacity-100 focus-visible:opacity-100 cursor-pointer">
                  <DialKitIcon of="trash" size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export type Option<T extends string> = { id: T; label: ReactNode; note?: string };
const noteOf = (pal: Pal, text?: string) => text && <p className={`m-0 px-3 pt-1.5 text-[12px] leading-[1.5] ${pal.laneNote}`}>{text}</p>;
const textOf = (label: ReactNode, id: string) => typeof label === 'string' || typeof label === 'number' ? String(label) : id;

// A menu that floats under the row it opens from, over whatever is below, the row's width; it scrolls
// inside with the sidebar's shade when long and stays inside the window, opening upward when there is
// more room above. It closes on a click outside and on Escape; up and down move through its rows.
const FLOAT_MAX = 0.6;
const FLOAT_GAP = 4;
const FLOAT_EDGE = 12;
const FLOAT_ROW = 'flex min-h-8 w-full shrink-0 items-center justify-between gap-2 rounded-[7px] px-2.5 text-left text-[13px] cursor-pointer';
function OneFloat({ bar, anchor, close, children }: { bar: Bar; anchor: RefObject<HTMLElement | null>; close: () => void; children: ReactNode }) {
  const { polarity } = bar;
  const box = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ host: HTMLElement; style: CSSProperties } | null>(null);
  useLayoutEffect(() => {
    const el = anchor.current;
    if (!el) return;
    // Inside the sidebar the menu hangs from the aside, which its blur makes the frame for anything fixed.
    const host = el.closest<HTMLElement>('aside[data-one]') ?? document.body;
    const put = () => {
      const r = el.getBoundingClientRect();
      const inBody = host === document.body;
      const o = inBody ? { top: 0, left: 0 } : host.getBoundingClientRect();
      const top = o.top + (inBody ? 0 : host.clientTop), left = o.left + (inBody ? 0 : host.clientLeft);
      // It keeps clear of the sidebar's foot, where the pointing toolbar sits.
      const floor = host.querySelector('[data-one-foot]')?.getBoundingClientRect().top ?? window.innerHeight - FLOAT_EDGE;
      const below = floor - r.bottom - FLOAT_GAP, above = r.top - FLOAT_EDGE;
      const up = below < 200 && above > below;
      const style: CSSProperties = { position: inBody ? 'fixed' : 'absolute', left: r.left - left, width: r.width, maxHeight: Math.min(window.innerHeight * FLOAT_MAX, up ? above : below) - FLOAT_GAP };
      if (up) style.bottom = (inBody ? window.innerHeight : top + host.clientHeight) - r.top + FLOAT_GAP;
      else style.top = r.bottom - top + FLOAT_GAP;
      setPlace({ host, style });
    };
    put();
    const onScroll = (e: Event) => { if (!box.current?.contains(e.target as Node)) put(); };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', put);
    return () => { window.removeEventListener('scroll', onScroll, true); window.removeEventListener('resize', put); };
  }, [anchor]);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.current?.contains(t)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      close();
      anchor.current?.querySelector<HTMLElement>('[data-float-anchor]')?.focus();
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', onKey, true); };
  }, [anchor, close]);
  const placed = !!place;
  useEffect(() => { // the picked row takes the focus, so up, down and Enter go on from it
    if (!placed) return;
    const rows = [...(box.current?.querySelectorAll<HTMLElement>('[data-float-item]') ?? [])];
    (rows.find(r => r.dataset.on === 'true') ?? rows[0])?.focus({ preventScroll: true });
    rows.find(r => r.dataset.on === 'true')?.scrollIntoView({ block: 'nearest' });
  }, [placed]);
  const step = (e: ReactKeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const rows = [...(box.current?.querySelectorAll<HTMLElement>('[data-float-item]') ?? [])];
    const at = rows.indexOf(document.activeElement as HTMLElement);
    rows[(at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length]?.focus();
  };
  if (!place) return null;
  return createPortal(
    <div ref={box} data-float onKeyDown={step} style={place.style} className={`z-30 flex flex-col overflow-hidden rounded-[10px] [font-family:system-ui] ${ONE_MORE[polarity].menu}`}>
      <OneScroll polarity={polarity} className="min-h-0 flex-1" inner="flex flex-col gap-0.5 p-1">{children}</OneScroll>
    </div>,
    place.host,
  );
}

// A row in a floating menu: the picked one ticked as OnePick ticks it, an action of its own on hover.
function FloatPick({ bar, on, pick, action, children, ...rest }: { bar: Bar; on: boolean; pick: () => void; action?: ReactNode; children: ReactNode } & Record<`data-${string}`, unknown>) {
  const { pal, polarity } = bar;
  const more = ONE_MORE[polarity];
  return (
    <div className={`group/row flex shrink-0 items-center rounded-[7px] ${on ? pal.itemOn : more.ghost}`}>
      <button onClick={pick} data-float-item data-on={on} {...rest} className={`${FLOAT_ROW} min-w-0 flex-1 ${on ? '' : more.focus}`}>
        <span className="min-w-0 truncate">{children}</span>{on && <Check size={15} strokeWidth={2} className="shrink-0 opacity-70" />}
      </button>
      {action}
    </div>
  );
}

// A quiet word that shows on its row's hover, or when it has the focus.
function RowWord({ bar, onClick, label, children, className = '', ...rest }: { bar: Bar; onClick: () => void; label?: string; children: ReactNode; className?: string } & Record<`data-${string}`, unknown>) {
  return (
    <button onClick={e => { e.stopPropagation(); onClick(); }} onPointerDown={e => e.stopPropagation()} aria-label={label} title={label} {...rest}
      className={`pointer-events-auto inline-flex h-6 shrink-0 items-center rounded-[6px] px-1.5 text-[12px] font-normal opacity-0 group-hover/q:opacity-100 group-hover/row:opacity-100 focus-visible:opacity-100 cursor-pointer transition-opacity duration-150 motion-reduce:transition-none ${ONE_MORE[bar.polarity].ghost} ${className}`}>
      {children}
    </button>
  );
}
const Decide = ({ bar, k, question, value }: { bar: Bar; k: string; question: string; value: string }) => (
  <RowWord bar={bar} onClick={() => bar.settle.decide(k, question, value)} data-decide={k}>Decide</RowWord>
);

// A decided question's line in the Decided section: "question · value", with Undo on hover.
function DecidedLine({ bar, k, question, value }: { bar: Bar; k: string; question: ReactNode; value: ReactNode }) {
  if (!bar.decidedBox) return null;
  return createPortal(
    <div data-decided-line={k} className={`group/q flex min-h-8 items-center gap-2 rounded-[7px] pl-3 pr-1 text-[13px] ${bar.pal.inkMid}`}>
      <span className="min-w-0 flex-1 truncate">{question} · <span className={bar.pal.inkHi}>{value}</span></span>
      <RowWord bar={bar} onClick={() => bar.settle.undo(k)} data-undo={k}>Undo</RowWord>
    </div>,
    bar.decidedBox,
  );
}

// The lanes retired, at the foot of their list: "N retired", opened to restore one.
function Retired<T extends string>({ bar, lanes }: { bar: Bar; lanes: Option<T>[] }) {
  const { pal, polarity } = bar;
  const more = ONE_MORE[polarity];
  const [open, setOpen] = useState(false);
  if (!lanes.length) return null;
  return (
    <div className="flex shrink-0 flex-col" data-retired>
      <button onClick={() => setOpen(!open)} aria-expanded={open} data-retired-toggle className={`${FLOAT_ROW} justify-start gap-1 ${pal.micro} ${more.ghost} ${more.focus}`}>
        {open ? <ChevronDown size={14} strokeWidth={1.8} /> : <ChevronRight size={14} strokeWidth={1.8} />}{lanes.length} retired
      </button>
      {open && lanes.map(l => (
        <div key={l.id} className={`group/row flex min-h-8 shrink-0 items-center gap-2 rounded-[7px] pl-2.5 pr-1 text-[13px] ${pal.micro}`}>
          <span className="min-w-0 flex-1 truncate">{l.label}</span>
          <RowWord bar={bar} onClick={() => bar.settle.restore(l.id)} data-restore={l.id}>Restore</RowWord>
        </div>
      ))}
    </div>
  );
}

// Retiring lanes: the lanes out, whether one may go (the first, what is live, may not), and the two moves.
type Retiring<T extends string> = { out: Option<T>[]; can: (id: T) => boolean; retire: (id: T) => void };
const RetireIcon = ({ bar, id, retire }: { bar: Bar; id: string; retire: () => void }) => (
  <RowWord bar={bar} onClick={retire} label="Retire" data-retire={id} className="mr-1 w-6 justify-center !px-0"><Archive size={13} strokeWidth={1.8} /></RowWord>
);

// One row for a pick among many: the picked one and a chevron, opening a floating menu of them all,
// with a step back and forward beside it.
export function OneMenu<T extends string>({ bar, options, value, pick, name, retiring }: { bar: Bar; options: Option<T>[]; value: T; pick: (id: T) => void; name: string; retiring?: Retiring<T> }) {
  const { pal } = bar;
  const [menu, setMenu] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const at = Math.max(0, options.findIndex(o => o.id === value));
  const step = (by: number) => pick(options[(at + by + options.length) % options.length].id);
  return (
    <div>
      <div ref={row} className="flex gap-1">
        <button onClick={() => setMenu(!menu)} onKeyDown={e => { if (e.key === 'ArrowDown' && !menu) { e.preventDefault(); setMenu(true); } }} aria-expanded={menu} aria-haspopup="listbox" data-menu={name} data-float-anchor
          className={`${ONE_ROW} min-w-0 flex-1 justify-between gap-2 ${pal.itemOn}`}>
          <span className="truncate">{options[at].label}</span><ChevronDown size={15} strokeWidth={1.8} className="shrink-0 opacity-60" />
        </button>
        <button onClick={() => step(-1)} aria-label="the one before" data-step={`${name}-1`} className={`${ICON_BTN} h-9 w-9 ${pal.itemOff}`}><ChevronLeft size={16} strokeWidth={1.8} /></button>
        <button onClick={() => step(1)} aria-label="the next one" data-step={`${name}+1`} className={`${ICON_BTN} h-9 w-9 ${pal.itemOff}`}><ChevronRight size={16} strokeWidth={1.8} /></button>
      </div>
      {menu && (
        <OneFloat bar={bar} anchor={row} close={() => setMenu(false)}>
          {options.map(o => (
            <FloatPick key={o.id} bar={bar} on={o.id === value} pick={() => { pick(o.id); setMenu(false); }} data-pick={`${name}-${o.id}`}
              action={retiring?.can(o.id) && <RetireIcon bar={bar} id={o.id} retire={() => retiring.retire(o.id)} />}>{o.label}</FloatPick>
          ))}
          {retiring && <Retired bar={bar} lanes={retiring.out} />}
        </OneFloat>
      )}
      {noteOf(pal, options[at].note)}
    </div>
  );
}

// The lanes. A few are a list; past LANES_LISTED they are a menu row, so nineteen lanes take one row.
// A retired lane leaves the list, the menu and the steps; the first, what is live, stays.
const LANES_LISTED = 6;
export function OneLanes<T extends string>({ bar, lanes, lane, pick }: { bar: Bar; lanes: { id: T; label: string; note: string }[]; lane: T; pick: (id: T) => void }) {
  const { pal } = bar;
  const out = bar.settle.kept.retired;
  const live = lanes.filter(l => !out.includes(l.id) || l.id === lane);
  const retiring: Retiring<T> = {
    out: lanes.filter(l => out.includes(l.id)),
    can: id => id !== lanes[0]?.id,
    retire: id => {
      const rest = live.filter(l => l.id !== id);
      if (id === lane && rest.length) pick(rest[live.findIndex(l => l.id === id) % rest.length].id);
      bar.settle.retire(id);
    },
  };
  const at = Math.max(0, live.findIndex(l => l.id === lane));
  if (live.length <= LANES_LISTED) return (
    <div className="flex flex-col gap-1.5">
      <p className={`${ONE_SECTION} ${pal.inkHi}`}>Lanes</p>
      {live.map(l => (
        <div key={l.id}>
          <div className={`group/row flex items-center rounded-[8px] ${l.id === lane ? pal.itemOn : pal.itemOff}`}>
            <button onClick={() => pick(l.id)} data-lane-pick={l.id} className={`${ONE_ROW} min-w-0 flex-1`}>{l.label}</button>
            {retiring.can(l.id) && <RetireIcon bar={bar} id={l.id} retire={() => retiring.retire(l.id)} />}
          </div>
          {l.id === lane && noteOf(pal, l.note)}
        </div>
      ))}
      <Retired bar={bar} lanes={retiring.out} />
    </div>
  );
  return (
    <div className="flex flex-col gap-1.5">
      <p className={`${ONE_SECTION} ${pal.inkHi}`}>Lanes <span className={`font-normal ${pal.micro}`}>{at + 1} of {live.length}</span></p>
      <OneMenu bar={bar} options={live} value={lane} pick={pick} name="lane" retiring={retiring} />
    </div>
  );
}

// A pick of one among a few, each with a line saying what it is: a tight list, a tick on the
// picked one, its line under the list. Decided, it leaves for the Decided section.
export function OnePick<T extends string>({ bar, title, name, options, value, pick }: { bar: Bar; title: string; name: string; options: Option<T>[]; value: T; pick: (id: T) => void }) {
  const { pal, polarity } = bar;
  const now = options.find(o => o.id === value);
  if (bar.settle.kept.decided[name]) return <DecidedLine bar={bar} k={name} question={title} value={now?.label ?? value} />;
  return (
    <div className="group/q flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <p className={`${ONE_SECTION} ${pal.inkHi}`}>{title}</p>
        <Decide bar={bar} k={name} question={title} value={textOf(now?.label, value)} />
      </div>
      <div className="flex flex-col">
        {options.map(o => (
          <button key={o.id} onClick={() => pick(o.id)} data-pick={`${name}-${o.id}`}
            className={`flex min-h-8 w-full items-center justify-between gap-2 rounded-[7px] px-3 py-1.5 text-left text-[13px] leading-[1.4] cursor-pointer ${o.id === value ? pal.itemOn : ONE_MORE[polarity].ghost}`}>
            {o.label}{o.id === value && <Check size={15} strokeWidth={2} className="shrink-0 opacity-70" />}
          </button>
        ))}
      </div>
      {noteOf(pal, now?.note)}
    </div>
  );
}

// DialKit's panels in the sidebar's flow, drawn here from DialKit's own controls so that a pick-one
// opens the sidebar's floating menu. A dial is known by its URL name. Dials have no Decide: the
// word over a slider would cover its fill.
const PARAMS = new Map<string, Record<string, string>>();
const noPanels: PanelConfig[] = [];
function usePanels() {
  const [panels, setPanels] = useState(noPanels);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- DialStore is read after mount, as DialRoot reads it
    setPanels(DialStore.getPanels());
    return DialStore.subscribeGlobal(() => setPanels(DialStore.getPanels()));
  }, []);
  return panels;
}
export function OneDials({ bar }: { bar: Bar }) {
  const panels = usePanels();
  return (
    <div className="shrink-0" data-dialkit-inline>
      <div className="dialkit-root" data-mode="inline" data-theme={bar.polarity}>
        <div className="dialkit-panel" data-mode="inline">
          {panels.map(p => <DialPanel key={p.id} bar={bar} panel={p} />)}
        </div>
      </div>
    </div>
  );
}
const labelOf = (o: SelectConfig['options'][number]) => typeof o === 'string' ? { id: o, label: o.replace(/\b\w/g, c => c.toUpperCase()) } : { id: o.value, label: o.label };
function DialPanel({ bar, panel }: { bar: Bar; panel: PanelConfig }) {
  const values = useSyncExternalStore(cb => DialStore.subscribe(panel.id, cb), () => DialStore.getValues(panel.id), () => DialStore.getValues(panel.id));
  const q = PARAMS.get(panel.name) ?? {};
  const keyOf = (c: ControlMeta) => q[c.path] ?? c.path;
  const set = (c: ControlMeta) => (v: unknown) => DialStore.updateValue(panel.id, c.path, v as never);
  const control = (c: ControlMeta) => {
    const v = values[c.path];
    const label = c.label;
    switch (c.type) {
      case 'slider': return <Slider label={label} value={v as number} onChange={set(c)} min={c.min} max={c.max} step={c.step} />;
      case 'toggle': return <Toggle label={label} checked={v as boolean} onChange={set(c)} />;
      case 'color': return <ColorControl label={label} value={v as string} onChange={set(c)} />;
      case 'text': return <TextControl label={label} value={v as string} onChange={set(c)} placeholder={c.placeholder} />;
      case 'select': return <DialSelect bar={bar} name={keyOf(c)} label={label} value={v as string} options={(c.options ?? []).map(labelOf)} pick={set(c)} />;
      default: return null;
    }
  };
  return (
    <div className="dialkit-panel-wrapper">
      <Folder title={panel.name} isRoot inline>
        {panel.controls.map(c => <div key={c.path} data-dial={keyOf(c)}>{control(c)}</div>)}
      </Folder>
    </div>
  );
}

// A pick-one dial: DialKit's select row, opening the sidebar's floating menu.
function DialSelect({ bar, name, label, value, options, pick }: { bar: Bar; name: string; label: ReactNode; value: string; options: { id: string; label: string }[]; pick: (v: string) => void }) {
  const [menu, setMenu] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const toggle = () => setMenu(!menu);
  return (
    <div ref={row} className="dialkit-select-row">
      <div role="button" tabIndex={0} onClick={toggle} data-float-anchor data-open={menu} aria-expanded={menu} aria-haspopup="listbox" data-menu={name}
        onKeyDown={e => { if (e.target !== e.currentTarget) return; if (e.key === 'Enter' || e.key === ' ' || (e.key === 'ArrowDown' && !menu)) { e.preventDefault(); toggle(); } }}
        className="dialkit-select-trigger">
        <span className="dialkit-select-label inline-flex items-center">{label}</span>
        <div className="dialkit-select-right min-w-0">
          <span className="dialkit-select-value">{options.find(o => o.id === value)?.label ?? value}</span>
          <ChevronDown className="dialkit-select-chevron" strokeWidth={2.5} />
        </div>
      </div>
      {menu && (
        <OneFloat bar={bar} anchor={row} close={() => setMenu(false)}>
          {options.map(o => <FloatPick key={o.id} bar={bar} on={o.id === value} pick={() => { pick(o.id); setMenu(false); }} data-pick={`${name}-${o.id}`}>{o.label}</FloatPick>)}
        </OneFloat>
      )}
    </div>
  );
}

// The surface the cook is made of moved since the cook was last touched (/dev/cook-drift): one quiet
// line under the header, opening the commits, newest first. Bringing the cook forward is a chat's job.
const DRIFT_SHOWN = 12;
type Drifted = { since: string | null; commits: { at: string; subject: string }[] };
const dayOf = (at: string) => new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
function Drift({ bar }: { bar: Bar }) {
  const { pal, polarity } = bar;
  const more = ONE_MORE[polarity];
  const [drift, setDrift] = useState<Drifted>({ since: null, commits: [] });
  const [open, setOpen] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void fetch(`/dev/cook-drift?page=${encodeURIComponent(window.location.pathname)}`).then(r => r.ok ? r.json() : null).then(d => d && setDrift(d));
  }, []);
  const n = drift.commits.length;
  if (!drift.since || !n) return null;
  return (
    <div className="shrink-0 px-4 pb-1"><div ref={row}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} data-drift data-float-anchor
        className={`-ml-1.5 inline-flex h-7 max-w-full items-center gap-1 rounded-[8px] pl-1.5 pr-2 text-[12px] cursor-pointer transition-colors duration-150 motion-reduce:transition-none ${more.ghost}`}>
        <span className="truncate">The surface moved since {dayOf(`${drift.since}T12:00:00`)} · {n} {n === 1 ? 'change' : 'changes'}</span>
        <ChevronDown size={14} strokeWidth={1.8} className="shrink-0 opacity-60" />
      </button>
      {open && (
        <OneFloat bar={bar} anchor={row} close={() => setOpen(false)}>
          {drift.commits.slice(0, DRIFT_SHOWN).map(c => (
            <div key={c.at + c.subject} data-drift-commit className={`flex shrink-0 gap-2 rounded-[7px] px-2.5 py-1.5 text-[12px] leading-[1.45] ${pal.inkMid}`}>
              <span className={`w-11 shrink-0 ${pal.micro}`}>{dayOf(c.at)}</span><span className="min-w-0">{c.subject}</span>
            </div>
          ))}
          {n > DRIFT_SHOWN && <p className={`m-0 shrink-0 px-2.5 py-1.5 text-[12px] ${pal.micro}`}>and {n - DRIFT_SHOWN} more</p>}
        </OneFloat>
      )}
    </div></div>
  );
}

// A cook's dials: a slider [start, min, max, step], a switch, a pick-one, or a colour.
export type Dials = Record<string, [number, number, number, number?] | boolean | SelectConfig | ColorConfig>;
type Dialled = number | boolean | string;
const URL_WRITE_MS = 250;
const startOf = (d: Dials[string]): Dialled => {
  if (Array.isArray(d)) return d[0];
  if (typeof d === 'boolean') return d;
  if (d.type === 'color') return d.default ?? '#000000';
  const first = d.options[0];
  return d.default ?? (typeof first === 'string' ? first : first.value);
};
const readAs = (d: Dials[string], raw: string): Dialled | undefined => {
  if (Array.isArray(d)) { const v = Number(raw); return v >= d[1] && v <= d[2] ? v : undefined; }
  if (typeof d === 'boolean') return raw === '1';
  if (d.type === 'color') return /^#[0-9a-f]{6}$/i.test(raw) ? raw : undefined;
  return d.options.some(o => (typeof o === 'string' ? o : o.value) === raw) ? raw : undefined;
};
const putDial = (panel: string, key: string, value: Dialled) => {
  const id = DialStore.getPanels().find(p => p.name === panel)?.id;
  if (id) DialStore.updateValue(id, key, value);
};

// The dials of one DialKit panel, kept in the URL: read from it once after mount, then a moved dial
// is written to it under its short name in `q` and one back at its start is taken out. Every other
// parameter is left as it is. `dials` and `q` are the cook's constants.
export function useUrlDials(panel: string, dials: Dials, q: Record<string, string> = {}) {
  const values = useDialKit(panel, dials) as Record<string, Dialled>;
  PARAMS.set(panel, q);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    for (const [key, d] of Object.entries(dials)) {
      const raw = p.get(q[key] ?? key);
      const v = raw == null ? undefined : readAs(d, raw);
      if (v !== undefined) putDial(panel, key, v);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is read after mount, once
    setReady(true);
  }, [panel, dials, q]);
  const moved = JSON.stringify(values);
  useEffect(() => {
    if (!ready) return;
    const write = window.setTimeout(() => {
      const now: Record<string, Dialled> = JSON.parse(moved);
      const url = new URL(window.location.href);
      for (const [key, d] of Object.entries(dials)) {
        const v = now[key];
        if (v === startOf(d)) url.searchParams.delete(q[key] ?? key);
        else url.searchParams.set(q[key] ?? key, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
      }
      window.history.replaceState(null, '', url);
    }, URL_WRITE_MS);
    return () => clearTimeout(write);
  }, [ready, moved, dials, q]);
  return {
    values, ready,
    set: (key: string, value: Dialled) => putDial(panel, key, value),
    reset: () => { for (const [key, d] of Object.entries(dials)) putDial(panel, key, startOf(d)); },
  };
}

type Note = { id: string; event: string; page: string; comment?: string; element?: string };
const POINTED_EVERY_MS = 2000;

// The notes pointed on this page, as the Agentation toolbar sent them to /dev/pointed.
function Pointed({ pal }: { pal: Pal }) {
  const [notes, setNotes] = useState<Note[]>([]);
  useEffect(() => {
    const read = async () => {
      const res = await fetch('/dev/pointed');
      if (!res.ok) return;
      const kept = new Map<string, Note>();
      for (const line of (await res.text()).split('\n').filter(Boolean)) {
        const n: Note = JSON.parse(line);
        if (new URL(n.page).pathname !== window.location.pathname) continue;
        if (n.event === 'annotation.delete') kept.delete(n.id); else kept.set(n.id, n);
      }
      setNotes([...kept.values()]);
    };
    void read();
    const every = window.setInterval(read, POINTED_EVERY_MS);
    return () => clearInterval(every);
  }, []);
  if (!notes.length) return null;
  return (
    <div className="flex flex-col gap-1.5 [font-family:system-ui]" data-pointed>
      <p className={`${ONE_SECTION} ${pal.inkHi}`}>Pointed</p>
      {notes.map((n, i) => (
        <div key={n.id} className={`rounded-[8px] px-3 py-2 ${pal.itemOff} hover:bg-inherit`}>
          <div className={`text-[13px] leading-[1.4] ${pal.inkHi}`}>{i + 1} · {n.comment}</div>
          <div className={`truncate pt-0.5 font-mono text-[11px] ${pal.micro}`}>{n.element}</div>
        </div>
      ))}
    </div>
  );
}
