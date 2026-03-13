import { join } from 'path';
import { existsSync } from 'fs';
import * as p from '@clack/prompts';
import type { UserAnswers } from './types.js';
import { buildContext } from './context.js';
import { generateRoot } from './generators/root.js';
import { generateWeb } from './generators/web.js';
import { generateApi } from './generators/api.js';
import { generateCI, generateDeployScript, generateDocs } from './generators/ci.js';
import { ensureDir } from './utils/fs.js';

export async function scaffold(answers: UserAnswers, targetDir: string): Promise<void> {
  const s = p.spinner();

  if (existsSync(targetDir)) {
    p.cancel(`Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }

  s.start('Scaffolding your project...');

  const ctx = buildContext(answers);

  await ensureDir(targetDir);
  await generateRoot(ctx, targetDir);
  if (ctx.hasWeb) await generateWeb(ctx, targetDir);
  if (ctx.hasApi) await generateApi(ctx, targetDir);
  await generateCI(ctx, targetDir);
  await generateDeployScript(ctx, targetDir);
  await generateDocs(ctx, targetDir);

  // git init
  try {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    await promisify(execFile)('git', ['init'], { cwd: targetDir });
  } catch {
    // git not available, skip
  }

  s.stop('Project scaffolded!');

  const steps = [
    `cd ${answers.projectName}`,
    'npm install',
    'cp .env.example .env  # fill in your values',
    'npm run dev',
  ];

  if (ctx.answers.apiDeploy === 'cloud-run') {
    steps.push('', '# To deploy:');
    steps.push('# 1. gcloud auth login');
    steps.push('# 2. npm run deploy');
  } else if (ctx.answers.apiDeploy) {
    steps.push('', '# To deploy:');
    steps.push('npm run deploy');
  }

  p.note(steps.join('\n'), 'Next steps');
  p.outro(`Happy shipping! Your stack: ${answers.frontend} + ${answers.backend !== 'none' ? answers.backend : 'no backend'}`);
}
