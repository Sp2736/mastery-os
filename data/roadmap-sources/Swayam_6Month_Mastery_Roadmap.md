# The 6-Month Mastery Roadmap
### DSA/CP + Business, Finance, Entrepreneurship & Critical Thinking
**Swayam Patel — B.Tech CSE, DEPSTAR CHARUSAT (5th Sem) | 24 Weeks | 1–2 hrs/day**

---

## 0. Ground Rules Before You Start

**Why this roadmap is different from the "14-week DSA plan" you were given:** that plan only solves one problem (interview-pattern recognition). You asked for something bigger — becoming a sharper *thinker and operator*, not just a faster leetcoder. So this plan runs **two tracks in parallel, every single day**, not sequentially. If you do DSA for 5 months and "business stuff" in month 6, the business stuff never sticks and you burn out on grinding. Interleaving is non-negotiable — it's also just better for retention (spaced repetition > cramming, this is neuroscience, not opinion).

**Daily budget (weekdays, ~75–90 min):**
- 50–60 min → Track A: DSA/CP
- 20–30 min → Track B: Business / Finance / Critical Thinking (reading or video, never coding)

**Weekend budget (~2–2.5 hrs each day):**
- Saturday → Codeforces contest / longer DSA session + review
- Sunday → Business/finance deep work (longer article, book chapter, case study) + weekly retrospective (15 min — what did I actually retain?)

**Total over 24 weeks: ~230–260 hours.** That is genuinely enough to get you to CF Pupil/Specialist level, LeetCode 400–500 solved with pattern fluency, and a working, usable mental model of how money, business, and decision-making actually work — if you don't skip the retrospectives. Most people fail these plans not from lack of time but from never re-testing themselves. Build that in from week 1.

**Tools you'll use:** LeetCode, Codeforces, CSES Problem Set, GitHub (to log everything — you already have the habit), a simple spreadsheet or Notion board to track problems solved / concepts revisited.

---

## PHASE 0 — Weeks 1–3: Language Mastery Foundations
*Goal: before touching "patterns," your hands should never fumble syntax. You should reach for the right container/data structure instinctively in whichever language you're using that day.*

You explicitly asked for this first — good instinct. Trying to learn graph theory while also googling "how does unordered_map iteration work" wastes cognitive load you need for the actual algorithm.

### Week 1 — C++ STL Mastery
| Day | Topic | Resource |
|---|---|---|
| Mon | `vector`, `pair`, `array`, basic I/O speedups (`ios::sync_with_stdio(false)`) | [C++ STL playlist – Luv](https://www.youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ) or freeCodeCamp "C++ STL" video |
| Tue | `set`, `multiset`, `unordered_set` — ordering guarantees, complexity | Same playlist + [cppreference.com](https://cppreference.com) as permanent lookup habit |
| Wed | `map`, `multimap`, `unordered_map` — iteration, custom comparators | cppreference + practice: 5 small problems using maps |
| Thu | `stack`, `queue`, `deque`, `priority_queue` (min-heap via negation, custom comparator) | cppreference |
| Fri | Iterators, `algorithm` header: `sort`, `lower_bound`/`upper_bound`, `next_permutation`, `accumulate` | cppreference |
| Sat (contest day, lighter) | Write a "cheat sheet" — your own — of STL snippets you'll reuse for 6 months | — |
| Sun | Pairs/tuples with structured bindings, `emplace_back` vs `push_back`, pass-by-reference discipline | Read: [Competitive Programmer's Handbook by Antti Laaksonen](https://cses.fi/book/book.pdf) — Ch 4 (free PDF, this book is gold and free, use it throughout) |

### Week 2 — Java Collections Framework
| Day | Topic | Resource |
|---|---|---|
| Mon | Collection hierarchy: `List`, `Set`, `Map`, `Queue` — interface vs implementation | [Java Collections – Telusko / Kunal Kushwaha YT playlist] |
| Tue | `ArrayList` vs `LinkedList`, `HashSet` vs `TreeSet` vs `LinkedHashSet` | Same |
| Wed | `HashMap` vs `TreeMap` vs `LinkedHashMap`, custom `equals()`/`hashCode()` | Same |
| Thu | `PriorityQueue`, `Deque`/`ArrayDeque` as stack+queue, `Collections` utility class | Same |
| Fri | Generics fundamentals: `<T>`, bounded types, wildcards `<? extends T>` | [Generics in Java – official Oracle docs, Trail: Generics] |
| Sat | Comparable vs Comparator, lambda-based sorting | Practice: 5 problems |
| Sun | Build your own Java STL-equivalent cheat sheet | — |

### Week 3 — Python DSA Idioms + Cross-Language Consolidation
| Day | Topic | Resource |
|---|---|---|
| Mon | `list`, `dict`, `set`, `tuple` — comprehensions, `collections.Counter`, `defaultdict` | [Python collections module docs](https://docs.python.org/3/library/collections.html) |
| Tue | `heapq` (min-heap only — trick for max-heap), `bisect` for binary search | Python docs |
| Wed | `deque` from collections, string manipulation idioms, slicing tricks | Python docs |
| Thu | `itertools` (permutations, combinations, product) — huge time-saver in CP | Python docs |
| Fri | Big-O refresher across all 3 languages — what's O(1) vs O(log n) *per language* (e.g., Python list.pop(0) is O(n)!) | Write your own comparison table |
| Sat | Contest #1 (Codeforces Div 4 — just to get the platform/UX pain out of the way, don't worry about rating yet) | codeforces.com |
| Sun | **Checkpoint:** solve the same 5 easy problems in all 3 languages back to back. If any language feels slow, that's your signal for extra reps. | — |

---

## PHASE 1 — Weeks 4–9: DSA Patterns, Properly
*Goal: ~15 real patterns, each learned as a reusable template, not a one-off trick. This is the actual meat.*

Use **NeetCode 150/250** as your problem bank throughout (better curated than raw LeetCode) and **CSES Problem Set** for CP-style rigor (Codeforces-adjacent difficulty, cleaner constraints).

### Week 4 — Arrays, Strings, Two Pointers, Sliding Window, Prefix Sums
- Concepts: fixed/variable window, prefix sum + hashmap for subarray problems, two-pointer convergence
- ~20 problems (NeetCode "Arrays & Hashing" + "Two Pointers" + "Sliding Window" sections)
- Video: NeetCode's pattern explainer videos (watch *before* attempting, not after)

### Week 5 — Linked Lists, Stacks, Queues, Monotonic Stack
- Concepts: fast/slow pointers (cycle detection, middle-finding), in-place reversal, monotonic stack (next greater element family)
- ~18 problems
- This week also: read Laaksonen's book Ch 1–2 (data structures section) as reinforcement

### Week 6 — Binary Search + Trees (BFS/DFS)
- Concepts: binary search on sorted arrays *and* binary search on the answer space (very underrated pattern, shows up constantly on CF), tree traversals (recursive + iterative), BST properties
- ~22 problems

### Week 7 — Graphs Part 1
- Concepts: BFS/DFS on graphs, connected components, grid-as-graph problems, cycle detection
- ~18 problems
- This is the week most self-taught devs get lazy on — don't. Graphs show up disproportionately on Codeforces.

### Week 8 — Graphs Part 2
- Concepts: topological sort (Kahn's + DFS-based), Union-Find/DSU, Dijkstra, minimum spanning tree (Kruskal/Prim) — at least conceptually
- ~15 problems
- Reference: Laaksonen Ch 12–15 (graph algorithms, free and excellent)

### Week 9 — Heaps, Greedy, Intervals
- Concepts: top-K problems, merge intervals, greedy proof-of-correctness thinking (this is where "critical thinking" and DSA actually overlap — greedy requires you to *prove* your intuition, not just trust it)
- ~18 problems

**Weekend habit from Week 4 onward, every week:** 1 Codeforces Div 3/4 contest (even if you get 2/6 problems — participation compounds pattern recognition faster than solo practice) + revisit 5 old problems cold (no notes) to test retention.

---

## PHASE 2 — Weeks 10–13: Dynamic Programming (the long pole)
*This is the one area where "3 weeks isn't enough" is a real risk — budget the full 4.*

| Week | Focus |
|---|---|
| 10 | 1D DP: climbing stairs, house robber, coin change, LIS (both O(n²) and O(n log n) versions) |
| 11 | 2D DP: unique paths, grid problems, 0/1 knapsack, unbounded knapsack |
| 12 | String DP: LCS, edit distance, palindrome partitioning, wildcard matching |
| 13 | DP on trees/graphs (intro level) + interval DP (matrix chain multiplication style) + review week |

**Method (this matters more than the topic list):**
1. Don't memorize solutions — for every DP problem, first write the **recurrence relation in plain English** before writing code. If you can't state "the answer to f(i) depends on f(i-1) and f(i-2) because X," you don't understand it yet, you're pattern-matching.
2. Solve top-down (memoization) first, then convert to bottom-up (tabulation) yourself — this cements the state-transition logic.
3. ~30 problems across the 4 weeks total (quality over volume here — DP rewards depth, not breadth).

---

## PHASE 3 — Weeks 14–17: Backtracking, Bit Manipulation, Advanced Graphs, Number Theory
*This is where CP starts diverging from pure "interview DSA" — this phase is what pushes you toward genuine Codeforces competence, not just LeetCode.*

| Week | Focus | Resource |
|---|---|---|
| 14 | Backtracking: subsets, permutations, N-Queens, Sudoku-style constraint problems | NeetCode "Backtracking" |
| 15 | Bit manipulation: XOR tricks, bitmasking for subset DP, popcount tricks | Laaksonen Ch 10 |
| 16 | Number theory: GCD/LCM, sieve of Eratosthenes, modular arithmetic, fast exponentiation | Laaksonen Ch 21–24 |
| 17 | Segment trees / Fenwick (BIT) — intro level, range queries + updates | [CP-Algorithms.com](https://cp-algorithms.com) — the single best free CP reference site, bookmark this permanently |

**Weekend Codeforces target from here on:** aim for Div 2 contests too, not just Div 3/4. Track your rating — Pupil (1200+) is a very achievable 6-month target; Specialist (1400+) is a stretch goal if Phase 3–5 goes well.

---

## PHASE 4 — Weeks 18–21: Volume, Mixed Practice, Timed Mocks
*You have the patterns. Now build speed and cross-pattern recognition — this is what separates "knows DP" from "can solve an unlabeled problem in 30 minutes under pressure."*

- Each day: 1 randomized mixed-topic problem, **timeboxed to 30–35 minutes**, no exceptions. If you don't solve it, stop, look at the editorial, and re-solve from scratch the next day (never mid-look-at-solution).
- Each weekend: 1 full mock interview (use Pramp — free — or a friend) where you narrate your thought process out loud. This verbalization skill is what actually gets tested in interviews, and most people never practice it.
- Weekly retrospective: which pattern category are you slowest on? Spend the following week's spare problem-slots there.

## PHASE 5 — Weeks 22–24: Polish, System Design Lite, Portfolio Integration
- Skim **"Grokking the System Design Interview"** basics (or the free [System Design Primer on GitHub](https://github.com/donnemartin/system-design-primer)) — you don't need depth, you need to not freeze if asked "how would you scale this."
- Given your actual project history (SmartBI, FinIQ, ARCADE), you already have real system-design stories — practice narrating *those* using a structured framework (requirements → high-level design → deep dive → tradeoffs). This is a stronger asset than generic system design trivia.
- Add your Codeforces/LeetCode profile links to your resume next to GitHub/Portfolio (as the other Claude account correctly flagged).
- Final week: full mixed-pattern mock contest simulating real constraints (2 hrs, 4 problems, no notes).

---

## TRACK B — Business, Finance, Entrepreneurship & Critical Thinking
*Runs every single week in parallel with Track A above. ~20–30 min on weekdays, ~1.5–2 hrs Sunday deep-dive.*

This track is organized by **monthly theme** so concepts build on each other instead of being random trivia. Each month = roughly 4 weeks = matches your DSA phases loosely, but don't worry about perfect sync — the point is consistent exposure, not lockstep pacing.

### Month 1 (Weeks 1–4): Money Psychology & Personal Finance Foundations
*Why first: you can't reason about business or investing well if your relationship with money itself is unexamined — this is the actual foundation, not a soft-skill afterthought.*
- **Book (read across the month, ~15 min/day):** *The Psychology of Money* — Morgan Housel. Short chapters, built for exactly this kind of drip-reading.
- **YouTube:** "Two Cents" (PBS) — personal finance fundamentals, well-researched, short episodes
- **Concepts to actively note down (not just consume):** compounding, risk vs uncertainty, the difference between being rich and being wealthy, savings rate as the real lever (more controllable than investment returns)
- **Sunday deep-dive weeks 3–4:** open a basic budgeting/expense tracker for yourself (even a spreadsheet) — apply the concepts to your actual life, not just theory

### Month 2 (Weeks 5–8): How Businesses Actually Work
- **Book:** *The Personal MBA* by Josh Kaufman — deliberately written as a business-school substitute, dense but practical, read in short daily chunks
- **Concepts:** value creation, marketing vs sales, basic unit economics (revenue, margin, CAC, LTV — directly relevant since you've built SaaS products), how a P&L statement and balance sheet actually work at a basic level
- **YouTube:** "Y Combinator Startup School" (free, on YouTube) — watch 1 lecture/week, these are genuinely excellent and given by people who've built real companies
- **Applied exercise:** take one of your own projects (FinIQ, SmartBI, or the fitness tracker SPA) and write a 1-page mock business case for it — who's the customer, what's the pricing model, what's the CAC/LTV story. This connects the reading to something real instead of abstract.

### Month 3 (Weeks 9–12): Markets, Investing & the Workflow of Money
- **Book:** *Rich Dad Poor Dad* (fast read, foundational mindset shift on assets vs liabilities) — then if time allows, start *A Random Walk Down Wall Street* for the more rigorous investing side
- **YouTube:** Patrick Boyle's channel — genuinely one of the best finance-explainer channels on YouTube, no fluff, covers markets/bubbles/investing mechanics rigorously
- **Concepts:** stocks vs bonds vs mutual funds vs index funds, how interest rates ripple through an economy, inflation mechanics, what a mutual fund distributor (relevant to your InvestaSure internship!) actually does in the money chain — you have a real head start here given FinIQ
- **Applied exercise:** since you already built FinIQ (mutual fund distribution SaaS), write out — in your own words — the full money workflow from an investor's rupee to AMC to distributor commission. You've coded this system; now understand it as a finance person would.

### Month 4 (Weeks 13–16): Entrepreneurship & Building Things That Matter
- **Book:** *Zero to One* — Peter Thiel (short, opinionated, forces you to think about monopolies/differentiation rather than "me-too" competition — very relevant given you build a lot of side products)
- **Essays:** Paul Graham's essays (paulgraham.com/articles.html) — read 1 per week, they're short and arguably the best free writing on startups/thinking that exists
- **Concepts:** product-market fit, MVP thinking, why most startups fail (distribution > product, usually), bootstrapping vs raising capital
- **Applied exercise:** pick one of your "sellable product" ideas (the fitness tracker SPA is a good candidate) and write a real 1-pager: problem, target user, MVP scope, pricing, distribution channel. This is the entrepreneurial thinking made concrete, not just read.

### Month 5 (Weeks 17–20): Critical Thinking & Mental Models
*This is the multiplier skill — the thing that actually makes someone "smarter than 99% of people," not raw knowledge but decision quality.*
- **Book:** *Poor Charlie's Almanack* (Charlie Munger) — or if time-constrained, Farnam Street's free blog (fs.blog) which distills the same mental-models thinking in shorter posts
- **Book (parallel, lighter):** *Thinking, Fast and Slow* — Kahneman, at least Part 1 (System 1 vs System 2 thinking, cognitive biases) — this alone will change how you evaluate your own decisions and other people's arguments
- **Concepts to internalize and actually use, not just know:** inversion (Munger's "invert, always invert"), first-principles thinking, confirmation bias, sunk cost fallacy, base rates, second-order thinking ("and then what?")
- **Applied exercise:** every Sunday this month, take one real decision you're facing (career, project, time allocation) and explicitly run it through 2 mental models before deciding. Write it down. This is where the reading becomes a skill instead of trivia.

### Month 6 (Weeks 21–24): Career Capital, Negotiation, Personal Branding, Synthesis
- **Book:** *So Good They Can't Ignore You* — Cal Newport (directly relevant to your "stand out in career" goal — argues skill-building beats "follow your passion" framing, which fits this entire roadmap's philosophy)
- **Article/skim:** basics of salary negotiation (search "Kalzumeus negotiation" — Patrick McKenzie's essay on negotiating job offers is the best free resource on this topic, engineers specifically underprice themselves and this fixes that)
- **Concepts:** how to build a public track record (you're already doing this well — GitHub, portfolio, published VS Code themes — now learn to *narrate* it well), personal branding as "reducing the risk of hiring you" in a recruiter's eyes, informational interviews
- **Synthesis exercise (final 2 weeks):** rewrite your resume's summary/profile section using everything from this track — sharper positioning, clearer value articulation. Also draft a 60-second "who I am and what I've built" pitch you could give in an interview, informed by both the business-thinking and the critical-thinking work.

---

## Tracking & Accountability

Set up one simple spreadsheet (Google Sheets is fine) with these tabs:
1. **DSA Log** — date, problem name, pattern, time taken, solved unaided (Y/N)
2. **CF Contest Log** — contest, rank, rating change, problems solved
3. **Reading Log** — book/article, date, one-sentence takeaway (forces active reading, not passive scrolling)
4. **Weekly Retro** — 3 questions every Sunday: What did I actually retain from last week? What pattern/concept am I weakest on? What's next week's focus adjustment?

**The single biggest failure mode for a plan like this isn't lack of information — you have plenty now — it's silent drift.** People quietly stop doing the Track B reading around week 3 because DSA feels more "urgent." Protect the 20–30 min Track B slot as fiercely as the DSA slot. It's the part that makes you different from every other CS student solving the same LeetCode problems.

---

## Quick Reference — All Resources in One Place

**DSA/CP:**
- NeetCode 150/250 (patterns, curated)
- CSES Problem Set (cses.fi/problemset — rigorous, free, CF-style)
- Competitive Programmer's Handbook — Antti Laaksonen (free PDF: cses.fi/book/book.pdf)
- CP-Algorithms.com (reference site, bookmark permanently)
- Codeforces (contests, rating)
- Pramp (free mock interviews)

**Business/Finance/Critical Thinking:**
- *The Psychology of Money* — Morgan Housel
- *The Personal MBA* — Josh Kaufman
- *Rich Dad Poor Dad* — Robert Kiyosaki
- *Zero to One* — Peter Thiel
- *Poor Charlie's Almanack* — Charlie Munger (or fs.blog as lighter alternative)
- *Thinking, Fast and Slow* — Daniel Kahneman (Part 1 minimum)
- *So Good They Can't Ignore You* — Cal Newport
- Paul Graham's essays (paulgraham.com/articles.html)
- Y Combinator Startup School (YouTube)
- Patrick Boyle (YouTube)
- Two Cents / PBS (YouTube)
- Patrick McKenzie's salary negotiation essay ("Kalzumeus negotiation")

---

*This roadmap assumes consistency over intensity. Missing one day is fine — missing a full week without adjusting the plan is how these things quietly die. If a week goes sideways, don't try to "catch up" by cramming; just resume the schedule from where you are and let the retro tab absorb the gap.*
