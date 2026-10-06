# ApplyPilot — Prototype Plan

Front-end only prototype. No login, no database, no AI, no real resume parsing. One shared mock dataset (Katherine Ma + 6 jobs: Spotify, Deloitte, Adobe, Visa, Amazon, Disney) kept in a single in-memory store so every page stays in sync.

## Pages
- **/onboarding** — 3 steps: (1) Resume upload UI states + validated profile fields, (2) Preferences with searchable multi-select chips, work authorization, sponsorship, (3) Shortlist explanation + top jobs + "Go to Dashboard".
- **/** Dashboard — 5 clickable metric cards (Jobs Reviewed, Apply Now, Active Applications, Interviews, Tasks Due), Top Recommended, Upcoming Deadlines, Upcoming Tasks, Recent Activity. First visit redirects to onboarding.
- **/jobs** Review Jobs — labeled filters (Search, Recommendation, Eligibility, Location, Role), split view list + detail with the four-part analysis, expand to full width, compare checkboxes, "Mark Applied / Save" actions, Add Job dialog with simulated Analyze.
- **/compare** — 2–3 jobs side by side, rows for each dimension, best/worst values highlighted.
- **/applications** — Kanban (Saved, Applied, Interview, Offer, Rejected) with drag-and-drop plus a status dropdown; card opens a side panel with timeline, notes, analysis, next steps, tasks.
- **/tasks** — simple list, add task, mark complete.
- **/profile** — same fields/components as onboarding; changing preferences re-scores the Personal Priority in a simple deterministic way.

Left sidebar navigation on all main pages.

## Visual design
Light neutral background, navy + teal primary, green/amber/red status colors, rounded cards, subtle shadows, minimal animation.

## Technical details
- State: React context + reducer, persisted to localStorage so a demo survives refresh (with a "Reset demo" button).
- Drag-and-drop: native HTML5 drag events (no new library) — low risk on desktop; touch drag on phones is limited, so the status dropdown is the mobile fallback.
- Shared components: MultiSelectChips, StatusBadge, AnalysisSections, JobCard, ProfileForm (used by onboarding + profile).

## Risks / better for a second iteration
- Mobile drag-and-drop (fallback dropdown provided).
- "Re-ranking from preferences" is a simple rule-based score, not real matching.
- Pasted job descriptions produce a templated analysis, not one derived from the text.
- Resume upload stores only the filename; extraction is left for backend teammates.
