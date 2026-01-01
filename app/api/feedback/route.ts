// app/api/feedback/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, content } = body;

    if (!name || !phone || !content) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        name,
        phone,
        content,
      },
    });

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedback.id,
      },
    });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi gửi phản ánh' },
      { status: 500 }
    );
  }
}