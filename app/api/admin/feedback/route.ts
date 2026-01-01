// app/api/admin/feedback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ feedbacks });
  } catch (error: any) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { feedbackId, isRead } = body;

    if (!feedbackId || typeof isRead !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { isRead },
    });

    return NextResponse.json({ success: true, feedback: updatedFeedback });
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}