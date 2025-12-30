// app/api/admin/statistics/route.ts

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

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month'); // Format: YYYY-MM

    if (!monthParam) {
      return NextResponse.json({ error: 'Month parameter required' }, { status: 400 });
    }

    const [year, month] = monthParam.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

    // Build where clause
    const where: any = {
      reviewedAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'APPROVED', // Chỉ tính đơn đã duyệt
    };

    // Filter by unit if not super admin
    if (!isSuperAdmin && session.user.unitId) {
      where.mainUnitId = session.user.unitId;
    }
    console.log('Where clause:', where);
    console.log('Is Super Admin:', isSuperAdmin);

    // Get all registrations for the month
    const registrations = await prisma.visitRegistration.findMany({
      where,
      select: {
        province: true,
        numberOfVisitors: true,
        status: true,
      },
    });
    console.log('Found registrations:', registrations.length);
    console.log('Sample data:', registrations[0]);

    // Calculate statistics (all approved)
    const totalRegistrations = registrations.length;
    const totalVisitors = registrations.reduce((sum, reg) => sum + reg.numberOfVisitors, 0);
    const approvedRegistrations = registrations.length; // Tất cả đều approved
    const pendingRegistrations = 0;
    const rejectedRegistrations = 0;

    // Group by province
    const provinceMap = new Map<string, { totalVisitors: number; registrationCount: number }>();

    registrations.forEach((reg) => {
      const existing = provinceMap.get(reg.province) || { totalVisitors: 0, registrationCount: 0 };
      provinceMap.set(reg.province, {
        totalVisitors: existing.totalVisitors + reg.numberOfVisitors,
        registrationCount: existing.registrationCount + 1,
      });
    });

    // Convert to array and sort by total visitors
    const provinceStats = Array.from(provinceMap.entries())
      .map(([province, stats]) => ({
        province,
        totalVisitors: stats.totalVisitors,
        registrationCount: stats.registrationCount,
      }))
      .sort((a, b) => b.totalVisitors - a.totalVisitors);

    return NextResponse.json({
      totalVisitors,
      totalRegistrations,
      approvedRegistrations,
      pendingRegistrations,
      rejectedRegistrations,
      provinceStats,
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}