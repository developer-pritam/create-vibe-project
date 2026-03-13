import * as p from '@clack/prompts';
import type { UserAnswers } from './types.js';

export async function collectAnswers(): Promise<UserAnswers> {
  p.intro('create-vibe-stack — scaffold and deploy in minutes');

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
            { value: 'react-vite', label: 'React + Vite', hint: 'recommended' },
            { value: 'nextjs', label: 'Next.js', hint: 'SSR / full-stack' },
            { value: 'static-html', label: 'Static HTML/CSS/JS', hint: 'no framework' },
            { value: 'none', label: 'None', hint: 'API only' },
          ],
        }),

      backend: () =>
        p.select({
          message: 'Backend API',
          options: [
            { value: 'none', label: 'None', hint: 'frontend only' },
            { value: 'hono', label: 'Node.js — Hono', hint: 'fast, lightweight, TypeScript' },
            { value: 'fastapi', label: 'Python — FastAPI', hint: 'async, great for AI/ML' },
            { value: 'go', label: 'Go — net/http', hint: 'high performance' },
          ],
        }),

      database: () =>
        p.select({
          message: 'Database',
          options: [
            { value: 'none', label: 'None' },
            { value: 'neon', label: 'PostgreSQL — Neon', hint: 'serverless postgres, free tier' },
            { value: 'mongodb', label: 'MongoDB Atlas', hint: 'NoSQL, free tier, paste your connection URL' },
            { value: 'firestore', label: 'Firestore', hint: 'NoSQL, Google, free tier' },
            { value: 'upstash-redis', label: 'Redis — Upstash', hint: 'serverless redis, free tier' },
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
          message: 'Authentication',
          options: [
            { value: 'none', label: 'None' },
            { value: 'clerk', label: 'Clerk', hint: 'easiest DX, free tier' },
            { value: 'firebase-auth', label: 'Firebase Auth', hint: 'Google, generous free tier' },
            { value: 'supabase-auth', label: 'Supabase Auth', hint: 'open source, free tier' },
          ],
        }),

      storage: () =>
        p.select({
          message: 'File Storage',
          options: [
            { value: 'none', label: 'None' },
            { value: 'r2', label: 'Cloudflare R2', hint: 'free egress, S3-compatible' },
            { value: 'firebase-storage', label: 'Firebase Storage', hint: 'easy, free tier' },
          ],
        }),

      jobs: () =>
        p.select({
          message: 'Background Jobs / Scheduled Tasks',
          options: [
            { value: 'none', label: 'None' },
            { value: 'cloud-scheduler', label: 'Cloud Scheduler → Cloud Run', hint: 'cron jobs, GCP' },
            { value: 'bullmq-upstash', label: 'BullMQ + Upstash Redis', hint: 'job queues, free tier' },
          ],
        }),

      realtime: () =>
        p.select({
          message: 'Real-time Features',
          options: [
            { value: 'none', label: 'None' },
            { value: 'websockets', label: 'WebSockets', hint: 'Socket.io on backend' },
            { value: 'supabase-realtime', label: 'Supabase Realtime', hint: 'managed, free tier' },
          ],
        }),

      ai: () =>
        p.select({
          message: 'AI / LLM',
          options: [
            { value: 'none', label: 'None' },
            { value: 'llm-api', label: 'LLM API calls', hint: 'Anthropic Claude / OpenAI' },
            { value: 'vector-rag', label: 'Vector Search / RAG', hint: 'Claude + Pinecone embeddings' },
          ],
        }),

      email: () =>
        p.select({
          message: 'Email',
          options: [
            { value: 'none', label: 'None' },
            { value: 'resend', label: 'Resend', hint: 'best DX, free tier (3k/month)' },
          ],
        }),

      payments: () =>
        p.select({
          message: 'Payments',
          options: [
            { value: 'none', label: 'None' },
            { value: 'stripe', label: 'Stripe', hint: 'checkout + webhooks pre-configured' },
          ],
        }),

      webDeploy: ({ results }) =>
        results.frontend === 'none'
          ? (Promise.resolve('cloudflare-pages') as Promise<'cloudflare-pages'>)
          : p.select({
              message: 'Deploy frontend to',
              options: [
                { value: 'cloudflare-pages', label: 'Cloudflare Pages', hint: 'fast, free, global edge' },
                { value: 'vercel', label: 'Vercel', hint: 'great for Next.js, free tier' },
                { value: 'firebase-hosting', label: 'Firebase Hosting', hint: 'Google CDN, free tier' },
                { value: 'netlify', label: 'Netlify', hint: 'simple, free tier' },
              ],
            }),

      apiDeploy: ({ results }) =>
        results.backend === 'none'
          ? (Promise.resolve(null) as Promise<null>)
          : p.select({
              message: 'Deploy backend to',
              options: [
                { value: 'cloud-run', label: 'Google Cloud Run', hint: 'scales to zero, pay-per-use' },
                { value: 'render', label: 'Render', hint: 'simple, free tier (sleeps on inactivity)' },
                { value: 'flyio', label: 'Fly.io', hint: 'global, generous free tier' },
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
