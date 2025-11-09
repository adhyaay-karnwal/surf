# Breeze: AI Browser for Students

[**Website**](https://breeze.engineer) · [**Discord**](https://breeze.engineer/discord)

Breeze is an AI-powered browser designed for students. It keeps lecture notes, readings, citations, and web research organised in one workspace so you can stay focused on learning instead of tab juggling.

![split](./docs/assets/split-note.webp)

## Why Breeze

- **Study-first workspace** – capture sources, summaries, and citations inside notebooks that stay in sync across tabs.
- **Guided prompts for coursework** – quick suggestions help you analyse readings, draft study plans, or prepare flashcards in seconds.
- **Notebook shelf** – pin active subjects, browse recent notebooks, and jump back into drafts between classes.
- **Local-first & flexible** – keep data on your device, bring your own AI keys, and export notebooks whenever you need.

## Key capabilities

- Clip PDFs, webpages, and files directly into notebooks.
- Generate structured notes, citation lists, or revision checklists with Breeze AI.
- Mention tabs, files, or notebooks inside the editor to give the AI precise study context.
- Import history or bookmarks from other browsers to move your entire research trail into Breeze.

## Install & download

Visit [https://breeze.engineer](https://breeze.engineer) for the latest installers for macOS, Windows, and Linux.

## Running from source

Breeze uses Yarn workspaces and Turborepo.

```bash
yarn install
yarn dev
```

The desktop app will open with hot reload for renderer changes. See [CONTRIBUTING.md](CONTRIBUTING.md) for more detail on the repo structure and contribution guidelines.

## Launch checklist

If you're preparing a commercial distribution of Breeze, follow the steps in [docs/COMMERCIAL_SETUP.md](docs/COMMERCIAL_SETUP.md) to set up branding assets, update environment variables, provision download/CDN endpoints, and refresh support channels.

## License

Breeze is released under the Apache 2.0 license unless noted otherwise. See [LICENSE](LICENSE) for full details.
