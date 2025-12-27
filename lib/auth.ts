// lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Số điện thoại', type: 'tel' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error('Số điện thoại và mật khẩu là bắt buộc');
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
          include: { unit: true },
        });

        if (!user) {
          throw new Error('Số điện thoại hoặc mật khẩu không đúng');
        }

        if (!user.isActive) {
          throw new Error('Tài khoản đã bị vô hiệu hóa');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Số điện thoại hoặc mật khẩu không đúng');
        }

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          unitId: user.unitId || '',
          unitName: user.unit?.name || '',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.role = user.role;
        token.unitId = user.unitId || '';
        token.unitName = user.unitName || '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.unitId = (token.unitId as string) || '';
        session.user.unitName = (token.unitName as string) || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};