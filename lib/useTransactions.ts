"use client";

import { useEffect, useState } from "react";
import { api } from "@appdeploy/client";
import type { Transaction } from "./types";

export function useTransactions(userId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    api
      .get("/api/transactions")
      .then(({ data }) => {
        if (active) setTransactions(data as Transaction[]);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  async function addTransaction(transaction: Omit<Transaction, "id">) {
    try {
      const { data } = await api.post("/api/transactions", transaction);
      setTransactions((prev) => [data as Transaction, ...prev]);
    } catch {
      // the transaction was not saved; leave the list unchanged
    }
  }

  async function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.delete(`/api/transactions/${id}`);
    } catch {
      // best effort, matching the previous optimistic behaviour
    }
  }

  return { transactions, addTransaction, deleteTransaction, loaded };
}
