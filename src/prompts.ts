import * as p from '@clack/prompts';
import type { UserAnswers } from './types.js';

// ── Shared helper ────────────────────────────────────────────────────────────
function cancel(msg = 'Cancelled.'): never {
  p.cancel(msg);
  process.exit(0);
}

function check<T>(val: T | symbol): T {
  if (p.isCancel(val)) cancel();
  return val as T;
}

// ── Shared MongoDB URI prompt ─────────────────────────────────────────────────
function mongoUriPrompt() {
  return p.text({
    message: 'Paste your MongoDB connection URL',
    placeholder: 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mydb',
    hint: 'Get it from MongoDB Atlas → Connect → Drivers',
    validate: (v) => {
      if (!v.trim()) return 'Connection URL is required';
      if (!v.startsWith('mongodb')) return 'Must start with mongodb:// or mongodb+srv://';
    },
  });
}

// ── FLOW 1: Vibe coder → Quick (3 questions) ─────────────────────────────────
async function vibeQuick(): Promise<UserAnswers> {
  const projectName = check(await p.text({
    message: 'What do you want to call your project?',
    placeholder: 'my-app',
    validate: (v) => {
      if (!v.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
    },
  }));

  const needsBackend = check(await p.confirm({
    message: 'Does your app need to save or process data? (logins, storing posts, sending emails...)',
    active: 'Yes',
    inactive: 'No — just a website',
  }));

  let needsDatabase = false;
  if (needsBackend) {
    needsDatabase = check(await p.confirm({
      message: 'Should it remember data between visits? (user profiles, orders, messages...)',
      active: 'Yes',
      inactive: 'No — no database needed',
    })) as boolean;
  }

  const backend = needsBackend ? 'hono' : 'none';
  const database = needsDatabase ? 'mongodb' : 'none';
  const apiDeploy = needsBackend ? 'render' : null;

  p.note(
    [
      `Website   → React + Vite      (free on Cloudflare Pages)`,
      needsBackend  ? `Server    → Node.js / Hono    (free on Render)` : '',
      needsDatabase ? `Database  → MongoDB Atlas      (free 512 MB)` : '',
    ].filter(Boolean).join('\n'),
    'Your stack — all set!'
  );

  return {
    projectName: projectName as string,
    frontend: 'react-vite',
    backend,
    database,
    mongodbUri: '',
    auth: 'none',
    storage: 'none',
    jobs: 'none',
    realtime: 'none',
    ai: 'none',
    email: 'none',
    payments: 'none',
    webDeploy: 'cloudflare-pages',
    apiDeploy,
  } as UserAnswers;
}

// ── FLOW 2: Vibe coder → I'll pick (simplified, no advanced options) ──────────
async function vibePick(): Promise<UserAnswers> {
  const answers = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'What do you want to call your project?',
          placeholder: 'my-app',
          validate: (v) => {
            if (!v.trim()) return 'Project name is required';
            if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
          },
        }),

      frontend: () =>
        p.select({
          message: 'What kind of app are you building?',
          options: [
            { value: 'react-vite',  label: 'An interactive web app',   hint: 'dashboards, tools, social apps — React' },
            { value: 'nextjs',      label: 'A blog or content website', hint: 'landing pages, docs, SEO-friendly — Next.js' },
            { value: 'static-html', label: 'A simple web page',         hint: 'portfolio, one-pager — plain HTML, no framework' },
            { value: 'none',        label: 'No website',                hint: 'I only need a server (e.g. for a mobile app)' },
          ],
        }),

      backend: () =>
        p.select({
          message: 'Does your app need to do anything on the server? (logins, saving data, sending emails...)',
          options: [
            { value: 'none',    label: 'No',               hint: 'website only — runs entirely in the browser' },
            { value: 'hono',    label: 'Yes — JavaScript', hint: 'Node.js / Hono — recommended for most apps' },
            { value: 'fastapi', label: 'Yes — Python',     hint: 'FastAPI — great if you want to use AI/ML libraries' },
          ],
        }),

      database: () =>
        p.select({
          message: 'Do you need to store and retrieve data? (user profiles, posts, orders...)',
          options: [
            { value: 'none',    label: 'No' },
            { value: 'mongodb', label: 'Yes — MongoDB',    hint: 'flexible storage, easy to start with — free tier' },
            { value: 'neon',    label: 'Yes — PostgreSQL', hint: 'structured storage, like a spreadsheet — free tier' },
          ],
        }),

      mongodbUri: ({ results }) =>
        results.database !== 'mongodb'
          ? (Promise.resolve('') as Promise<string>)
          : mongoUriPrompt(),

      auth: () =>
        p.select({
          message: 'Do you need users to sign up or log in?',
          options: [
            { value: 'none',          label: 'No login needed' },
            { value: 'clerk',         label: 'Yes — Clerk',         hint: 'Google, email, GitHub — easiest setup, free tier' },
            { value: 'firebase-auth', label: 'Yes — Firebase Auth', hint: "Google's login system — email + social, free tier" },
            { value: 'supabase-auth', label: 'Yes — Supabase Auth', hint: 'open source login, free tier' },
          ],
        }),

      storage: () =>
        p.select({
          message: 'Do you need to store files that users upload? (photos, documents, videos...)',
          options: [
            { value: 'none', label: 'No' },
            { value: 'r2',   label: 'Yes', hint: 'Cloudflare R2 — free storage and downloads' },
          ],
        }),

      jobs: () =>
        p.select({
          message: 'Do you need anything to run automatically?',
          options: [
            { value: 'none',            label: 'No' },
            { value: 'bullmq-upstash',  label: 'Yes — background tasks', hint: 'things that run after an action, e.g. send email after signup, resize image after upload' },
            { value: 'cloud-scheduler', label: 'Yes — scheduled tasks',   hint: 'things that run on a timer, e.g. daily digest, nightly cleanup, weekly report' },
          ],
        }),

      realtime: () =>
        p.select({
          message: 'Do you need anything to update live without refreshing the page? (chat, notifications, live scores...)',
          options: [
            { value: 'none',       label: 'No' },
            { value: 'websockets', label: 'Yes', hint: 'WebSockets — data updates instantly without page refresh' },
          ],
        }),

      ai: () =>
        p.select({
          message: 'Do you want to add AI to your app? (chat, writing help, smart search...)',
          options: [
            { value: 'none',    label: 'No' },
            { value: 'llm-api', label: 'Yes — AI chat or text generation', hint: 'Claude / OpenAI — pre-wired and ready to use' },
          ],
        }),

      email: () =>
        p.select({
          message: 'Does your app need to send emails? (welcome, password reset...)',
          options: [
            { value: 'none',   label: 'No' },
            { value: 'resend', label: 'Yes — Resend', hint: '3,000 emails/month free' },
          ],
        }),

      payments: () =>
        p.select({
          message: 'Do you need to charge money or accept payments?',
          options: [
            { value: 'none',   label: 'No' },
            { value: 'stripe', label: 'Yes — Stripe', hint: 'checkout + subscription handling pre-wired' },
          ],
        }),

      webDeploy: ({ results }) =>
        results.frontend === 'none'
          ? (Promise.resolve('cloudflare-pages') as Promise<'cloudflare-pages'>)
          : p.select({
              message: 'Where should your website be hosted?',
              options: [
                { value: 'cloudflare-pages', label: 'Cloudflare Pages', hint: 'fast, free, works everywhere — recommended' },
                { value: 'vercel',           label: 'Vercel',           hint: 'great for Next.js / blog sites, free tier' },
                { value: 'netlify',          label: 'Netlify',          hint: 'simple and free' },
              ],
            }),

      apiDeploy: ({ results }) =>
        results.backend === 'none'
          ? (Promise.resolve(null) as Promise<null>)
          : p.select({
              message: 'Where should your server be hosted?',
              options: [
                { value: 'render', label: 'Render', hint: 'simple setup, free tier — recommended for vibe coders' },
                { value: 'flyio',  label: 'Fly.io', hint: 'global servers, generous free tier' },
              ],
            }),
    },
    { onCancel: () => cancel() }
  );

  return answers as unknown as UserAnswers;
}

// ── FLOW 3: Developer → Full control (all options) ────────────────────────────
async function developerFull(): Promise<UserAnswers> {
  const answers = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name',
          placeholder: 'my-app',
          validate: (v) => {
            if (!v.trim()) return 'Project name is required';
            if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
          },
        }),

      frontend: () =>
        p.select({
          message: 'Frontend',
          options: [
            { value: 'react-vite',  label: 'React + Vite',       hint: 'recommended' },
            { value: 'nextjs',      label: 'Next.js',             hint: 'SSR / app router' },
            { value: 'static-html', label: 'Static HTML/CSS/JS',  hint: 'no framework' },
            { value: 'none',        label: 'None',                hint: 'API only' },
          ],
        }),

      backend: () =>
        p.select({
          message: 'Backend',
          options: [
            { value: 'none',    label: 'None',              hint: 'frontend only' },
            { value: 'hono',    label: 'Node.js — Hono',    hint: 'TypeScript, lightweight' },
            { value: 'fastapi', label: 'Python — FastAPI',  hint: 'async, great for AI/ML' },
            { value: 'go',      label: 'Go — net/http',     hint: 'high performance' },
          ],
        }),

      database: () =>
        p.select({
          message: 'Database',
          options: [
            { value: 'none',         label: 'None' },
            { value: 'neon',         label: 'PostgreSQL — Neon',  hint: 'serverless postgres, free tier' },
            { value: 'mongodb',      label: 'MongoDB Atlas',      hint: 'NoSQL, free tier' },
            { value: 'firestore',    label: 'Firestore',          hint: 'Google NoSQL, free tier' },
            { value: 'upstash-redis', label: 'Redis — Upstash',  hint: 'serverless redis, free tier' },
          ],
        }),

      mongodbUri: ({ results }) =>
        results.database !== 'mongodb'
          ? (Promise.resolve('') as Promise<string>)
          : mongoUriPrompt(),

      auth: () =>
        p.select({
          message: 'Auth',
          options: [
            { value: 'none',          label: 'None' },
            { value: 'clerk',         label: 'Clerk',         hint: '10k MAU free, easiest DX' },
            { value: 'firebase-auth', label: 'Firebase Auth', hint: 'Google, generous free tier' },
            { value: 'supabase-auth', label: 'Supabase Auth', hint: 'open source' },
          ],
        }),

      storage: () =>
        p.select({
          message: 'File storage',
          options: [
            { value: 'none',             label: 'None' },
            { value: 'r2',               label: 'Cloudflare R2',    hint: 'S3-compatible, zero egress' },
            { value: 'firebase-storage', label: 'Firebase Storage', hint: 'easy, free tier' },
          ],
        }),

      jobs: () =>
        p.select({
          message: 'Background jobs',
          options: [
            { value: 'none',            label: 'None' },
            { value: 'cloud-scheduler', label: 'Cloud Scheduler → Cloud Run', hint: 'GCP cron' },
            { value: 'bullmq-upstash',  label: 'BullMQ + Upstash Redis',      hint: 'job queues, free tier' },
          ],
        }),

      realtime: () =>
        p.select({
          message: 'Real-time',
          options: [
            { value: 'none',              label: 'None' },
            { value: 'websockets',        label: 'WebSockets',       hint: 'Socket.io' },
            { value: 'supabase-realtime', label: 'Supabase Realtime', hint: 'managed' },
          ],
        }),

      ai: () =>
        p.select({
          message: 'AI / LLM',
          options: [
            { value: 'none',       label: 'None' },
            { value: 'llm-api',    label: 'LLM API calls',     hint: 'Anthropic / OpenAI' },
            { value: 'vector-rag', label: 'Vector Search / RAG', hint: 'Claude + Pinecone' },
          ],
        }),

      email: () =>
        p.select({
          message: 'Email',
          options: [
            { value: 'none',   label: 'None' },
            { value: 'resend', label: 'Resend', hint: '3k/month free' },
          ],
        }),

      payments: () =>
        p.select({
          message: 'Payments',
          options: [
            { value: 'none',   label: 'None' },
            { value: 'stripe', label: 'Stripe', hint: 'checkout + webhooks' },
          ],
        }),

      webDeploy: ({ results }) =>
        results.frontend === 'none'
          ? (Promise.resolve('cloudflare-pages') as Promise<'cloudflare-pages'>)
          : p.select({
              message: 'Deploy frontend to',
              options: [
                { value: 'cloudflare-pages',  label: 'Cloudflare Pages',  hint: 'fast, free, global edge' },
                { value: 'vercel',            label: 'Vercel',            hint: 'great for Next.js' },
                { value: 'firebase-hosting',  label: 'Firebase Hosting',  hint: 'Google CDN' },
                { value: 'netlify',           label: 'Netlify',           hint: 'simple, free tier' },
              ],
            }),

      apiDeploy: ({ results }) =>
        results.backend === 'none'
          ? (Promise.resolve(null) as Promise<null>)
          : p.select({
              message: 'Deploy backend to',
              options: [
                { value: 'cloud-run', label: 'Google Cloud Run', hint: 'scales to zero, pay-per-use' },
                { value: 'render',    label: 'Render',           hint: 'simple, free tier' },
                { value: 'flyio',     label: 'Fly.io',           hint: 'global, generous free tier' },
              ],
            }),
    },
    { onCancel: () => cancel() }
  );

  return answers as unknown as UserAnswers;
}

// ── Entry point ───────────────────────────────────────────────────────────────
export async function collectAnswers(): Promise<UserAnswers> {
  p.intro('create-vibe-project — scaffold and deploy in minutes');

  const builderType = check(await p.select({
    message: 'First — what kind of builder are you?',
    options: [
      {
        value: 'vibe',
        label: 'Vibe coder',
        hint: 'I use AI to build, I might not know every service',
      },
      {
        value: 'dev',
        label: 'Developer',
        hint: 'I know my stack, show me all options',
      },
    ],
  }));

  if (builderType === 'dev') return developerFull();

  // Vibe coder → quick or pick
  const vibeMode = check(await p.select({
    message: 'How do you want to set up?',
    options: [
      {
        value: 'quick',
        label: 'Quick start',
        hint: 'answer 3 yes/no questions, we pick the rest',
      },
      {
        value: 'pick',
        label: "I'll choose",
        hint: 'plain-English questions, no jargon',
      },
    ],
  }));

  if (vibeMode === 'quick') return vibeQuick();
  return vibePick();
}
