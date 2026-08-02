# CLAUDE.md — Mastery OS Developer Cheatsheet

## 🛠️ Essential Commands

### Development Server
```bash
npm run dev           # Start Next.js development server
```

### Production Build & Linting
```bash
npm run build         # Build production Next.js app
npm run lint          # Run ESLint validation
```

### Seeding & Parsing Data
```bash
npx tsx scripts/generate-quotes.ts    # Seed quote corpus (min 2,000 quotes)
npx tsx scripts/parse-roadmaps.ts     # Reparse all markdown roadmaps to JSON
```

---

## 🎨 Coding Conventions & Architecture

### Tech Stack & State
- **Framework**: Next.js 16 App Router (React 19).
- **Styling**: Tailwind CSS & shadcn/ui. Always build rich glassmorphism dark-mode aesthetics.
- **State**: Zustand for global auth and active roadmap states.
- **Charts**: Recharts for graphs, React Flow for the Interactive Knowledge Graph.

### Data Layer Rules (No DBs & No external AI/LLMs)
- **JSON Storage**: All files read/written via `lib/storage/writeJson.ts`. Never use database client libs.
- **Pathing**:
  - Roadmap definitions → `/data/roadmaps/<id>.json`
  - User progress & logs → `/data/users/<userId>/`
- **Stable IDs**: Ensure parser utilizes `sha1(roadmapId + phaseTitle + weekTitle + rawLineText).slice(0, 10)` for node IDs.
- **AI/Weekly Reports**: Computed 100% programmatically and locally. NO external API keys or Anthropic integrations.

### Visuals & Motion
- **Glow & Glass**: Layered blurs, 1px white border highlight, outer glows on hover.
- **Accent Theme**: Dynamic HSL derivation from `lib/theme/deriveAccentPalette.ts`.
- **Motion**: Timings and curves are in `lib/motion/easings.ts`. Wrap animations in `useMotionSafe()` hook.

### Auth Gate & Security
- **Console login**: Authenticates via `window.getAccess(userId)` which registers a secure SHA-256 signed HMAC session cookie `mastery_session`.
- **Path Traversal Shield**: Paths are strictly constructed after checking `userId` against `'swayam'`.
