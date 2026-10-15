// What was settled on a cook page from its sidebar: the questions decided (keyed by their URL
// parameter, with the question and its value as shown) and the lanes retired, kept per page
// in .cook/decided.json, where a chat reads them.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type Kept = { decided: Record<string, { question: string; value: string; at: string }>; retired: string[] };
const DIR = path.join(process.cwd(), '.cook');
const FILE = path.join(DIR, 'decided.json');
const NONE: Kept = { decided: {}, retired: [] };

const load = async (): Promise<Record<string, Kept>> => JSON.parse(await readFile(FILE, 'utf8').catch(() => '{}'));
const keep = async (all: Record<string, Kept>, page: string, mine: Kept) => {
  if (!Object.keys(mine.decided).length && !mine.retired.length) delete all[page]; else all[page] = mine;
  await mkdir(DIR, { recursive: true });
  await writeFile(FILE, JSON.stringify(all, null, 1));
  return Response.json(mine);
};

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const page = new URL(req.url).searchParams.get('page') ?? '';
  return Response.json((await load())[page] ?? NONE);
}

// { page, key, question, value } decides a question; { page, retire } retires a lane.
export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const { page, key, question, value, retire } = await req.json();
  const all = await load();
  const mine: Kept = all[page] ?? { decided: {}, retired: [] };
  if (key) mine.decided[key] = { question, value, at: new Date().toISOString() };
  if (retire && !mine.retired.includes(retire)) mine.retired.push(retire);
  return keep(all, page, mine);
}

// { page, key } undoes a decision; { page, retire } restores a lane.
export async function DELETE(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const { page, key, retire } = await req.json();
  const all = await load();
  const mine: Kept = all[page] ?? { decided: {}, retired: [] };
  if (key) delete mine.decided[key];
  if (retire) mine.retired = mine.retired.filter(id => id !== retire);
  return keep(all, page, mine);
}
