Onboardr — Repository setup and deployment guide

Overview

This repository contains a full-stack onboarding app using Vite + React (client/), a Node server (server/), Supabase, and Netlify Functions (netlify/functions/). Follow the step-by-step instructions below to create a GitHub repo, set up your local environment, run the app, and deploy.

1) Create the GitHub repository

1. Create a new repository on GitHub (private or public) named e.g. "onboardr".
2. On your machine, add the remote and push the code:

   git init
   git remote add origin git@github.com:<your-org-or-username>/onboardr.git
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main

3. Set branch protection rules (optional): protect main, require PR reviews, enable required status checks.

2) Branching & workflow recommendations

- Use feature branches: feature/xxx or fix/xxx.
- Create pull requests targeting main. Merge via PR after review and passing CI.
- Use GitHub Actions (or your preferred CI) for tests and linting.

3) Local setup

Prerequisites:
- Node.js LTS (>=16), npm or pnpm
- Git
- Optional: Docker (if you prefer containerized runtime)

Install dependencies (top-level package.json):

   npm install

Environment variables

Copy the example env file and fill required values:

   cp .env.example .env

Important files and values:
- .env — runtime env for server & build
- .env.example — template provided (already created)
- database/supabase-schema.sql — SQL schema for Supabase
- scripts/create-admin-user.js — helper to seed an admin user

Note: The project already references Supabase. The repository also includes server/lib/supabase.ts and client/lib/supabase.ts which expect SUPABASE-related env vars. Fill these in .env from your Supabase project dashboard.

Run the app locally

This repository contains both the client and the server. Typical commands you can run from the repository root:

- Start the dev server (Vite) + local server (if provided by scripts):

   npm run dev

- Build for production:

   npm run build

- Start the production server (after build):

   npm run start

If the project uses separate scripts for server and client, you may have to run them concurrently. Check package.json scripts for exact commands.

4) Database (Supabase) setup

1. Create a Supabase project at https://app.supabase.com (you may already have Supabase connected as an MCP in this environment).
2. Create the required tables by running the SQL schema located at:

   database/supabase-schema.sql

   (Use the SQL editor in the Supabase dashboard or run psql against your database.)

3. Add the credentials to .env. Typical env names used by this repo:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

4. Seed an admin user (optional):

   node scripts/create-admin-user.js

5) Netlify Functions

The repo includes serverless functions under netlify/functions/ (netlify/functions/api.ts). If you are serving with Netlify:

- Netlify will build the project and detect functions automatically if configured in netlify.toml.
- If you deploy elsewhere, ensure those endpoints are served by your chosen platform.

6) CI / GitHub Actions (recommended)

Create a .github/workflows/ci.yml to run:
- npm ci
- npm run build
- npm test (if tests exist)
- lint steps

This ensures PRs are validated before merge.

7) Deploying to production (Netlify or Vercel via MCP)

This project supports deployment with Netlify or Vercel. The repository contains netlify.toml and Netlify Functions — Netlify is a first-class option.

If you want to deploy via the Builder.io MCP integrations:

- Step 1: Connect Netlify: Click [Connect to Netlify](#open-mcp-popover) and follow the UI to link your Netlify account. If Netlify MCP tools are not available, connect using the Netlify dashboard and point to this GitHub repo.

- Step 2: Configure build command and publish directory in Netlify
  - Build command: npm run build
  - Publish directory: dist (or check package.json / vite.config.ts to confirm)
  - Ensure environment variables from .env are added to Netlify site settings (VITE_SUPABASE_* and any server-side keys as Netlify ENV variables).

- Step 3: Deploy
  - Use the Netlify dashboard or MCP deployment tool to trigger a deployment. Netlify will run the build, produce the client assets, and publish your site.

For Vercel deployments:
- Step 1: Click [Connect to Vercel](#open-mcp-popover) and connect the repository.
- Step 2: Configure build (npm run build) and ensure env vars are set in Vercel.
- Step 3: Deploy — Vercel will build and publish automatically.

If the MCP tools for Netlify or Vercel are not available in your Builder environment, open the Netlify or Vercel dashboard and connect the repository manually.

8) Available MCP integrations and when to use them

This environment supports external MCP integrations. The following MCP servers are available and useful for typical tasks — you can open the MCP popover and connect them as needed:

• Neon — serverless Postgres; useful for advanced DB or auth integration. Connect if you prefer Neon over Supabase.
• Netlify — deployment, hosting, functions. Perfect for this repo (contains netlify.toml & functions).
• Zapier — automation and workflow integrations.
• Figma — convert design to code using the Builder.io Figma plugin (Get Plugin at the MCP Servers section: https://www.figma.com/community/plugin/747985167520967365/builder-io-ai-powered-figma-to-code-react-vue-tailwind-more).
• Builder CMS (Builder.io) — content & page management for marketing pages or in-app content.
• Linear — project management and issue tracking.
• Notion — documentation and knowledge base sync.
• Sentry — error monitoring and performance tracking.
• Context7 — inline documentation & API references for developer docs.
• Semgrep — static application security testing and vulnerability scanning.
• Prisma Postgres — ORM + Postgres management if you choose Prisma for DB.

Note: Supabase is already connected in this environment and is the preferred DB option for this repo. To connect any MCP server, click [Open MCP popover](#open-mcp-popover) and select the integration you need.

9) Theming and color palette (reference images included)

Design assets are attached in the project summary. To apply the provided color palette across the app, update client/global.css and Tailwind configuration (tailwind.config.ts). Recommended strategy:

- Primary: dark bold purple — use for primary buttons and active nav items.
- Secondary: softer purple/lavender — use for secondary buttons and headers.
- Accent: light green — success states and completion indicators.
- Background: very light neutral with slight lavender tint — page backgrounds.
- Cards: slightly darker shade than background, with rounded corners and soft shadows.
- Text: use near-black for legibility; use primary purple for links.

Files to edit:
- client/global.css
- tailwind.config.ts

10) Common tasks & troubleshooting

- Missing env or build errors: confirm .env values, run npm run build locally to catch errors.
- Database issues: verify Supabase project and keys, re-run database/supabase-schema.sql.
- Server functions (Netlify): check netlify/functions/ logs in Netlify dashboard if endpoints fail.

11) Useful file locations

- client/ — React app and UI components
  - client/pages/Tasks.tsx — tasks view & Kanban implementation
  - client/components/navigation/DesktopNav.tsx — navigation UI
  - client/components/layout/Layout.tsx — layout wrapper
  - client/components/ui/button.tsx — base button
  - client/lib/supabase.ts — client-side Supabase helper

- server/ — API server & routes
  - server/index.ts
  - server/routes/*.ts
  - server/lib/supabase.ts

- netlify/functions/ — serverless functions for Netlify
- database/supabase-schema.sql — DB schema
- scripts/create-admin-user.js — seeds

12) Security and keys

- Never commit production keys or the SUPABASE_SERVICE_ROLE_KEY to GitHub. Use environment secrets in your hosting provider (Netlify/Vercel) or CI.
- Use the .env.example to show which variables are required but do not populate secrets.

13) Pull requests and code review

- Use descriptive PR titles and reference issues.
- Run local linting and unit tests before opening a PR.

14) Additional recommendations

- Add GitHub Actions for CI and Dependabot for dependency updates.
- Add a basic issue template and PR template to the repository for consistency.
- Break large UI files into smaller components (client/components/) as the project grows; follow patterns already in the codebase.

If you'd like, I can:
- Add a starter GitHub Actions workflow file (.github/workflows/ci.yml).
- Add a sample netlify deploy settings file or Vercel configuration.
- Update client/global.css and tailwind.config.ts to implement the color palette from the attached images.

Done: README.md updated with step-by-step GitHub repo setup and deployment guide.
#   r e a c t - v i t e  
 