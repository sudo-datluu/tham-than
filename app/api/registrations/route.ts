// app/api/registrations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      soldierName,
      unitCode,
      mainUnitCode,
      relativeName,
      relationship,
      visitDate,
      province,
      ward,
      numberOfVisitors,
      vehicleType,
      vehicleCount,
      phoneNumber,
    } = body;

    // Validation
    if (!soldierName || !unitCode || !relativeName || !relationship || !visitDate || !province || !ward || !phoneNumber) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra unit có tồn tại
    const unit = await prisma.unit.findUnique({
      where: { code: unitCode },
    });

    if (!unit) {
      return NextResponse.json(
        { error: 'Đơn vị không tồn tại' },
        { status: 400 }
      );
    }

    // Tìm main unit (nếu là subunit thì lấy parent)
    let mainUnit = unit;
    if (unit.parentId) {
      const parent = await prisma.unit.findUnique({
        where: { id: unit.parentId },
      });
      if (parent) {
        mainUnit = parent;
      }
    }

    // Tạo đơn đăng ký
    const registration = await prisma.visitRegistration.create({
      data: {
        soldierName,
        unitId: unit.id,
        mainUnitId: mainUnit.id,
        relativeName,
        relationship,
        visitDate: new Date(visitDate),
        province,
        ward,
        numberOfVisitors: parseInt(numberOfVisitors),
        vehicleType,
        vehicleCount: parseInt(vehicleCount),
        phoneNumber,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      registration: {
        id: registration.id,
        status: registration.status,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi tạo đơn đăng ký' },
      { status: 500 }
    );
  }
}