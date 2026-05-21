import { Provider, ProviderAdapter } from './types';
import { AnthropicAdapter } from './anthropic';

const adapters: Record<string, ProviderAdapter> = {
  anthropic: new AnthropicAdapter(),
};

export function getProviderAdapter(provider: Provider): ProviderAdapter | null {
  return adapters[provider] ?? null;
}

export function getDefaultModel(provider: Provider): string {
  const models: Record<string, string> = {
    anthropic: 'claude-sonnet-4-20250514',
    openai: 'gpt-4o',
    gemini: 'gemini-2.0-flash',
  };
  return models[provider] || models.anthropic;
}
