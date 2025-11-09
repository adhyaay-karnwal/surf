import {} from './browser.types'
import { PageChatMessageSentEventError, PageChatMessageSentEventTrigger } from './events.types'
export var Provider
;(function (Provider) {
  Provider['OpenAI'] = 'open-ai'
  Provider['Anthropic'] = 'anthropic'
  Provider['Google'] = 'google'
  Provider['Custom'] = 'custom'
})(Provider || (Provider = {}))
export var BuiltInModelIDs
;(function (BuiltInModelIDs) {
  BuiltInModelIDs['GPT5'] = 'gpt-5'
  BuiltInModelIDs['GPT5_Mini'] = 'gpt-5-mini'
  BuiltInModelIDs['GPT4_1'] = 'gpt-4.1'
  BuiltInModelIDs['GPT4_1_Mini'] = 'gpt-4.1-mini'
  BuiltInModelIDs['GPT4o'] = 'gpt-4o'
  BuiltInModelIDs['GPT4oMini'] = 'gpt-4o-mini'
  BuiltInModelIDs['O4Mini'] = 'o4-mini'
  BuiltInModelIDs['O3Mini'] = 'o3-mini'
  BuiltInModelIDs['ClaudeSonnet'] = 'claude-3-5-sonnet-latest'
  BuiltInModelIDs['ClaudeSonnet45'] = 'claude-4-5-sonnet-latest'
  BuiltInModelIDs['ClaudeSonnet4'] = 'claude-4-sonnet-latest'
  BuiltInModelIDs['ClaudeSonnet37'] = 'claude-3-7-sonnet-latest'
  BuiltInModelIDs['ClaudeHaiku'] = 'claude-3-5-haiku-latest'
  BuiltInModelIDs['Gemini2Flash'] = 'gemini-2.0-flash'
})(BuiltInModelIDs || (BuiltInModelIDs = {}))
export var ModelTiers
;(function (ModelTiers) {
  ModelTiers['Premium'] = 'premium'
  ModelTiers['PremiumVision'] = 'premium_vision'
  ModelTiers['Standard'] = 'standard'
})(ModelTiers || (ModelTiers = {}))
export var ChatMode
;(function (ChatMode) {
  ChatMode[(ChatMode['TextOnly'] = 1)] = 'TextOnly'
  ChatMode[(ChatMode['TextWithScreenshot'] = 2)] = 'TextWithScreenshot'
  ChatMode[(ChatMode['AppCreation'] = 3)] = 'AppCreation'
})(ChatMode || (ChatMode = {}))
;(function (ChatMode) {
  function isValid(value) {
    return Object.values(ChatMode).includes(value)
  }
  ChatMode.isValid = isValid
})(ChatMode || (ChatMode = {}))
export const BuiltInModelLabels = {
  [BuiltInModelIDs.GPT4_1_Mini]: 'GPT-4.1 Mini',
  [BuiltInModelIDs.GPT4o]: 'GPT-4o',
  [BuiltInModelIDs.GPT4oMini]: 'GPT-4o Mini',
  [BuiltInModelIDs.O3Mini]: 'o3 Mini',
  [BuiltInModelIDs.ClaudeSonnet37]: 'Claude 3.7 Sonnet',
  [BuiltInModelIDs.ClaudeSonnet]: 'Claude 3.5 Sonnet',
  [BuiltInModelIDs.GPT4_1]: 'GPT-4.1',
  [BuiltInModelIDs.ClaudeHaiku]: 'Claude 3.5 Haiku',
  [BuiltInModelIDs.GPT5]: 'GPT-5',
  [BuiltInModelIDs.GPT5_Mini]: 'GPT-5 Mini',
  [BuiltInModelIDs.ClaudeSonnet45]: 'Claude 4.5 Sonnet',
  [BuiltInModelIDs.ClaudeSonnet4]: 'Claude 4 Sonnet',
  [BuiltInModelIDs.Gemini2Flash]: 'Gemini 2.0 Flash'
}
export const ProviderLabels = {
  [Provider.OpenAI]: 'Open AI',
  [Provider.Anthropic]: 'Anthropic',
  [Provider.Google]: 'Google',
  [Provider.Custom]: 'Custom'
}
export const ProviderIcons = {
  [Provider.OpenAI]: 'open-ai',
  [Provider.Anthropic]: 'claude',
  [Provider.Google]: 'gemini',
  [Provider.Custom]: 'sparkles'
}
export const OPEN_AI_PATH_SUFFIX = '/v1/chat/completions'
export const BUILT_IN_MODELS = [
  {
    id: BuiltInModelIDs.GPT5,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT5],
    provider: Provider.OpenAI,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.OpenAI],
    supports_json_format: true,
    vision: true
  },
  {
    id: BuiltInModelIDs.GPT5_Mini,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT5_Mini],
    provider: Provider.OpenAI,
    tier: ModelTiers.Standard,
    icon: ProviderIcons[Provider.OpenAI],
    supports_json_format: true,
    vision: true
  },
  {
    id: BuiltInModelIDs.GPT4_1,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT4_1],
    provider: Provider.OpenAI,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.OpenAI],
    vision: true,
    supports_json_format: true
  },
  {
    id: BuiltInModelIDs.GPT4_1_Mini,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT4_1_Mini],
    provider: Provider.OpenAI,
    tier: ModelTiers.Standard,
    icon: ProviderIcons[Provider.OpenAI],
    vision: true,
    supports_json_format: true
  },
  {
    id: BuiltInModelIDs.GPT4o,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT4o],
    provider: Provider.OpenAI,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.OpenAI],
    vision: true,
    supports_json_format: true
  },
  {
    id: BuiltInModelIDs.GPT4oMini,
    label: BuiltInModelLabels[BuiltInModelIDs.GPT4oMini],
    provider: Provider.OpenAI,
    tier: ModelTiers.Standard,
    icon: ProviderIcons[Provider.OpenAI],
    vision: true,
    supports_json_format: true
  },
  {
    id: BuiltInModelIDs.O3Mini,
    label: BuiltInModelLabels[BuiltInModelIDs.O3Mini],
    provider: Provider.OpenAI,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.OpenAI],
    vision: false,
    supports_json_format: true
  },
  {
    id: BuiltInModelIDs.ClaudeSonnet45,
    label: BuiltInModelLabels[BuiltInModelIDs.ClaudeSonnet45],
    provider: Provider.Anthropic,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.Anthropic],
    supports_json_format: true,
    vision: true
  },
  {
    id: BuiltInModelIDs.ClaudeSonnet4,
    label: BuiltInModelLabels[BuiltInModelIDs.ClaudeSonnet4],
    provider: Provider.Anthropic,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.Anthropic],
    supports_json_format: true,
    vision: true
  },
  {
    id: BuiltInModelIDs.ClaudeSonnet37,
    label: BuiltInModelLabels[BuiltInModelIDs.ClaudeSonnet37],
    provider: Provider.Anthropic,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.Anthropic],
    vision: true,
    supports_json_format: true,
    max_tokens: 128_000
  },
  {
    id: BuiltInModelIDs.ClaudeSonnet,
    label: BuiltInModelLabels[BuiltInModelIDs.ClaudeSonnet],
    provider: Provider.Anthropic,
    tier: ModelTiers.Premium,
    icon: ProviderIcons[Provider.Anthropic],
    vision: true,
    supports_json_format: true,
    max_tokens: 128_000
  },
  {
    id: BuiltInModelIDs.ClaudeHaiku,
    label: BuiltInModelLabels[BuiltInModelIDs.ClaudeHaiku],
    provider: Provider.Anthropic,
    tier: ModelTiers.Standard,
    icon: ProviderIcons[Provider.Anthropic],
    supports_json_format: true,
    vision: false
  },
  {
    id: BuiltInModelIDs.Gemini2Flash,
    label: BuiltInModelLabels[BuiltInModelIDs.Gemini2Flash],
    provider: Provider.Google,
    tier: ModelTiers.Standard,
    icon: ProviderIcons[Provider.Google],
    supports_json_format: true,
    vision: true
  }
]
export const DEFAULT_AI_MODEL = BuiltInModelIDs.GPT4_1
export const RECOMMENDED_AI_MODELS = [
  {
    id: BuiltInModelIDs.GPT5,
    description: 'Most capable model for general use cases'
  },
  {
    id: BuiltInModelIDs.ClaudeSonnet45,
    description: 'Excellent analysis and creative skills'
  },
  {
    id: BuiltInModelIDs.Gemini2Flash,
    description: 'Quick responses with solid reliability'
  }
]
export var CUSTOM_MODELS
;(function (CUSTOM_MODELS) {
  CUSTOM_MODELS['Ollama'] = 'Ollama'
  CUSTOM_MODELS['OpenRouter'] = 'OpenRouter'
  CUSTOM_MODELS['HuggingFaceTogether'] = 'Hugging Face Together AI'
  CUSTOM_MODELS['HuggingFace'] = 'Hugging Face Inference Endpoint'
})(CUSTOM_MODELS || (CUSTOM_MODELS = {}))
export const CUSTOM_MODEL_DEFINITIONS = {
  [CUSTOM_MODELS.Ollama]: {
    id: CUSTOM_MODELS.Ollama,
    label: 'Ollama',
    icon: 'ollama',
    provider_url: 'http://localhost:11434/v1/chat/completions',
    model_page: 'https://ollama.com/search'
  },
  [CUSTOM_MODELS.OpenRouter]: {
    id: CUSTOM_MODELS.OpenRouter,
    label: 'OpenRouter',
    icon: 'openrouter',
    provider_url: 'https://openrouter.ai/api/v1/chat/completions',
    model_page: 'https://openrouter.com/models',
    api_key_page: 'https://openrouter.ai/settings/keys'
  },
  [CUSTOM_MODELS.HuggingFaceTogether]: {
    id: CUSTOM_MODELS.HuggingFaceTogether,
    label: 'Hugging Face Together AI',
    icon: 'huggingface',
    provider_url: 'https://router.huggingface.co/together/v1/chat/completions',
    model_page: 'https://huggingface.co/models?inference_provider=together&sort=trending',
    api_key_page: 'https://huggingface.co/settings/tokens'
  },
  [CUSTOM_MODELS.HuggingFace]: {
    id: CUSTOM_MODELS.HuggingFace,
    label: 'Hugging Face Custom',
    icon: 'huggingface',
    provider_url: 'https://api-inference.huggingface.co/models/',
    model_page: 'https://huggingface.co/models?inference_provider=together&sort=trending',
    api_key_page: 'https://huggingface.co/settings/tokens'
  }
}
export const BUILT_IN_PROVIDER_DEFINITIONS = {
  [Provider.OpenAI]: {
    api_key_page: 'https://platform.openai.com/api-keys'
  },
  [Provider.Anthropic]: {
    api_key_page: 'https://console.anthropic.com/settings/keys'
  },
  [Provider.Google]: {
    api_key_page: 'https://aistudio.google.com/app/api-keys'
  },
  [Provider.Custom]: {}
}
