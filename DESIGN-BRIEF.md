# Implementation prompt

Build a private, offline, mobile football lineup editor closely matching the supplied 809 × 1280 screenshot. Preserve the charcoal background, status bar, circular back/menu controls, central 1–2 scoreboard with team badges, horizontal navigation and selected Lineup tab. Reproduce the cropped pitch geometry, original 4-4-2 player positions, circular portrait crops, names, muted shirt numbers, green/orange ratings, blue player-of-the-match badge, captain marker, goals, assists, substitutions and yellow card.

Wrap the reference-sized composition in a responsive desktop studio with a restrained green-accented editor and a live preview. On narrow screens stack the preview above the editor. Keep the actual lineup visually independent from the surrounding app.

Provide player selection from the pitch and dropdown; editable names, numbers, decimal ratings, goal/assist counts, card colour, substitution minute, captain and player-of-the-match flags. Allow local photo replacement. Provide home/away names, scores, badge uploads, optional names above the score, clock, battery and formation controls. Persist changes locally, support JSON import/export, restore the original, and include a clean screenshot view. Use safe rendering and validate imported data. Ship as buildless HTML/CSS/JavaScript with all assets local.
