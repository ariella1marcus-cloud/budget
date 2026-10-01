export type TransactionType = "income" | "expense";

export type PaymentMethod = "my-card" | "dad-card";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
};
