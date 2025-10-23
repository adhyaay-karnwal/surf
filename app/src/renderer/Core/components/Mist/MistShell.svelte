<script lang="ts">
  const spaces = [
    { id: 'space/research', name: 'Research OS', emoji: '🧭', active: false },
    { id: 'space/japan', name: 'Plan Japan trip', emoji: '🗺️', active: true },
    { id: 'space/founders', name: 'Founder updates', emoji: '📡', active: false },
    { id: 'space/studio', name: 'Mist studio', emoji: '🌫️', active: false }
  ]

  const flows = [
    { id: 'flow/flights', name: 'Find flights', status: 'in-progress', active: true },
    { id: 'flow/stays', name: 'Compare stays', status: 'idle', active: false },
    { id: 'flow/itinerary', name: 'Draft itinerary', status: 'idle', active: false }
  ]

  const cards = [
    {
      id: 'card/overview',
      title: 'Arigato Travel – Flight matrix',
      preview: 'Best fares across ANA, JAL, United. Highlighting sub $600 options.',
      accent: 'var(--mist-accent-1)',
      position: { left: '16%', top: '18%' }
    },
    {
      id: 'card/summary',
      title: 'Agent plan • Compare flights',
      preview: '1. Scrape ANA + JAL fares\n2. Cross-check SeatGuru for comfort\n3. Build comparison table',
      accent: 'var(--mist-accent-2)',
      position: { left: '44%', top: '36%' }
    },
    {
      id: 'card/entities',
      title: 'Entities • Tokyo itinerary',
      preview: '📍 Haneda Intl • ✈️ ANA NH107 • 🏨 Ryokan Sanga • 🍣 Sushi Saito',
      accent: 'var(--mist-accent-3)',
      position: { left: '24%', top: '58%' }
    }
  ]

  const commandQueue = [
    { id: 'cmd/download', label: 'Downloading ANA fare CSV', status: '40%' },
    { id: 'cmd/sync', label: 'Syncing Memory highlights', status: 'Done' }
  ]

  const sidecarTabs = ['Notes', 'Entities', 'Memory', 'History', 'Tasks', 'Inspector']
  let activeSidecarTab = sidecarTabs[0]
</script>

<div class="mist-root">
  <div class="mist-background" aria-hidden="true">
    <div class="mist-sheen" />
    <div class="mist-grid" />
  </div>

  <aside class="space-strip" aria-label="Spaces and flows">
    <div class="space-strip__logo">🌫️</div>
    <div class="space-strip__spaces" role="navigation">
      {#each spaces as space}
        <button class:active={space.active} class="space-strip__space" type="button">
          <span class="space-strip__emoji">{space.emoji}</span>
          <span class="space-strip__label">{space.name}</span>
        </button>
      {/each}
    </div>
    <div class="space-strip__flows" aria-label="Flows">
      {#each flows as flow}
        <button class:active={flow.active} class="space-strip__flow" type="button">
          <span class="flow__indicator" aria-hidden="true" />
          <span class="space-strip__label">{flow.name}</span>
        </button>
      {/each}
    </div>
  </aside>

  <main class="mist-stage">
    <header class="mist-omnibar" aria-label="Mist omnibar">
      <div class="omnibar-glass">
        <span class="omnibar-mode">Intent</span>
        <input
          class="omnibar-input"
          type="text"
          value="Compare flights under $600 SFO → HND in May"
          readonly
          aria-readonly="true"
        />
        <div class="omnibar-meta">
          <span>Plan preview</span>
          <span>⇧ Enter</span>
        </div>
      </div>
    </header>

    <section class="scene-canvas" aria-label="Scene canvas prototype">
      {#each cards as card}
        <article class="scene-card" style={`left:${card.position.left};top:${card.position.top};`}>
          <div class="scene-card__halo" style={`background:${card.accent};`} aria-hidden="true" />
          <div class="scene-card__chrome">
            <div class="scene-card__title">{card.title}</div>
            <div class="scene-card__badge">live</div>
          </div>
          <p class="scene-card__preview">{card.preview}</p>
        </article>
      {/each}
      <div class="scene-canvas__hint">
        Pinch to zoom · Drag to pan · Double-click to focus
      </div>
    </section>

    <footer class="command-dock" aria-label="Command dock">
      <div class="command-dock__queue">
        {#each commandQueue as item}
          <div class="command-chip">
            <span>{item.label}</span>
            <small>{item.status}</small>
          </div>
        {/each}
      </div>
      <div class="command-dock__shortcuts">⌘ + K Command Palette · ⌘ + ` Switch Spaces</div>
    </footer>
  </main>

  <aside class="mist-sidecar" aria-label="Context sidecar">
    <nav class="sidecar-tabs" aria-label="Sidecar modes">
      {#each sidecarTabs as tab}
        <button
          class:active={tab === activeSidecarTab}
          class="sidecar-tab"
          type="button"
          on:click={() => (activeSidecarTab = tab)}
        >
          {tab}
        </button>
      {/each}
    </nav>
    <div class="sidecar-panel">
      {#if activeSidecarTab === 'Notes'}
        <div class="sidecar-notes">
          <h2>Flow notebook</h2>
          <p>
            Agent suggests booking ANA NH107 on May 12th. Compare seat comfort with JAL 57.
            Collect lounge access perks and highlight differences in layover duration.
          </p>
          <ul>
            <li>Snapshot cards → table export</li>
            <li>Link to Memory: <span>Tokyo itinerary 2025</span></li>
          </ul>
        </div>
      {:else if activeSidecarTab === 'Entities'}
        <div class="sidecar-entities">
          <h2>Entities</h2>
          <div class="entity-pill">Haneda International (HND)</div>
          <div class="entity-pill">ANA NH107</div>
          <div class="entity-pill">Sushi Saito</div>
          <div class="entity-pill">Park Hyatt Tokyo</div>
        </div>
      {:else}
        <div class="sidecar-placeholder">
          <p>{activeSidecarTab} view coming soon.</p>
        </div>
      {/if}
    </div>
  </aside>
</div>

<style lang="scss">
  :global(html) {
    background: radial-gradient(circle at 20% -10%, rgba(109, 133, 255, 0.18), transparent 55%),
      radial-gradient(circle at 80% -20%, rgba(133, 233, 255, 0.24), transparent 50%),
      radial-gradient(circle at 50% 120%, rgba(255, 214, 245, 0.32), transparent 55%),
      color(display-p3 0.05 0.07 0.11);
    color: rgba(255, 255, 255, 0.92);
  }

  .mist-root {
    --mist-border: 1px solid rgba(255, 255, 255, 0.18);
    --mist-panel-bg: rgba(22, 28, 38, 0.42);
    --mist-panel-highlight: rgba(255, 255, 255, 0.12);
    --mist-accent-1: linear-gradient(
      135deg,
      rgba(135, 196, 255, 0.65),
      rgba(98, 118, 255, 0.35)
    );
    --mist-accent-2: linear-gradient(
      135deg,
      rgba(109, 209, 222, 0.7),
      rgba(95, 131, 255, 0.3)
    );
    --mist-accent-3: linear-gradient(
      135deg,
      rgba(205, 182, 255, 0.7),
      rgba(132, 133, 255, 0.4)
    );
    position: relative;
    isolation: isolate;
    display: grid;
    grid-template-columns: 240px 1fr 320px;
    grid-template-rows: 100vh;
    overflow: hidden;
    backdrop-filter: blur(0px);
  }

  .mist-background {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: -2;
  }

  .mist-sheen,
  .mist-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .mist-sheen {
    background: radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.14), transparent 55%),
      radial-gradient(circle at 70% 80%, rgba(109, 196, 255, 0.21), transparent 60%);
    filter: blur(60px);
  }

  .mist-grid {
    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 80px 80px;
    opacity: 0.45;
  }

  .space-strip {
    display: flex;
    flex-direction: column;
    padding: 32px 16px 24px;
    backdrop-filter: blur(24px);
    background: rgba(14, 18, 26, 0.65);
    border-right: var(--mist-border);
    gap: 24px;
  }

  .space-strip__logo {
    font-size: 1.8rem;
  }

  .space-strip__spaces,
  .space-strip__flows {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .space-strip__space,
  .space-strip__flow {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 14px;
    border: var(--mist-border);
    background: rgba(255, 255, 255, 0.02);
    color: inherit;
    font-size: 0.92rem;
    text-align: left;
    cursor: pointer;
    transition: background 180ms ease, transform 180ms ease;
  }

  .space-strip__space:hover,
  .space-strip__flow:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .space-strip__space.active,
  .space-strip__flow.active {
    background: rgba(255, 255, 255, 0.16);
    color: white;
  }

  .space-strip__emoji {
    font-size: 1.1rem;
  }

  .space-strip__label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .flow__indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(122, 185, 253, 0.8), rgba(65, 104, 253, 0.7));
  }

  .mist-stage {
    position: relative;
    display: grid;
    grid-template-rows: auto 1fr auto;
    border-right: var(--mist-border);
    backdrop-filter: blur(18px);
    background: rgba(10, 12, 18, 0.55);
  }

  .mist-omnibar {
    padding: 28px 40px 12px;
  }

  .omnibar-glass {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 16px 22px;
    border-radius: 24px;
    border: var(--mist-border);
    background: rgba(12, 16, 24, 0.6);
    backdrop-filter: blur(24px);
    box-shadow: 0 24px 45px rgba(4, 6, 12, 0.45);
  }

  .omnibar-mode {
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(186, 198, 214, 0.8);
  }

  .omnibar-input {
    flex: 1;
    font-size: 1.02rem;
    font-weight: 500;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.9);
    outline: none;
  }

  .omnibar-meta {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 0.78rem;
    color: rgba(186, 198, 214, 0.7);
  }

  .scene-canvas {
    position: relative;
    overflow: hidden;
  }

  .scene-card {
    position: absolute;
    width: 340px;
    padding: 24px;
    border-radius: 22px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(12, 16, 24, 0.78);
    backdrop-filter: blur(18px);
    box-shadow: 0 25px 70px rgba(3, 6, 12, 0.55);
    color: rgba(235, 242, 255, 0.92);
    transition: transform 220ms ease;
  }

  .scene-card:hover {
    transform: translate3d(0, -8px, 0) scale(1.02);
  }

  .scene-card__halo {
    position: absolute;
    inset: -18%;
    border-radius: 30px;
    filter: blur(24px);
    opacity: 0.75;
  }

  .scene-card__chrome {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 0.85rem;
  }

  .scene-card__title {
    font-weight: 600;
  }

  .scene-card__badge {
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.12);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 0.68rem;
  }

  .scene-card__preview {
    position: relative;
    z-index: 1;
    white-space: pre-line;
    line-height: 1.5;
    color: rgba(209, 224, 245, 0.9);
  }

  .scene-canvas__hint {
    position: absolute;
    right: 48px;
    bottom: 36px;
    padding: 10px 16px;
    border-radius: 16px;
    background: rgba(12, 16, 24, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(200, 215, 235, 0.72);
    font-size: 0.78rem;
    letter-spacing: 0.02em;
  }

  .command-dock {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    background: rgba(12, 16, 24, 0.7);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }

  .command-dock__queue {
    display: flex;
    gap: 12px;
  }

  .command-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 14px;
    border: var(--mist-border);
    background: rgba(22, 28, 38, 0.6);
    color: rgba(210, 222, 236, 0.85);
    font-size: 0.82rem;
  }

  .command-chip small {
    color: rgba(168, 188, 214, 0.7);
  }

  .command-dock__shortcuts {
    font-size: 0.78rem;
    color: rgba(186, 198, 214, 0.7);
  }

  .mist-sidecar {
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(28px);
    background: rgba(14, 18, 26, 0.7);
    padding: 32px;
    gap: 24px;
  }

  .sidecar-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .sidecar-tab {
    padding: 10px 12px;
    border-radius: 12px;
    border: var(--mist-border);
    background: rgba(18, 22, 30, 0.55);
    color: rgba(205, 214, 232, 0.78);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.68rem;
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease;
  }

  .sidecar-tab.active {
    background: rgba(255, 255, 255, 0.16);
    color: white;
  }

  .sidecar-panel {
    flex: 1;
    padding: 18px;
    border-radius: 16px;
    border: var(--mist-border);
    background: rgba(12, 16, 22, 0.62);
    color: rgba(214, 226, 240, 0.92);
  }

  .sidecar-notes h2,
  .sidecar-entities h2 {
    font-size: 0.94rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(190, 205, 224, 0.78);
    margin-bottom: 12px;
  }

  .sidecar-notes ul {
    margin-top: 16px;
    display: grid;
    gap: 8px;
    padding-left: 18px;
  }

  .sidecar-notes span {
    color: rgba(154, 197, 255, 0.9);
  }

  .entity-pill {
    display: inline-flex;
    padding: 10px 14px;
    margin: 6px 6px 0 0;
    border-radius: 999px;
    border: var(--mist-border);
    background: rgba(24, 32, 44, 0.62);
    font-size: 0.78rem;
    color: rgba(206, 222, 242, 0.85);
  }

  .sidecar-placeholder {
    font-size: 0.86rem;
    color: rgba(186, 198, 214, 0.7);
  }

  @media (max-width: 1400px) {
    .mist-root {
      grid-template-columns: 200px 1fr 280px;
    }

    .scene-card {
      width: 280px;
    }
  }

  @media (max-width: 1200px) {
    .mist-root {
      grid-template-columns: 180px 1fr 0;
    }

    .mist-sidecar {
      display: none;
    }
  }
</style>
