import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/schedules - list schedules for the current org
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: any = { orgId: payload.orgId };
  if (status) where.status = status;

  const schedules = await prisma.schedule.findMany({
    where,
    include: {
      draft: { select: { id: true, title: true, platform: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ schedules });
}

// POST /api/schedules - create a new schedule
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { draftId, platform, scheduledAt } = await request.json();

  if (!platform) {
    return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
  }

  const schedule = await prisma.schedule.create({
    data: {
      orgId: payload.orgId,
      draftId: draftId || null,
      platform,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
    },
  });

  return NextResponse.json({ schedule });
}

// PATCH /api/schedules - update schedule status (for state machine transitions)
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { id, status } = await request.json();

  if (!id || !status) {
    return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
  }

  // Verify the schedule belongs to the user's org
  const existing = await prisma.schedule.findFirst({
    where: { id, orgId: payload.orgId },
  });

  if (!existing) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });

  const validTransitions: Record<string, string[]> = {
    DRAFT: ['SCHEDULED', 'ARCHIVED'],
    SCHEDULED: ['PUBLISHING', 'ARCHIVED'],
    PUBLISHING: ['COMPLETED', 'PARTIAL_FAIL'],
    COMPLETED: ['ARCHIVED'],
    PARTIAL_FAIL: ['PUBLISHING', 'ARCHIVED'],
  };

  const allowedNext = validTransitions[existing.status] || [];
  if (!allowedNext.includes(status)) {
    return NextResponse.json({
      error: `Cannot transition from ${existing.status} to ${status}. Allowed: ${allowedNext.join(', ')}`,
    }, { status: 400 });
  }

  const updated = await prisma.schedule.update({
    where: { id },
    data: {
      status,
      ...(status === 'COMPLETED' || status === 'PARTIAL_FAIL'
        ? { publishedAt: new Date() }
        : {}),
    },
  });

  return NextResponse.json({ schedule: updated });
}
