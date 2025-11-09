# Contributing to Breeze

Breeze welcomes contributions that make the student research experience smoother—whether that means improving the UI, refining AI prompts, writing documentation, or fixing a bug.

## Getting started

1. **Install dependencies** – run `yarn install` from the repo root.
2. **Start the desktop app** – run `yarn dev` to launch Breeze with hot reload.
3. **Explore the project structure**:
   - `app/` – Electron main process and renderer entrypoints.
   - `packages/services/` – shared state, data access, and AI integrations.
   - `packages/ui/` – design system components and tokens.
   - `packages/editor/` – Tiptap-based editor extensions.

## Development workflow

- Create a branch from `main` for your changes.
- Keep pull requests focused and include before/after context for UI updates.
- Run relevant lint or build commands before submitting a PR (`yarn lint`, `yarn turbo run @breeze/utils#build`).
- Document user-facing changes in the PR description.

## Code of conduct

Our community follows the [Breeze Code of Conduct](CODE_OF_CONDUCT.md). If you observe behavior that violates the code, contact [adhyaay@breeze.engineer](mailto:adhyaay@breeze.engineer).

## Support and discussion

Need help or want to discuss an idea?

- Join the community on [Discord](https://breeze.engineer/discord)
- Open a discussion or issue on GitHub
- Email [adhyaay@breeze.engineer](mailto:adhyaay@breeze.engineer)

Thanks for helping make Breeze a better study companion!
