import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { getProviderAdapter, getDefaultModel } from '@/lib/ai/registry';
import { Provider, ProxyRequest } from '@/lib/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { prompt, model, system, maxTokens, temperature } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Resolve the provider and API key
  const provider: Provider = body.provider || 'anthropic';
  const providerAdapter = getProviderAdapter(provider);

  if (!providerAdapter) {
    return new Response(JSON.stringify({ error: `Unsupported provider: ${provider}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let apiKey = body.apiKey || ''; // Allow passing key directly (for dev)

  if (!apiKey) {
    // Try to get key from database (user's own key via auth)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(JSON.stringify({ error: 'API Key required. Provide via apiKey field or authenticate.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Look up the user's API key for this provider + role
    const keyRecord = await prisma.apiKey.findFirst({
      where: {
        orgId: payload.orgId,
        provider,
        role: 'text',
        isActive: true,
      },
    });

    if (!keyRecord) {
      return new Response(JSON.stringify({
        error: `未配置 ${provider} 的 API Key，请前往 Key 管理页面添加`,
        code: 'key_not_found',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    apiKey = keyRecord.encryptedKey;
  }

  const proxyRequest: ProxyRequest = {
    model: model || getDefaultModel(provider),
    prompt,
    system,
    maxTokens: maxTokens || 4096,
    temperature: temperature ?? 0.7,
  };

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of providerAdapter.streamChat(proxyRequest, apiKey)) {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
        controller.enqueue(encoder.encode('data: {"type":"status","stage":"done","status":"done"}\n\n'));
      } catch (err) {
        const errorPayload = `data: ${JSON.stringify({
          type: 'error',
          code: 'generation_failed',
          provider,
          message: '生成过程中发生错误',
        })}\n\n`;
        controller.enqueue(encoder.encode(errorPayload));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
