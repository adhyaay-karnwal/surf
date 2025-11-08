import type { AITool } from '@breeze/types'

export const AI_TOOLS = [
  {
    id: 'websearch',
    name: 'Web Search',
    icon: 'world',
    active: true,
    disabled: false
  },
  {
    id: 'breezelet',
    name: 'App Generation',
    icon: 'code',
    active: true,
    disabled: false
  },
  {
    id: 'image-generation',
    name: 'Image Generation',
    icon: 'screenshot',
    active: false,
    disabled: true
  }
] as AITool[]
