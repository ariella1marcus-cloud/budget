"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { Transaction } from "./types";

type DbTransactionRow = {
  id: string;
  type: Transaction["type"];
  amount: number;
  category_id: string;
  description: string | null;
  date: string;
  payment_method: Transaction["paymentMethod"];
};

function fromRow(row: DbTransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    categoryId: row.category_id,
    description: row.description ?? "",
    date: row.date,
    paymentMethod: row.payment_method,
  };
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          setTransactions(data.map(fromRow));
        }
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  async function addTransaction(transaction: Omit<Transaction, "id">) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        type: transaction.type,
        amount: transaction.amount,
        category_id: transaction.categoryId,
        description: transaction.description,
        date: transaction.date,
        payment_method: transaction.paymentMethod,
      })
      .select()
      .single();

    if (!error && data) {
      setTransactions((prev) => [fromRow(data), ...prev]);
    }
  }

  async function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("transactions").delete().eq("id", id);
  }

  return { transactions, addTransaction, deleteTransaction, loaded };
}
