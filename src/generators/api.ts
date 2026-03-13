import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ScaffoldContext } from '../types.js';
import { copyTemplateDir, writeJson } from '../utils/fs.js';

const TEMPLATES_DIR = fileURLToPath(new URL('../templates', import.meta.url));

export async function generateApi(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const apiDir = join(targetDir, 'apps', 'api');
  const backend = ctx.answers.backend;

  if (backend === 'none') return;

  const templateDir = join(TEMPLATES_DIR, 'api', backend);
  await copyTemplateDir(templateDir, apiDir, ctx.flags);

  // Inject extra deps into apps/api/package.json (Node backends only)
  if ((backend === 'hono') && Object.keys(ctx.apiDeps).length > 0) {
    const pkgPath = join(apiDir, 'package.json');
    const { readFile } = await import('fs/promises');
    try {
      const raw = await readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(raw);
      pkg.dependencies = { ...pkg.dependencies, ...ctx.apiDeps };
      await writeJson(pkgPath, pkg);
    } catch {
      // ok
    }
  }
}
