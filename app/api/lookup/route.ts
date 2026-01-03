// app/api/lookup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code || code.length !== 7) {
      return NextResponse.json(
        { error: 'Mã số đăng ký không hợp lệ' },
        { status: 400 }
      );
    }

    const registration = await prisma.visitRegistration.findUnique({
      where: { registrationCode: code },
      include: {
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn đăng ký với mã số này' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration: {
        registrationCode: registration.registrationCode,
        soldierName: registration.soldierName,
        relativeName: registration.relativeName,
        relationship: registration.relationship,
        visitDate: registration.visitDate,
        status: registration.status,
        submittedAt: registration.submittedAt,
        unit: registration.unit,
        adminNotes: registration.adminNotes
      },
    });
  } catch (error: any) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tra cứu' },
      { status: 500 }
    );
  }
}