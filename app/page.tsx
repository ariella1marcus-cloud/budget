"use client";

import { useState } from "react";
import {
  PaymentMethodFilter,
  type PaymentMethodOrAll,
} from "@/components/PaymentMethodFilter";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/lib/useTransactions";

export default function Home() {
  const { transactions, addTransaction, deleteTransaction, loaded } =
    useTransactions();
  const [filter, setFilter] = useState<PaymentMethodOrAll>("all");

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.paymentMethod === filter);

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">התקציב שלי</h1>

      {loaded && (
        <>
          <SummaryCards transactions={transactions} />
          <TransactionForm onAdd={addTransaction} />
          <PaymentMethodFilter value={filter} onChange={setFilter} />
          <TransactionList
            transactions={filteredTransactions}
            onDelete={deleteTransaction}
          />
        </>
      )}
    </main>
  );
}
