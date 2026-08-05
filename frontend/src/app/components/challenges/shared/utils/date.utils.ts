export function getDaysRemaining(endDate: string): number {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const diff = end - now;
  return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
}
