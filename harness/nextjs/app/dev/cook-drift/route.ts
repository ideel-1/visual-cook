// Whether the surface a cook is made of moved since the cook was last touched: the files outside
// app/dev/ that the cook's files import directly ('@/' or relative paths) are logged after the cook
// folder's last commit. Commits that also touched the cook folder carried the cook with them and are
// left out. Run from the app root, inside a git checkout.
import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const git = async (...args: string[]) => (await run('git', args, { cwd: process.cwd(), maxBuffer: 1 << 24 })).stdout.trim();
const IMPORT = /(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g;
const SEP = '\x1f';
// Where app/ and the '@/' alias sit under the app root: '' by default, 'src/' in an app with a src dir.
const SRC = '';

const isFile = (p: string) => stat(p).then(s => s.isFile(), () => false);
async function resolve(from: string, spec: string) {
  const base = spec.startsWith('@/') ? SRC + spec.slice(2) : spec.startsWith('.') ? path.join(path.dirname(from), spec) : null;
  if (!base) return null;
  for (const p of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) if (await isFile(p)) return p;
  return null;
}

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
  const page = new URL(req.url).searchParams.get('page') ?? '';
  const name = page.match(/^\/dev\/visual-cook\/([^/?#]+)/)?.[1];
  if (!name) return Response.json({ since: null, commits: [] });
  const folder = `${SRC}app/dev/visual-cook/${name}`;
  const [hash, last] = (await git('log', '-1', `--format=%H${SEP}%cI`, '--', folder)).split(SEP);
  if (!last) return Response.json({ since: null, commits: [] });
  const day = last.slice(0, 10);
  const own = (await git('ls-files', '--', folder)).split('\n').filter(f => /\.tsx?$/.test(f));
  const used = new Set<string>();
  for (const file of own) {
    const text = await readFile(file, 'utf8');
    for (const [, spec] of text.matchAll(IMPORT)) {
      const p = await resolve(file, spec);
      if (p && !p.startsWith(`${SRC}app/dev/`)) used.add(p);
    }
  }
  if (!used.size) return Response.json({ since: day, commits: [] });
  const since = `${hash}..HEAD`;
  const withCook = new Set((await git('log', since, '--format=%H', '--', folder)).split('\n'));
  const commits = (await git('log', since, `--format=%H${SEP}%cI${SEP}%s`, '--', ...used)).split('\n').filter(Boolean)
    .map(l => l.split(SEP)).filter(([h]) => !withCook.has(h)).map(([, at, subject]) => ({ at, subject }));
  return Response.json({ since: day, commits });
}
