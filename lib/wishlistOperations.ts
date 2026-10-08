import type { PaymentMethod, Transaction, WishlistItem } from "./types";

export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isItemComplete(
  item: Pick<WishlistItem, "price" | "categoryId">
): boolean {
  return item.price !== null && item.price > 0 && item.categoryId !== null;
}

export function buildExpenseFromItem(
  item: {
    description: string;
    price: number;
    categoryId: string;
    paymentMethod: PaymentMethod;
  },
  date: string
): Omit<Transaction, "id"> {
  return {
    type: "expense",
    amount: item.price,
    categoryId: item.categoryId,
    description: item.description,
    date,
    paymentMethod: item.paymentMethod,
  };
}

export function canStartPurchase(item: Pick<WishlistItem, "status">): boolean {
  return item.status === "wishlist";
}

export function canUndoPurchase(
  item: Pick<WishlistItem, "status" | "transactionId">
): boolean {
  return item.status === "purchased" && item.transactionId !== null;
}

export function planRevertToWishlist(
  item: Pick<WishlistItem, "transactionId">
): { hasLinkedTransaction: boolean; transactionId: string | null } {
  return {
    hasLinkedTransaction: item.transactionId !== null,
    transactionId: item.transactionId,
  };
}
