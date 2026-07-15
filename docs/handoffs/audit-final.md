# Handoff — Final audit session

Runs AFTER all screen sessions, in the MAIN checkout on `master`
(port 5173). This is the hub's merge-and-audit phase. Read
`docs/HANDBOOK.md`, every `docs/handbacks/*.md`, then:

0. **Merge the worktree branches**, one at a time in review order:
   `git merge screen/<name>` → resolve conflicts (appended styles.css
   blocks should merge trivially; scrutinize any shared-file edits the
   handback flagged) → `npx tsc --noEmit` → browser spot-check → next.
   When all branches are in: `git worktree remove` each worktree and
   delete the merged `screen/*` branches.

1. **Handback review**: verify every claimed checkbox (re-run tsc,
   re-take the four screenshot combos per screen). Fix gaps listed in
   handbacks; hunt for unlisted ones (contrast, RTL slips, GPU leaks,
   console errors, broken routes/aliases).
2. **Landing variant diff**: fetch Figma `55:879` (duplicate of the
   landing frame) and diff against `5:962` — if it differs (e.g.
   platform-button state), reconcile with the client before changing
   anything.
3. **Cross-page coherence**: consistent section rhythm (84px rule),
   heading scales, CTA styles, fx opacity levels, dark-mode parity,
   nav active states per page, footer links all resolve.
4. **Full-site pass**: click every route from every entry point
   (desktop + `?coarse` touch), both themes; run an adversarial review
   workflow over the new pages' code (the review-changes pattern in
   this repo's history caught real bugs — reuse it).
5. Write `docs/handbacks/audit-final.md` summarizing fixes and residual
   risks for the client.
