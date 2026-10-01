"use client";

import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { useTransactions } from "@/lib/useTransactions";

export default function Home() {
  const { transactions, addTransaction, deleteTransaction, loaded } =
    useTransactions();

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">התקציב שלי</h1>

      {loaded && (
        <>
          <SummaryCards transactions={transactions} />
          <TransactionForm onAdd={addTransaction} />
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </>
      )}
    </main>
  );
}
