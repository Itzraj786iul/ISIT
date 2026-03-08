import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import JWT

const SALT_ROUNDS = 10; 

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// NEW FUNCTION: Generate JWT Token
export function signToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}