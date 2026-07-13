// Shared section-color palette. Chosen for distinctness at a glance and
// even coverage across hue, so consecutive sections never look alike.
export const CATEGORY_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#0ea5e9", // sky
  "#84cc16", // lime
  "#d946ef", // fuchsia
];

// Picks the first palette color not already in use. Once every color has
// been used at least once, cycles round-robin (by count) so repeats stay
// spread out instead of clustering on the first color.
export function pickCategoryColor(existingColors: string[]): string {
  const used = new Set(existingColors);
  const free = CATEGORY_COLORS.find((c) => !used.has(c));
  if (free) return free;
  return CATEGORY_COLORS[existingColors.length % CATEGORY_COLORS.length];
}
