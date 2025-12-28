// lib/generateCode.ts

import { prisma } from './prisma';

/**
 * Generate a unique 7-character registration code
 * Format: Mixed case letters + numbers (e.g., Ab3X9kL)
 */
export async function generateRegistrationCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const codeLength = 7;
  
  let code = '';
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random 7-character code
    code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    
    // Check if code already exists
    const existing = await prisma.visitRegistration.findUnique({
      where: { registrationCode: code },
    });
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
}