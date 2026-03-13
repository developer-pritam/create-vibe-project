# CLAUDE.md — create-vibe-project

This file gives AI assistants full context to work on this codebase.

## What this project is

`create-vibe-project` is a CLI tool (`npx create-vibe-project`) that scaffolds full-stack projects. It asks 13 interactive questions and generates a project folder with `npm run dev` and `npm run deploy` pre-configured.

## Repository structure

```
src/
  index.ts          Entry point. Calls collectAnswers() then scaffold().
  prompts.ts        All 13 @clack/prompts questions. Conditional: apiDeploy only shown when backend !== 'none'.
  types.ts          UserAnswers, ScaffoldContext, TemplateFlags interfaces. All type unions.
  context.ts        buildContext() — the central logic hub. Maps UserAnswers → ScaffoldContext with flags, envVars, deps.
  scaffold.ts       Orchestrates generation: root → web → api → ci → deploy script → git init.
  generators/
    root.ts         Writes package.json, vibe.config.json, .env.example, .gitignore
    web.ts          Copies templates/web/<frontend>/, injects webDeps into package.json
    api.ts          Copies templates/api/<backend>/, injects apiDeps into package.json (Node only)
    ci.ts           Renders deploy.yml.mustache and deploy.ts.mustache from templates/shared/
  utils/
    fs.ts           writeFileSafe, copyTemplateDir, processTemplate (Mustache render), writeJson

templates/
  web/
    react-vite/     Vite config with /api proxy, App.tsx with Clerk conditional
    nextjs/         Next.js 15 app router, layout.tsx with ClerkProvider conditional
    static-html/    Plain HTML/CSS/JS, served with `npx serve`
  api/
    hono/           Hono + @hono/node-server, routes for Neon/Stripe/Anthropic/Resend
    fastapi/        FastAPI main.py with conditional imports per service
    go/             Go net/http, cmd/api/main.go, CORS middleware
  shared/
    deploy.yml.mustache    GitHub Actions CI for all deploy target combinations
    deploy.ts.mustache     npm run deploy script, reads vibe.config.json
```

## Core data flow

```
UserAnswers
    ↓ buildContext() in src/context.ts
ScaffoldContext {
  answers,       — raw answers
  hasWeb,        — boolean
  hasApi,        — boolean
  envVars[],     — EnvVar[] for .env.example
  webDeps{},     — extra deps injected into apps/web/package.json
  apiDeps{},     — extra deps injected into apps/api/package.json
  flags{}        — TemplateFlags, passed to every Mustache render
}
    ↓ generators
Generated project files
```

## Template system

- Templates live in `templates/`
- Files ending in `.mustache` are rendered with Mustache using `ctx.flags`
- All other files are copied verbatim
- The `.mustache` extension is stripped from output filenames
- Mustache flags are plain booleans: `{{#hasClerk}}...{{/hasClerk}}`
- `TEMPLATES_DIR` is resolved at runtime using `new URL('../../templates', import.meta.url)` — works correctly when installed via npm

## Adding a new integration (step by step)

1. **`src/types.ts`** — add to the relevant union type (e.g. `type Auth = ... | 'my-auth'`)
2. **`src/context.ts`**:
   - Add env vars to `ENV_VAR_MAP['my-auth']`
   - Add npm deps to `WEB_EXTRA_DEPS`, `WEB_EXTRA_DEPS_NEXTJS`, or `API_EXTRA_DEPS`
   - Add a boolean flag to `TemplateFlags` interface in `src/types.ts`
   - Set the flag in `buildContext()`: `hasMyAuth: answers.auth === 'my-auth'`
3. **`src/prompts.ts`** — add `{ value: 'my-auth', label: 'My Auth', hint: 'description' }` to the relevant select
4. **Templates** — add `{{#hasMyAuth}}...{{/hasMyAuth}}` sections to relevant `.mustache` files

## Key decisions

- **Mustache not EJS** — templates are logic-free, all branching in TypeScript context builder
- **npm workspaces** — `apps/web` and `apps/api` are workspace packages; root `package.json` has dev/deploy scripts
- **concurrently** — used in root dev script only when both web and api are present
- **tsx** — used to run `scripts/deploy.ts` in generated projects; added as devDependency
- **No `npm install` after scaffold** — matches convention of create-react-app, create-next-app; user runs it manually

## What NOT to change without understanding the impact

- `TemplateFlags` interface — every flag must be set in `buildContext()` or Mustache silently renders nothing
- `TEMPLATES_DIR` resolution — must use `import.meta.url`, not `__dirname` (ESM)
- The `.mustache` extension stripping in `utils/fs.ts` — output filenames depend on this
- `apiDeploy: null` when `backend === 'none'` — the prompts group returns `null`, not `'none'`

## Running locally

```bash
npm install
npm run build        # compile to dist/
node dist/index.js   # run the CLI
```

For fast iteration, test scaffold output with a script:

```js
// test.mjs
import { buildContext } from './src/context.js';
import { scaffold } from './src/scaffold.js';

await scaffold({
  projectName: 'test-app',
  frontend: 'react-vite',
  backend: 'hono',
  database: 'neon',
  auth: 'clerk',
  storage: 'none',
  jobs: 'none',
  realtime: 'none',
  ai: 'llm-api',
  email: 'resend',
  payments: 'stripe',
  webDeploy: 'cloudflare-pages',
  apiDeploy: 'cloud-run',
}, '/tmp/test-app');
```

```bash
npx tsx test.mjs
```
