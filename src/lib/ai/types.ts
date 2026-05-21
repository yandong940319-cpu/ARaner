// AI Provider types for the proxy layer

export type Provider = 'anthropic' | 'openai' | 'gemini' | 'tongyi' | 'doubao' | 'deepseek';

export type AiRole = 'text' | 'image' | 'video';

export interface ProxyRequest {
  model?: string;
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TokenEvent {
  type: 'token';
  content: string;
}

export interface StatusEvent {
  type: 'status';
  stage: string;
  status: 'running' | 'done';
}

export interface ErrorEvent {
  type: 'error';
  code: string;
  provider: string;
  message: string;
}

export type ProxyEvent = TokenEvent | StatusEvent | ErrorEvent;

export interface ProviderAdapter {
  streamChat(request: ProxyRequest, apiKey: string): AsyncGenerator<ProxyEvent, void, unknown>;
}
