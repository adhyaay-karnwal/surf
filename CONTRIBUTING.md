# Contributing to Mist Browser

We welcome contributions from the community to help improve Mist Browser—the AI-powered browser designed for students. Whether you're fixing bugs, refining the experience, or improving documentation, your work helps everyone study smarter.

Mist Browser evolves quickly, so some areas of the codebase are still in flux. Focused pull requests with clear context are easiest for us to review and merge. Before you dive in, scan existing threads in our support portal or start a new conversation so we can coordinate effort and avoid duplicate work.

## Code of Conduct
This project and everyone participating in it is governed by the [Mist Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [hello@mistbrowser.com](mailto:hello@mistbrowser.com).

## I need help!
If you need help getting started or have questions about the codebase, drop by the [Mist Discord](https://mistbrowser.com/discord) or email us at [hello@mistbrowser.com](mailto:hello@mistbrowser.com).

## What's inside?
Mist Browser lives inside a Turborepo-managed monorepo with several packages and the core Electron application in `app`. It uses Yarn Workspaces to manage dependencies and build processes.

### Core App
- `Core`: main app UI
- `Resource`: journals and resource views such as Smart Notes
- `PDF`: custom PDF viewer
- `Overlay`: overlay window used for dialogs and other floating interfaces
- `Settings`: settings window
- `Setup`: onboarding window
- `Updates`: updates window
- `Announcements`: announcements window

Within the `preload` directory there are different scripts for the different view types, each one exposing a tailored API to the renderer process via `contextBridge`. The most important are:
- `core`: for the main app UI renderer
- `resource`: for the journal & resource renderer
- `webcontents`: for external web pages

The `main` directory is the Electron main process, responsible for window management, app lifecycle, IPC handling, protocol handlers, and more.

### Packages
Legacy internal packages retain the `@deta/...` namespace for compatibility. They cover:
- `@deta/backend`: Rust backend compiled to a Node.js module
- `@deta/backend-server`: Rust backend compiled to a standalone server for compute-intensive AI tasks
- `@deta/services`: core services powering tabs, resources, journals, settings, etc.
- `@deta/editor`: Tiptap-based rich text editor component
- `@deta/teletype`: command menu library
- `@deta/dragcula`: drag and drop library
- `@deta/web-parser`: resource extraction / web clipping helpers
- `@deta/ui`: UI component library
- `@deta/utils`: shared utilities
- `@deta/icons`: icon library based on [`tabler`](https://tabler.io/icons)
- `@deta/types`: shared TypeScript types

Each package is either written in [TypeScript](https://www.typescriptlang.org/) or Rust; UI layers are built with [Svelte](https://svelte.dev/).

## Installation
To use a non-notarized version on macOS:
- download a suitable `dmg` from [mistbrowser.com/downloads](https://mistbrowser.com/downloads)
- move it to your `Applications` folder
- run `xattr -cr /Applications/{release_name}.app` in Terminal (replace `{release_name}` accordingly)
- start the app

## Local Setup
### Prerequisites
- [Node.js](https://nodejs.org/) (version `22.18.0` or higher)
- [Yarn](https://yarnpkg.com/) (version 1.x)
- [Rust and Cargo](https://www.rust-lang.org/tools/install)

### Install Dependencies
```sh
yarn install
```

### Develop
```sh
yarn dev
```

### Build
```sh
yarn build
```

To create the final distributable build:
```sh
yarn build:desktop:mac:arm   # macOS (Apple Silicon)
yarn build:desktop:win:x64   # Windows (x64)
```
Check the `package.json` scripts section for more build options.

# 📌 How to Contribute

### 1. Start with a Support Thread (for bigger changes)
**Before starting work on significant features or changes**, open a topic in the support portal or Discuss channel to outline your proposal. This helps ensure:
- The change aligns with the project's direction
- You don't spend time on something that may not be accepted
- We can provide guidance and feedback early in the process

Small bug fixes and documentation improvements can skip this step.

### 2. Fork & Branch
- Fork this repository
- Create a new branch for your changes
```bash
git checkout -b feature/my-feature
```

### 3. Make Changes
Write clean, well-documented code. Include tests when applicable.

### 4. Commit with Signed-off-by
This project uses a **Developer Certificate of Origin (DCO)** to certify contribution rights.

Each commit **must be signed** by adding a `Signed-off-by` line to your commit message:
```bash
git commit -s -m "Add new feature"
```
This automatically adds:
```
Signed-off-by: Your Name <you@example.com>
```
If you forgot to sign a commit, fix it with:
```bash
git commit --amend --signoff
```

---

## ✅ Developer Certificate of Origin (DCO)
By contributing, you agree to the Developer Certificate of Origin:
```
Developer Certificate of Origin
Version 1.1
By making a contribution to this project, I certify that:
(a) The contribution is my original work, and I have the right to submit it under the open source license indicated in the file; or
(b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license; or
(c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it; and
(d) I understand and agree that this project and its contributions are public and that a record of the contribution (including my name and email) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.
```

---

## 📥 Pull Requests
Before submitting a pull request:
- Make sure your code builds without errors
- Follow existing code style
- Add tests if needed
- Include a clear description of the change
