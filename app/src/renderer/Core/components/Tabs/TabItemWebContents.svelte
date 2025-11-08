<script lang="ts">
  import { type WebContentsView } from '@breeze/services/views'

  let { webContents = $bindable() }: { webContents: WebContentsView } = $props()

  $inspect(webContents.title)

  // const title = $derived.by(() => {
  //     if (view.webContents) {
  //         return view.webContents.title || 'Untitled Tab';
  //     }

  //     return 'Untitled Tab';
  // });
</script>

<span class="tab-title">{webContents.title}</span>
