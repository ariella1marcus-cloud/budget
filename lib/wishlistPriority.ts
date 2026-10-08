import type { WishlistPriority } from "./types";

export const WISHLIST_PRIORITIES: WishlistPriority[] = ["must", "want", "maybe"];

export const WISHLIST_PRIORITY_LABELS: Record<WishlistPriority, string> = {
  must: "חייבת",
  want: "ארצה",
  maybe: "אולי",
};

// Reuses the existing category color tokens (lib/categoryColors.ts) so the
// badge styling stays visually consistent with the rest of the app.
export const WISHLIST_PRIORITY_COLOR: Record<
  WishlistPriority,
  "terracotta" | "peach" | "gray"
> = {
  must: "terracotta",
  want: "peach",
  maybe: "gray",
};
