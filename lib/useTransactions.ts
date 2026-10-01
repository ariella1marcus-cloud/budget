"use client";

import { useEffect, useState } from "react";
import type { Transaction } from "./types";

const STORAGE_KEY = "budget-transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed: Transaction[] = JSON.parse(raw);
        setTransactions(
          parsed.map((t) => ({ paymentMethod: "cash", ...t }))
        );
      } catch {
        setTransactions([]);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, loaded]);

  function addTransaction(transaction: Omit<Transaction, "id">) {
    setTransactions((prev) => [
      { ...transaction, id: crypto.randomUUID() },
      ...prev,
    ]);
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return { transactions, addTransaction, deleteTransaction, loaded };
}
