# create-vibe-stack

Scaffold a production-ready full-stack project in under a minute. Answer a few questions — get a working project with `npm run dev` and `npm run deploy` already configured.

```bash
npx create-vibe-stack
```

---

## What it does

Asks you 13 questions about what your project needs, then generates:

- A complete project folder with `apps/web/` and/or `apps/api/`
- All imports, boilerplate, and config wired for your chosen stack
- `.env.example` with every required environment variable documented
- GitHub Actions CI/CD workflow
- `npm run dev` — runs everything locally with one command
- `npm run deploy` — builds and deploys to your chosen platforms

---

## Quick start

```bash
npx create-vibe-stack
cd my-app
npm install
cp .env.example .env   # fill in your values
npm run dev
```

---

## Options

### Frontend
| Option | Description |
|--------|-------------|
| `react-vite` | React 18 + Vite — fast HMR, TypeScript, auto-proxies `/api` to backend |
| `nextjs` | Next.js 15 — SSR, app router, great for SEO-heavy or full-stack apps |
| `static-html` | Plain HTML/CSS/JS, no framework |
| `none` | No frontend — API only |

### Backend
| Option | Description |
|--------|-------------|
| `hono` | Node.js + Hono — lightweight, TypeScript, fast. CORS + logger pre-configured |
| `fastapi` | Python + FastAPI — async, great for AI/ML workloads |
| `go` | Go standard library — high performance, minimal dependencies |
| `none` | No backend — frontend only |

### Database
| Option | Free Tier | Notes |
|--------|-----------|-------|
| `neon` | Yes | Serverless PostgreSQL. Best for relational data |
| `firestore` | Yes | Google NoSQL. Best for document data, real-time |
| `upstash-redis` | Yes | Serverless Redis. Best for caching, sessions, queues |
| `none` | — | No database |

### Auth
| Option | Free Tier | Notes |
|--------|-----------|-------|
| `clerk` | Yes | Easiest setup. Pre-built UI components. 10k MAU free |
| `firebase-auth` | Yes | Google. Email, Google, GitHub login. Generous free tier |
| `supabase-auth` | Yes | Open source. Works great with Supabase DB |
| `none` | — | No auth |

### Storage
| Option | Free Tier | Notes |
|--------|-----------|-------|
| `r2` | Yes | Cloudflare R2. S3-compatible, zero egress fees |
| `firebase-storage` | Yes | Firebase. Simple SDK, integrates with Firebase Auth |
| `none` | — | No file storage |

### Background Jobs
| Option | Notes |
|--------|-------|
| `cloud-scheduler` | GCP Cloud Scheduler triggers Cloud Run — cron jobs |
| `bullmq-upstash` | BullMQ job queues backed by Upstash Redis — free tier |
| `none` | No background jobs |

### Real-time
| Option | Notes |
|--------|-------|
| `websockets` | Socket.io on your backend (Cloud Run / Render / Fly.io) |
| `supabase-realtime` | Managed real-time subscriptions — free tier |
| `none` | No real-time |

### AI
| Option | Notes |
|--------|-------|
| `llm-api` | Anthropic Claude SDK wired. POST `/api/chat` ready to use |
| `vector-rag` | Claude + Pinecone — embeddings, vector search, RAG pipeline |
| `none` | No AI |

### Email
| Option | Free Tier | Notes |
|--------|-----------|-------|
| `resend` | Yes | 3,000 emails/month free. Best developer experience |
| `none` | — | No email |

### Payments
| Option | Notes |
|--------|-------|
| `stripe` | Checkout session + webhook handler pre-configured |
| `none` | No payments |

### Frontend Deploy
| Option | Free Tier | Notes |
|--------|-----------|-------|
| `cloudflare-pages` | Yes | Global edge, unlimited bandwidth, fast deploys |
| `vercel` | Yes | Best for Next.js, great DX |
| `firebase-hosting` | Yes | Google CDN, good if already using Firebase |
| `netlify` | Yes | Simple, good free tier |

### Backend Deploy
| Option | Notes |
|--------|-------|
| `cloud-run` | Google Cloud Run — scales to zero, pay per request, no idle cost |
| `render` | Simple setup, free tier (service sleeps after 15min inactivity) |
| `flyio` | Fly.io — global, 3 shared VMs free, does not sleep |

---

## Generated project structure

```
my-app/
├── apps/
│   ├── web/                  # Frontend (if selected)
│   │   ├── src/
│   │   │   ├── App.tsx       # Auth provider + routes wired
│   │   │   └── main.tsx
│   │   ├── vite.config.ts    # /api proxy to localhost:8080
│   │   └── package.json
│   └── api/                  # Backend (if selected)
│       ├── src/index.ts      # Routes for all selected services
│       ├── Dockerfile        # Production-ready multi-stage build
│       └── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD for your chosen deploy targets
├── scripts/
│   └── deploy.ts             # npm run deploy logic
├── .env.example              # All env vars with descriptions and examples
├── .env                      # Pre-created, fill in your values
├── .gitignore
├── vibe.config.json          # Your stack choices (machine-readable)
└── package.json              # Root: workspaces + dev/deploy scripts
```

---

## Scripts reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Starts all services locally (web on :3000, api on :8080) |
| `npm run dev:web` | Frontend only |
| `npm run dev:api` | Backend only |
| `npm run build:web` | Build frontend for production |
| `npm run deploy` | Build + deploy everything to configured platforms |

---

## Prerequisites by backend

### Hono (Node.js)
- Node.js 20+
- No extra setup

### FastAPI (Python)
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Go
```bash
# Install Go: https://go.dev/dl/
# Install air (live reload):
go install github.com/air-verse/air@latest
cd apps/api && go mod download
```

---

## Prerequisites by deployment target

### Cloudflare Pages
```bash
npm install -g wrangler
wrangler login
```

### Vercel
```bash
npm install -g vercel
vercel login
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select your project
```

### Netlify
```bash
npm install -g netlify-cli
netlify login
```

### Google Cloud Run
```bash
# Install: https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Render
Connect your GitHub repo at https://dashboard.render.com — deploys automatically on push to `main`.

### Fly.io
```bash
# Install: https://fly.io/docs/flyctl/install/
fly auth login
fly launch   # from apps/api directory
```

---

## Environment variables

After running `create-vibe-stack`, copy `.env.example` to `.env` and fill in the values.

Each variable has a description and example value in `.env.example`. The variables present depend on which services you selected.

**Never commit `.env` to git.** It is already in `.gitignore`.

For deployments, add secrets to:
- **Cloudflare Pages**: Dashboard → Settings → Environment Variables
- **Vercel**: Dashboard → Settings → Environment Variables
- **Firebase Hosting**: Uses `firebase.json`, secrets via Cloud Secret Manager
- **Google Cloud Run**: `gcloud run services update SERVICE --set-env-vars KEY=VALUE`
- **Render**: Dashboard → Environment
- **Fly.io**: `fly secrets set KEY=VALUE`
- **GitHub Actions**: Repository → Settings → Secrets and Variables → Actions

---

## vibe.config.json

Every generated project contains a `vibe.config.json` that records your choices:

```json
{
  "projectName": "my-app",
  "frontend": "react-vite",
  "backend": "hono",
  "database": "neon",
  "auth": "clerk",
  "webDeploy": "cloudflare-pages",
  "apiDeploy": "cloud-run",
  "createdAt": "2026-03-13T00:00:00.000Z",
  "version": "0.1.0"
}
```

The `npm run deploy` script reads this file to know where to deploy.

---

## Contributing

```bash
git clone https://github.com/your-org/create-vibe-stack
cd create-vibe-stack
npm install
npm run dev        # watch mode
node dist/index.js # test the CLI
```

Templates are in `templates/`. Files ending in `.mustache` are rendered with [Mustache](https://mustache.github.io/) using flags from `src/context.ts`. All other files are copied verbatim.

To add a new integration:
1. Add the type to `src/types.ts`
2. Add env vars to `ENV_VAR_MAP` in `src/context.ts`
3. Add deps to the dep maps in `src/context.ts`
4. Add the flag to `TemplateFlags` in `src/types.ts` and `buildContext()` in `src/context.ts`
5. Add the prompt option in `src/prompts.ts`
6. Add `{{#hasYourFlag}}` sections to relevant templates
