#!/usr/bin/env node

// src/index.ts
import { resolve } from "path";

// src/prompts.ts
import * as p from "@clack/prompts";
function cancel2(msg = "Cancelled.") {
  p.cancel(msg);
  process.exit(0);
}
function check(val) {
  if (p.isCancel(val)) cancel2();
  return val;
}
function mongoUriPrompt() {
  return p.text({
    message: "Paste your MongoDB connection URL",
    placeholder: "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mydb",
    hint: "Get it from MongoDB Atlas \u2192 Connect \u2192 Drivers",
    validate: (v) => {
      if (!v.trim()) return "Connection URL is required";
      if (!v.startsWith("mongodb")) return "Must start with mongodb:// or mongodb+srv://";
    }
  });
}
async function vibeQuick() {
  const projectName = check(await p.text({
    message: "What do you want to call your project?",
    placeholder: "my-app",
    validate: (v) => {
      if (!v.trim()) return "Project name is required";
      if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only";
    }
  }));
  const needsBackend = check(await p.confirm({
    message: "Does your app need to save or process data? (logins, storing posts, sending emails...)",
    active: "Yes",
    inactive: "No \u2014 just a website"
  }));
  let needsDatabase = false;
  if (needsBackend) {
    needsDatabase = check(await p.confirm({
      message: "Should it remember data between visits? (user profiles, orders, messages...)",
      active: "Yes",
      inactive: "No \u2014 no database needed"
    }));
  }
  const backend = needsBackend ? "hono" : "none";
  const database = needsDatabase ? "mongodb" : "none";
  const apiDeploy = needsBackend ? "render" : null;
  p.note(
    [
      `Website   \u2192 React + Vite      (free on Cloudflare Pages)`,
      needsBackend ? `Server    \u2192 Node.js / Hono    (free on Render)` : "",
      needsDatabase ? `Database  \u2192 MongoDB Atlas      (free 512 MB)` : ""
    ].filter(Boolean).join("\n"),
    "Your stack \u2014 all set!"
  );
  return {
    projectName,
    frontend: "react-vite",
    backend,
    database,
    mongodbUri: "",
    auth: "none",
    storage: "none",
    jobs: "none",
    realtime: "none",
    ai: "none",
    email: "none",
    payments: "none",
    webDeploy: "cloudflare-pages",
    apiDeploy
  };
}
async function vibePick() {
  const answers = await p.group(
    {
      projectName: () => p.text({
        message: "What do you want to call your project?",
        placeholder: "my-app",
        validate: (v) => {
          if (!v.trim()) return "Project name is required";
          if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only";
        }
      }),
      frontend: () => p.select({
        message: "What kind of app are you building?",
        options: [
          { value: "react-vite", label: "An interactive web app", hint: "dashboards, tools, social apps \u2014 React" },
          { value: "nextjs", label: "A blog or content website", hint: "landing pages, docs, SEO-friendly \u2014 Next.js" },
          { value: "static-html", label: "A simple web page", hint: "portfolio, one-pager \u2014 plain HTML, no framework" },
          { value: "none", label: "No website", hint: "I only need a server (e.g. for a mobile app)" }
        ]
      }),
      backend: () => p.select({
        message: "Does your app need to do anything on the server? (logins, saving data, sending emails...)",
        options: [
          { value: "none", label: "No", hint: "website only \u2014 runs entirely in the browser" },
          { value: "hono", label: "Yes \u2014 JavaScript", hint: "Node.js / Hono \u2014 recommended for most apps" },
          { value: "fastapi", label: "Yes \u2014 Python", hint: "FastAPI \u2014 great if you want to use AI/ML libraries" }
        ]
      }),
      database: () => p.select({
        message: "Do you need to store and retrieve data? (user profiles, posts, orders...)",
        options: [
          { value: "none", label: "No" },
          { value: "mongodb", label: "Yes \u2014 MongoDB", hint: "flexible storage, easy to start with \u2014 free tier" },
          { value: "neon", label: "Yes \u2014 PostgreSQL", hint: "structured storage, like a spreadsheet \u2014 free tier" }
        ]
      }),
      mongodbUri: ({ results }) => results.database !== "mongodb" ? Promise.resolve("") : mongoUriPrompt(),
      auth: () => p.select({
        message: "Do you need users to sign up or log in?",
        options: [
          { value: "none", label: "No login needed" },
          { value: "clerk", label: "Yes \u2014 Clerk", hint: "Google, email, GitHub \u2014 easiest setup, free tier" },
          { value: "firebase-auth", label: "Yes \u2014 Firebase Auth", hint: "Google's login system \u2014 email + social, free tier" },
          { value: "supabase-auth", label: "Yes \u2014 Supabase Auth", hint: "open source login, free tier" }
        ]
      }),
      storage: () => p.select({
        message: "Do you need to store files that users upload? (photos, documents, videos...)",
        options: [
          { value: "none", label: "No" },
          { value: "r2", label: "Yes", hint: "Cloudflare R2 \u2014 free storage and downloads" }
        ]
      }),
      jobs: () => p.select({
        message: "Do you need anything to run automatically?",
        options: [
          { value: "none", label: "No" },
          { value: "bullmq-upstash", label: "Yes \u2014 background tasks", hint: "things that run after an action, e.g. send email after signup, resize image after upload" },
          { value: "cloud-scheduler", label: "Yes \u2014 scheduled tasks", hint: "things that run on a timer, e.g. daily digest, nightly cleanup, weekly report" }
        ]
      }),
      realtime: () => p.select({
        message: "Do you need anything to update live without refreshing the page? (chat, notifications, live scores...)",
        options: [
          { value: "none", label: "No" },
          { value: "websockets", label: "Yes", hint: "WebSockets \u2014 data updates instantly without page refresh" }
        ]
      }),
      ai: () => p.select({
        message: "Do you want to add AI to your app? (chat, writing help, smart search...)",
        options: [
          { value: "none", label: "No" },
          { value: "llm-api", label: "Yes \u2014 AI chat or text generation", hint: "Claude / OpenAI \u2014 pre-wired and ready to use" }
        ]
      }),
      email: () => p.select({
        message: "Does your app need to send emails? (welcome, password reset...)",
        options: [
          { value: "none", label: "No" },
          { value: "resend", label: "Yes \u2014 Resend", hint: "3,000 emails/month free" }
        ]
      }),
      payments: () => p.select({
        message: "Do you need to charge money or accept payments?",
        options: [
          { value: "none", label: "No" },
          { value: "stripe", label: "Yes \u2014 Stripe", hint: "checkout + subscription handling pre-wired" }
        ]
      }),
      webDeploy: ({ results }) => results.frontend === "none" ? Promise.resolve("cloudflare-pages") : p.select({
        message: "Where should your website be hosted?",
        options: [
          { value: "cloudflare-pages", label: "Cloudflare Pages", hint: "fast, free, works everywhere \u2014 recommended" },
          { value: "vercel", label: "Vercel", hint: "great for Next.js / blog sites, free tier" },
          { value: "netlify", label: "Netlify", hint: "simple and free" }
        ]
      }),
      apiDeploy: ({ results }) => results.backend === "none" ? Promise.resolve(null) : p.select({
        message: "Where should your server be hosted?",
        options: [
          { value: "render", label: "Render", hint: "simple setup, free tier \u2014 recommended for vibe coders" },
          { value: "flyio", label: "Fly.io", hint: "global servers, generous free tier" }
        ]
      })
    },
    { onCancel: () => cancel2() }
  );
  return answers;
}
async function developerFull() {
  const answers = await p.group(
    {
      projectName: () => p.text({
        message: "Project name",
        placeholder: "my-app",
        validate: (v) => {
          if (!v.trim()) return "Project name is required";
          if (!/^[a-z0-9-]+$/.test(v)) return "Use lowercase letters, numbers, and hyphens only";
        }
      }),
      frontend: () => p.select({
        message: "Frontend",
        options: [
          { value: "react-vite", label: "React + Vite", hint: "recommended" },
          { value: "nextjs", label: "Next.js", hint: "SSR / app router" },
          { value: "static-html", label: "Static HTML/CSS/JS", hint: "no framework" },
          { value: "none", label: "None", hint: "API only" }
        ]
      }),
      backend: () => p.select({
        message: "Backend",
        options: [
          { value: "none", label: "None", hint: "frontend only" },
          { value: "hono", label: "Node.js \u2014 Hono", hint: "TypeScript, lightweight" },
          { value: "fastapi", label: "Python \u2014 FastAPI", hint: "async, great for AI/ML" },
          { value: "go", label: "Go \u2014 net/http", hint: "high performance" }
        ]
      }),
      database: () => p.select({
        message: "Database",
        options: [
          { value: "none", label: "None" },
          { value: "neon", label: "PostgreSQL \u2014 Neon", hint: "serverless postgres, free tier" },
          { value: "mongodb", label: "MongoDB Atlas", hint: "NoSQL, free tier" },
          { value: "firestore", label: "Firestore", hint: "Google NoSQL, free tier" },
          { value: "upstash-redis", label: "Redis \u2014 Upstash", hint: "serverless redis, free tier" }
        ]
      }),
      mongodbUri: ({ results }) => results.database !== "mongodb" ? Promise.resolve("") : mongoUriPrompt(),
      auth: () => p.select({
        message: "Auth",
        options: [
          { value: "none", label: "None" },
          { value: "clerk", label: "Clerk", hint: "10k MAU free, easiest DX" },
          { value: "firebase-auth", label: "Firebase Auth", hint: "Google, generous free tier" },
          { value: "supabase-auth", label: "Supabase Auth", hint: "open source" }
        ]
      }),
      storage: () => p.select({
        message: "File storage",
        options: [
          { value: "none", label: "None" },
          { value: "r2", label: "Cloudflare R2", hint: "S3-compatible, zero egress" },
          { value: "firebase-storage", label: "Firebase Storage", hint: "easy, free tier" }
        ]
      }),
      jobs: () => p.select({
        message: "Background jobs",
        options: [
          { value: "none", label: "None" },
          { value: "cloud-scheduler", label: "Cloud Scheduler \u2192 Cloud Run", hint: "GCP cron" },
          { value: "bullmq-upstash", label: "BullMQ + Upstash Redis", hint: "job queues, free tier" }
        ]
      }),
      realtime: () => p.select({
        message: "Real-time",
        options: [
          { value: "none", label: "None" },
          { value: "websockets", label: "WebSockets", hint: "Socket.io" },
          { value: "supabase-realtime", label: "Supabase Realtime", hint: "managed" }
        ]
      }),
      ai: () => p.select({
        message: "AI / LLM",
        options: [
          { value: "none", label: "None" },
          { value: "llm-api", label: "LLM API calls", hint: "Anthropic / OpenAI" },
          { value: "vector-rag", label: "Vector Search / RAG", hint: "Claude + Pinecone" }
        ]
      }),
      email: () => p.select({
        message: "Email",
        options: [
          { value: "none", label: "None" },
          { value: "resend", label: "Resend", hint: "3k/month free" }
        ]
      }),
      payments: () => p.select({
        message: "Payments",
        options: [
          { value: "none", label: "None" },
          { value: "stripe", label: "Stripe", hint: "checkout + webhooks" }
        ]
      }),
      webDeploy: ({ results }) => results.frontend === "none" ? Promise.resolve("cloudflare-pages") : p.select({
        message: "Deploy frontend to",
        options: [
          { value: "cloudflare-pages", label: "Cloudflare Pages", hint: "fast, free, global edge" },
          { value: "vercel", label: "Vercel", hint: "great for Next.js" },
          { value: "firebase-hosting", label: "Firebase Hosting", hint: "Google CDN" },
          { value: "netlify", label: "Netlify", hint: "simple, free tier" }
        ]
      }),
      apiDeploy: ({ results }) => results.backend === "none" ? Promise.resolve(null) : p.select({
        message: "Deploy backend to",
        options: [
          { value: "cloud-run", label: "Google Cloud Run", hint: "scales to zero, pay-per-use" },
          { value: "render", label: "Render", hint: "simple, free tier" },
          { value: "flyio", label: "Fly.io", hint: "global, generous free tier" }
        ]
      })
    },
    { onCancel: () => cancel2() }
  );
  return answers;
}
async function collectAnswers() {
  p.intro("create-vibe-project \u2014 scaffold and deploy in minutes");
  const builderType = check(await p.select({
    message: "First \u2014 what kind of builder are you?",
    options: [
      {
        value: "vibe",
        label: "Vibe coder",
        hint: "I use AI to build, I might not know every service"
      },
      {
        value: "dev",
        label: "Developer",
        hint: "I know my stack, show me all options"
      }
    ]
  }));
  if (builderType === "dev") return developerFull();
  const vibeMode = check(await p.select({
    message: "How do you want to set up?",
    options: [
      {
        value: "quick",
        label: "Quick start",
        hint: "answer 3 yes/no questions, we pick the rest"
      },
      {
        value: "pick",
        label: "I'll choose",
        hint: "plain-English questions, no jargon"
      }
    ]
  }));
  if (vibeMode === "quick") return vibeQuick();
  return vibePick();
}

// src/scaffold.ts
import { existsSync as existsSync2 } from "fs";
import * as p2 from "@clack/prompts";

// src/context.ts
var ENV_VAR_MAP = {
  neon: [
    { key: "DATABASE_URL", description: "Neon PostgreSQL connection string", example: "postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require" }
  ],
  firestore: [
    { key: "FIREBASE_PROJECT_ID", description: "Firebase project ID", example: "my-project-id" },
    { key: "FIREBASE_CLIENT_EMAIL", description: "Firebase service account email", example: "firebase-adminsdk@my-project.iam.gserviceaccount.com" },
    { key: "FIREBASE_PRIVATE_KEY", description: "Firebase service account private key", example: '"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"' }
  ],
  "upstash-redis": [
    { key: "UPSTASH_REDIS_REST_URL", description: "Upstash Redis REST URL", example: "https://xxx.upstash.io" },
    { key: "UPSTASH_REDIS_REST_TOKEN", description: "Upstash Redis REST token", example: "AXxx..." }
  ],
  mongodb: [
    { key: "MONGODB_URI", description: "MongoDB connection string (MongoDB Atlas or self-hosted)", example: "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/mydb?retryWrites=true&w=majority" }
  ],
  clerk: [
    { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", description: "Clerk publishable key", example: "pk_test_..." },
    { key: "CLERK_SECRET_KEY", description: "Clerk secret key", example: "sk_test_..." }
  ],
  "firebase-auth": [
    { key: "NEXT_PUBLIC_FIREBASE_API_KEY", description: "Firebase API key", example: "AIza..." },
    { key: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", description: "Firebase auth domain", example: "my-project.firebaseapp.com" },
    { key: "NEXT_PUBLIC_FIREBASE_PROJECT_ID", description: "Firebase project ID", example: "my-project-id" }
  ],
  "supabase-auth": [
    { key: "NEXT_PUBLIC_SUPABASE_URL", description: "Supabase project URL", example: "https://xxx.supabase.co" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", description: "Supabase anon key", example: "eyJhbGciOi..." }
  ],
  r2: [
    { key: "R2_ACCOUNT_ID", description: "Cloudflare account ID", example: "abc123" },
    { key: "R2_ACCESS_KEY_ID", description: "R2 access key ID", example: "key123" },
    { key: "R2_SECRET_ACCESS_KEY", description: "R2 secret access key", example: "secret123" },
    { key: "R2_BUCKET_NAME", description: "R2 bucket name", example: "my-bucket" },
    { key: "R2_PUBLIC_URL", description: "R2 public bucket URL", example: "https://pub-xxx.r2.dev" }
  ],
  "firebase-storage": [
    { key: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", description: "Firebase storage bucket", example: "my-project.appspot.com" }
  ],
  "bullmq-upstash": [
    { key: "UPSTASH_REDIS_REST_URL", description: "Upstash Redis REST URL (for BullMQ)", example: "https://xxx.upstash.io" },
    { key: "UPSTASH_REDIS_REST_TOKEN", description: "Upstash Redis REST token", example: "AXxx..." }
  ],
  resend: [
    { key: "RESEND_API_KEY", description: "Resend API key", example: "re_..." },
    { key: "RESEND_FROM_EMAIL", description: "From email address (must be verified)", example: "noreply@yourdomain.com" }
  ],
  stripe: [
    { key: "STRIPE_SECRET_KEY", description: "Stripe secret key", example: "sk_test_..." },
    { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", description: "Stripe publishable key", example: "pk_test_..." },
    { key: "STRIPE_WEBHOOK_SECRET", description: "Stripe webhook signing secret", example: "whsec_..." }
  ],
  "llm-api": [
    { key: "ANTHROPIC_API_KEY", description: "Anthropic Claude API key", example: "sk-ant-..." },
    { key: "OPENAI_API_KEY", description: "OpenAI API key (optional)", example: "sk-..." }
  ],
  "vector-rag": [
    { key: "ANTHROPIC_API_KEY", description: "Anthropic Claude API key", example: "sk-ant-..." },
    { key: "PINECONE_API_KEY", description: "Pinecone API key", example: "pcsk_..." },
    { key: "PINECONE_INDEX", description: "Pinecone index name", example: "my-index" }
  ],
  "cloud-run": [
    { key: "GCP_PROJECT_ID", description: "Google Cloud project ID", example: "my-gcp-project" },
    { key: "GCP_REGION", description: "Google Cloud region", example: "us-central1" }
  ]
};
var WEB_EXTRA_DEPS = {
  clerk: { "@clerk/react": "^5.0.0" },
  "firebase-auth": { firebase: "^10.0.0" },
  "supabase-auth": { "@supabase/supabase-js": "^2.0.0" },
  "supabase-realtime": { "@supabase/supabase-js": "^2.0.0" },
  stripe: { "@stripe/stripe-js": "^3.0.0", "@stripe/react-stripe-js": "^2.0.0" }
};
var WEB_EXTRA_DEPS_NEXTJS = {
  clerk: { "@clerk/nextjs": "^5.0.0" },
  "firebase-auth": { firebase: "^10.0.0" },
  "supabase-auth": { "@supabase/supabase-js": "^2.0.0", "@supabase/ssr": "^0.5.0" },
  "supabase-realtime": { "@supabase/supabase-js": "^2.0.0", "@supabase/ssr": "^0.5.0" },
  stripe: { "@stripe/stripe-js": "^3.0.0", "@stripe/react-stripe-js": "^2.0.0" }
};
var API_EXTRA_DEPS = {
  neon: { "@neondatabase/serverless": "^0.10.0", drizzle: "^0.36.0" },
  mongodb: { mongoose: "^8.0.0" },
  "upstash-redis": { "@upstash/redis": "^1.34.0" },
  "bullmq-upstash": { bullmq: "^5.0.0", "@upstash/redis": "^1.34.0" },
  clerk: { "@clerk/express": "^1.0.0" },
  resend: { resend: "^3.0.0" },
  stripe: { stripe: "^16.0.0" },
  "llm-api": { "@anthropic-ai/sdk": "^0.32.0" },
  "vector-rag": { "@anthropic-ai/sdk": "^0.32.0", "@pinecone-database/pinecone": "^3.0.0" }
};
function collectEnvVars(answers) {
  const keys = /* @__PURE__ */ new Set();
  const vars = [];
  const add = (source) => {
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
  if (answers.database === "mongodb" && answers.mongodbUri) {
    const mongoVar = vars.find((v) => v.key === "MONGODB_URI");
    if (mongoVar) mongoVar.example = answers.mongodbUri;
  }
  return vars;
}
function collectWebDeps(answers) {
  const deps = answers.frontend === "nextjs" ? WEB_EXTRA_DEPS_NEXTJS : WEB_EXTRA_DEPS;
  const result = {};
  const merge = (source) => Object.assign(result, deps[source] ?? {});
  merge(answers.auth);
  merge(answers.realtime);
  merge(answers.payments);
  return result;
}
function collectApiDeps(answers) {
  const result = {};
  const merge = (source) => Object.assign(result, API_EXTRA_DEPS[source] ?? {});
  merge(answers.database);
  merge(answers.auth);
  merge(answers.jobs);
  merge(answers.email);
  merge(answers.payments);
  merge(answers.ai);
  return result;
}
function buildContext(answers) {
  const hasWeb = answers.frontend !== "none";
  const hasApi = answers.backend !== "none";
  const hasFirebase = answers.auth === "firebase-auth" || answers.database === "firestore" || answers.storage === "firebase-storage" || answers.webDeploy === "firebase-hosting";
  const hasSupabase = answers.auth === "supabase-auth" || answers.realtime === "supabase-realtime";
  const flags = {
    projectName: answers.projectName,
    isStaticHtml: answers.frontend === "static-html",
    isReactVite: answers.frontend === "react-vite",
    isNextjs: answers.frontend === "nextjs",
    isHono: answers.backend === "hono",
    isFastapi: answers.backend === "fastapi",
    isGo: answers.backend === "go",
    hasNeon: answers.database === "neon",
    hasFirestore: answers.database === "firestore",
    hasUpstashRedis: answers.database === "upstash-redis",
    hasMongodb: answers.database === "mongodb",
    hasClerk: answers.auth === "clerk",
    hasFirebaseAuth: answers.auth === "firebase-auth",
    hasSupabaseAuth: answers.auth === "supabase-auth",
    hasR2: answers.storage === "r2",
    hasFirebaseStorage: answers.storage === "firebase-storage",
    hasCloudScheduler: answers.jobs === "cloud-scheduler",
    hasBullmq: answers.jobs === "bullmq-upstash",
    hasWebsockets: answers.realtime === "websockets",
    hasSupabaseRealtime: answers.realtime === "supabase-realtime",
    hasLlmApi: answers.ai === "llm-api",
    hasVectorRag: answers.ai === "vector-rag",
    hasResend: answers.email === "resend",
    hasStripe: answers.payments === "stripe",
    isCloudflarePages: answers.webDeploy === "cloudflare-pages",
    isFirebaseHosting: answers.webDeploy === "firebase-hosting",
    isVercel: answers.webDeploy === "vercel",
    isNetlify: answers.webDeploy === "netlify",
    isCloudRun: answers.apiDeploy === "cloud-run",
    isRender: answers.apiDeploy === "render",
    isFlyio: answers.apiDeploy === "flyio",
    hasWeb,
    hasApi,
    hasFirebase,
    hasSupabase,
    year: (/* @__PURE__ */ new Date()).getFullYear()
  };
  return {
    answers,
    hasWeb,
    hasApi,
    envVars: collectEnvVars(answers),
    webDeps: hasWeb ? collectWebDeps(answers) : {},
    apiDeps: hasApi ? collectApiDeps(answers) : {},
    flags
  };
}

// src/generators/root.ts
import { join as join2 } from "path";

// src/utils/fs.ts
import { readFile, writeFile, mkdir, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { dirname, join } from "path";
import Mustache from "mustache";
async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}
async function writeFileSafe(filePath, content) {
  await ensureDir(dirname(filePath));
  await writeFile(filePath, content, "utf8");
}
async function renderTemplate(templatePath, vars) {
  const raw = await readFile(templatePath, "utf8");
  return Mustache.render(raw, vars);
}
async function processTemplate(src, dest, vars) {
  await ensureDir(dirname(dest));
  if (src.endsWith(".mustache")) {
    const rendered = await renderTemplate(src, vars);
    await writeFile(dest.replace(/\.mustache$/, ""), rendered, "utf8");
  } else {
    await copyFile(src, dest);
  }
}
async function copyTemplateDir(srcDir, destDir, vars) {
  if (!existsSync(srcDir)) return;
  const { readdirSync, statSync } = await import("fs");
  const entries = readdirSync(srcDir);
  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const destName = entry.endsWith(".mustache") ? entry.replace(/\.mustache$/, "") : entry;
    const destPath = join(destDir, destName);
    if (statSync(srcPath).isDirectory()) {
      await copyTemplateDir(srcPath, destPath, vars);
    } else {
      await processTemplate(srcPath, destPath, vars);
    }
  }
}
function writeJson(filePath, obj) {
  return writeFileSafe(filePath, JSON.stringify(obj, null, 2) + "\n");
}

// src/generators/root.ts
async function generateRoot(ctx, targetDir) {
  await generatePackageJson(ctx, targetDir);
  await generateVibeConfig(ctx, targetDir);
  await generateEnvExample(ctx, targetDir);
  await generateGitignore(targetDir);
}
function buildDevScript(ctx) {
  if (!ctx.hasWeb && !ctx.hasApi) return 'echo "No services configured"';
  if (ctx.hasWeb && !ctx.hasApi) return "npm run dev -w apps/web";
  if (!ctx.hasWeb && ctx.hasApi) return "npm run dev -w apps/api";
  const webCmd = "npm run dev -w apps/web";
  const apiCmd = "npm run dev -w apps/api";
  return `concurrently --names "web,api" --prefix-colors "cyan,yellow" --kill-others-on-fail "${webCmd}" "${apiCmd}"`;
}
function buildDeployScript(ctx) {
  return "tsx scripts/deploy.ts";
}
function buildRootDeps(ctx) {
  const deps = {};
  if (ctx.hasWeb && ctx.hasApi) deps["concurrently"] = "^9.0.0";
  if (ctx.answers.backend === "hono" || ctx.answers.backend === "none") {
    deps["tsx"] = "^4.0.0";
  }
  return deps;
}
async function generatePackageJson(ctx, targetDir) {
  const workspaces = [];
  if (ctx.hasWeb) workspaces.push("apps/web");
  if (ctx.hasApi) workspaces.push("apps/api");
  const pkg = {
    name: ctx.answers.projectName,
    version: "0.1.0",
    private: true,
    ...workspaces.length > 0 ? { workspaces } : {},
    scripts: {
      dev: buildDevScript(ctx),
      deploy: buildDeployScript(ctx),
      ...ctx.hasWeb ? { "dev:web": "npm run dev -w apps/web", "build:web": "npm run build -w apps/web" } : {},
      ...ctx.hasApi ? { "dev:api": "npm run dev -w apps/api", "build:api": "npm run build -w apps/api" } : {}
    },
    devDependencies: {
      tsx: "^4.0.0",
      ...buildRootDeps(ctx)
    }
  };
  await writeJson(join2(targetDir, "package.json"), pkg);
}
async function generateVibeConfig(ctx, targetDir) {
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
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    version: "0.1.0"
  };
  await writeJson(join2(targetDir, "vibe.config.json"), config);
}
async function generateEnvExample(ctx, targetDir) {
  if (ctx.envVars.length === 0) {
    await writeFileSafe(join2(targetDir, ".env.example"), "# No environment variables required\n");
    return;
  }
  let content = "# Environment Variables\n# Copy this file to .env and fill in the values\n\n";
  for (const v of ctx.envVars) {
    content += `# ${v.description}
${v.key}=${v.example}

`;
  }
  await writeFileSafe(join2(targetDir, ".env.example"), content);
  const envLocal = ctx.envVars.map((v) => `${v.key}=`).join("\n") + "\n";
  await writeFileSafe(join2(targetDir, ".env"), envLocal);
}
async function generateGitignore(targetDir) {
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
  await writeFileSafe(join2(targetDir, ".gitignore"), content);
}

// src/generators/web.ts
import { join as join3 } from "path";
import { fileURLToPath } from "url";
var TEMPLATES_DIR = fileURLToPath(new URL("../templates", import.meta.url));
async function generateWeb(ctx, targetDir) {
  const webDir = join3(targetDir, "apps", "web");
  const frontend = ctx.answers.frontend;
  if (frontend === "none") return;
  const templateDir = join3(TEMPLATES_DIR, "web", frontend);
  await copyTemplateDir(templateDir, webDir, ctx.flags);
  if (Object.keys(ctx.webDeps).length > 0) {
    const pkgPath = join3(webDir, "package.json");
    const { readFile: readFile2 } = await import("fs/promises");
    try {
      const raw = await readFile2(pkgPath, "utf8");
      const pkg = JSON.parse(raw);
      pkg.dependencies = { ...pkg.dependencies, ...ctx.webDeps };
      await writeJson(pkgPath, pkg);
    } catch {
    }
  }
}

// src/generators/api.ts
import { join as join4 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var TEMPLATES_DIR2 = fileURLToPath2(new URL("../templates", import.meta.url));
async function generateApi(ctx, targetDir) {
  const apiDir = join4(targetDir, "apps", "api");
  const backend = ctx.answers.backend;
  if (backend === "none") return;
  const templateDir = join4(TEMPLATES_DIR2, "api", backend);
  await copyTemplateDir(templateDir, apiDir, ctx.flags);
  if (backend === "hono" && Object.keys(ctx.apiDeps).length > 0) {
    const pkgPath = join4(apiDir, "package.json");
    const { readFile: readFile2 } = await import("fs/promises");
    try {
      const raw = await readFile2(pkgPath, "utf8");
      const pkg = JSON.parse(raw);
      pkg.dependencies = { ...pkg.dependencies, ...ctx.apiDeps };
      await writeJson(pkgPath, pkg);
    } catch {
    }
  }
}

// src/generators/ci.ts
import { join as join5 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var TEMPLATES_DIR3 = fileURLToPath3(new URL("../templates", import.meta.url));
async function generateCI(ctx, targetDir) {
  const src = join5(TEMPLATES_DIR3, "shared", "deploy.yml.mustache");
  const dest = join5(targetDir, ".github", "workflows", "deploy.yml");
  await processTemplate(src, dest, ctx.flags);
}
async function generateDeployScript(ctx, targetDir) {
  const src = join5(TEMPLATES_DIR3, "shared", "deploy.ts.mustache");
  const dest = join5(targetDir, "scripts", "deploy.ts");
  await processTemplate(src, dest, ctx.flags);
}
async function generateDocs(ctx, targetDir) {
  const shared = join5(TEMPLATES_DIR3, "shared");
  await processTemplate(join5(shared, "README.md.mustache"), join5(targetDir, "README.md"), ctx.flags);
  await processTemplate(join5(shared, "TROUBLESHOOTING.md.mustache"), join5(targetDir, "TROUBLESHOOTING.md"), ctx.flags);
  await processTemplate(join5(shared, "CLAUDE.md.mustache"), join5(targetDir, "CLAUDE.md"), ctx.flags);
}

// src/scaffold.ts
async function scaffold(answers, targetDir) {
  const s = p2.spinner();
  if (existsSync2(targetDir)) {
    p2.cancel(`Directory "${answers.projectName}" already exists.`);
    process.exit(1);
  }
  s.start("Scaffolding your project...");
  const ctx = buildContext(answers);
  await ensureDir(targetDir);
  await generateRoot(ctx, targetDir);
  if (ctx.hasWeb) await generateWeb(ctx, targetDir);
  if (ctx.hasApi) await generateApi(ctx, targetDir);
  await generateCI(ctx, targetDir);
  await generateDeployScript(ctx, targetDir);
  await generateDocs(ctx, targetDir);
  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    await promisify(execFile)("git", ["init"], { cwd: targetDir });
  } catch {
  }
  s.stop("Project scaffolded!");
  const steps = [
    `cd ${answers.projectName}`,
    "npm install",
    "cp .env.example .env  # fill in your values",
    "npm run dev"
  ];
  if (ctx.answers.apiDeploy === "cloud-run") {
    steps.push("", "# To deploy:");
    steps.push("# 1. gcloud auth login");
    steps.push("# 2. npm run deploy");
  } else if (ctx.answers.apiDeploy) {
    steps.push("", "# To deploy:");
    steps.push("npm run deploy");
  }
  p2.note(steps.join("\n"), "Next steps");
  p2.outro(`Happy shipping! Your stack: ${answers.frontend} + ${answers.backend !== "none" ? answers.backend : "no backend"}`);
}

// src/index.ts
async function main() {
  const answers = await collectAnswers();
  const targetDir = resolve(process.cwd(), answers.projectName);
  await scaffold(answers, targetDir);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
