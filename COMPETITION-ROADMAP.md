# Competition build order and reset contract

The existing editor, clubs, players, face pool, matches, event stream, analytics,
Home, shot maps and heatmaps remain the canonical systems. No parallel match
store or second simulator was introduced.

## Implemented build sequence

1. **Save graph / IDs:** existing IDs are retained; competition, season/edition and
   tournament references extend them. Download/Load Save includes definitions,
   editions, groups, brackets, archived results, trophy records, existing lineups,
   benches, faces and full simulation events. Imports validate references and do
   not regenerate players or assign faces. Older saves gain a stable legacy
   season for each saved league.
2. **Seasons:** leagues own distinct season IDs. Fixtures reference both league
   and season. Current tables exclude other seasons and unassigned friendlies.
3. **Completion:** the required matches-per-team target defaults to 10. When
   every registered club has completed at least its target, final standings are
   archived with champion and runner-up. Points, GD, GF determine the order,
   followed by club name for a completely equal tie.
4. **History:** one historical award record per completed edition references
   competition ID, season ID, winner club ID and runner-up club ID. Frozen tables,
   group tables and result summaries preserve official results after evidence
   deletion. Renaming a club does not move its trophies.
5. **Settings / recovery:** each reset below has a separate scope. An atomic
   IndexedDB transaction stores the pre-operation snapshot and replacement save
   together. If either cannot be written, the operation does not run. Retain the
   latest three snapshots outside the active save; Settings lists date, time and
   operation and offers Restore Last Backup. Importing a save also snapshots the
   current world first. Restoring a backup snapshots the state it replaces.
6. **Cups:** 2/4/8/16/32 clubs; round of 32, round of 16, quarters, semis and final
   as applicable. A completed round automatically creates the next canonical
   matches. Tied knockout games continue through 30 minutes of actual extra time
   in the same engine and then recorded penalty kicks if still tied. Shootout
   kicks never inflate normal match goals, shots, player goals or xG.
7. **Major tournaments:** exactly 32 clubs, eight groups of four, single round
   robin (48 group fixtures), top two per group, round of 16 through final (15
   knockout fixtures). Opposite group winners/runners-up are paired in the first
   knockout round. Group and knockout games feed existing Home/match screens.
8. **History / trophy UI:** Competitions has edition selection and Overview,
   Matches, Table/Groups, Bracket, Stats and History. Club Overview has a dark
   trophy cabinet: competition, Winner/Runner-up totals, expandable actual
   seasons. Counts derive from award records, not manually incremented counters.
9. **Integration checks:** test-competitions.cjs covers the eight requested
   scenarios, exact reset isolation, frozen group/bracket summaries, empty-world
   startup, UI cup creation/reset and typed RESET/restore. test-knockout.cjs covers
   extra time, shootouts, statistics and validated save/reload. test-storage.cjs
   covers the actual IndexedDB recovery transaction and retention. Existing
   simulator, generator, Home, image, map and analytics suites remain in use.

## Exact destructive scopes

| Action | Deletes / changes | Always preserves |
|---|---|---|
| Reset team lineup | Selects a sensible 4-4-2 XI/bench from that club's existing players; changes template selection/coordinates only | IDs, names, faces, nationality, player rating/stat/injury/generated fields, all recorded match lineups and events, trophies |
| Reset current league season | Only fixtures/results/progress with the selected league's ACTIVE season ID; table derives back to zero | League membership, clubs, squads, previous editions/awards and other competitions |
| Delete selected league matches | Only matches matching BOTH league ID AND selected season ID | Every other match; archived final standings and awards even when archived evidence is deleted |
| Start new season | Adds a new ID and fixtures after the previous edition completes | Entire previous season, its matches, final table, champion and runner-up |
| Reset current cup | Only the unfinished cup edition's draw/bracket/fixtures/results | Cup definition/badge, previous editions and all squads/awards |
| Reset current tournament | Only the unfinished tournament edition's groups/bracket/fixtures/results | Competition definition, completed editions and all squads/awards |
| Delete all matches | All match records and their events, maps, match ratings/statistics; active brackets/groups clear and active standings recalculate | Clubs, players, faces, templates, competition definitions, archived editions/final summaries and trophy records |
| Reset all active competitions | Only unfinished editions' fixtures/results/tables/groups/brackets | Completed editions/history, unrelated friendlies, squads and faces |
| Delete competition history | Archived seasons/editions and trophy records; surviving historical matches are detached from those removed editions | Active competitions, surviving match-level evidence, definitions and squads |
| Reset entire save | All save clubs, players/assignments, matches, competitions, editions, statistics, injuries, history and trophies | Reusable face pool; recovery snapshots |

Lineup reset affects the permanent template for future games. It does not rewrite
past match lineups or clear injuries. A lineup-lock flag prevents an old match
autosave from silently replacing this newly selected template.

## Confirmations

Lineup reset has a normal club-specific confirmation. League/cup/tournament
reset explains its scope. Delete all matches, reset all active competitions and
delete history require a second confirmation. Deleting archived league evidence
also requires a second warning and leaves official awards intact. Entire-save
reset requires the exact typed word `RESET`.

Archived summary data is separate from match-level evidence. Deleting evidence
removes derived career/H2H/match statistics; it does not invent replacement
events, maps or appearances. Trophy counts remain until Delete Competition
History is explicitly chosen.

## Operational notes

- Use **Competitions → league → Generate season fixtures** for the complete
  matches-per-team schedule. Odd club counts need an even target. Weekly
  matchdays prevent clubs playing twice in the same round. The older **Generate
  10 fixtures** button still adds ten games in total to the active season.
- New seasons retain membership and create fresh fixtures without deleting old
  ones. Edit dates/kickoffs in the existing Match editor.
- A manually entered knockout draw cannot qualify a club. Simulate the game to
  resolve extra time/penalties through the existing engine.
- Recovery snapshots stay on this browser/device. Download Save is the portable
  backup; recovery snapshots are not recursively included in exported JSON.
- Browser screenshot QA was attempted but the browser-control runtime failed to
  initialize (kernel asset path error). DOM and model tests do not replace visual
  screenshot verification.

## League deletion

Delete selected league is available in the league editor and Settings, including
when there is just one league. It removes that league from active directories
and selectors, retires its unfinished season, and keeps clubs, players, matches
and completed trophies. A read-only historical definition preserves old IDs and
source names through save/load. The operation creates a recovery snapshot first.
Deleting league matches remains a separate season-specific action.

## Shared fixture calendar

All generated league, cup and tournament games use the same club/date availability
check, including the older Generate 10 fixtures button. A clash with any stored
match (finished, live or upcoming), or another game being generated in the same
batch, shifts the new fixture to the first day both clubs are free. Existing match
dates stay unchanged. Later knockout rounds and league matchdays stay after the
preceding round even when earlier games have moved. Different clubs can still
play on the same date. Run `node test-fixture-dates.cjs` for cross-competition
scheduling, round progression, calendar boundaries and reload coverage.


Section 17 lifecycle supersedes automatic league archival: league fixtures can finish while the edition remains active/ready. Only FINISH LEAGUE freezes standings and awards the existing single season history record. Cup/tournament final advancement still archives automatically. Full-league simulation runs the shared engine on non-FT matches, yields between fixtures for progress, and keeps stored FT evidence intact. See README and test-section17.cjs for live profile/snapshot/season checks.
