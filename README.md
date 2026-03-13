<div id="top">
  <h1>C3 — Color Contrast Checker
   <img src="https://cdn.iconscout.com/icon/free/png-256/typescript-1174965.png" width="25" height="25" />
 </h1>

![Color Contrast Checker](https://github.com/Proskynete/color-contrast-checker/blob/main/public/images/color-contrast-checker.webp "C3 — Color Contrast Checker")

## Status

[![GitHub license](https://img.shields.io/github/license/Proskynete/color-contrast-checker?logo=Github)](https://github.com/Proskynete/color-contrast-checker) [![GitHub issues](https://img.shields.io/github/issues/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/issues) [![GitHub forks](https://img.shields.io/github/forks/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/network) [![GitHub stars](https://img.shields.io/github/stars/Proskynete/color-contrast-checker)](https://github.com/Proskynete/color-contrast-checker/stargazers) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-green)](#CONTRIBUTING.md)

<br />
<br />

<details>
  <summary>Table of contents</summary>
  <ol>
    <li><a href="#description">👀 Description</a></li>
    <li><a href="#features">✨ Features</a></li>
    <li>
      <a href="#setup">⚙️ Setup - local</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#technologies">Technologies</a></li>
        <li><a href="#env">Environment Variables</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#database">Database Migrations</a></li>
      </ul>
    </li>
    <li><a href="#structure">📁 Project Structure</a></li>
    <li><a href="#api">🔌 API Routes</a></li>
    <li><a href="#plans">💳 Plan Limits</a></li>
    <li><a href="#how-to-use">🚀 How to use</a></li>
  </ol>
</details>

<h2 id="description">👀 Description</h2>

C3 is a WCAG-compliant color contrast checker with AI-powered color suggestions, team collaboration, shareable check URLs, and freemium billing. Built with Astro SSR, React, Clerk, Neon Postgres, and Lemon Squeezy.

<div align="right"><a href="#top">🔝</a></div>

<h2 id="features">✨ Features</h2>

### Free (no account required)
- Instant contrast ratio calculation (text vs background)
- WCAG AA / AAA compliance for small text, large text, and UI components
- Live color preview with dummy text rendering
- Tools panel: palette harmony generator, color history, daltonism simulation, RGB/HSL display, palette export
- 7-day shareable check URLs

### Pro ($9/mo or $80/yr)
- Check history (365 days)
- Permanent shareable check URLs
- Saved personal color palettes (up to 10)
- Unlimited AI color correction suggestions (3/month on Free)
- AI palette generator — full 8-role accessible color system from a brand color

### Teams ($29/mo)
- Everything in Pro
- Team workspace with up to 5 members
- Shared brand palettes
- Bulk CSV contrast checker with paginated results and PDF export
- PDF audit report export from check history

<div align="right"><a href="#top">🔝</a></div>

<h2 id="setup">⚙️ Setup - local</h2>

<h3 id="prerequisites">Prerequisites</h3>

- [node.js](https://nodejs.org) ≥ 20 — [nvm](https://github.com/nvm-sh/nvm) recommended
- [npm](https://npmjs.com)
- [vscode](https://code.visualstudio.com/)
  - [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) (required)
  - [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) (required)
- [git](https://git-scm.com/)
- Accounts: [Clerk](https://clerk.com), [Neon](https://neon.tech), [Lemon Squeezy](https://lemonsqueezy.com), [OpenAI](https://platform.openai.com)

<h3 id="technologies">Technologies</h3>

| Layer | Technology |
|---|---|
| Framework | [Astro 5](https://astro.build) (SSR, `@astrojs/vercel`) |
| UI | [React 18](https://reactjs.org) + [Tailwind CSS](https://tailwindcss.com) |
| Auth | [Clerk](https://clerk.com) (Google/GitHub OAuth, magic link) |
| Database | [Neon](https://neon.tech) (Postgres, serverless HTTP driver) |
| Billing | [Lemon Squeezy](https://lemonsqueezy.com) |
| AI | [OpenAI GPT-4o-mini](https://platform.openai.com) |
| PDF | [jspdf](https://github.com/parallax/jsPDF) + jspdf-autotable |
| State | [nanostores](https://github.com/nanostores/nanostores) |
| Linting | [ESLint](https://eslint.org) + [Prettier](https://prettier.io) + [commitlint](https://commitlint.js.org) |
| Hooks | [Husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/okonet/lint-staged) |
| Deploy | [Vercel](https://vercel.com) |

<h3 id="env">Environment Variables</h3>

Create a `.env` file at the project root:

```env
# Clerk
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Neon
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID=...
LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID=...
LEMONSQUEEZY_TEAMS_MONTHLY_VARIANT_ID=...

# Cron (Vercel)
CRON_SECRET=...
```

<h3 id="installation">Installation</h3>

Clone the repository:

```bash
# with ssh
git clone git@github.com:Proskynete/color-contrast-checker.git
# with https
git clone https://github.com/Proskynete/color-contrast-checker.git
# with GitHub CLI
gh repo clone Proskynete/color-contrast-checker
```

Install dependencies and start the dev server:

```bash
cd color-contrast-checker
npm install
npm run dev
```

The app will be available at [localhost:4321](http://localhost:4321).

<h3 id="database">Database Migrations</h3>

```bash
npm run db:migrate
```

Migrations are located in `src/db/migrations/`. They must run in order:

| File | Description |
|---|---|
| `001_users.sql` | Users table |
| `002_teams.sql` | Teams and team_members tables |
| `003_checks.sql` | Contrast checks with share token |
| `004_palettes.sql` | Personal and team palettes |
| `005_ai_rate_limits.sql` | Per-user hourly AI rate limits |
| `007_users_lemonsqueezy.sql` | Lemon Squeezy customer/subscription IDs |

<div align="right"><a href="#top">🔝</a></div>

<h2 id="structure">📁 Project Structure</h2>

```
src/
├── db/               # Neon client + migrations
├── layouts/          # Astro layouts (landing, header, footer)
├── lib/              # Shared server utilities
├── pages/
│   ├── api/          # API endpoints
│   │   ├── ai-suggest.ts
│   │   ├── ai-palette.ts
│   │   ├── checks/
│   │   ├── clerk/
│   │   ├── cron/
│   │   ├── lemonsqueezy/
│   │   ├── palettes/
│   │   └── teams/
│   ├── sections/     # React island components
│   ├── share/        # Public share page /share/[token]
│   ├── pricing.astro
│   └── index.astro
├── store/            # nanostores (textStore, backgroundStore)
├── types/
└── utils/            # contrast.util.ts, color-convert.util.ts
```

<div align="right"><a href="#top">🔝</a></div>

<h2 id="api">🔌 API Routes</h2>

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/checks` | Required | Save a contrast check |
| `GET` | `/api/checks` | Required | Get check history |
| `GET` | `/api/checks/[token]` | None | Get shared check |
| `POST` | `/api/ai-suggest` | Required | AI color correction (up to 3 suggestions) |
| `POST` | `/api/ai-palette` | Required | AI full palette generation (8 roles) |
| `GET/POST` | `/api/palettes` | Required | List / save personal palette |
| `DELETE` | `/api/palettes/[id]` | Required | Delete personal palette |
| `GET/POST` | `/api/teams` | Required | Get / create team |
| `GET` | `/api/teams/[id]` | Member | Get team details + members |
| `POST` | `/api/teams/[id]/invite` | Owner | Invite member by email |
| `GET/POST` | `/api/teams/[id]/palettes` | Member/Owner | List / save team palette |
| `DELETE` | `/api/teams/[id]/palettes/[id]` | Owner | Delete team palette |
| `POST` | `/api/lemonsqueezy/checkout` | Required | Create checkout session |
| `GET` | `/api/lemonsqueezy/portal` | Required | Customer billing portal URL |
| `POST` | `/api/lemonsqueezy/webhook` | — | Handle Lemon Squeezy subscription events |
| `POST` | `/api/clerk/webhook` | — | Handle Clerk user.created events |
| `GET` | `/api/cron/cleanup-teams` | Cron secret | Hard-delete teams frozen 30+ days |

<div align="right"><a href="#top">🔝</a></div>

<h2 id="plans">💳 Plan Limits</h2>

| Feature | Free | Pro | Teams |
|---|---|---|---|
| Contrast checker | ✓ | ✓ | ✓ |
| Tools panel | ✓ | ✓ | ✓ |
| Shareable links | 7-day expiry | Permanent | Permanent |
| Check history | — | 365 days | 365 days |
| AI color suggestions | 3/month | Unlimited | Unlimited |
| AI palette generator | — | ✓ | ✓ |
| Saved palettes | — | Up to 10 | Unlimited |
| Team workspace | — | — | Up to 5 members |
| Shared brand palettes | — | — | ✓ |
| Bulk CSV checker | — | — | ✓ |
| PDF export | — | — | ✓ |

<div align="right"><a href="#top">🔝</a></div>

<h2 id="how-to-use">🚀 How to use</h2>

1. Go to [c3.eduardoalvarez.dev](https://c3.eduardoalvarez.dev)
2. Enter a text color and a background color (hex, RGB, or HSL)
3. The app instantly shows the contrast ratio and WCAG compliance level
4. Use **"Suggest with AI"** if the ratio fails — get up to 3 accessible color alternatives
5. Sign in (Google / GitHub / magic link) to save checks, create shareable links, and manage palettes
6. Upgrade to **Pro** for unlimited history and AI usage, or **Teams** for bulk checking and PDF reports

<div align="right"><a href="#top">🔝</a></div>
