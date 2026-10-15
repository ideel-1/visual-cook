// What was pointed at on a dev page: the Agentation toolbar (components/dev/DevTools.tsx) posts each
// note here as it is saved, changed or deleted, and it is kept where a chat reads it, one JSON line per
// event in .cook/pointed.jsonl (not .next, which a build empties), also served here.
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), '.cook');
const FILE = path.join(DIR, 'pointed.jsonl');
const KEPT = ['id', 'comment', 'element', 'elementPath', 'selectedText', 'nearbyText', 'cssClasses', 'reactComponents', 'boundingBox'];

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const { event, url, annotation } = await req.json();
  if (annotation) {
    const note = Object.fromEntries(KEPT.filter(k => annotation[k] != null).map(k => [k, annotation[k]]));
    await mkdir(DIR, { recursive: true });
    await appendFile(FILE, JSON.stringify({ at: new Date().toISOString(), event, page: url, ...note }) + '\n');
  }
  return new Response(null, { status: 204 });
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const text = await readFile(FILE, 'utf8').catch(() => '');
  return new Response(text, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
