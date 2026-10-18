# Lineup Studio

## 196 external Gold player images — enabled

Expanded by 96 additional male Gold faces, retaining all earlier IDs and URLs.

The generator now defaults to **196 external Gold head images · WeFUT**, using
196 distinct male normal-Gold head URLs from the existing `D:/fc26` Gold catalogue.
All 196 image endpoints returned HTTP 200 with image content types when checked.
`external-gold-faces.js` and `public/player-faces/gold/external-manifest.json`
contain the actual URLs and source metadata. Male player IDs were cross-checked
against the existing EA men's-football data. These links are WeFUT assets; the
separate FUT.GG source/import option retains its own status below.

External photos load directly from the image host and need an internet connection.
The same URL and face ID are saved permanently across squads, matches and reloads;
new XI/bench players get distinct faces within their club. Existing player photos
are preserved. Random Real Face and the guarded generated-face replacement button
use this source by default. Embedded/local face-pack options remain available.

Run `node test-external-gold.cjs` for the 196-link manifest, default source,
unique XI/bench assignment and save/reload checks.

## FUT.GG normal-Gold source status

FUT.GG remains a separate optional source. **Gold player face
library unavailable** currently means no qualifying FUT.GG head export is
installed; the previous `D:/fc26` project contains remote asset references, not a
local head cache. The app does not claim that the older 85 Commons portraits are
FUT.GG cutouts. They remain preserved in saves and can be explicitly selected
under Existing local face pack.

The new local-export adapter reuses the previous project's FUT.GG player mapping
with male/non-special base-Gold filtering and a head-only manifest. Clubs accepts
permitted local FUT.GG player/head JSON. `import-futgg-gold.cjs` can package 100
supplied local PNG heads for the project; it makes no network requests and stops
without changing the cache if 100 eligible distinct heads are unavailable.
[See FUTGG-IMPORT.md](FUTGG-IMPORT.md) for the exact previous-code findings, source
status, import format and command. `node test-futgg-faces.cjs` checks filtering,
unavailable behavior, local import, no-repeat squads and permanent assignments.

## Seasons, competitions, trophies and recovery

Refresh the app to load **Competitions** and **Settings** in the main navigation.
Existing saved leagues migrate to a stable initial season. Create/edit a league's
matches-per-team target, open its competition page, and generate a complete
season schedule. Completed seasons archive their champion, runner-up and final
table; Start New Season keeps that history and creates a fresh season ID.

Competitions also creates knockout cups (2–32 clubs in powers of two) and classic
32-club group/knockout tournaments using the same saved matches and simulator.
Tied knockout simulations continue to 120 minutes and, if needed, recorded
shootouts. Trophy cabinets on club Overview show expandable real season records.

Settings provides separate scoped resets, three automatic recovery snapshots,
Restore Last Backup, Download Save and Load Save. Archived trophies survive
ordinary resets and match deletion. Full-save reset requires typing RESET. It
leaves an actually empty world; create clubs or load/restore a save to begin again.

See [COMPETITION-ROADMAP.md](COMPETITION-ROADMAP.md) for the nine build phases,
exact reset matrix, confirmation levels, data relationships and verification.
Run `node test-competitions.cjs`, `node test-knockout.cjs` and
`node test-storage.cjs` for the new lifecycle, same-engine knockout and atomic
recovery checks. Existing regression suites also pass. Browser screenshot QA
remains unavailable because the browser-control runtime cannot initialize.

## Bundled real player heads

The project includes **85 real male Gold-level footballer heads**, ready to use without importing a pack. Images live in `public/player-faces/gold/`; `manifest.json` records source player IDs, nationality, rating evidence, creators, licences, crop details and hashes. Open `/public/player-faces/gold/credits.html` for the illustrated per-image credits.

Eligibility uses EA's explicit Men's Football field and documented Gold rule (overall 75+), with Wikidata male/human/footballer identity checks. Portraits come through Wikimedia APIs from individually reusable Commons photographs, not EA card artwork. Cropping, resizing, palette optimisation and circular alpha edges process actual source pixels; no synthesized faces are used. Source photographs can retain a little background inside the circular head crop.

At startup the local embedded bundle merges into the saved face pool without changing existing player assignments. Generated XI/bench players and Random Real Face use this local pool. Their fictional names and nationalities remain independent of the real-player metadata. Face IDs and photos remain saved with the player across lineups, profiles, substitutions, future fixtures and reloads. No external database/image requests happen during normal app use. Existing import controls remain available for additional licensed local packs.

Under Permanent club squad, **Replace Generated Faces With Real Faces** explicitly replaces only generated empty/placeholder/recognised legacy heads. It preserves manual uploads, manually created players and valid assigned real heads. Matching old generated face assignments in saved lineups update too; identity, nationality, ratings, stats and match events stay unchanged. Unrecognised old images are conservatively preserved. Storage failures restore prior assignments.

The source build is a separate, optional maintenance step: `node build-face-library.cjs` queries the public source APIs once and caches their responses/downloads, respecting rate limits; `prepare-face-library.py` makes and indexes visually checked crops using Pillow and OpenCV 4.12; `node package-face-library.cjs` validates local hashes and builds the offline bundle and credits. None runs on app startup. The completed library is already included; there is no need to rebuild it. Do not redistribute derivatives without retaining each image's applicable attribution/licence.

Validation: `node test-bundled-faces.cjs` checks all 85 local image signatures/dimensions/hashes and source metadata, offline automatic availability, generated XI/bench uniqueness, independent nationality, permanent reload/import assignments, guarded migration and failure rollback. `node test-real-faces.cjs` covers imported-pack compatibility and all no-fallback paths. The contact sheets were visually inspected. Browser screenshot QA remains unavailable because the browser-control runtime fails during initialization.

## Movement-based heatmaps

Heatmaps now use a shared continuous world-coordinate model in match-movement.js. Player roles (CB, fullback, CDM, CM, CAM, winger, striker, GK) influence probabilistic destinations; only the pitch boundary limits movement. Saved internal individual styles change dropping deep, roaming, forward runs and width, with no visible Player Traits section. Score, late match tactics and recorded possession affect destinations. Passes begin at the ballholder's position and end at the recorded reception; carries record their actual endpoints. Shooting chances progress through recorded passes/carries and the final ball position becomes the shot origin. Defensive blocks and goalkeeper saves contribute their exact recorded contact points. All maps use home +X / away -X without an independent heatmap flip.

Every new touch is a single recorded action with a coordinate. The player card's touch total equals its heatmap point count and summed density weight. Off-ball running is maintained as movement state and is never mislabelled as a touch. Substitutes start collecting points after entry; removed, dismissed or seriously injured players stop collecting them. Movement state, behavioural variation and random seed survive paused-save reloads, giving deterministic continuation.

heat-density.js estimates a Gaussian kernel density field from recorded points and draws interpolated, softened contours. Nearby contacts blend into natural hot spots; no role rectangles or post-match random positions are painted. Cached compact contours keep live rendering manageable. Completed older matches retain their actual stored positions and show a legacy-data note. Start a new simulation for fully movement-based heatmaps.

Validation: node test-real-faces.cjs checks all no-fallback paths, empty-pool blocking without partial squads, face metadata filtering, uniqueness, folder indexing, explicit legacy-face repair, permanent assignments and failure rollback. node test-movement-density.cjs checks role/state/style tendencies across 25 seeded matches, pitch coverage, exact pass/shot/block/save coordinate agreement, touch-density mass, participation boundaries and deterministic reload continuation. Existing library, player-map, generator, analytics, timer/storage and 500-match engine checks also pass. The browser automation runtime still fails during initialization (kernel asset path not found), so visual screenshot verification was unavailable.

## Advanced simulation and working match tabs

The existing simulator now records a single detailed event stream. Goals are shot events with a goal outcome; misses, saves and blocks are shot events with their own outcomes. Each attempt records its player/team/minute, normalized full-pitch world coordinates, distance, body part, situation, result, modelled xG and (for on-target shots) xGOT, and goal-target coordinates. Score and player contributions update during creation of that same event. Commentary and match statistics read those events instead of inventing a second set of outcomes. xG and xGOT are estimates from this local simulation model, not official FotMob data.

- **Penalties:** attempts are explicitly labelled Penalty in the timeline/commentary and shot details. Penalty goals count toward goals and penalty goals. Saved/wide attempts count as missed penalties. Player profiles also show penalty attempts, penalty goals, saves and recorded injuries.
- **Boost:** use the Normal/Boosted controls for either team before or during a simulation. The temporary advantage adds 1.5 team strength, increases chance creation by 35% and finishing by 40%, and reduces opposing finishing by 15%. It is applied by the engine at kickoff and also works when switched during play; it does not set the score. Turning it off removes the advantage for subsequent play.
- **Injuries:** uncommon minor/serious injuries are stored as events and shown with a white/red cross beside the player. Minor injuries reduce effectiveness; serious injuries stop participation until replacement. Minor and serious injuries trigger automatic replacement when a healthy compatible reserve and substitution remain, including injured incoming substitutes and with tactical AI disabled. Serious injuries take priority. Manual substitution still takes priority while its picker is open.
- **Generate Bench:** click it under either match bench or in a club's Squad page. It fills up to seven reserves with sensible role coverage, editable names/numbers/strengths and embedded real male Gold head images from the saved face pool. Import Face Pack in Clubs before generation if the pool is empty. Existing reserves are kept. It runs only on a button click and saves normal club/player records. It is disabled for either team in an active simulation.
- **Grab Random Face:** available in the player editor and reserve form. It selects a real male Gold head from the saved face pool and stores the face ID and image with the player. Empty pools show an Import Face Pack message. No scraping, hotlinks, external photo services or network calls are used. Uploaded images can still replace it.
- **Formations:** 4-4-2, 4-3-3, 4-2-3-1, 4-1-4-1, 4-3-2-1, 4-5-1, 3-5-2, 3-4-3, 3-4-2-1, 5-3-2 and 5-4-1 are supported. Each has real row coordinates and affects attacking/defensive balance in the engine.
- **Commentary:** appears in a right-hand desktop panel and the phone's Commentary tab. On narrow screens the side panel moves beneath the preview. Passing, shots, placement, goals, saves, corners, fouls, cards, penalties, injuries and substitutions are descriptions of stored events.
- **Table:** uses the match's assigned league or another league containing both clubs; the dropdown switches between applicable leagues. Live results do not count until FT.
- **Stats:** displays event-derived possession, shots, on/off-target and blocked shots, big chances, corners, fouls, cards, penalties, xG/xGOT, saves and injuries. The interactive shot map has distinct team colours and goal/save/miss/block markers. Click a marker or use previous/next to inspect that attempt. The goal graphic and commentary use the same recorded target. Home attacks right; away attacks left in the same stored world-coordinate system.
- **H2H:** shows other saved completed meetings on or before the selected match's date and a summary of the latest five. It never fabricates old results.

Older saved matches remain usable; they can only show the detailed shot statistics that were actually recorded. New simulation fields are retained by IndexedDB, JSON backup/import and paused-match reload. `node test-advanced.cjs` checks generated benches, formations, views, event/stat/score consistency, shot navigation, saved-state preservation, injury indicators, and probabilistic boost effects. Existing engine/timer/storage/integration suites continue to cover regression behaviour. Final visual browser QA remains unavailable because the browser-control runtime could not start.

## Match simulator and benches

Open a match and scroll below the preview, or click **Match simulator & benches** in the Match panel. Add reserves for each team with **Bench → Add**; set their name, shirt number, position, starting strength and optional face. A reserve's historical average is used when available. Empty benches are supported, but substitutions require reserves.

Press **Start Simulation** to run the existing match from 0 to 90 minutes. Simulating a match that already has a result asks before replacing that result. Speeds are 1×, 2×, 3×, 5× and 10×; one virtual minute takes one second at 1×, so the default 3× lasts roughly 30 seconds plus the half-time break. Pause and Resume work at any time. At 45 minutes the match pauses at HT; press **Start second half**. At 90 minutes it stops at FT.

The seeded engine weights team strength from player histories, initial XI ratings, positions, goals/assists, recent results and bench strength. Current performance and dismissals change strength during play. Outcomes retain randomness. Goals, assists, chances, cards, substitutions and period markers appear only when the relevant minute is reached. Not every goal has an assist. Live match ratings change with contributions, discipline and team results.

Click **View live timeline** or the mobile **Commentary** tab for the event feed; **Lineup** returns to the pitch. Click an active starting player during the simulation to choose exactly which unused reserve comes on, then press **Substitute**. The selected team's AI waits while that picker is open. Each side may make up to five substitutions; sent-off players cannot be replaced and used reserves cannot re-enter. AI substitutions are individually switchable for home and away and use position, score, time, performance and reserve strength.

The same match record stores its final result, per-player statistics/ratings, actual minutes, original starting-player IDs, original bench IDs, participants who went off and the full timeline. The club's original XI and bench remain its squad template for subsequent fixtures. Simulation appearances count toward profiles, averages, Best XI and club totals only at FT; unused reserves never count. League tables and form use the completed result as usual. Minutes for simulated participants are exact virtual minutes rather than the manual-match 90-minute assumption.

Opening another match pauses the current simulation. Reloaded simulations reopen paused at their saved minute, with their existing event feed and substitution state. A single cancellable timer controls the clock; changing speed never advances a minute on its own. Re-simulating asks before replacing the current match and restores the club's starting squad.

Verification: `node test-simulator.cjs` covers the engine, 500 seeded matches, scoring/card rates, underdog outcomes, HT/FT, manual/AI substitutions, actual minutes and shared statistics. `node test-simulator-ui.cjs` covers bench forms, timer cancellation on speed changes, pause/resume, manual selection, saved halftime reload, final participants and new-match templates using the DOM test environment. Visual browser QA was unavailable during implementation.

## Storage

Libraries now use IndexedDB rather than the small localStorage quota. Startup loads IndexedDB before enabling the editor and automatically migrates an existing version-2 localStorage library when no IndexedDB save exists. The old copy is retained as a migration backup. Imports and generated fixtures wait for their storage transaction to complete before replacing in-memory state; failed writes preserve the previous library. Autosaves are queued in order. JSON backups and the import confirmation still work as before.

Run `node test-storage.cjs` to verify migration, an 8 MB save, reopening, write order and failed-write preservation. This test uses the QA dependencies (`npm install --prefix .qa --no-package-lock --no-save linkedom fake-indexeddb`). If an old tab is still open after this update, refresh it before continuing to edit.

## Club analytics, player pages and leagues

**Generate fixtures:** after saving a league with at least two member clubs, click “Generate 10 fixtures” in the league manager or its club Stats view. Each click adds 10 upcoming matches in total with saved squads, reset player events and zero scores. Home/away pairings rotate using a round-robin schedule (with byes for odd club counts); smaller leagues repeat the cycle as needed. Matchdays are one week apart, and subsequent batches follow the existing league schedule. Open any generated fixture to edit its date, lineups and result. Upcoming games do not count toward ratings or standings. Existing matches are preserved.

Club pages now include a **Switch club** selector. Overview shows a Best XI directly below team form: it ranks players by their average across recorded matches (including live matches; upcoming fixtures are excluded), selects the highest-rated players within each position, and uses the club's saved formation. Empty positions remain visible rather than putting a player into the wrong role. Set a player's position using the new Position selector in the existing player editor. Faces reuse the existing uploaded photos or reference portrait crops.

The club formation and player match cards display goals, assists and missed penalties in fixed compact counters, so large totals cannot expand the cards. The match editor's existing icon stacks remain available. The missed-penalty indicator starts further to the right of the portrait. Red rating numbers are black.

**Squad:** click a player or a Best XI portrait to open Profile, Matches, Stats and Career. All figures come from saved lineups. These screens include appearances, average rating, goals, assists, missed penalties, cards, estimated minutes, goalkeeper clean sheets and player-of-the-match awards. They do not include Player Traits. Minutes are capped at 90 using the recorded substitution time, or 90 when no substitution is recorded. A second-yellow dismissal contributes two yellow cards and one red card. Career rows group recorded matches by club, competition and season (or calendar year when no league season is assigned).

**Leagues:** use Clubs → Leagues to create or edit a league, set a season, and check its member clubs. Uncheck members and save to remove them. Open a club's Stats tab to switch between all saved leagues and view standings. Tables use completed matches, award 3 points for wins and 1 for draws, and sort by points, goal difference and goals scored. Clubs without matches remain in the table on zero points. By default, unassigned completed matches between member clubs count. Use the Match panel's League selector to assign a fixture to a particular league; assigned fixtures are excluded from other leagues. Both teams must belong to the selected league. Upcoming and live matches do not affect tables.

The existing version-2 library is extended with optional leagues, stable player IDs and positions. Old projects migrate in place. Backups include these new fields. Loading a save validates the file, shows a confirmation warning and replaces the entire current library, preserving the save's IDs and active match. Cancel, invalid files and storage failures leave the current library intact. Renaming a player keeps their recorded history linked.

Additional verification: `node test-analytics.cjs` checks the statistics and standings. `node test-integration.cjs` exercises the app with a DOM simulator and requires the QA dependency (`npm install --prefix .qa --no-package-lock --no-save linkedom`). This is not a browser screenshot test.

## Clubs and match library

- **Clubs:** create a club with a name and optional badge. It remains available in the Match panel.
- **Match:** choose home/away clubs, set the date, competition and status, and edit the scoreboard. Changes save automatically. “Create a new match” preserves the current match and starts a separate record with the selected clubs and their saved squads. Choose different clubs from the selectors as needed.
- **Player:** use “Editing team” or the team buttons above the pitch to switch sides. Each team has its own players, ratings, events and formation. The original screenshot lineup migrates to the away team; the other team starts with editable placeholders.
- Click either scoreboard badge or a club in the club list to open its mobile homepage. Overview shows form and recent results; Matches shows its history; Squad shows saved players. Click any match row to reopen that match.
- The back arrow on the lineup opens the complete match library.
- **Project:** download the entire library as JSON. “Load saved library” replaces all current clubs, players, matches and leagues after a confirmation warning. Download a backup first to retain the current library. The original single-lineup JSON format is also supported. Reset affects only the active team.

Club names and badges are shared. Match scores and player statistics remain separate per match. Newly created matches reuse the club's saved squad but reset performance statistics. All data stays in this browser; there is no live-score feed or account sync. Download a backup before clearing browser storage. Different browser origins (including opening the HTML file directly versus using localhost) have separate storage.

Mobile page references: [FotMob](https://www.fotmob.com/download) and the [FotMob mobile UI walkthrough](https://assets.nextleap.app/submissions/Fotmob-NewuserOnboarding-9d78951b-6ab5-4bd8-9840-b838a8b915da.pdf), particularly the team overview and form screen. The new screens adapt those patterns to the local editor.

Validation: `node test-model.cjs` checks migration, library serialization, independent squads, match resets, card preservation and invalid club references. Browser checks covered team switching, reload persistence, club creation, a second match, club history and reopening the first match unchanged.

Open `index.html` in your browser. No installation, internet connection, or account is needed.

Select a player on the pitch or in the dropdown. Edit names, numbers, ratings, goals, assists, cards, substitutions, captain and player of the match. Use Match for scores, team names, uploaded badges, formations, time and battery. Photos and badges are processed locally.

Edits save in this browser's local storage. Project provides JSON backup/import and reset. Browser storage can be cleared, so download a backup for anything you want to retain. Clean view hides controls; Escape returns to the editor. Use your normal screenshot tool to capture it.

The original composition is reproduced on an 809 × 1280 canvas and scaled responsively. Player portraits use an Imagegen-cleaned source with the original baked-in ratings and badges removed. Goal, assist and substitution symbols are separately clipped from the original screenshot, while the missed-penalty icon uses the supplied reference. Missed penalties support editable counts, local saving and project import/export. Up to three contribution types are spaced independently around the bottom of each portrait. Team badges still use the original reference. Some system icons and font rendering approximate the screenshot. This is a personal local recreation, not an official FotMob product.

## Date-based Home and smarter simulation

The app opens on Home, showing today in the Europe/London timezone. Use the seven-day strip, arrows, calendar or Today button to change dates. Matches are grouped by competition; headers collapse and show the league logo/category when stored. Upcoming fixtures show kickoff, simulations show LIVE with minute and score, halftime shows HT, and completed results show FT. Every row opens the existing match page. An active simulation continues updating while Home is open; reopening that same match keeps its timer running. Opening a different match pauses it as before.

Use the main Home / Clubs / Leagues / Matches navigation. Star clubs in Clubs to move their competitions and matches upward without duplicating fixtures. Create Match from Home schedules the selected date; edit the date, kickoff, clubs and league in the existing Match panel. All views, league tables and profiles read the same saved match records. Leagues can also store a category and uploaded logo. Favourites, kickoff and league metadata survive save/export/import.

AI substitution choices compare current performance, historical average, recent form, goals/assists, importance, cards and available positional replacements. Strong contributors are protected from unnecessary downgrades. Injuries can override that protection, including injuries to players who came off the bench. Serious injuries stop normal participation until replacement; manual substitutions remain available. Generated benches use the starting squad's historical quality, include positional coverage and saved real-pool head images, and remain editable.

The shot map draws stored trajectories for goals, saves and misses. Blocked trajectories end at their recorded block point and name the recorded blocker in commentary. Origins, targets and block locations survive saves and drive the same shot events used by statistics. Older saves use their stored target when possible; legacy blocked shots without a block location do not invent a trajectory.

Verification: node test-match-centre.cjs covers date/timezone handling, shared-match navigation, states, grouping, favourites, scheduling, persistence and live Home updates. node test-smart-subs-paths.cjs checks protected stars, appropriate replacements, injury overrides and 220 seeded matches for consistent shot paths, block commentary and injury participation. Existing simulator and integration suites also pass. Browser screenshot verification was unavailable because the browser automation runtime could not start.

## Live player cards, heatmaps and two-team shots

Home attacks right and away attacks left on the shot map. New shot events store their actual pitch origin, target, block point and attacking direction. Loading an older library migrates its away-team shot coordinates once; repeated reloads preserve the corrected coordinates. Both penalty areas are visible, and colours/direction labels identify the teams.

During or after a simulation, click a formation player's face, name or rating to open their player menu. Choose Open Stats for the match sheet, or Substitute player to use the existing manual substitution controls. The Stats tab also lists all players who appeared, including those substituted off. The sheet stays over the match and updates with the same timer. It includes the existing face, badge, live rating and position, and country/age when stored. No Player Traits are included.

New simulations record continuous player movement state and individual ball-contact actions for active players. Touches, passes, accurate passes, possession losses, tackles, interceptions and clearances are derived from those saved actions. Heatmaps aggregate their stored pitch positions and touch weights. Substitutes receive activity only after entering; players who leave, are dismissed or cannot continue receive no further activity. These are simulated football actions, not tracking data from real matches. Previously completed matches have no retroactively generated activity; the sheet explains when heatmap data is unavailable.

Shots, goals, assists, chances/key passes, blocks, goalkeeper saves, cards and penalties reuse the same shot and match events. Highlights compare these figures across participants and identify joint leaders. Negative highlights require recorded errors, missed penalties, conceded penalties or red cards. Mistakes link to the shot they caused, with goal/penalty consequences agreeing with commentary and rating deductions. Small passing/defensive contributions have small rating effects.

Both the mobile Commentary view and desktop feed offer All / Major Events using the same saved list. All includes recorded activity, with Show older events to keep the initial page manageable. Major Events shows goals, penalties, cards, injuries, substitutions, big chances/saves, serious errors and halftime/fulltime. FT saves retain the complete event list, live statistics and deterministic highlights.

Validation: node test-live-players.cjs verifies stored directions and idempotent migration, clicking formation/menu/stats controls, live updates without generating data on opening, substitute participation boundaries, FT/reload equality, linked errors, highlight ties, negative highlights and commentary filtering. Existing simulator, advanced-match, simulator-UI, match-centre and smart-substitution suites pass. A visual screenshot check was blocked by the computer-use runtime failing to initialize (kernel asset path not found).

## Individual shot maps and goalkeeper save maps

Player menu > Open Stats now includes Shots for outfield players. The compact pitch contains only that player's recorded attempts, with goal/saved/miss/blocked markers, the stored trajectories, and live totals for shots, shots on target, goals and xG. Select a marker to see the minute, outcome, pitch origin, direction/end point, body part, situation, xG, applicable xGOT, assister and blocker when recorded. Goals/saves also show their recorded aim on a front-facing goal. Blocked paths stop at the saved block point.

Goalkeepers instead lead with a front-facing Goalkeeper shot / save map. Green markers are saves, footballs are goals conceded, and yellow markers are penalty saves. All on-target attempts are selected by the keeperId saved on the original shot, including when keepers are substituted. Misses and blocked attempts count among shots faced but are not plotted as on-target goal markers. Totals include saves, goals conceded, shots/on-target shots faced, save percentage, penalties faced/saved, clean sheet, passing and rating. Save percentage is zero when no on-target shots have been faced. Clean sheets are confirmed at FT; a live shutout is Pending. Unsimulated catches/claims are not invented.

Keeper highlights use those same events: saves made, leading save counts (including ties), big-chance saves, penalty saves, FT clean sheets and low-xG goals conceded (below 0.10 xG), plus existing error highlights. Clicking either individual map selects the same shot on the main match map. View on match shot map closes the sheet and opens that shot in the existing Stats view. Refreshes and reopens retain the event's exact geometry; opening a view creates no match data. Older shots without a saved target count in totals but have no invented goal marker.

Run node test-player-shot-maps.cjs for focused checks of player-only filtering, summary totals, stored block endpoints/goal coordinates, selection/details, keeper substitution attribution, keeper highlights, zero-shot percentage, live updates, FT persistence and missing legacy targets. The existing player and integration suites also pass. Visual browser verification remains unavailable due to the previously reported automation-runtime initialization error.

## Full fictional team generator and permanent club squads

Open Clubs > Create club, enter a name, choose Country / Base Nation, formation and squad quality, then press Generate Team. This saves 11 starters and seven normal substitutes directly into the existing club library. The starting roles follow the selected formation; reserves cover GK, two defenders, two midfielders and two forwards. Nationality mixes vary, with a majority from the club country and weighted regional/international selections. Names come from nationality-specific pools. The country/name/region tables live in team-generator-model.js and can be extended there.

Faces default to Imported male Gold head images. Use the face-pack importer once to select multiple local head-image files, or a JSON file with a faces array. JSON entries contain id, name, photo (embedded data:image/...;base64), gender: male, tier: gold and kind: head. Women/Silver/Bronze/manager/badge-labelled entries are excluded. Plain image imports are user-labelled: the app cannot determine card tier or gender from pixels, so select only the requested male Gold heads. No automatic scraping or remote image links are used. Generation and Random Face require this real head-image pool. There is no avatar alternative or fallback.

The pool supports up to 500 embedded heads. Image files are resized locally to a maximum of 192 pixels. Identical images are deduplicated on import. Assignment avoids duplicate pool faces inside a club until the pool is exhausted. Import at least 18 distinct heads for a full squad without repeats. Both pool images and each player's assigned photo/face ID are saved and exported. Adding more faces never changes existing assignments. The library import limit is 100 MB for saves containing face packs.

Use Edit permanent squad / starting XI on a club's Squad page, or the Permanent club squad manager in Clubs. Every starter and reserve can have their name, nationality, position, starting quality, age and face edited. Random Face changes only that selected player. Reserves can swap with a starter in the same position. These changes apply to future matches without rewriting recorded lineups or results. Nationality is also editable in the existing match and reserve editors. Change Face uploads and Random Face remain available.

Generated starting quality is stored as baseRating. New fixtures retain that quality instead of resetting all generated players to 6.5. The normal simulator uses historical averages when available and the saved starting quality otherwise. Match ratings, injuries, events and historical statistics remain in the existing match records. Club templates retain their original XI and permanent bench through substitutions and later saves; used substitutes are not regenerated. Reloading, navigating and opening a match never run the generator.

Validation: node test-team-generator.cjs exercises every country pool and several formations, changing weighted mixes, unique identities/names/shirt numbers/faces, face-pack filtering/import/deduplication, complete creation and reload, isolated face edits, reserve promotion, starting quality in the normal simulator, substitute history, later-match identity, template protection when saving older matches, and storage-failure rollback. Existing library, analytics, live-player, shot-map, match-centre, simulator UI and seeded engine tests pass. Visual browser verification remains unavailable because of the previously reported automation-runtime initialization failure.

AI substitutions now protect anyone who came on as a substitute for the rest of
that match, including after reload. Only original starters are eligible for AI
removal; explicit manual replacements remain available. Bench Off badges reflect
actual substitutions, not the offAt time recorded when a serious injury stops
participation. `node test-sub-protection.cjs` checks these protections.

New match ratings start at **6.0** for both starting XIs and substitutes, including previously saved unstarted fixtures. Base ability and recorded form stay separate from the displayed match rating; recent form influences simulated team strength, while events determine the new match rating. Live and completed match ratings remain intact.

**Auto Sim** in the Match simulator panel runs the same minute-by-minute engine straight to FT. It starts an upcoming match or continues a running, paused or half-time match, automatically passing half-time and any knockout extra time/shootout. It keeps selected boosts/AI settings and saves the normal shared result, events and player ratings. Finished results are protected; use Simulate again explicitly to replay one.

Match action ratings: completed passes, carries, successful take-ons, defensive actions and shots on target now earn larger live rating increases. Failed passes/lost possession and wasted high-quality chances retain deductions. Successful dribbles are recorded as their own activity and shown in player stats/commentary; every view reads those same saved events. These changes apply to new simulated actions and do not rewrite historical ratings.

Goalkeeper conceded totals include legacy goal events without shot flags or keeper IDs, resolving missing identity from starting lineups and ordered substitutions. Explicit keeper attribution is preserved. For a single uninterrupted goalkeeper in a completed score-only result, the recorded score supplies missing conceded totals/save percentage; the map reports missing shot details instead of fabricating markers.


Section 17 updates:
- The player sheet updates existing DOM nodes; live heatmap/shot/highlight changes retain the open player, selected shot and internal scroll. Substituted players remain open with OFF time and replacement name.
- Kickoff saves both `simulation.startingLineupSnapshot` objects (formation, XI, IDs, original slots, captain, goalkeeper and faces). Current live lineups continue in `match.data.teams`. At FT the pitch reads the original snapshot with final match statistics; incoming and unused substitutes remain in the bench section. Old saves can recover starters from their own recorded starting IDs/match players, never the current club roster; missing original historical formation changes cannot be invented.
- League pages expose SIM NEXT MATCH, SIM REMAINING MATCHES and SIM FULL LEAGUE. They use `MatchSimulator.complete`, skip every FT result, continue live games, report progress, and fill only missing schedule slots needed for the configured per-team target. Full match events/statistics/snapshots are retained.
- Leagues no longer archive automatically. FINISH LEAGUE validates fixture completion and every club's required games, freezes final standings and creates the single existing champion/runner-up history record. The winner page links to the final table, history and START NEXT SEASON. New season IDs/fixtures preserve players and all prior evidence/trophies.
- Knockouts use normal time, extra time with a 105-minute interval, and a separate alternating shootout (goal/save/miss, early mathematical elimination and sudden death). Shootout kicks remain outside ordinary goals/shots/xG. Home/competition listings show the penalty result separately. Group-stage draws remain FT at 90.
- Shot buildup now carries the player into the box for most chances; recorded touches and shot origins stay identical. The seeded distribution check covers both attacking directions.

Checks: `node test-section17.cjs`, `node test-cup-phases.cjs`, `node test-box-shots.cjs` plus the existing league, timer, save, player-map and movement tests. Browser-control startup still fails in this environment, so scrolling is verified through DOM identity and retained scroll-position tests rather than a visual browser run.


Section 18 mobile browsing:
- A black mobile app shell and safe-area-aware glass navigation provide Matches, News, Leagues, Favourites and Search. Existing management, squad generation, save/download/load and reset controls remain in the management menu. The original match/detail engine and its layout are reused.
- Matches uses the shared selected date/calendar and compact competition sections. Following provides shortcut rows for followed clubs; both rows retain the same match ID. Scores, live minutes, AET and penalty results come from the canonical match.
- Favourites persist as club/player/competition IDs in `library.favourites`; the legacy club favourite flag remains synchronised. The Leagues directory includes only this save's actual leagues, cups and tournaments. Team cards show actual upcoming fixtures or recorded club information.
- Search filters clubs, generated/manual players, competitions and matches from the current save. Typing updates only results, retaining input focus. Recent clicked items and submitted queries are stored in `library.recentSearches`, with individual removal and clear controls.
- `library.news` stores deterministic local match reports and exceptional keeper/serious-injury stories (at most one extra per match), plus champion stories from archived season history. Headline facts derive from actual saved scores, scorers, saves and events; shootout scores remain separate. Existing articles remain stable across reload; editing a source result updates its existing story ID. News dates follow match dates, while season titles use their completion date. For You prioritises followed entities; Latest sorts by fixture date/time.
- News uses saved club badges/player faces and CSS match graphics. It never fetches real-world news, external editorial photos or advertisements. Deleting match evidence leaves stored historical articles readable with no dead Open Match button; deleting trophy history removes championship articles; resetting the entire save clears all browsing metadata too.

`node test-section18.cjs` covers the 15 Section 18 flows, including destination identity, date changes, favourites, typed search, recent history, factual reports and championship stories, personalised ordering and complete save/reload. Browser/computer-use tools still fail during runtime startup in this environment, so visual browser QA remains unavailable.


Section 18F live match view:
- Facts is the default match overview. All six existing match tabs share the larger badge/name/score/clock header. Facts and Commentary include a responsive striped SVG pitch, compact numbered team markers, ball ownership, attacking context and a collapsible field. There are no odds, betting controls or advertisements.
- New simulations use event schema 5: existing canonical events additionally retain matchId, second, eventType and compact position frames indexed by simulation.motionRoster. Pass events expose passer/receiver IDs, source/destination coordinates and completion. Touches, heatmaps, commentary, live stats and shot maps continue using these same records. Old saves remain readable; historical motion is never fabricated.
- Animation interpolates the latest engine minute only, using requestAnimationFrame and recorded event seconds. It respects the selected speed, discards backlog when switching views, stops on pauses/intervals/FT and never advances the engine itself. A shot uses MatchEvents.trajectory, including the exact block endpoint and saved goal target. Auto Sim still uses the existing completion path.
- Scored goals reset actual motion positions and record a conceding-team kick-off. Simulated corners and free kicks place the actual taker, reposition players and record their delivery/reception through the existing activity events. Off-ball movement does not create heatmap touches.
- The Facts card places home/away events on opposite sides, groups incoming/outgoing substitutions, links player names to the existing match stats sheet and stores actual HT/FT score snapshots. Shootout kicks and penalty scores stay separate from normal goals. Five-minute momentum bars derive from recorded pressure, shots/xG, on-target attempts, corners and goals. Match information resolves the fixture's own competition edition and football season.
- DOM patching retains the Facts container, pitch SVG, player sheet and scroll positions; animation frames update SVG transforms and text only.

Checks: node test-live-pitch.cjs covers shared pass/reception/touch data, saves/goals/blocks, restarts/set pieces, marker substitutions, accurate HT scores, frame round-tripping, momentum, stable sheet/SVG/scroll, clickable names and RAF/tab/pause behavior. The browser automation runtime still cannot start on this machine; no screenshot-based visual verification is claimed.


Section 18G player sheets, Stats and team management:
- The supplied 3.57-second video was inspected at ten frames per second. Player clicks now open the match-stat sheet directly. A 320ms slide, dim/blur backdrop, rounded gradient header, pinned scrolled name and sticky X / Profile / Compare actions follow that interaction. Close waits for the transition; the header supports downward drag. Reduced-motion settings shorten the animation.
- The existing player sheet continues morphing mounted nodes. Stable class keys now work in both browsers and DOM tests, including when a highlight disappears. The scroll anchor, active player, heatmap, shot selection and comparison stay intact during updates.
- Match-event schema 6 records real timed movement totals, opponents in dribble/duel events and explicit periods. Physical totals come from actual movement distances/speeds on the 105m by 68m pitch, not random numbers on opening the UI. Substituted/injured/dismissed players stop accumulating. Unsupported aerial duels, throw-ins, offsides and line-breaking passes are not shown. Older partial physical recordings identify their starting minute.
- The existing Shot Map is refined with a charcoal pitch, compact distinct goal/save/miss/block markers and the selected event's real trajectory. All / 1st / 2nd / ET filter that same event list and Top stats together; shootout kicks remain separate. The player's own shots and goalkeeper save map are retained.
- Home/away kit colours are saved on each club, and the selected pair is captured at kick-off on the match. Similar kits use a distinguishable alternate combination, with a neutral fallback only if both clubs' kits still clash. Matching colours appear on shot/stat/momentum/live-player graphics, with readable pill/number text. Historical saved match colours remain unchanged by later club edits.
- Club pages and the permanent manager expose Edit Team and Select Player. Normal clicks open statistics or profiles. Select mode explicitly offers edits, transfers, removals, position/role changes and a second-player swap. Team details include name, short name, country, badge library/upload, kits, formation, future generation range and eligible league membership.
- TeamManager changes permanent rosters and unstarted future fixtures only. Formation changes retain real players, safely bench excess players and leave explicit vacant slots where replacements are needed. Single-player generation reuses the club's country weighting, saved range, face and name libraries. Free agents persist separately; adding a club-owned player invokes the existing transfer system. Permanent deletion asks for confirmation and keeps historical match snapshots readable.
- Existing match data, IDs, careers, current overall/development, badges, national call-ups and persistent reserves remain shared. Changing a club country/range never rerolls or renationalises existing players.

Checks: node test-section18g.cjs plus the complete regression suite. Browser automation still fails during runtime startup on this computer; no browser screenshot verification is claimed.

### Responsive desktop and tablet presentation (18G addendum)

The same pages and live match components now adapt to Mobile (<720px), Tablet (720–1179px), and Desktop (1180px+). Manage → Interface Mode offers Auto (default), Mobile, or Desktop; this browser preference is stored separately from the football save.

Desktop uses top navigation, a match information/events rail, a proportional central pitch/formation, and the existing commentary panel. Stats places the existing period-filtered shot map beside Top stats. On wide monitors the original bench moves beside the formation; narrowing the window moves that same element back. Player match stats slide in from the right and reserve space in the dashboard. Browsing includes date/competition shortcuts, favourites and recorded competition fixtures; news, profiles, career tables, clubs and team management reflow into controlled columns. There are no additional routes, match records, simulations, or generated shot locations.

Validation: `node test-responsive.cjs` checks mode selection at 390, 719, 720, 1024, 1179, 1180, 1366, 1440, 1920 and 2560 pixels; stored overrides; unchanged simulation identity/data on resize; persistent pitch/player nodes and sheet scroll; continued live stats; unchanged shot geometry; retained bench controls and unsaved editing inputs; existing club/league navigation; and CSS parsing. These are DOM/model and stylesheet checks, not rendered screenshot assertions. Browser visual verification was unavailable because the browser-control runtime could not start.

### Route isolation fix

The browsing catalogue used to sit beside an always-mounted match/editor workspace. Its only isolation was a CSS visibility rule, which the new responsive grid rules overrode. The app now has one `#app-route-outlet`: navigation mounts the browsing page, match workspace, independent club page, or management page there and removes the previous view from the document. Facts/Commentary/Lineup/Table/Stats/H2H also mount a single content branch. No route-specific hide rule is needed for the match workspace.

Parked views retain their existing event handlers and controls for the shared simulator and save operations; they are not in the document or page scroll tree. Transaction locks now reference the workspace directly rather than assuming a `<main>` is mounted. Preview captions and the obsolete navigation have been removed from application content. Long player labels are bounded by their actual formation column spacing. Browsing height follows its content rather than reserving an extra near-viewport of space.

`node test-route-shell.cjs` checks all eight browsing routes, mobile and desktop overrides at 390/809/1366/1920px, absence of every match component from the document, exclusive tabs, one navigation/outlet, the actual scheduled simulation callback while navigating, Back, independent club/settings views, save transactions from browsing, and returning to the original lineup. Existing match, simulator, responsive, profile, world, competition, storage and Section 18G checks also pass. Visual browser inspection remains unavailable: the browser-control runtime fails to initialize its kernel assets.
