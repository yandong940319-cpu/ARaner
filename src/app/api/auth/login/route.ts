import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get the user's first org membership
    const membership = await prisma.orgMember.findFirst({
      where: { userId: user.id },
      include: { org: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'No workspace found for this user' },
        { status: 404 }
      );
    }

    const token = signToken({
      userId: user.id,
      orgId: membership.orgId,
      role: membership.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      org: {
        id: membership.org.id,
        name: membership.org.name,
        slug: membership.org.slug,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
