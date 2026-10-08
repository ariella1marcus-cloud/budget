import type { CategoryColor } from "./categoryColors";

export type TransactionType = "income" | "expense";

export type PaymentMethod = "my-card" | "dad-card";

export type Category = {
  id: string;
  type: TransactionType;
  name: string;
  emoji: string;
  color: CategoryColor;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
};

export type WishlistStatus = "wishlist" | "purchased";
export type WishlistPriority = "must" | "want" | "maybe";

export type WishlistItem = {
  id: string;
  status: WishlistStatus;
  description: string;
  url: string | null;
  price: number | null;
  categoryId: string | null;
  paymentMethod: PaymentMethod;
  priority: WishlistPriority;
  note: string | null;
  transactionId: string | null;
};
