<div align="center">
  <img src="./docs/assets/repo-header.png" alt="Mist Browser" />
  <br>
  <a href="https://mistbrowser.com"><strong>Website</strong></a> ·
  <a href="https://mistbrowser.com/discord"><strong>Discord</strong></a>
</div>

# Mist Browser · Midnight AI Browser for Students

Mist Browser is a local-first, AI-powered browser designed to help students stay in flow. Capture research, keep journals, generate study aids, and remix the web without juggling endless tabs. Mist keeps everything on your device, wraps it in a midnight-lavender theme, and lets you shape the interface to match the way you study.

## Why Mist Browser?
- **Student-first workflows** – Save readings, lecture videos, and tabs into *Journals* that stay organized automatically.
- **AI that cites its sources** – Summaries, explanations, and study prompts stay linked to the original resource for easy review.
- **Always personal** – Data stays local, formats stay open, and you decide which AI models to connect.
- **Customizable vibe** – Switch between light & midnight styles, pick your accent palette, and tune Mist to your study routine.

## Highlights

### Journals instead of tabs
Group web pages, PDFs, lecture slides, and notes into Journals so you can pick up right where you left off. Mist’s sidebar gives you a split-screen “Study Desk” that keeps journal context beside whatever you’re browsing.

### Smart Notes with context
Ask questions about any resource, drop citations automatically, and @-mention anything you’ve saved. Mist’s AI assistants ground every answer in your Journals and pull in fresh web research when you need it.

### Mistlets (interactive study helpers)
Mist can code lightweight applets—flashcards, visualizers, quick calculators—directly inside your notes. See [Mistlets](./docs/MISTLETS.md) for all the ways to remix your study material.

### Midnight Mist theme
The interface leans into deep purples and soft light, inspired by late-night study sessions. Prefer another vibe? Head to **Settings → Appearance** to choose a different accent palette or switch between light and midnight modes.

## Installation
Download the latest builds from [mistbrowser.com/downloads](https://mistbrowser.com/downloads).

On macOS (notarization-free build):
1. Move the `.dmg` to your `Applications` folder
2. Run `xattr -cr /Applications/Mist.app`
3. Launch Mist

## Documentation
- [Journals & Library](./docs/LIBRARY.md)
- [Smart Notes](./docs/SMART_NOTES.md)
- [Mistlets](./docs/MISTLETS.md)
- [AI Models](./docs/AI_MODELS.md)
- [Keyboard Shortcuts](./docs/SHORTCUTS.md)

## Development
Mist Browser runs inside a Turborepo workspace. You’ll need Node.js ≥ 22.18, Yarn 1.x, Rust, and Cargo.

```sh
yarn install
# Run the desktop app and supporting packages in dev mode
yarn dev
# Build everything
yarn build
# Create platform builds
yarn build:desktop:mac:arm   # macOS (Apple Silicon)
yarn build:desktop:win:x64   # Windows (x64)
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for full setup instructions, contribution guidelines, and the DCO policy.

## Security & Support
Report vulnerabilities via GitHub’s security tab or email [security@mistbrowser.com](mailto:security@mistbrowser.com).

For general support, reach the team at [hello@mistbrowser.com](mailto:hello@mistbrowser.com) or join the [Mist Discord](https://mistbrowser.com/discord).

## License
Mist Browser is released under the [ISC License](./LICENSE).
