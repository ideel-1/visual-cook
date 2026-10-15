import { notFound } from 'next/navigation';
import Link from 'next/link';
import { COOK_INDEX } from './index';

export const metadata = {
  title: 'visual cooks',
  robots: { index: false, follow: false },
};

// The cooks, newest first. The whole card is the link; the record sits in a disclosure.
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  const rows = [...COOK_INDEX].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <main className="min-h-dvh bg-white px-5 py-10 [font-family:system-ui] text-[#262320]">
      <h1 className="m-0 mb-6 text-[15px] font-medium">visual cooks</h1>
      <ul className="m-0 flex max-w-[760px] list-none flex-col gap-3 p-0">
        {rows.map((c) => (
          <li key={c.topic} data-cook={c.topic}
            className={`relative rounded-[6px] border border-[#00000014] px-4 py-3 transition-colors duration-150 hover:bg-[#0000000a] focus-within:bg-[#0000000a] ${c.status === 'superseded' || c.status === 'abandoned' ? 'opacity-55' : ''}`}>
            <Link href={c.route} className="absolute inset-0 rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#262320]" aria-label={c.topic} />
            <div className="flex items-baseline gap-3 text-[12px] text-[#8B857B]">
              <span>{c.date}</span>
              <span className={c.status === 'wip' || c.status === 'settled' ? 'font-medium text-[#262320]' : ''}>{c.status}</span>
              {c.applied && <span>applied: {c.applied}</span>}
            </div>
            <div className="mt-1 text-[14px] font-medium">{c.topic}</div>
            <div className="mt-0.5 text-[12px] text-[#5A554D]">{c.component}</div>
            {c.summary && <p className="m-0 mt-2 text-[13px] leading-[1.5]">{c.summary}</p>}
            <details className="relative z-10 mt-2 text-[12px] text-[#5A554D]">
              <summary className="cursor-pointer select-none">record</summary>
              {c.question && <p className="m-0 mt-1.5"><span className="text-[#8B857B]">asked</span> {c.question}</p>}
              {c.settled.length > 0 && <ul className="m-0 mt-1.5 pl-4">{c.settled.map((s) => <li key={s}>{s}</li>)}</ul>}
              {c.owed && <p className="m-0 mt-1.5"><span className="text-[#8B857B]">owed</span> {c.owed}</p>}
              {c.unruled && <p className="m-0 mt-1.5"><span className="text-[#8B857B]">unruled</span> {c.unruled}</p>}
            </details>
          </li>
        ))}
      </ul>
    </main>
  );
}
