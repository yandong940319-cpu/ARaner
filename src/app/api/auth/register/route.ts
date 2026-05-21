import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, name, orgName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);
    const slug = (orgName || name || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create user, org, and membership in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashed, name: name || email.split('@')[0] },
      });

      const org = await tx.org.create({
        data: {
          name: orgName || `${user.name}'s Workspace`,
          slug: `${slug}-${Date.now().toString(36)}`,
        },
      });

      await tx.orgMember.create({
        data: {
          userId: user.id,
          orgId: org.id,
          role: 'OWNER',
        },
      });

      return { user, org };
    });

    const token = signToken({
      userId: result.user.id,
      orgId: result.org.id,
      role: 'OWNER',
    });

    return NextResponse.json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      org: {
        id: result.org.id,
        name: result.org.name,
        slug: result.org.slug,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
