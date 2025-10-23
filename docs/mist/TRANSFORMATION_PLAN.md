# Mist Transformation Plan

This document captures the first-pass blueprint for evolving **Deta Surf** into **Mist**, a spatial, AI-native browser experience. It translates the high-level vision into actionable phases that fit Surf’s current Electron/Svelte/Turborepo architecture.

> **Scope note:** Mist is a ground-up reimagining that touches every layer of the application. Attempting to land the full transformation in a single iteration would destabilise the codebase and violate the product quality bar. The plan below focuses on sequencing work so that we can build and ship Mist incrementally while keeping Surf functional behind a feature flag.

---

## 0. Discovery & Foundations

### 0.1 Architecture audit

- Catalogue the responsibilities of the main process (`app/src/main`) and renderer (`app/src/renderer`).
- Map current IPC channels exposed in `ipcHandlers.ts` and the services exposed via `window.api`.
- Document persistence (SFFS + SQLite) and how it feeds the renderer stores.
- Identify which Surf-specific constructs (tabs, sidebar, split view) can be deprecated versus shimmed for backwards compatibility.

### 0.2 Data model & storage strategy

- Define canonical Mist entities: **Space**, **Flow**, **Scene**, **Card**, **Action**, **Entity**, **Memory**.
- Decide where each entity lives: renderer store (ephemeral UI), SQLite (durable session graph), SFFS extensions (assets, highlights), and vector search (memory embeddings).
- Draft migration paths to convert existing Surf notebooks/tabs into Mist spaces/scenes so users are not stranded.

### 0.3 Design system primitives

- Establish Mist’s “glass” visual language: blur radii, elevation scale, accent gradients, and typography.
- Build token definitions that can ship inside `@deta/ui` and be consumed by both the new renderer views and any shared packages.
- Define motion principles (200–250 ms materialisation, 120 ms micro-interactions, physics-driven panning) and accessibility hooks (reduced motion, contrast).

Deliverables: architecture memo, ER diagram for graph & memory schema, design tokens spec, updated README pointer to Mist vision.

---

## 1. Mist Shell & Feature Flag

1. Add a feature-flagged entrypoint in the renderer (`Core.svelte`) that swaps the legacy tabbed layout for a Mist shell when `process.env.MIST_ENABLED` (or a persisted setting) is true.
2. Implement the chrome-free base layout: left edge strip (spaces/flows), center canvas, right sidecar, bottom command dock placeholder.
3. Reuse the existing shortcut infrastructure (`ShortcutActions`) to wire the new omnibar focus (Cmd/Ctrl + L) and command palette (Cmd/Ctrl + K).
4. Ensure the main process window is configured for borderless, full-screen-first presentation while preserving platform-specific window controls for accessibility.

Deliverables: Mist shell scaffolding, environment toggle, baseline integration tests that ensure Surf’s default experience remains intact.

---

## 2. Scene Canvas Prototype (Milestone M0)

1. Stand up a renderer module (`packages/scene-engine` or similar) responsible for:
   - Infinite panning/zooming (consider Svelte + Pixi or a custom Canvas/WebGL approach).
   - Card layout management with snap lines and inertia.
   - Timeline snapshots keyed by `Scene` changes to later support time travel.
2. Integrate with Electron webviews via the existing `WebContentsView` wrapper but render them inside the canvas cards instead of the tab strip.
3. Add auto-arrange and clustering heuristics (grid, stack, domain clusters) as composable layout strategies.
4. Provide keyboard/gesture bindings: pinch zoom, two-finger pan, double-click focus, Option/Alt+Arrow card cycling.

Acceptance: 60 fps interaction with ≥10 active cards, Cmd/Ctrl + Number cycling across recent scenes, timeline snapshot capture.

---

## 3. Omnibar & Command System

1. Create a Mist-styled omnibar component with **navigate**, **intent**, **search**, **command** modes and inline token chips (`site:`, `type:`, etc.).
2. Stand up a command bus that maps typed commands to side-effect handlers, with undo/redo capability and agent approvals.
3. Implement live previews: URL metadata, intent plan sketches, search entity previews.
4. Replace Surf’s location bar usage within `NavigationBar.svelte` when Mist is enabled; legacy tabs still fall back to the old component.

Acceptance: omnibar focus via Cmd/Ctrl + L, plan preview on Shift + Enter, command palette (Cmd/Ctrl + K) sourcing commands/pages/flows/entities.

---

## 4. Session Graph & Time Travel (Milestone M1)

1. Build a graph engine (e.g. RxJS + Zustand hybrid) that emits nodes and edges for spaces, flows, scenes, cards, actions, and agent proposals.
2. Persist graph events in SQLite via the main process; expose query APIs over IPC for time-based and intent-based queries.
3. Implement the graph overlay (toggle with `G`) to visualise journeys, scrub time, and restore historical scene snapshots.

Acceptance: users can open the graph, scrub to a previous state, and restore the scene reliably.

---

## 5. Sidecar & Knowledge Surfaces

1. Sidecar framework with tabs for Notes, Entities, Memory, History, Tasks, Inspector.
2. Notes: rich-text editor (build on top of existing Tiptap-based editor) with backlinks to cards and entities.
3. Entities: DOM extraction SDK injected into each card; highlight mentions on hover/select.
4. Memory: persisted highlights and structured facts with search UI, backed by local embeddings.

Acceptance: selecting a card updates the sidecar; extracted entities highlight within the live webview; notes persist per card/scene.

---

## 6. Agent UI & Automation

1. Agent panel that displays proposed action plans with approve/modify/reject controls.
2. Skill execution sandbox with explicit permissions for navigation, form fill, scraping, comparison, summarisation.
3. Audit trail describing each agent action, inputs, outputs, and failure states.

Acceptance: an intent like “Compare X vs Y” produces a plan, allows editing, and executes while logging each step.

---

## 7. Spaces & Flow Navigation

1. Implement the left-edge strip for active spaces and flows, including hover details and quick actions.
2. Build the space switcher overlay (Cmd/Ctrl + `), complete with thumbnails and templates (Research, Trip, Recruit, Debug).
3. Persist flows and their associated scenes/cards to support resuming work seamlessly.

Acceptance: create a space, manage multiple flows, and switch between them via keyboard or the strip.

---

## 8. Polishing, Migration, & Rollout

- Replace Surf branding/assets with Mist once feature parity is acceptable.
- Port settings, downloads, onboarding, and importers into the Mist experience.
- Provide a “Convert Surf tabs to Mist scene” migration assistant.
- Harden performance (webview pooling, lazy hydration) and privacy guardrails (agent permissions, audit logging).

---

## Tooling & Quality Gates

- Extend the test harness to cover the scene engine, command bus, and graph store.
- Maintain linting/formatting parity with existing tooling (ESLint + Prettier + Turbo pipelines).
- Use story-based visual regression for new Mist components (Chromatic/Playwright + deterministic scenes) to protect the glass aesthetic.
- Monitor performance budgets: 16 ms for canvas interactions, <=300 ms webview creation, <=150 ms memory search.

---

## Open Questions

- **Engine constraints:** validate that Electron’s `BrowserView` usage scales for tens of simultaneous cards; evaluate alternatives (Offscreen rendering, Stage Manager-like snapshots).
- **LLM providers:** decide the initial agent backends (local vs cloud) and how to cache output safely on-device.
- **Collaboration (v2):** outline CRDT strategy (likely Yjs) and sync transport (WebRTC or WebSocket).
- **Packaging & distribution:** confirm new signing requirements for macOS/Windows once Mist branding ships.

---

## Next Ticket Suggestions

1. `docs`: Land an architecture audit and ER diagram for Mist entities.
2. `renderer`: Scaffold a Mist feature flag and empty shell container.
3. `packages/ui`: Define Mist design tokens and glassmorphism primitives.
4. `main process`: Prototype the session graph persistence layer.

Addressing these sequentially will let the team converge on Mist without destabilising the current Surf user experience.
