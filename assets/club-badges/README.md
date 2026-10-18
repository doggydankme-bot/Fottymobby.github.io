# Local club badge library

Import badge images or a JSON pack from Club Badge → Select Badge → Import badges. Use images you are permitted to store. No external website is scraped or downloaded.

Folder convention: `Country/League/Club.png`, for example `England/Premier Division/My Badge.png`. Country presets cover England, Spain, Germany, Italy, France, Portugal, Netherlands and Scotland; custom countries also work.

The local server caches imported image bytes here using a SHA-256 filename and records clubName, country, league, badgeId, assetPath and source information in manifest.json. The save also embeds each image so importing/exporting your football save remains portable. Selecting a badge never renames the custom club.

A JSON pack can contain `{ "badges": [{ "clubName": "My badge", "country": "England", "league": "Premier Division", "image": "data:image/png;base64,..." }] }`. Instead of image, `file` may refer to an image selected in the same imported folder. Download a badge pack from the selector to reuse or back up your catalogue.
