import { Provider, ProviderAdapter } from './types';
import { AnthropicAdapter } from './anthropic';
import { DeepSeekAdapter } from './deepseek';

const adapters: Record<string, ProviderAdapter> = {
  anthropic: new AnthropicAdapter(),
  deepseek: new DeepSeekAdapter(),
};

export function getProviderAdapter(provider: Provider): ProviderAdapter | null {
  return adapters[provider] ?? null;
}

export function getDefaultModel(provider: Provider): string {
  const models: Record<string, string> = {
    anthropic: 'claude-sonnet-4-20250514',
    deepseek: 'deepseek-chat',
    openai: 'gpt-4o',
    gemini: 'gemini-2.0-flash',
  };
  return models[provider] || models.anthropic;
}
