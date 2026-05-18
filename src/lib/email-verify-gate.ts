export type VerifiableUser = { email_verified?: boolean; email?: string };

export function needsEmailVerification(user: VerifiableUser | null | undefined): boolean {
  return Boolean(user && user.email_verified === false);
}
