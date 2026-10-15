// A cook's saved versions: the whole cook as its URL holds it (lane, picks, dials), saved from the
// sidebar's Versions and numbered per cook, kept where a chat reads them in .cook/versions.json.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Version = { n: number; at: string; search: string };
const DIR = path.join(process.cwd(), '.cook');
const FILE = path.join(DIR, 'versions.json');

const load = async (): Promise<Record<string, Version[]>> => JSON.parse(await readFile(FILE, 'utf8').catch(() => '{}'));
const keep = async (all: Record<string, Version[]>) => { await mkdir(DIR, { recursive: true }); await writeFile(FILE, JSON.stringify(all, null, 1)); };

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const page = new URL(req.url).searchParams.get('page') ?? '';
  return Response.json((await load())[page] ?? []);
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const { page, search } = await req.json();
  const all = await load();
  const mine = all[page] ?? [];
  mine.push({ n: Math.max(0, ...mine.map(v => v.n)) + 1, at: new Date().toISOString(), search });
  all[page] = mine;
  await keep(all);
  return Response.json(mine);
}

export async function DELETE(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const { page, n } = await req.json();
  const all = await load();
  all[page] = (all[page] ?? []).filter(v => v.n !== n);
  await keep(all);
  return Response.json(all[page]);
}
