import { ProviderAdapter, ProxyRequest, ProxyEvent } from './types';

export class DeepSeekAdapter implements ProviderAdapter {
  async *streamChat(request: ProxyRequest, apiKey: string): AsyncGenerator<ProxyEvent, void, unknown> {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || 'deepseek-chat',
          messages: [
            ...(request.system ? [{ role: 'system' as const, content: request.system }] : []),
            { role: 'user' as const, content: request.prompt },
          ],
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        if (response.status === 401) {
          yield { type: 'error' as const, code: 'key_inactive', provider: 'deepseek', message: 'API Key 无效' };
        } else if (response.status === 429) {
          yield { type: 'error' as const, code: 'rate_limited', provider: 'deepseek', message: '请求过于频繁' };
        } else if (response.status === 402) {
          yield { type: 'error' as const, code: 'key_quota_exhausted', provider: 'deepseek', message: 'API 余额不足' };
        } else {
          yield { type: 'error' as const, code: 'generation_failed', provider: 'deepseek', message: `API 错误: ${response.status} ${errBody}` };
        }
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { type: 'error' as const, code: 'generation_failed', provider: 'deepseek', message: '无法读取响应流' };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield { type: 'token' as const, content };
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (error: any) {
      yield {
        type: 'error' as const,
        code: 'generation_failed',
        provider: 'deepseek',
        message: error.message || '网络错误',
      };
    }
  }
}
