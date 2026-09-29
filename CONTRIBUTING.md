# Contributing to 12 Axes

Open an issue or pull request for corrections and new features. Keep each pull request focused on one change.

## Before requesting a review

1. Run `mvn test` in `backend/` after backend or catalog changes.
2. Run `npm ci`, `npm test`, and `npm run build` in `frontend/` after frontend or translation changes. The build also generates the static catalog pages.
3. Describe what changed, how you tested it, and any language or catalog entries that still need translation.
4. For translations, check the quiz, results, share text, and generated pages in the new language.

Use a short commit subject such as `feat: add Russian translation` or `fix: correct quiz navigation`. The CI checks behavior and builds; commit subject wording is guidance, not an automated merge requirement.

The `main` branch is intended to receive changes through reviewed pull requests with passing backend and frontend CI checks.
