# Lineup Studio

## Clubs and match library

- **Clubs:** create a club with a name and optional badge. It remains available in the Match panel.
- **Match:** choose home/away clubs, set the date, competition and status, and edit the scoreboard. Changes save automatically. “Create a new match” preserves the current match and starts a separate record with the selected clubs and their saved squads. Choose different clubs from the selectors as needed.
- **Player:** use “Editing team” or the team buttons above the pitch to switch sides. Each team has its own players, ratings, events and formation. The original screenshot lineup migrates to the away team; the other team starts with editable placeholders.
- Click either scoreboard badge or a club in the club list to open its mobile homepage. Overview shows form and recent results; Matches shows its history; Squad shows saved players. Click any match row to reopen that match.
- The back arrow on the lineup opens the complete match library.
- **Project:** download the entire library as JSON. Importing adds clubs and matches without deleting existing records. The original single-lineup JSON format is also supported. Reset affects only the active team.

Club names and badges are shared. Match scores and player statistics remain separate per match. Newly created matches reuse the club's saved squad but reset performance statistics. All data stays in this browser; there is no live-score feed or account sync. Download a backup before clearing browser storage. Different browser origins (including opening the HTML file directly versus using localhost) have separate storage.

Mobile page references: [FotMob](https://www.fotmob.com/download) and the [FotMob mobile UI walkthrough](https://assets.nextleap.app/submissions/Fotmob-NewuserOnboarding-9d78951b-6ab5-4bd8-9840-b838a8b915da.pdf), particularly the team overview and form screen. The new screens adapt those patterns to the local editor.

Validation: `node test-model.cjs` checks migration, library serialization, independent squads, match resets, card preservation and invalid club references. Browser checks covered team switching, reload persistence, club creation, a second match, club history and reopening the first match unchanged.

Open `index.html` in your browser. No installation, internet connection, or account is needed.

Select a player on the pitch or in the dropdown. Edit names, numbers, ratings, goals, assists, cards, substitutions, captain and player of the match. Use Match for scores, team names, uploaded badges, formations, time and battery. Photos and badges are processed locally.

Edits save in this browser's local storage. Project provides JSON backup/import and reset. Browser storage can be cleared, so download a backup for anything you want to retain. Clean view hides controls; Escape returns to the editor. Use your normal screenshot tool to capture it.

The original composition is reproduced on an 809 × 1280 canvas and scaled responsively. Player portraits use an Imagegen-cleaned source with the original baked-in ratings and badges removed. Goal, assist and substitution symbols are separately clipped from the original screenshot, while the missed-penalty icon uses the supplied reference. Missed penalties support editable counts, local saving and project import/export. Up to three contribution types are spaced independently around the bottom of each portrait. Team badges still use the original reference. Some system icons and font rendering approximate the screenshot. This is a personal local recreation, not an official FotMob product.
