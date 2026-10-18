# 85 locally cached real male Gold-level footballer heads

`manifest.json` indexes all PNG files, source IDs, nationality, EA rating evidence and male classification, Wikidata identity, image source, licence, author, edits and SHA-256. `credits.html` is the illustrated attribution page; `credits.json` is a compact machine-readable version. The app uses `bundled-face-library.js` generated from these exact PNGs, so future matches do not need external image requests.

Gold eligibility follows EA's documented 75+ overall rule. EA supplies rating/men's-football facts only; the images are separately licensed Wikimedia Commons photographs. The offline `eligibility-audit.json` retains selected source facts from the build. Every image's individual licence applies to its derivative PNG. Retain author/source/licence and edit notices when sharing. Head cropping, resizing, palette optimisation and circular alpha processing changed source pixels without synthesizing face features. Circular portraits may retain small areas of the original photograph background. No affiliation or endorsement is implied.

The separate one-time build scripts are documented in the project README. The normal website never runs the downloader or contacts the source APIs. The final contact sheets were visually checked before inclusion.
