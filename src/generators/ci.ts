import { join } from 'path';
import { fileURLToPath } from 'url';
import type { ScaffoldContext } from '../types.js';
import { processTemplate } from '../utils/fs.js';

const TEMPLATES_DIR = fileURLToPath(new URL('../templates', import.meta.url));

export async function generateCI(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const src = join(TEMPLATES_DIR, 'shared', 'deploy.yml.mustache');
  const dest = join(targetDir, '.github', 'workflows', 'deploy.yml');
  await processTemplate(src, dest, ctx.flags);
}

export async function generateDeployScript(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const src = join(TEMPLATES_DIR, 'shared', 'deploy.ts.mustache');
  const dest = join(targetDir, 'scripts', 'deploy.ts');
  await processTemplate(src, dest, ctx.flags);
}

export async function generateDocs(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const shared = join(TEMPLATES_DIR, 'shared');
  await processTemplate(join(shared, 'README.md.mustache'), join(targetDir, 'README.md'), ctx.flags);
  await processTemplate(join(shared, 'TROUBLESHOOTING.md.mustache'), join(targetDir, 'TROUBLESHOOTING.md'), ctx.flags);
  await processTemplate(join(shared, 'CLAUDE.md.mustache'), join(targetDir, 'CLAUDE.md'), ctx.flags);
}
