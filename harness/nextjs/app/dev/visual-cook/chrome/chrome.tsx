'use client';

// The cook chrome's base: the two pinned palettes, the handle a collapsed sidebar leaves on the
// page, and the three spots it docks to. one.tsx builds the sidebar on it. One copy per app,
// imported by every cook; a change to the chrome is made here, never in a cook.

import { useEffect, useRef, useState } from 'react';

export type Polarity = 'dark' | 'light';
// PINNED (no host tokens ⇒ identical chrome in every repo) and TWO (⇒ not dark by accident).
// Every class string is a COMPLETE literal — Tailwind's scanner can't see assembled ones.
export const PAL = {
  dark: {
    aside: 'bg-[#131211]/97 border-[#ffffff14]',
    meta: 'text-[#B8B4AE]', metaSub: 'text-[#7A756D]', metaLink: 'hover:text-[#E8E6E3]',
    itemOn: 'bg-[#ffffff0a] text-[#F2F0ED] font-medium',
    itemOff: 'text-[#B8B4AE] hover:bg-[#ffffff0a] hover:text-[#E8E6E3]',
    laneNote: 'text-[#7A756D]', micro: 'text-[#7A756D]', microHover: 'hover:text-[#E8E6E3]',
    inkHi: 'text-[#E8E6E3]', inkMid: 'text-[#B8B4AE]',
    toggleBtn: 'text-[#7A756D] hover:text-[#E8E6E3] hover:bg-[#ffffff0d]',
    fab: 'bg-[#131211]/80 text-[#7A756D] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.35)]',
  },
  light: {
    aside: 'bg-[#F6F4F1]/97 border-[#00000014]',
    meta: 'text-[#5A554D]', metaSub: 'text-[#8B857B]', metaLink: 'hover:text-[#262320]',
    itemOn: 'bg-[#0000000a] text-[#1F1D1A] font-medium',
    itemOff: 'text-[#5A554D] hover:bg-[#0000000a] hover:text-[#262320]',
    laneNote: 'text-[#8B857B]', micro: 'text-[#8B857B]', microHover: 'hover:text-[#262320]',
    inkHi: 'text-[#262320]', inkMid: 'text-[#5A554D]',
    toggleBtn: 'text-[#8B857B] hover:text-[#262320] hover:bg-[#0000000d]',
    fab: 'bg-[#F6F4F1]/85 text-[#8B857B] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.18)]',
  },
} as const;
export type Pal = (typeof PAL)[Polarity];

// Phone FAB only — "open a panel" is the message there.
export function PanelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><line x1="14.5" y1="4" x2="14.5" y2="20" />
    </svg>
  );
}

// HOVER grows the handle +12.5%; CLICK opens; DRAG re-docks. Growth is a LAYOUT change (CSS w/h,
// viewBox scales the content) — a `transform: scale()` filters a cached bitmap mid-flight and
// reads as "enlarged, then shrank".
const GROW = 'transition-[width,height] group-hover:w-[18px] group-hover:h-[94.5px]';

// The handle's ink: a filled outline traced from a drawn stroke, not a stroked centerline, so its
// two edges and ends keep a hand's unevenness. Generated, pasted frozen; don't hand-edit the numbers.
const HANDLE_D = 'M 12.81 76.48 L 12.82 76.04 L 12.82 75.06 L 12.84 73.59 L 12.85 71.66 L 12.87 69.31 L 12.89 66.58 L 12.91 63.51 L 12.94 60.15 L 12.96 56.52 L 12.98 52.68 L 13.00 48.65 L 13.01 44.48 L 13.02 40.22 L 13.03 35.89 L 13.03 31.54 L 13.03 27.21 L 13.01 22.93 L 12.99 18.75 L 12.96 14.71 L 12.92 10.84 L 12.87 7.19 L 12.81 3.80 C 12.77 1.26 9.25 3.80 9.24 5.08 L 9.23 8.35 L 9.22 11.87 L 9.21 15.59 L 9.20 19.49 L 9.19 23.52 L 9.18 27.65 L 9.18 31.83 L 9.17 36.03 L 9.16 40.21 L 9.16 44.32 L 9.15 48.34 L 9.15 52.22 L 9.15 55.93 L 9.15 59.42 L 9.15 62.66 L 9.16 65.61 L 9.17 68.23 L 9.18 70.47 L 9.19 72.32 L 9.20 73.71 L 9.22 74.62 L 9.24 75.01 C 9.45 76.06 12.81 77.95 12.81 76.48 Z';

/* ── the three docks ────────────────────────────────────────────────────────────────────────────
   SPOTS, not free positioning: three fixed targets, so there is no continuous offset to fine-tune.
   No TOP target — the handle would fight page headers and browser chrome there. */
export type SpotId = 'left' | 'right' | 'bottom';
const SPOT_IDS: SpotId[] = ['left', 'right', 'bottom'];
export const DOCK_KEY = 'visual-cook:chrome:dock';
const DOCK_MARGIN = 18;
const DOCK_HALF_THICKNESS = 20;
const SPOT_ROTATE: Record<SpotId, number> = { right: 0, left: 180, bottom: 90 };

export function spotPoint(id: SpotId, w: number, h: number): { x: number; y: number } {
  const inset = DOCK_MARGIN + DOCK_HALF_THICKNESS;
  if (id === 'right') return { x: w - inset, y: h / 2 };
  if (id === 'left') return { x: inset, y: h / 2 };
  return { x: w / 2, y: h - inset };
}
// EUCLIDEAN nearest, not edge-distance — edge-distance makes a drag toward a corner snap wrong.
function nearestSpot(x: number, y: number, w: number, h: number): SpotId {
  let best: SpotId = 'right', bestDist = Infinity;
  for (const id of SPOT_IDS) {
    const p = spotPoint(id, w, h);
    const d = Math.hypot(p.x - x, p.y - y);
    if (d < bestDist) { bestDist = d; best = id; }
  }
  return best;
}
export function loadSpot(): SpotId { // read POST-MOUNT only — reading during render hydrate-mismatches
  try {
    const raw = window.localStorage.getItem(DOCK_KEY);
    if (raw && (SPOT_IDS as string[]).includes(JSON.parse(raw)?.side)) return JSON.parse(raw).side;
  } catch { /* private mode, corrupt value — the default is always fine */ }
  return 'right';
}
export function Grabber({ spot, setSpot, onOpen }: {
  spot: SpotId; setSpot: (s: SpotId) => void; onOpen: () => void;
}) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState<SpotId | null>(null);
  const moved = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (dragging) return;
    const update = () => setPoint(spotPoint(spot, window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [spot, dragging]);

  if (!point) return null;

  return (
    <>
      {/* Blur + darken scrim. NOT polarity-matched, deliberately: the point is contrast against the
          pure-white targets below, on a light stage as much as a dark one. */}
      {dragging && <div className="hidden sm:block fixed inset-0 z-[2147483646] backdrop-blur-lg bg-black/30 motion-reduce:backdrop-blur-none" />}

      {dragging && SPOT_IDS.map(id => {
        const p = spotPoint(id, window.innerWidth, window.innerHeight);
        const on = active === id;
        return (
          <div key={id} className="hidden sm:block fixed z-[2147483646] rounded-full bg-white pointer-events-none shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-150 ease-out motion-reduce:transition-none"
            style={{ left: p.x, top: p.y, width: 96, height: 96,
                     transform: `translate(-50%, -50%) scale(${on ? 1 : 0.72})`, opacity: on ? 0.95 : 0.4 }} />
        );
      })}

      <button aria-label="expand cook sidebar — drag to dock left, right, or bottom"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: e.clientX, y: e.clientY }; moved.current = false; }}
        onPointerMove={e => {
          if (!start.current) return;
          // 4px threshold: below it this is a CLICK, so a shaky press never re-docks by accident.
          if (!moved.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 4) { moved.current = true; setDragging(true); }
          if (moved.current) {
            setPoint({ x: e.clientX, y: e.clientY });
            setActive(nearestSpot(e.clientX, e.clientY, window.innerWidth, window.innerHeight));
          }
        }}
        onPointerUp={() => {
          if (moved.current && active) setSpot(active);
          else if (!moved.current) onOpen();
          setDragging(false); setActive(null); start.current = null;
        }}
        className="group hidden sm:flex fixed z-[2147483647] w-10 h-32 items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)',
                 transition: dragging ? 'none' : 'left 220ms cubic-bezier(0.16,1,0.3,1), top 220ms cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ transform: `rotate(${SPOT_ROTATE[spot]}deg)`, transition: dragging ? 'none' : 'transform 220ms ease-out' }}>
          <svg width="16" height="84" viewBox="0 0 16 84" fill="none"
            className={`overflow-visible duration-200 ease-out motion-reduce:transition-none ${GROW}`}>
            {/* One ink on any stage: a mid grey clears light and dark grounds alike, the shadow the
                greys between. Hover only grows it; a colour change would fade it on one of the two. */}
            <path d={HANDLE_D} fill="#8C877F" stroke="#8C877F" strokeWidth="1"
              style={{ filter: 'drop-shadow(0 0 1.5px rgba(0,0,0,0.35))' }} />
          </svg>
        </div>
      </button>
    </>
  );
}
