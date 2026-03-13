import { join } from 'path';
import type { ScaffoldContext } from '../types.js';
import { writeFileSafe, writeJson } from '../utils/fs.js';

export async function generateRoot(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  await generatePackageJson(ctx, targetDir);
  await generateVibeConfig(ctx, targetDir);
  await generateEnvExample(ctx, targetDir);
  await generateGitignore(targetDir);
}

function buildDevScript(ctx: ScaffoldContext): string {
  if (!ctx.hasWeb && !ctx.hasApi) return 'echo "No services configured"';
  if (ctx.hasWeb && !ctx.hasApi) return 'npm run dev -w apps/web';
  if (!ctx.hasWeb && ctx.hasApi) return 'npm run dev -w apps/api';

  // Both web and api
  const webCmd = 'npm run dev -w apps/web';
  const apiCmd = 'npm run dev -w apps/api';
  return `concurrently --names "web,api" --prefix-colors "cyan,yellow" --kill-others-on-fail "${webCmd}" "${apiCmd}"`;
}

function buildDeployScript(ctx: ScaffoldContext): string {
  return 'tsx scripts/deploy.ts';
}

function buildRootDeps(ctx: ScaffoldContext): Record<string, string> {
  const deps: Record<string, string> = {};
  if (ctx.hasWeb && ctx.hasApi) deps['concurrently'] = '^9.0.0';
  if (ctx.answers.backend === 'hono' || ctx.answers.backend === 'none') {
    deps['tsx'] = '^4.0.0';
  }
  return deps;
}

async function generatePackageJson(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const workspaces: string[] = [];
  if (ctx.hasWeb) workspaces.push('apps/web');
  if (ctx.hasApi) workspaces.push('apps/api');

  const pkg: Record<string, unknown> = {
    name: ctx.answers.projectName,
    version: '0.1.0',
    private: true,
    ...(workspaces.length > 0 ? { workspaces } : {}),
    scripts: {
      dev: buildDevScript(ctx),
      deploy: buildDeployScript(ctx),
      ...(ctx.hasWeb ? { 'dev:web': 'npm run dev -w apps/web', 'build:web': 'npm run build -w apps/web' } : {}),
      ...(ctx.hasApi ? { 'dev:api': 'npm run dev -w apps/api', 'build:api': 'npm run build -w apps/api' } : {}),
    },
    devDependencies: {
      tsx: '^4.0.0',
      ...buildRootDeps(ctx),
    },
  };

  await writeJson(join(targetDir, 'package.json'), pkg);
}

async function generateVibeConfig(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  const config = {
    projectName: ctx.answers.projectName,
    frontend: ctx.answers.frontend,
    backend: ctx.answers.backend,
    database: ctx.answers.database,
    auth: ctx.answers.auth,
    storage: ctx.answers.storage,
    jobs: ctx.answers.jobs,
    realtime: ctx.answers.realtime,
    ai: ctx.answers.ai,
    email: ctx.answers.email,
    payments: ctx.answers.payments,
    webDeploy: ctx.answers.webDeploy,
    apiDeploy: ctx.answers.apiDeploy,
    createdAt: new Date().toISOString(),
    version: '0.1.0',
  };

  await writeJson(join(targetDir, 'vibe.config.json'), config);
}

async function generateEnvExample(ctx: ScaffoldContext, targetDir: string): Promise<void> {
  if (ctx.envVars.length === 0) {
    await writeFileSafe(join(targetDir, '.env.example'), '# No environment variables required\n');
    return;
  }

  // Group by category based on key prefixes
  let content = '# Environment Variables\n# Copy this file to .env and fill in the values\n\n';
  for (const v of ctx.envVars) {
    content += `# ${v.description}\n${v.key}=${v.example}\n\n`;
  }

  await writeFileSafe(join(targetDir, '.env.example'), content);
  // Also write .env with empty values for local dev
  const envLocal = ctx.envVars.map((v) => `${v.key}=`).join('\n') + '\n';
  await writeFileSafe(join(targetDir, '.env'), envLocal);
}

async function generateGitignore(targetDir: string): Promise<void> {
  const content = `# Dependencies
node_modules/
.venv/
__pycache__/
*.pyc

# Build output
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
*.log
npm-debug.log*

# Misc
.cache/
`;

  await writeFileSafe(join(targetDir, '.gitignore'), content);
}
