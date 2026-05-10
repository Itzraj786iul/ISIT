/** Public-facing support address — override via NEXT_PUBLIC_SUPPORT_EMAIL */
export function getSupportEmail(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (fromEnv && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEnv)) return fromEnv;
  return 'support@isic.education';
}
