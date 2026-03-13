export type Frontend = 'none' | 'static-html' | 'react-vite' | 'nextjs';
export type Backend = 'none' | 'hono' | 'fastapi' | 'go';
export type Database = 'none' | 'neon' | 'firestore' | 'upstash-redis';
export type Auth = 'none' | 'clerk' | 'firebase-auth' | 'supabase-auth';
export type Storage = 'none' | 'r2' | 'firebase-storage';
export type Jobs = 'none' | 'cloud-scheduler' | 'bullmq-upstash';
export type Realtime = 'none' | 'websockets' | 'supabase-realtime';
export type AI = 'none' | 'llm-api' | 'vector-rag';
export type Email = 'none' | 'resend';
export type Payments = 'none' | 'stripe';
export type WebDeploy = 'cloudflare-pages' | 'firebase-hosting' | 'vercel' | 'netlify';
export type ApiDeploy = 'cloud-run' | 'render' | 'flyio';

export interface UserAnswers {
  projectName: string;
  frontend: Frontend;
  backend: Backend;
  database: Database;
  auth: Auth;
  storage: Storage;
  jobs: Jobs;
  realtime: Realtime;
  ai: AI;
  email: Email;
  payments: Payments;
  webDeploy: WebDeploy;
  apiDeploy: ApiDeploy | null;
}

export interface EnvVar {
  key: string;
  description: string;
  example: string;
}

export interface ScaffoldContext {
  answers: UserAnswers;
  hasWeb: boolean;
  hasApi: boolean;
  envVars: EnvVar[];
  webDeps: Record<string, string>;
  apiDeps: Record<string, string>;
  // Mustache template flags
  flags: TemplateFlags;
}

export interface TemplateFlags {
  projectName: string;
  // frontend
  isStaticHtml: boolean;
  isReactVite: boolean;
  isNextjs: boolean;
  // backend
  isHono: boolean;
  isFastapi: boolean;
  isGo: boolean;
  // database
  hasNeon: boolean;
  hasFirestore: boolean;
  hasUpstashRedis: boolean;
  // auth
  hasClerk: boolean;
  hasFirebaseAuth: boolean;
  hasSupabaseAuth: boolean;
  // storage
  hasR2: boolean;
  hasFirebaseStorage: boolean;
  // jobs
  hasCloudScheduler: boolean;
  hasBullmq: boolean;
  // realtime
  hasWebsockets: boolean;
  hasSupabaseRealtime: boolean;
  // ai
  hasLlmApi: boolean;
  hasVectorRag: boolean;
  // email / payments
  hasResend: boolean;
  hasStripe: boolean;
  // deploy
  isCloudflarePages: boolean;
  isFirebaseHosting: boolean;
  isVercel: boolean;
  isNetlify: boolean;
  isCloudRun: boolean;
  isRender: boolean;
  isFlyio: boolean;
  // convenience
  hasWeb: boolean;
  hasApi: boolean;
  hasFirebase: boolean;
  hasSupabase: boolean;
  year: number;
}
