<script lang="ts">
  import { TabOrientation } from '@mist/services/tabs'
  import TabsList from './TabsList/TabsList.svelte'
  import VerticalTabsList from './VerticalTabsList.svelte'

  let {
    orientation = TabOrientation.Horizontal
  }: {
    orientation?: TabOrientation
  } = $props()
</script>

{#if orientation === TabOrientation.Vertical}
  <VerticalTabsList />
{:else}
  <TabsList />
{/if}
