# Next.js + NestJS — 8 Week Manual Coding Roadmap

**Goal:** Go from "reads AI-generated code well" to "writes it from scratch without AI."
**Time:** 30-45 min/day. **Rule:** No AI, no copy-paste, no docs-open-first during practice. Try from blank file, then check yourself.

---

## Week 1 — JS Fundamentals You've Been Outsourcing

- **Day 1:** Array methods — write `map`, `filter`, `reduce` from scratch on a sample array (no built-ins allowed, then compare to real ones)
- **Day 2:** Destructuring + spread/rest — rewrite 5 functions using destructured params
- **Day 3:** Promises vs async/await — write a function that fetches data 3 different ways (callback, .then, async/await)
- **Day 4:** Closures — write a counter factory function and explain out loud why it works
- **Day 5:** `this`, arrow functions vs regular functions — write 3 examples showing the difference
- **Day 6:** Review — redo Day 1 and Day 3 from memory, no peeking
- **Day 7:** Rest / light review of anything shaky

## Week 2 — React Core

- **Day 8:** `useState` — build a counter + a toggle component from a blank file
- **Day 9:** `useEffect` — build a component that fetches data on mount, handle loading/error states
- **Day 10:** Props vs state — build a parent component passing data + a callback to a child
- **Day 11:** Lists and keys — build a todo list (add/remove items) from scratch
- **Day 12:** Forms — build a controlled form with 3 inputs and validation on submit
- **Day 13:** Component composition — refactor Day 11's todo list into 3 smaller components
- **Day 14:** Rebuild the todo list entirely from memory, timed — no reference

## Week 3 — Next.js Fundamentals (App Router)

- **Day 15:** File-based routing — create `app/about/page.tsx`, `app/blog/page.tsx` manually
- **Day 16:** Dynamic routes — build `app/blog/[slug]/page.tsx`, log the param
- **Day 17:** Layouts — create a shared `layout.tsx` with a nav bar across routes
- **Day 18:** Server vs Client Components — write one of each, explain why each needs (or doesn't need) `"use client"`
- **Day 19:** Data fetching in Server Components — fetch a public API directly in a page component
- **Day 20:** Loading and error states — add `loading.tsx` and `error.tsx` to a route
- **Day 21:** Review — rebuild Day 16 + Day 19 from a blank folder

## Week 4 — Next.js Data & Routes

- **Day 22:** Route handlers — create `app/api/notes/route.ts` with a GET handler returning mock data
- **Day 23:** POST handler — accept a body, validate it, return a response
- **Day 24:** Dynamic API routes — `app/api/notes/[id]/route.ts` with GET/DELETE
- **Day 25:** Connect a page to your own API route (fetch from `app/api/notes` in a Server Component)
- **Day 26:** Client-side interactivity — add a delete button that calls your DELETE route
- **Day 27:** Environment variables + `.env.local` — use one in a route handler
- **Day 28:** Build a tiny "notes" app end-to-end from scratch (list + add + delete), no notes open

## Week 5 — NestJS Core

- **Day 29:** Install Nest CLI, generate a project, understand the folder structure by hand-tracing `main.ts` → `AppModule`
- **Day 30:** Modules — create a `NotesModule` manually (not via CLI generator)
- **Day 31:** Controllers — write a `NotesController` with a GET endpoint
- **Day 32:** Providers/Services — move logic into a `NotesService`, inject it into the controller
- **Day 33:** Explain Dependency Injection out loud/in writing — why does Nest need `@Injectable()`?
- **Day 34:** POST endpoint — add a `create` method to service + controller
- **Day 35:** Review — rebuild the whole Notes module (module/controller/service) from blank files

## Week 6 — NestJS + Database

- **Day 36:** DTOs — create `CreateNoteDto` with `class-validator` decorators
- **Day 37:** Enable validation pipe globally, test that bad input gets rejected
- **Day 38:** Install Prisma (or TypeORM), set up a `Note` model, run a migration
- **Day 39:** Wire `NotesService` to the database for GET (read all)
- **Day 40:** Wire POST (create) to the database
- **Day 41:** Add PATCH and DELETE endpoints backed by the DB
- **Day 42:** Rebuild the full CRUD resource from scratch, timed, no reference

## Week 7 — Integration

- **Day 43:** Point your Next.js app's fetch calls at your NestJS API (CORS setup)
- **Day 44:** Basic auth — add a simple login endpoint in Nest (email/password, no JWT yet)
- **Day 45:** JWT — issue a token on login, write the auth service logic by hand
- **Day 46:** Protect a route with an auth guard — write the guard yourself
- **Day 47:** Frontend — store token, attach it to authenticated fetch requests
- **Day 48:** Protected page — redirect unauthenticated users on the frontend
- **Day 49:** Review the full auth flow end-to-end, explain each step without notes

## Week 8 — Solo Build (No AI, No Reference)

- **Day 50:** Plan a small full-stack app (e.g., task tracker) — routes, data model, pages, on paper
- **Day 51:** Build NestJS backend: module + controller + service skeleton
- **Day 52:** Backend: DB model + CRUD endpoints
- **Day 53:** Backend: auth (login + protected routes)
- **Day 54:** Frontend: pages + routing in Next.js
- **Day 55:** Frontend: connect to backend, forms, list views
- **Day 56:** Polish, fix bugs, and do a final self-check — could you rebuild this whole thing again from nothing?

---

## Rules for every session
1. Start from a blank file — don't open a template or reference first.
2. Try for the full 30-45 min before looking anything up.
3. Only after attempting, compare against docs or what AI would write — note the gap.
4. If a day's concept doesn't stick, repeat it before moving on rather than pushing forward on schedule.
