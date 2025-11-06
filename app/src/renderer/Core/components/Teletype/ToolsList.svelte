<script lang="ts">
  import { derived } from 'svelte/store'
  import type { TeletypeService } from '@mist/services'
  import { Dropdown, type DropdownItem } from '@mist/ui'
  import { useLogScope } from '@mist/utils'

  let {
    teletype,
    disabled = false
  }: {
    teletype: TeletypeService
    disabled?: boolean
  } = $props()

  const log = useLogScope('ToolsList')

  const tools = teletype.tools

  const items = derived(tools, ($tools) => {
    if (!$tools) return []

    return Array.from($tools.entries()).map(
      ([toolId, tool]) =>
        ({
          id: toolId,
          label: tool.name,
          icon: tool.icon,
          disabled: tool.disabled,
          disabledLabel: tool.disabled ? 'coming soon!' : undefined,
          checked: tool.active,
          type: 'checkbox',
          action: () => {
            log.debug('Toggling tool:', toolId)
            teletype.toggleTool(toolId)
          }
        }) as DropdownItem
    )
  })
</script>

{#if $tools && $tools.size > 0}
  <Dropdown items={$items} triggerText="Tools" triggerIcon="bolt" {disabled} />
{/if}
