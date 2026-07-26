<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mastery OS — Agent Core Rules & Development Guidelines

You are an autonomous coding assistant developing and maintaining **Mastery OS**. You must adhere to the following architectural guidelines, rules, and restrictions.

---

## 💾 Rule 1: No Databases (SQL/NoSQL/ORM) or External AI/LLM APIs
* **Rule**: You are strictly forbidden from adding databases (Supabase, Prisma, PostgreSQL, MongoDB, etc.), ORM libraries, or external LLM APIs (Anthropic, OpenAI, etc.).
* **Mechanism**:
  * Use the unified JSON read/write abstraction layer defined under `lib/storage/writeJson.ts`.
  * Weekly summaries, reports, insights, sleep-mood-productivity correlations, and pace predictions (linear regression) must be computed programmatically using local JS/TS algorithms in `lib/insights/` and `lib/ai/`. No network LLM calls.
* **Behavior**:
  * In `development`: Perform local filesystem writes to `/data/...`.
  * In `production` (Vercel): Commit files back to the GitHub repository via the GitHub REST API (Contents API).

## 🔒 Rule 2: Access Control Gate & Data Isolation Mechanics
* **Rule**: Do not add standard visible input login forms, passwords, or OAuth integrations.
* **Mechanism**:
  * The user interface must present an "Access Denied" shield (unmounted real dashboard components) until authenticated.
  * Authentication is performed strictly via the browser developer console by calling `window.getAccess('swayam')` or `window.getAccess('jalisa')`.
  * The gate provider client-side must trigger a POST request to `/api/auth/session` to issue a signed secure cookie (`mastery_session`) signed with SHA-256 HMAC utilizing `SESSION_SECRET`.
  * Middleware (`middleware.ts`) must enforce auth for `/(app)` and `/api/**` (except `/api/auth/session` and public endpoints).
  * Private endpoints must derive user context *only* from the session cookie, never URL or request parameters.
  * File paths in `lib/storage/` must validate `userId` against the enum `['swayam', 'jalisa']` before constructing any paths.

## 📊 Rule 3: Roadmap Parser Integrity & Stable IDs
* **Rule**: Replacing or updating `.md` source roadmaps in `/data/roadmap-sources/` must be idempotent and must never orphan or duplicate user progress.
* **Mechanism**:
  * Calculate stable hashes for each roadmap node using the formula: `node.id = "node-" + sha1(roadmapId + phaseTitle + weekTitle + rawLineText).slice(0,10)`.
  * Diffs node IDs against existing user `progress.json` files and archives old progress in `progress.json.archived[]`. Never auto-delete user data.

## 🎨 Rule 4: Visual Language & Depth
* **Rule**: Custom skin everything. Avoid default unstyled shadcn layouts. 
* **Mechanism**:
  * Use layered glassmorphism with layered blurs, a 1px inner border highlight (low-opacity white/accent), and soft outer glows on hover.
  - Base background: near-black (`#08090c` / `#0b0d12`), panels on `#101319` with glass overlay.
  - Dynamic HSL accent derivation (`lib/theme/deriveAccentPalette.ts`) based on user choice.
  - Custom track colors (`lib/theme/trackPalette.ts`) and icons (`lib/theme/trackIcons.ts`) hashed from names.
  - Monospace/Grotesk tabular figures for numbers to prevent width jitter during counters.

## 🏃 Rule 5: Motion & Easing Language
* **Rule**: Standardize animation speed/easing and support accessibility overrides globally.
* **Mechanism**:
  - Timings and custom curves must reside in `lib/motion/easings.ts` (e.g. `easeOutExpo`, `easeInOutCubic`).
  - Use `useMotionSafe()` hook globally to check `prefers-reduced-motion` and replace movements with simple fades or instant jumps.
  - Restrict custom layout animations and only animate `transform` and `opacity` for GPU acceleration.

## 📈 Rule 6: SVG, OG & Flex API Performance
* **Rule**: All badges, calendars, and embeddable widgets must render efficiently without running resource-heavy operations like puppeteer on Vercel.
* **Mechanism**:
  * Badges and calendars (`/api/public/...` and `/api/flex/...`) must return raw SVG templates constructed via string manipulation.
  * Interactive widgets/PNG captures requiring raster graphics must use `@vercel/og` (Satori) running under the Edge Runtime.
  * Respect public profile visibility toggles (`settings.publicProfile: boolean`) and CORS policies (open for public/flex APIs, strictly same-origin for app APIs).
