// app/api/admin/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        unit: {
          select: {
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        unit: user.unit,
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
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
    const { name, phone, newPassword } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Tên và số điện thoại không được để trống' },
        { status: 400 }
      );
    }

    // Check if phone is being changed and already exists
    if (phone !== session.user.phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Số điện thoại đã được sử dụng' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      phone,
    };

    // Hash new password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        unit: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      user: {
        name: updatedUser.name,
        phone: updatedUser.phone,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}