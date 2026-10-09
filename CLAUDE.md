# human-kit charts

Accessible, headless chart components for Svelte 5, published as `@human-kit/charts`.
The sibling library is `@human-kit/ui` (`../svelte-components`). Take its conventions
unless an RFC in `rfcs/` says otherwise.

## Hard rules

- **Everything written is in English**: code, comments, docs, RFCs, notes, this file,
  commits, PR bodies, changesets and GitHub comments. Only the chat with the user is
  in Spanish.
- Reader-facing prose (docs, READMEs, RFCs, JSDoc, PR bodies) follows **ASD-STE100**,
  as the "Documentation style" section of the ui repo's `CONTRIBUTING.md` defines it.
- **Never name another UI or chart library** in anything that persists: code, docs,
  RFCs, commits, PRs, changesets. Study them; do not name them.
- **No Claude attribution** in commits or PR bodies.
- **Accessibility is the primary bar**: the WAI-ARIA APG and the best accessible
  libraries, not only internal consistency.
- **Size is the second bar**: zero runtime dependencies, and every byte needs a
  reason. There is no size target: the goal is the smallest size possible, and CI
  measures it on each change.
- Branches: `feat/…`, `fix/…`, `docs/…`; only the version bump uses `release/<version>`.
- GitHub: only the `Agustin-Delgado` account can open PRs in the `human-kit` org.
  Scope the token per command: `GH_TOKEN=$(gh auth token --user Agustin-Delgado) gh ...`.
- Do not create a GitHub repo or publish a package without the user's approval.

## Design

The architecture is in `rfcs/0001-architecture.md`. Read it before you add a part.
