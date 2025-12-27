// app/api/admin/registrations/route.ts

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
    const statusFilter = searchParams.get('status') || 'ALL';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

    // Build where clause
    const where: any = {};

    // Filter by status
    if (statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    // Filter by date range
    if (startDate || endDate) {
      where.visitDate = {};
      if (startDate) {
        where.visitDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        where.visitDate.lte = end;
      }
    }

    // Filter by unit if not super admin
    if (!isSuperAdmin && session.user.unitId) {
      where.mainUnitId = session.user.unitId;
    }

    const registrations = await prisma.visitRegistration.findMany({
      where,
      include: {
        unit: {
          select: {
            name: true,
            code: true,
          },
        },
        reviewedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({ registrations });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { registrationId, status, adminNotes } = body;

    if (!registrationId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if registration exists and belongs to admin's unit
    const registration = await prisma.visitRegistration.findUnique({
      where: { id: registrationId },
      include: { unit: true },
    });

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

    // Check permission
    if (!isSuperAdmin && registration.mainUnitId !== session.user.unitId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only manage registrations for your unit' },
        { status: 403 }
      );
    }

    // Update registration
    const updated = await prisma.visitRegistration.update({
      where: { id: registrationId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, registration: updated });
  } catch (error: any) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}