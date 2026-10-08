import { CATEGORY_COLORS } from "@/lib/categoryColors";
import type { WishlistPriority } from "@/lib/types";
import {
  WISHLIST_PRIORITY_COLOR,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/wishlistPriority";

export function PriorityBadge({ priority }: { priority: WishlistPriority }) {
  const colors = CATEGORY_COLORS[WISHLIST_PRIORITY_COLOR[priority]];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {WISHLIST_PRIORITY_LABELS[priority]}
    </span>
  );
}
