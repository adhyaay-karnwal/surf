<script lang="ts">
  import SurfCore from './SurfCore.svelte'
  import MistShell from './components/Mist/MistShell.svelte'

  const envValue = import.meta.env.R_VITE_ENABLE_MIST
  const mistEnabled = envValue === 'true'
</script>

{#if mistEnabled}
  <MistShell />
{:else}
  <SurfCore />
{/if}
