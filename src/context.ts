import type { UserAnswers, ScaffoldContext, EnvVar, TemplateFlags } from './types.js';

const ENV_VAR_MAP: Partial<Record<string, EnvVar[]>> = {
  neon: [
    { key: 'DATABASE_URL', description: 'Neon PostgreSQL connection string', example: 'postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require' },
  ],
  firestore: [
    { key: 'FIREBASE_PROJECT_ID', description: 'Firebase project ID', example: 'my-project-id' },
    { key: 'FIREBASE_CLIENT_EMAIL', description: 'Firebase service account email', example: 'firebase-adminsdk@my-project.iam.gserviceaccount.com' },
    { key: 'FIREBASE_PRIVATE_KEY', description: 'Firebase service account private key', example: '"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"' },
  ],
  'upstash-redis': [
    { key: 'UPSTASH_REDIS_REST_URL', description: 'Upstash Redis REST URL', example: 'https://xxx.upstash.io' },
    { key: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash Redis REST token', example: 'AXxx...' },
  ],
  mongodb: [
    { key: 'MONGODB_URI', description: 'MongoDB connection string (MongoDB Atlas or self-hosted)', example: 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mydb?retryWrites=true&w=majority' },
  ],
  clerk: [
    { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', description: 'Clerk publishable key', example: 'pk_test_...' },
    { key: 'CLERK_SECRET_KEY', description: 'Clerk secret key', example: 'sk_test_...' },
  ],
  'firebase-auth': [
    { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', description: 'Firebase API key', example: 'AIza...' },
    { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', description: 'Firebase auth domain', example: 'my-project.firebaseapp.com' },
    { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', description: 'Firebase project ID', example: 'my-project-id' },
  ],
  'supabase-auth': [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Supabase project URL', example: 'https://xxx.supabase.co' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Supabase anon key', example: 'eyJhbGciOi...' },
  ],
  r2: [
    { key: 'R2_ACCOUNT_ID', description: 'Cloudflare account ID', example: 'abc123' },
    { key: 'R2_ACCESS_KEY_ID', description: 'R2 access key ID', example: 'key123' },
    { key: 'R2_SECRET_ACCESS_KEY', description: 'R2 secret access key', example: 'secret123' },
    { key: 'R2_BUCKET_NAME', description: 'R2 bucket name', example: 'my-bucket' },
    { key: 'R2_PUBLIC_URL', description: 'R2 public bucket URL', example: 'https://pub-xxx.r2.dev' },
  ],
  'firebase-storage': [
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', description: 'Firebase storage bucket', example: 'my-project.appspot.com' },
  ],
  'bullmq-upstash': [
    { key: 'UPSTASH_REDIS_REST_URL', description: 'Upstash Redis REST URL (for BullMQ)', example: 'https://xxx.upstash.io' },
    { key: 'UPSTASH_REDIS_REST_TOKEN', description: 'Upstash Redis REST token', example: 'AXxx...' },
  ],
  resend: [
    { key: 'RESEND_API_KEY', description: 'Resend API key', example: 're_...' },
    { key: 'RESEND_FROM_EMAIL', description: 'From email address (must be verified)', example: 'noreply@yourdomain.com' },
  ],
  stripe: [
    { key: 'STRIPE_SECRET_KEY', description: 'Stripe secret key', example: 'sk_test_...' },
    { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe publishable key', example: 'pk_test_...' },
    { key: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook signing secret', example: 'whsec_...' },
  ],
  'llm-api': [
    { key: 'ANTHROPIC_API_KEY', description: 'Anthropic Claude API key', example: 'sk-ant-...' },
    { key: 'OPENAI_API_KEY', description: 'OpenAI API key (optional)', example: 'sk-...' },
  ],
  'vector-rag': [
    { key: 'ANTHROPIC_API_KEY', description: 'Anthropic Claude API key', example: 'sk-ant-...' },
    { key: 'PINECONE_API_KEY', description: 'Pinecone API key', example: 'pcsk_...' },
    { key: 'PINECONE_INDEX', description: 'Pinecone index name', example: 'my-index' },
  ],
  'cloud-run': [
    { key: 'GCP_PROJECT_ID', description: 'Google Cloud project ID', example: 'my-gcp-project' },
    { key: 'GCP_REGION', description: 'Google Cloud region', example: 'us-central1' },
  ],
};

const WEB_EXTRA_DEPS: Partial<Record<string, Record<string, string>>> = {
  clerk: { '@clerk/react': '^5.0.0' },
  'firebase-auth': { firebase: '^10.0.0' },
  'supabase-auth': { '@supabase/supabase-js': '^2.0.0' },
  'supabase-realtime': { '@supabase/supabase-js': '^2.0.0' },
  stripe: { '@stripe/stripe-js': '^3.0.0', '@stripe/react-stripe-js': '^2.0.0' },
};

const WEB_EXTRA_DEPS_NEXTJS: Partial<Record<string, Record<string, string>>> = {
  clerk: { '@clerk/nextjs': '^5.0.0' },
  'firebase-auth': { firebase: '^10.0.0' },
  'supabase-auth': { '@supabase/supabase-js': '^2.0.0', '@supabase/ssr': '^0.5.0' },
  'supabase-realtime': { '@supabase/supabase-js': '^2.0.0', '@supabase/ssr': '^0.5.0' },
  stripe: { '@stripe/stripe-js': '^3.0.0', '@stripe/react-stripe-js': '^2.0.0' },
};

const API_EXTRA_DEPS: Partial<Record<string, Record<string, string>>> = {
  neon: { '@neondatabase/serverless': '^0.10.0', drizzle: '^0.36.0' },
  mongodb: { mongoose: '^8.0.0' },
  'upstash-redis': { '@upstash/redis': '^1.34.0' },
  'bullmq-upstash': { bullmq: '^5.0.0', '@upstash/redis': '^1.34.0' },
  clerk: { '@clerk/express': '^1.0.0' },
  resend: { resend: '^3.0.0' },
  stripe: { stripe: '^16.0.0' },
  'llm-api': { '@anthropic-ai/sdk': '^0.32.0' },
  'vector-rag': { '@anthropic-ai/sdk': '^0.32.0', '@pinecone-database/pinecone': '^3.0.0' },
};

function collectEnvVars(answers: UserAnswers): EnvVar[] {
  const keys = new Set<string>();
  const vars: EnvVar[] = [];

  const add = (source: string) => {
    const entries = ENV_VAR_MAP[source];
    if (!entries) return;
    for (const v of entries) {
      if (!keys.has(v.key)) {
        keys.add(v.key);
        vars.push(v);
      }
    }
  };

  add(answers.database);
  add(answers.auth);
  add(answers.storage);
  add(answers.jobs);
  add(answers.ai);
  add(answers.email);
  add(answers.payments);
  if (answers.apiDeploy) add(answers.apiDeploy);

  // Fill in the actual MongoDB URI the user entered
  if (answers.database === 'mongodb' && answers.mongodbUri) {
    const mongoVar = vars.find((v) => v.key === 'MONGODB_URI');
    if (mongoVar) mongoVar.example = answers.mongodbUri;
  }

  return vars;
}

function collectWebDeps(answers: UserAnswers): Record<string, string> {
  const deps = answers.frontend === 'nextjs' ? WEB_EXTRA_DEPS_NEXTJS : WEB_EXTRA_DEPS;
  const result: Record<string, string> = {};
  const merge = (source: string) => Object.assign(result, deps[source] ?? {});

  merge(answers.auth);
  merge(answers.realtime);
  merge(answers.payments);

  return result;
}

function collectApiDeps(answers: UserAnswers): Record<string, string> {
  const result: Record<string, string> = {};
  const merge = (source: string) => Object.assign(result, API_EXTRA_DEPS[source] ?? {});

  merge(answers.database);
  merge(answers.auth);
  merge(answers.jobs);
  merge(answers.email);
  merge(answers.payments);
  merge(answers.ai);

  return result;
}

export function buildContext(answers: UserAnswers): ScaffoldContext {
  const hasWeb = answers.frontend !== 'none';
  const hasApi = answers.backend !== 'none';
  const hasFirebase = answers.auth === 'firebase-auth' || answers.database === 'firestore' || answers.storage === 'firebase-storage' || answers.webDeploy === 'firebase-hosting';
  const hasSupabase = answers.auth === 'supabase-auth' || answers.realtime === 'supabase-realtime';

  const flags: TemplateFlags = {
    projectName: answers.projectName,
    isStaticHtml: answers.frontend === 'static-html',
    isReactVite: answers.frontend === 'react-vite',
    isNextjs: answers.frontend === 'nextjs',
    isHono: answers.backend === 'hono',
    isFastapi: answers.backend === 'fastapi',
    isGo: answers.backend === 'go',
    hasNeon: answers.database === 'neon',
    hasFirestore: answers.database === 'firestore',
    hasUpstashRedis: answers.database === 'upstash-redis',
    hasMongodb: answers.database === 'mongodb',
    hasClerk: answers.auth === 'clerk',
    hasFirebaseAuth: answers.auth === 'firebase-auth',
    hasSupabaseAuth: answers.auth === 'supabase-auth',
    hasR2: answers.storage === 'r2',
    hasFirebaseStorage: answers.storage === 'firebase-storage',
    hasCloudScheduler: answers.jobs === 'cloud-scheduler',
    hasBullmq: answers.jobs === 'bullmq-upstash',
    hasWebsockets: answers.realtime === 'websockets',
    hasSupabaseRealtime: answers.realtime === 'supabase-realtime',
    hasLlmApi: answers.ai === 'llm-api',
    hasVectorRag: answers.ai === 'vector-rag',
    hasResend: answers.email === 'resend',
    hasStripe: answers.payments === 'stripe',
    isCloudflarePages: answers.webDeploy === 'cloudflare-pages',
    isFirebaseHosting: answers.webDeploy === 'firebase-hosting',
    isVercel: answers.webDeploy === 'vercel',
    isNetlify: answers.webDeploy === 'netlify',
    isCloudRun: answers.apiDeploy === 'cloud-run',
    isRender: answers.apiDeploy === 'render',
    isFlyio: answers.apiDeploy === 'flyio',
    hasWeb,
    hasApi,
    hasFirebase,
    hasSupabase,
    year: new Date().getFullYear(),
  };

  return {
    answers,
    hasWeb,
    hasApi,
    envVars: collectEnvVars(answers),
    webDeps: hasWeb ? collectWebDeps(answers) : {},
    apiDeps: hasApi ? collectApiDeps(answers) : {},
    flags,
  };
}
