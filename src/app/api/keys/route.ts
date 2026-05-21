import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/keys - list all API keys for the current org
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { orgId: payload.orgId },
    select: {
      id: true,
      provider: true,
      role: true,
      label: true,
      keyHash: true,
      isDefault: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Do NOT select encryptedKey - never expose to frontend
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ keys });
}

// POST /api/keys - add a new API key
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { provider, role, key: rawKey, label } = await request.json();

  if (!provider || !role || !rawKey) {
    return NextResponse.json({ error: 'provider, role, and key are required' }, { status: 400 });
  }

  if (!['anthropic', 'deepseek', 'openai', 'gemini'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  if (!['text', 'image', 'video'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Compute key hash (prefix only for display)
  const keyHash = rawKey.slice(-4);

  // Store the key (in production: RSA decrypt → AES-256-GCM encrypt)
  // For Wave 1: store encryptedKey directly (will be upgraded in Wave 2)
  const encryptedKey = rawKey;

  // Check if a key for this provider+role already exists
  const existing = await prisma.apiKey.findUnique({
    where: { orgId_provider_role: { orgId: payload.orgId, provider, role } },
  });

  if (existing) {
    // Update existing key
    const updated = await prisma.apiKey.update({
      where: { id: existing.id },
      data: { encryptedKey, keyHash, label: label || '', isActive: true },
      select: { id: true, provider: true, role: true, label: true, keyHash: true, isDefault: true, isActive: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json({ key: updated });
  }

  // Create new key
  const created = await prisma.apiKey.create({
    data: {
      orgId: payload.orgId,
      provider,
      role,
      label: label || '',
      encryptedKey,
      keyHash,
    },
    select: { id: true, provider: true, role: true, label: true, keyHash: true, isDefault: true, isActive: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({ key: created });
}

// DELETE /api/keys - remove an API key
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
  }

  // Verify the key belongs to the user's org
  const key = await prisma.apiKey.findFirst({
    where: { id, orgId: payload.orgId },
  });

  if (!key) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  }

  await prisma.apiKey.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
