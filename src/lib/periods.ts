/** Generates the last N months (default 24) up to and including the current month, oldest first. */
export function getDefaultPeriodRange(months = 24): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(d.toISOString().slice(0, 10)); // YYYY-MM-01
  }
  return result;
}
