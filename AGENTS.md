<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- All app data lives in one client store (src/lib/store.tsx) seeded from src/lib/data.ts and persisted to localStorage — prototype is front-end only by requirement; backend can replace the store later.
- Recommendations are computed from job + profile (recommendationFor in data.ts), never stored — so profile edits re-rank everywhere consistently.
