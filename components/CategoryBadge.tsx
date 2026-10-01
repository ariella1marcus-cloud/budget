import { CATEGORY_COLORS } from "@/lib/categoryColors";
import type { Category } from "@/lib/types";

export function CategoryBadge({ category }: { category: Category }) {
  const colors = CATEGORY_COLORS[category.color];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span>{category.emoji}</span>
      <span>{category.name}</span>
    </span>
  );
}
