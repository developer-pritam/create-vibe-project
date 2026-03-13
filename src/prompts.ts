import * as p from '@clack/prompts';
import type { UserAnswers } from './types.js';

async function quickStart(): Promise<UserAnswers> {
  const projectName = await p.text({
    message: 'Project name',
    placeholder: 'my-app',
    validate: (v) => {
      if (!v.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Use lowercase letters, numbers, and hyphens only';
    },
  });
  if (p.isCancel(projectName)) { p.cancel('Cancelled.'); process.exit(0); }

  const needsBackend = await p.confirm({ message: 'Does your app need a server? (logins, saving data, sending emails...)' });
  if (p.isCancel(needsBackend)) { p.cancel('Cancelled.'); process.exit(0); }

  let needsDatabase = false;
  if (needsBackend) {
    const db = await p.confirm({ message: 'Do you need to save data? (user profiles, posts, orders...)' });
    if (p.isCancel(db)) { p.cancel('Cancelled.'); process.exit(0); }
    needsDatabase = db as boolean;
  }

  const backend = needsBackend ? 'hono' : 'none';
  const database = needsDatabase ? 'mongodb' : 'none';
  const apiDeploy = needsBackend ? 'render' : null;

  p.note(
    [
      `Website   → React + Vite  (hosted on Cloudflare Pages)`,
      needsBackend ? `Server    → Node.js / Hono  (hosted on Render)` : '',
      needsDatabase ? `Database  → MongoDB Atlas` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    'Your stack'
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

export async function collectAnswers(): Promise<UserAnswers> {
  p.intro('create-vibe-stack — scaffold and deploy in minutes');

  const mode = await p.select({
    message: 'How do you want to set up your project?',
    options: [
      { value: 'quick', label: 'Quick start', hint: 'React + Hono + MongoDB, ready in seconds' },
      { value: 'custom', label: 'Custom', hint: 'choose every option yourself' },
    ],
  });
  if (p.isCancel(mode)) { p.cancel('Cancelled.'); process.exit(0); }

  if (mode === 'quick') return quickStart();

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
          message: 'What should your app look like?',
          options: [
            { value: 'react-vite', label: 'React + Vite', hint: 'modern interactive website — recommended' },
            { value: 'nextjs', label: 'Next.js', hint: 'great for SEO, blogs, and content-heavy sites' },
            { value: 'static-html', label: 'Static HTML/CSS/JS', hint: 'simple pages, no framework needed' },
            { value: 'none', label: 'No website', hint: 'server only — no frontend' },
          ],
        }),

      backend: () =>
        p.select({
          message: 'Does your app need a server?',
          options: [
            { value: 'none', label: 'No', hint: 'website only, no server' },
            { value: 'hono', label: 'Yes — Node.js (Hono)', hint: 'JavaScript/TypeScript, fast and lightweight' },
            { value: 'fastapi', label: 'Yes — Python (FastAPI)', hint: 'Python, great for AI apps' },
            { value: 'go', label: 'Yes — Go', hint: 'very fast, minimal resource usage' },
          ],
        }),

      database: () =>
        p.select({
          message: 'Do you need to save data?',
          options: [
            { value: 'none', label: 'No' },
            { value: 'neon', label: 'Yes — Neon (PostgreSQL)', hint: 'tables and rows, like a spreadsheet — free tier' },
            { value: 'mongodb', label: 'Yes — MongoDB Atlas', hint: 'flexible storage, like JSON files — free tier' },
            { value: 'firestore', label: 'Yes — Firestore', hint: "Google's database, real-time sync — free tier" },
            { value: 'upstash-redis', label: 'Yes — Upstash Redis', hint: 'super fast cache and temporary data — free tier' },
          ],
        }),

      mongodbUri: ({ results }) =>
        results.database !== 'mongodb'
          ? (Promise.resolve('') as Promise<string>)
          : p.text({
              message: 'MongoDB connection URL',
              placeholder: 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mydb',
              hint: 'Get it from MongoDB Atlas → Connect → Drivers',
              validate: (v) => {
                if (!v.trim()) return 'Connection URL is required';
                if (!v.startsWith('mongodb')) return 'Must start with mongodb:// or mongodb+srv://';
              },
            }),

      auth: () =>
        p.select({
          message: 'Do users need to log in?',
          options: [
            { value: 'none', label: 'No login needed' },
            { value: 'clerk', label: 'Yes — Clerk', hint: 'easiest setup, Google + email + GitHub — free tier' },
            { value: 'firebase-auth', label: 'Yes — Firebase Auth', hint: "Google's login system — free tier" },
            { value: 'supabase-auth', label: 'Yes — Supabase Auth', hint: 'open source login — free tier' },
          ],
        }),

      storage: () =>
        p.select({
          message: 'Do you need to store files? (images, PDFs, videos...)',
          options: [
            { value: 'none', label: 'No' },
            { value: 'r2', label: 'Yes — Cloudflare R2', hint: 'fast global CDN, free uploads and downloads' },
            { value: 'firebase-storage', label: 'Yes — Firebase Storage', hint: "Google's file storage — free tier" },
          ],
        }),

      jobs: () =>
        p.select({
          message: 'Do you need tasks that run in the background or on a schedule?',
          options: [
            { value: 'none', label: 'No' },
            { value: 'cloud-scheduler', label: 'Yes — scheduled tasks (GCP)', hint: 'run code at set times, like a cron job' },
            { value: 'bullmq-upstash', label: 'Yes — background job queue', hint: 'process tasks without making users wait' },
          ],
        }),

      realtime: () =>
        p.select({
          message: 'Do you need live updates without refreshing the page?',
          options: [
            { value: 'none', label: 'No' },
            { value: 'websockets', label: 'Yes — WebSockets', hint: 'live chat, notifications, multiplayer' },
            { value: 'supabase-realtime', label: 'Yes — Supabase Realtime', hint: 'database changes pushed instantly to users' },
          ],
        }),

      ai: () =>
        p.select({
          message: 'Do you want to add AI features?',
          options: [
            { value: 'none', label: 'No' },
            { value: 'llm-api', label: 'Yes — AI chat / text generation', hint: 'Claude or OpenAI wired and ready to use' },
            { value: 'vector-rag', label: 'Yes — AI search over your own content', hint: 'ask questions about your own documents' },
          ],
        }),

      email: () =>
        p.select({
          message: 'Do you need to send emails? (welcome, password reset...)',
          options: [
            { value: 'none', label: 'No' },
            { value: 'resend', label: 'Yes — Resend', hint: '3,000 emails/month free, great developer experience' },
          ],
        }),

      payments: () =>
        p.select({
          message: 'Do you need to accept payments?',
          options: [
            { value: 'none', label: 'No' },
            { value: 'stripe', label: 'Yes — Stripe', hint: 'checkout + webhook handler pre-wired' },
          ],
        }),

      webDeploy: ({ results }) =>
        results.frontend === 'none'
          ? (Promise.resolve('cloudflare-pages') as Promise<'cloudflare-pages'>)
          : p.select({
              message: 'Where should your website be hosted?',
              options: [
                { value: 'cloudflare-pages', label: 'Cloudflare Pages', hint: 'fast, free, works everywhere — recommended' },
                { value: 'vercel', label: 'Vercel', hint: 'great for Next.js, free tier' },
                { value: 'firebase-hosting', label: 'Firebase Hosting', hint: "Google's CDN, free tier" },
                { value: 'netlify', label: 'Netlify', hint: 'simple setup, free tier' },
              ],
            }),

      apiDeploy: ({ results }) =>
        results.backend === 'none'
          ? (Promise.resolve(null) as Promise<null>)
          : p.select({
              message: 'Where should your server be hosted?',
              options: [
                { value: 'cloud-run', label: 'Google Cloud Run', hint: 'pay only when used, scales automatically' },
                { value: 'render', label: 'Render', hint: 'simple setup, free tier (sleeps after 15min idle)' },
                { value: 'flyio', label: 'Fly.io', hint: 'global servers, generous free tier' },
              ],
            }),
    },
    {
      onCancel: () => {
        p.cancel('Cancelled.');
        process.exit(0);
      },
    }
  );

  return answers as unknown as UserAnswers;
}
