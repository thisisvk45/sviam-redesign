# Codex task — integrate the SViam redesign into the live app + backend

## 0. What this is
There is a finished, static HTML/CSS reference redesign of the SViam site in
`site/` (repo root: `/Users/viks/Desktop/sviam-landing`). It is the **source of
truth for visual design, information architecture, page structure, copy, and the
new candidate/company features**. Your job is to port that design and its
features into the **real Next.js 16 app** (`src/`) and wire it to the **existing
FastAPI backend** (`backend/`) so it goes live. The static site is a mock (login
is `localStorage`, data is illustrative); the production version must use real
auth, real data, and real AI.

Do NOT copy the static HTML verbatim into the app. Re-implement it as React
components using our existing stack, tokens, and data layer.

## 1. Ground rules (hard constraints)
- **Read `AGENTS.md` first.** This is a modified Next.js — read the relevant
  guides under `node_modules/next/dist/docs/` before writing routing/server code.
- Stack: Next.js 16 App Router, React 19, TypeScript (strict), Tailwind CSS 4,
  Framer Motion 12. **Never use `any`.** Zero TypeScript errors.
- **Run `npm run build` after frontend changes** and fix all type errors before
  finishing. Run `npm run lint` and the vitest/playwright suites you touch.
- Backend scripts run with `PYTHONPATH=.` and the venv activated
  (`cd backend && source venv/bin/activate`).
- Reuse what exists. This repo already has: Supabase auth, a question registry,
  an interview-prep engine, a resume parser, a deep scorer, an integrity engine,
  hiring flows, and LiveKit/ElevenLabs voice. Prefer wiring to these over new code.
- Ship in small, reviewable PRs following the order in §8.

## 2. Honesty rules (must hold in the shipped UI — non-negotiable)
- Practice is **live**. Hiring is a **limited pilot** — label it as such.
- Maya **supports** human evaluation; she does **not** decide who is hired. Every
  score/scorecard must carry that framing.
- No fabricated metrics, logos, or endorsements. "Supported by" = ElevenLabs
  Grants + Plaksha Entrepreneurship Support Program 2026 (grants, not investment).
- Company/campus practice sets are "modelled on public interview patterns, not
  affiliated with the companies named." Keep that disclaimer.
- Integrity/AI-cheating detection (Cluely/ParakeetAI overlays, second-screen) is
  **in development** — never publish accuracy numbers.
- Legal entity "SVIAM AI PRIVATE LIMITED"; contact `vikas.kumar@sviam.in`; no
  physical address in the footer.

## 3. Design system to port
Source: `site/site.css`. Translate these into Tailwind theme tokens / a small set
of shared components (do not hand-roll per page):
- **Fonts:** General Sans (Fontshare) for UI/headings; JetBrains Mono for code and
  small metric labels only. Do NOT use Inter/Geist.
- **Color tokens** (define as CSS vars + Tailwind theme):
  `--bg:#f7f8f7  --surface:#fff  --ink:#0b0f0d  --ink-2:#464e4a  --ink-3:#6b736e
   --line:rgba(11,15,13,.11)  --line-2:rgba(11,15,13,.18)
   --accent:#12a150 (fills)  --accent-text:#0e7a3e (accent on light, AA)
   --accent-press:#0c6634  --accent-wash:rgba(18,161,80,.10)`.
  Green is the ONLY primary accent. No purple/violet anywhere.
- **Rules:** hairlines, not boxes (the only allowed boxes are the demo interview
  "frame", the scorecard "viz", inputs/buttons, and pricing/practice cards).
  12-col grid, generous whitespace, Apple-clean.
- **Shared components to build** (map from the static classes):
  `Nav` (role-aware, see §4), `Footer` (dark), `Button` (green primary /
  outline / on-white), `StatCard` (.stat), `Card` (.dcard), `Row` (.drow),
  `ScorePill`, `NeedChip` (clean/review/flag), `Tabs` (.tab-btn/.tab-panel),
  `QuestionRow` (.qr), `Chip` (.qchip filter), `VoiceFeedback` (.voicefb),
  `Viz`/`BarRow` (scorecard), `Frame` (interview window), `Tile` (.ptile).
- The static nav/footer injector is `site/site.js` (`buildNav`/`buildFooter`);
  reproduce that behavior in the React `Nav`/`Footer` instead of injecting HTML.

## 4. Auth & role-aware navigation
The static site fakes this with `localStorage.sviam_demo = {role,name,email}`.
Replace with **real Supabase auth** (`src/lib/supabase.ts`,
`src/lib/supabase-server.ts`, existing `src/app/auth/callback/route.ts`,
`src/app/signin`, `src/app/register`).
- Derive `role` (`candidate` | `company`) from the user's profile
  (`backend/app/api/routes/profile.py` / Supabase profile), not client storage.
- **Role-aware nav** (this is a core requirement of the redesign):
  - Logged out → marketing nav: Product · For developers · For companies ·
    Pricing + Log in + Get started.
  - Candidate → Dashboard · Practice · History · Pricing + avatar + Log out.
    **Hide all "For companies"/hiring links from candidates.**
  - Company → Dashboard · Jobs · Candidates · Pricing + avatar + Log out.
  - The logo links to the user's dashboard when logged in, else the marketing home.
- Guard the app routes server-side (redirect to `/signin` if role mismatches),
  replacing the static per-page `localStorage` guard scripts.

## 5. Page-by-page integration map
For each: **static reference → Next.js route → data source**. Match the static
layout/copy; swap mock data for real.

### Marketing (visual refresh only, keep/repoint existing routes)
- `index.html` (centered hero with rotating first word, supported-by, live demo,
  closing) → home (`src/components/LandingPageV3.tsx` / home route). Port the
  hero, rotating-word animation (Framer Motion), and section rhythm.
- `product.html`, `practice.html` (For developers), `companies.html`
  (For companies), `pricing.html`, `about/careers/contact/resources` → existing
  marketing routes. Re-skin to the new system; keep real content/links.

### Candidate app
1. **Dashboard** — `app-candidate.html` → candidate dashboard route (`src/app/me`
   or a new `/dashboard`). Greeting "Hi {firstName}, welcome back." Stats
   (sessions, avg score, streak, plan), recent sessions with score pills →
   session review, progress sparkline, Maya's last **spoken** feedback, and the
   company/campus practice tiles. Data: user profile + past interview reports
   (`backend reports.py` / `src/lib/interview-report.ts`).
2. **Practice hub** — `questions.html` → `/practice`. Three things:
   a. **"Practise for a specific job" (JD + resume tailor)** — see §6, the flagship
      new feature.
   b. **Question bank** — port the filterable table. **Back it with the real
      registry** `src/lib/questions/registry.ts` (two-sum, merge-intervals,
      valid-parentheses, number-of-islands, reverse-linked-list, LRU/rate-limiter
      via `url-shortener`/`rate-limiter`, etc.) instead of the hard-coded 14 rows.
      Each row starts a real interview session (see interview flow below).
   c. Tiles linking to company-prep and campus-prep.
3. **Company prep** — `company-prep.html` → `/practice/company`. Company grid +
   category filter; selecting a company shows that company's set. Model sets on
   top of the real question registry (tag questions by company/category). Keep the
   "not affiliated" disclaimer.
4. **Campus prep** — `campus-prep.html` → `/practice/campus`. Placement-season
   portal: companies visiting a campus (role, date, status), prep tracks, and an
   "add my campus" waitlist → `backend/app/api/routes/waitlist.py`. Campus data is
   pilot; where you don't have real drive data, mark it clearly and gate behind the
   waitlist. Bind the campus to the user's profile college when available.
5. **Session review / replay** — `session-review.html` → `/replay/[sessionId]`
   (repo already has `src/lib/replay-source.ts`, `src/app/replay`). Header with
   question + score, tabs **Transcript / Code replay / Maya's feedback**, a
   **scorecard** (per-signal bars), and "practise what slipped." Data: the real
   session transcript, code timeline, and **AI-generated scorecard** from
   `backend deep_scorer.py` / `src/lib/interview-prep/evidence-scorecard.ts`.
   Maya's spoken feedback via existing ElevenLabs pipeline (`src/lib/voice-*`,
   `elevenlabs-token.ts`).
6. **Live interview** — the "Start" actions must launch the existing interview
   room (`src/app/interview/[sessionId]/InterviewRoom.tsx`, `interview_ws.py`).
   Reuse it; just make sure the new practice entry points create a session and
   route into it, carrying the tailoring context from §6 when present.

### Company app
7. **Company dashboard** — `app-company.html` → company route
   (`src/app/company/page.tsx` / `src/app/hiring`). Greeting, stats (open jobs,
   candidates, interviewed, awaiting review), "Needs your review" list with score
   pills + integrity chips, active jobs, integrity panel, "what your team reviews."
   Data: hiring flows (`src/lib/hiring*.ts`, backend `teams.py`, `reports.py`).
8. **Drive / job detail** — `job.html` → `/hiring/jobs/[jobId]` (or existing
   hiring route). Which drive, which role, applications received → invited →
   interviewed → shortlisted funnel, per-candidate rows (score + integrity chip +
   Review), averaged interview feedback, and the integrity panel (Cluely/overlay,
   second-screen) from `proctoring_scorer.py` / `integrity_intervention.py` /
   `integrity_ingest.py`. Keep "in development / no accuracy numbers."

## 6. Flagship feature — tailor an interview to a JD + resume
Static reference: the "Practise for a specific job" card in `site/questions.html`
(role detection, focus tags, amber "gap" tags, tailored set). Build the real thing:
- **Input:** candidate pastes JD **text** OR a **JD URL**, and provides a
  **resume** (upload file or "use my saved resume").
- **JD URL:** add a backend endpoint that fetches + extracts the public posting
  text server-side (sanitize; handle failures gracefully). New route under
  `backend/app/api/routes/` (e.g. `job_targets.py`).
- **Resume:** reuse `backend/app/services/resume_parser.py` (and
  `hiring_resume.py` / `src/lib/interview-resume.ts`) to extract skills/experience.
  Persist the candidate's saved resume on their profile.
- **Tailoring:** feed JD + resume into the interview-prep engine
  (`src/lib/interview-prep/interviewer-prompt.ts`, `adaptive-path.ts`,
  `problem-spec.ts`; backend `interview_ai.py` / `llm_interviewer.py`) to produce:
  detected role, **strength focus areas** (present in both JD and resume) and
  **gaps** (in JD, thin/absent in resume), plus a **tailored question set** chosen
  from the real registry. Store this as the session's interview plan so the live
  room actually asks those questions and probes the gaps.
- **Output UI:** exactly the static card's result layout — role line, green focus
  chips, amber gap chips, tailored question rows, and a "Start the tailored
  interview" CTA that launches the interview room with this plan.
- Privacy: JD/resume are used only to shape the interview; state this in the UI and
  don't log raw resume text beyond what the parser needs.

## 7. Feedback must be AI-driven (explicit user requirement)
Everywhere feedback appears (session review scorecard, Maya's spoken feedback,
"practise what slipped," company scorecards), it must be **generated per-session by
the model from the actual transcript/code**, not static/generic strings. Wire to
`deep_scorer.py` / `evidence-scorecard.ts` for the scorecard and to
`interview_ai.py` + the ElevenLabs voice pipeline for spoken feedback. The
"practise what slipped" suggestions must derive from that session's real weak
signals. No hard-coded feedback copy in production.

## 8. Suggested PR order
1. Design tokens + shared component library + role-aware Nav/Footer (no data yet).
2. Marketing re-skin (home hero + rotating word, then the rest).
3. Auth/role plumbing + server-side route guards; candidate & company dashboards
   wired to real profile/report data.
4. Practice hub + question bank on the real registry; launch real sessions.
5. Session review/replay wired to real transcript + AI scorecard + spoken feedback.
6. Company job/drive detail + integrity panels wired to hiring/proctoring data.
7. JD + resume tailoring (backend JD-fetch endpoint + resume parse + tailored plan
   + result UI + launch).
8. Company-prep and campus-prep (registry tagging + campus waitlist).

## 9. Acceptance criteria
- `npm run build` passes with zero TS errors; no `any`; lint clean.
- Logged-out, candidate, and company each see the correct nav/pages; candidates
  never see hiring UI; route guards enforce role server-side.
- Question bank, company-prep, and the tailored set all pull from the real
  question registry; "Start" launches the real interview room.
- JD-text and JD-URL both produce a tailored plan the live interview honors;
  resume parsing works for PDF/DOC.
- Session review shows a real, per-session AI scorecard + AI spoken feedback and
  real code replay for a completed session.
- Company job detail shows the real funnel, candidate list, feedback averages, and
  integrity flags from backend data.
- All honesty rules in §2 hold in the shipped UI.

## 10. Reference
- Redesign reference (visual/IA/copy/features): `site/*.html`, `site/site.css`,
  `site/site.js`. View at `file://…/site/index.html` or serve the folder.
- Key existing frontend: `src/lib/api.ts` (`authFetch`), `src/lib/supabase*.ts`,
  `src/lib/questions/registry.ts`, `src/lib/interview-prep/*`,
  `src/lib/replay-source.ts`, `src/lib/interview-report.ts`, `src/lib/hiring*.ts`,
  `src/app/interview/[sessionId]/InterviewRoom.tsx`, `src/app/company/page.tsx`,
  `src/components/LandingPageV3.tsx`, `src/components/Navbar.tsx`.
- Key existing backend: `backend/app/api/routes/` (`interviews.py`,
  `interview_ws.py`, `profile.py`, `waitlist.py`, `reports.py`, `teams.py`),
  `backend/app/services/` (`interview_ai.py`, `llm_interviewer.py`,
  `resume_parser.py`, `question_bank.py`, `deep_scorer.py`,
  `proctoring_scorer.py`, `integrity_intervention.py`).
