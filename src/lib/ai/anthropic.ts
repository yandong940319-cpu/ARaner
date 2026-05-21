import Anthropic from '@anthropic-ai/sdk';
import { ProviderAdapter, ProxyRequest, ProxyEvent } from './types';

export class AnthropicAdapter implements ProviderAdapter {
  async *streamChat(request: ProxyRequest, apiKey: string): AsyncGenerator<ProxyEvent, void, unknown> {
    const client = new Anthropic({ apiKey });

    const messages: Anthropic.MessageParam[] = [];
    if (request.system) {
      // Add system prompt as a user message with instruction
      messages.push({
        role: 'user',
        content: `[System instruction: ${request.system}]\n\n${request.prompt}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: request.prompt,
      });
    }

    try {
      const stream = await client.messages.create({
        model: request.model || 'claude-sonnet-4-20250514',
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield {
            type: 'token' as const,
            content: chunk.delta.text,
          };
        }
      }
    } catch (error: any) {
      // Map common Anthropic errors to our error codes
      if (error.status === 401) {
        yield {
          type: 'error' as const,
          code: 'key_inactive',
          provider: 'anthropic',
          message: 'API Key 无效或已过期',
        };
      } else if (error.status === 429) {
        yield {
          type: 'error' as const,
          code: 'rate_limited',
          provider: 'anthropic',
          message: '请求过于频繁，请稍后重试',
        };
      } else if (error.status === 400) {
        yield {
          type: 'error' as const,
          code: 'model_unavailable',
          provider: 'anthropic',
          message: `模型不可用: ${error.message}`,
        };
      } else {
        yield {
          type: 'error' as const,
          code: 'generation_failed',
          provider: 'anthropic',
          message: error.message || '生成失败',
        };
      }
    }
  }
}
