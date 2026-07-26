# Mastery OS 🌌

> **Version 2.0** — Personal Upskilling & Gamified Progress Operating System.
> Designed for autonomous build agents and disciplined developer journeys.

Mastery OS is a personal, portfolio-ready, gamified tracking workspace designed to monitor long-form upskilling across multiple independent roadmaps simultaneously. Built on top of **Next.js 16 (App Router)** and styled with premium, responsive glassmorphism themes, it turns your personal roadmap progression into a visually stunning git contribution graph and interactive dashboard.

---

## 🚀 Architectural Blueprint (Git-Backed Flat JSON)

To deploy cleanly on Vercel's hobby tier without paying for or configuring databases, Mastery OS uses a **pure, database-free flat-JSON persistence engine**. 

* **Reads**: Performed directly from local `/data/*.json` files bundled at build time or fetched locally.
* **Writes**: Multi-environment storage adapter:
  * **Development (`NODE_ENV=development`)**: Reads/writes directly to local disk using `fs`.
  * **Production (`NODE_ENV=production`)**: Commits updated JSON files back to the GitHub repository using the **GitHub REST API (Contents API)** via a fine-grained Personal Access Token (`GITHUB_TOKEN`).
  * **Write-through Caching**: A 3–5 second in-memory and ephemeral `/tmp` cache prevents redundant commits on rapid updates.

Every step you complete on your roadmap translates directly into a real Git commit, adding layers of gamification and visualizing discipline on your GitHub contribution graph.

---

## ✨ Core Features

### 1. Multi-Roadmap Parser
Drop any Markdown roadmap (like `Swayam_6Month_Mastery_Roadmap.md` or `web-dev-roadmap.md`) into `/data/roadmap-sources/` and trigger the parser.
* **Stable ID Generation**: Auto-hashes nodes: `node.id = "node-" + sha1(roadmapId + phaseTitle + weekTitle + rawLineText).slice(0, 10)`.
* Edits or additions preserve historical progress for unchanged lines. Renamed/deleted tasks have progress archived safely into `progress.json.archived[]` instead of being deleted.

### 2. Premium Visuals & Motion System
* **AAA Video Game Aesthetic**: Bento-grid layout, dark-mode-first styling with near-black backgrounds (`#08090c`), elevated panel layers (`#101319`), and glassmorphism depth cues (layered blur, 1px inner border highlight, soft outer glow on hover).
* **Dynamic Palette**: The accent system is programmatically derived from a user's selected primary hue using HSL calculations (`lib/theme/deriveAccentPalette.ts`).
* **Motion & Easing**: Choreographed entrances and micro-interactions utilizing custom transitions from `lib/motion/easings.ts` (e.g. `easeOutExpo`, `easeInOutCubic`).
* **Accessibility**: Fully optimized animations that dynamically downgrade to opacity crossfades or instant state changes under `prefers-reduced-motion` using the global `useMotionSafe()` hook.

### 3. Access Control Gate & Hardened Security
* **Access Denied Screen**: First-load unmounted dashboard DOM with zero visual login forms.
* **Developer Console Login**: Access is granted only by running developer console hooks:
  ```javascript
  window.getAccess('swayam') // Authenticates as Swayam
  window.getAccess('jalisa') // Authenticates as Jalisa
  ```
* **Security Hardening**: Session cookie signed (SHA-256 HMAC utilizing `SESSION_SECRET`), `httpOnly`, `secure`, and `sameSite=lax`. Private API routes resolve user context *only* from verified tokens (no query parameters), and directory path resolution is protected via a strict user ID whitelist to prevent path traversal exploits.

### 4. Interactive Dashboard & Gamification
* Large central progress ring featuring animated count-ups and gradient strokes.
* Daily deterministic quotes typing out letter-by-letter, configured to never repeat until the quote pool is exhausted.
* **Trophy Catalog**: Steam-like achievements featuring tiered rarities (`common`, `rare`, `epic`, `legendary`). Legendary badges are styled with subtle animated shimmer sweeps. Users can drag and pin up to 6 badges to their profile showcase.

### 5. Programmatic Analytics & Local Insights
* Heatmaps, radar charts, velocity graphs, and completion forecasting (calculated using local linear regression).
* **Pearson Correlation Engine**: Programmatically computes relationships between variables (mood, sleep, productivity, energy) locally (`lib/insights/correlations.ts`).
* **Programmatic Weekly Reports**: Fully local, data-backed reports compiled from tracked metrics—**no external LLM/AI APIs are used**, protecting user privacy and preventing text hallucination.

### 6. Embeddable Widgets & Flex API
Includes public-facing routes (`/api/public/...` and `/api/flex/...`) designed for portfolio pages and GitHub profile READMEs:
* Showcase badge strips, single achievement SVGs/PNGs, Notion-ready `<iframe>` templates, and game-style stat cards (`card.png`) generated using `@vercel/og` (Satori on Edge Runtime).
* Controlled via user settings (`settings.publicProfile: boolean`) and CORS policies (open for Flex widgets, restricted to same-origin for app APIs).

---

## 🛠️ Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Language**: TypeScript
* **State Management**: Zustand
* **Styling & UI**: TailwindCSS + Shadcn/ui + Framer Motion
* **Visualizations**: Recharts + React Flow
* **Edge OG Generation**: `@vercel/og` (Satori)
* **API Client**: Octokit (GitHub REST API integration)

---

## 📂 Project Structure

```
├── app/
│   ├── (gate)/                # Access Denied page + quote animation
│   ├── (app)/                 # Authenticated application workspace
│   │   ├── dashboard/
│   │   ├── journey/           # Gamification (levels, achievements, trophy catalog)
│   │   ├── daily-review/      # Journaling and Pearson correlations
│   │   ├── retrospective/     # Weekly reflections
│   │   ├── analytics/         # Recharts suite
│   │   ├── graph/             # React Flow knowledge graph
│   │   └── settings/
│   └── api/
│       ├── auth/session       # Console login handler
│       ├── admin/reparse      # Reparses markdown roadmaps
│       ├── public/[userId]/   # README badges & widget APIs
│       └── flex/[userId]/     # Pinned badges, share widgets, stat cards
├── components/                # Shared layout & UI components
├── lib/
│   ├── storage/               # Multi-env Git-backed JSON storage engine
│   ├── parser/                # Markdown-to-Roadmap AST parser
│   ├── scoring/               # Gamification & XP algorithms
│   ├── insights/              # Pearson correlation & pace forecasting engine
│   └── motion/                # Motion easing, duration tokens, accessibility hooks
├── data/                      # Global & user-specific flat JSON databases
└── scripts/                   # Seeding and background parsing scripts
```

---

## 💻 Setup and Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd mastery-os
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
# GitHub token with repository write permissions (for production writes)
GITHUB_TOKEN=your_github_pat

# Secret for signing session cookies
SESSION_SECRET=a_secure_long_random_string
```

### 4. Seed quotes and parse roadmaps
Run the seeding and parsing scripts to populate the `/data` directory:
```bash
npm run seed:quotes
npm run parse:roadmaps
```

### 5. Run the development server
```bash
npm run dev
```

---

## 🔑 Development Authentication
Once the server starts:
1. Open [http://localhost:3000](http://localhost:3000). You will see the **Access Denied** gate.
2. Open your browser console (`F12` or `Ctrl+Shift+I`).
3. Type and execute: `window.getAccess('swayam')`
4. The dashboard will automatically unlock and refresh.
