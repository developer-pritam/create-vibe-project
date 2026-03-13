import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ScaffoldContext } from '../types.js';
import { copyTemplateDir, writeJson } from '../utils/fs.js';

const TEMPLATES_DIR = fileURLToPath(new URL('../../templates', import.meta.url));

export async function generateWeb(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const webDir = join(targetDir, 'apps', 'web');
  const frontend = ctx.answers.frontend;

  if (frontend === 'none') return;

  // Copy base template
  const templateDir = join(TEMPLATES_DIR, 'web', frontend);
  await copyTemplateDir(templateDir, webDir, ctx.flags);

  // Inject extra deps into apps/web/package.json
  if (Object.keys(ctx.webDeps).length > 0) {
    const pkgPath = join(webDir, 'package.json');
    const { readFile } = await import('fs/promises');
    try {
      const raw = await readFile(pkgPath, 'utf8');
      const pkg = JSON.parse(raw);
      pkg.dependencies = { ...pkg.dependencies, ...ctx.webDeps };
      await writeJson(pkgPath, pkg);
    } catch {
      // package.json might not exist yet, that's ok
    }
  }
}
