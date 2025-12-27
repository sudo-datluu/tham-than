// types/index.ts

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: string;
      unitId: string;
      unitName: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    phone: string;
    role: string;
    unitId: string;
    unitName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    phone: string;
    role: string;
    unitId: string;
    unitName: string;
  }
}

export interface VisitRegistrationFormData {
  visitorName: string;
  visitorPhone: string;
  visitorIdCard: string;
  visitorAddress?: string;
  inmateName: string;
  inmateRelation: string;
  inmateIdNumber?: string;
  visitDate: Date;
  visitReason?: string;
  numberOfVisitors: number;
  unitId: string;
}

export interface RegistrationWithUnit {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorIdCard: string;
  visitorAddress: string | null;
  inmateName: string;
  inmateRelation: string;
  inmateIdNumber: string | null;
  visitDate: Date;
  visitReason: string | null;
  numberOfVisitors: number;
  status: string;
  adminNotes: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  unit: {
    name: string;
    code: string;
  };
  reviewedBy: {
    name: string;
  } | null;
}