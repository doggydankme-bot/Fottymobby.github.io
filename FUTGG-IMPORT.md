# FUT.GG face import: previous project reuse

The previous project is `D:/fc26`. Its actual FUT.GG implementation is
`scripts/import-promos.mjs`: it maps `data` entries using `eaId`,
`basePlayerEaId`, names, `overall`, `gender`, club/nation and image URLs. The old
project stores URLs in JavaScript catalogues. It has no downloaded image cache
in source or dist. Its Gold-specific `scripts/import-gold.mjs` uses WeFUT,
not FUT.GG, and includes women's cards. Those records cannot be blindly copied
into the requested male normal-Gold pool. Cached `api_tots.json` is special TOTS
data and is rejected.

This project's `futgg-face-model.js` adapts the existing FUT.GG item mapping to a
local head manifest and the existing permanent `faceId` / `photo` system.
`futgg-face-ui.js` extends the existing import UI, generator, permanent bench and
Random Real Face controls. There is no second player system or avatar fallback.

## Current status

**Gold player face library unavailable.** No 100-head FUT.GG cache was found or
downloaded. `futgg-face-library.js` deliberately contains an empty unavailable
state, rather than pretending that unrelated portraits are FUT.GG cutouts.
Existing assigned player images and the previously cached portraits are retained.
To use that older pack explicitly, select Existing local face pack. FUT.GG is the
default source for new assignments; it stops with a clear message if unavailable.

FUT.GG's current [terms](https://stormstrike.gg/terms) restrict automated access
except where expressly permitted, and its [robots rules](https://www.fut.gg/robots.txt)
disallow `/api/*`. The old importer itself does not contain evidence of special
access permission. No authentication/access protections were bypassed and no
new automated site requests are made by this adapter.

## Import a permitted local export

Use Clubs → Import FUT.GG local export. JSON contains `data` (the prior
importer's FUT.GG player records) and `heads` (the separately supplied actual
head layers). Each head specifies:

```json
{"sourcePlayerId":"209331","kind":"head","headOnly":true,"photo":"data:image/png;base64,..."}
```

For a permanent 100-file project cache, `heads` may instead specify `file`, a
PNG path relative to a local folder. Run:

```powershell
node import-futgg-gold.cjs C:/path/permitted-export.json C:/path/heads
```

The builder requires 100 distinct eligible images before writing. It stores PNGs,
manifest and an importable face-pack JSON under `public/player-faces/futgg-gold/`
and packages an embedded local bundle. Refresh then installs those heads into the
existing saved face pool without changing assigned player faces. It never fetches
image URLs. Existing local face-pack/folder imports remain available.

Eligibility requires FUT.GG gender 1 plus a non-women's club, 75+ overall,
ordinary Rare/Common rarity EA ID 1/0, `isSpecial: false`, no evolution/icon club,
and a base item whose `eaId` equals `basePlayerEaId`. This rejects special-card
photos even if their real player also owns a normal Gold item. Head layers must
be supplied separately; full-card/social/card-layer URLs are never downloaded or
used as a face. Pixel identity/head-only content cannot be inferred just from a
PNG header: the exporter must supply the genuine player layer and the preview
allows checking it.

New FUT.GG squads never reuse an assigned face ID within that squad; an exhausted
pool produces an error. Names/nationalities stay fictional and independent.
REPLACE GENERATED FACES WITH GOLD FACES uses the existing guarded migration,
preserving manual/valid real faces, player IDs, match events, statistics, heatmaps
and trophies. It refuses to run when the selected source is unavailable.
