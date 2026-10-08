"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import type {
  PaymentMethod,
  Transaction,
  WishlistItem,
  WishlistPriority,
} from "./types";
import {
  buildExpenseFromItem,
  canStartPurchase,
  canUndoPurchase,
  planRevertToWishlist,
} from "./wishlistOperations";

type DbWishlistRow = {
  id: string;
  status: WishlistItem["status"];
  description: string;
  url: string | null;
  price: number | null;
  category_id: string | null;
  payment_method: PaymentMethod;
  priority: WishlistPriority;
  note: string | null;
  transaction_id: string | null;
};

function fromRow(row: DbWishlistRow): WishlistItem {
  return {
    id: row.id,
    status: row.status,
    description: row.description,
    url: row.url,
    price: row.price,
    categoryId: row.category_id,
    paymentMethod: row.payment_method,
    priority: row.priority,
    note: row.note,
    transactionId: row.transaction_id,
  };
}

export type NewWishlistInput = {
  description: string;
  url: string | null;
  price: number | null;
  categoryId: string | null;
  paymentMethod: PaymentMethod;
  priority: WishlistPriority;
  note: string | null;
};

export type WishlistItemEdits = Partial<{
  description: string;
  url: string | null;
  price: number | null;
  categoryId: string | null;
  paymentMethod: PaymentMethod;
  priority: WishlistPriority;
  note: string | null;
}>;

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const pending = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    supabase
      .from("wishlist_items")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          setItems(data.map(fromRow));
        }
        setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function addItem(input: NewWishlistInput): Promise<{ error?: string }> {
    const { data, error } = await supabase
      .from("wishlist_items")
      .insert({
        description: input.description,
        url: input.url,
        price: input.price,
        category_id: input.categoryId,
        payment_method: input.paymentMethod,
        priority: input.priority,
        note: input.note,
      })
      .select()
      .single();

    if (error || !data) {
      return { error: "לא ניתן היה להוסיף את הפריט" };
    }
    setItems((prev) => [fromRow(data), ...prev]);
    return {};
  }

  async function updateItem(
    id: string,
    edits: WishlistItemEdits
  ): Promise<{ error?: string }> {
    const dbChanges: Record<string, unknown> = {};
    if ("description" in edits) dbChanges.description = edits.description;
    if ("url" in edits) dbChanges.url = edits.url;
    if ("price" in edits) dbChanges.price = edits.price;
    if ("categoryId" in edits) dbChanges.category_id = edits.categoryId;
    if ("paymentMethod" in edits) dbChanges.payment_method = edits.paymentMethod;
    if ("priority" in edits) dbChanges.priority = edits.priority;
    if ("note" in edits) dbChanges.note = edits.note;

    const { error } = await supabase
      .from("wishlist_items")
      .update(dbChanges)
      .eq("id", id);

    if (error) {
      return { error: "לא ניתן היה לעדכן את הפריט" };
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...edits } : item))
    );
    return {};
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await supabase.from("wishlist_items").delete().eq("id", id);
  }

  async function markPurchased(
    id: string,
    details: { price: number; categoryId: string; date: string }
  ): Promise<{ error?: string }> {
    const item = items.find((i) => i.id === id);
    if (!item || !canStartPurchase(item) || pending.current.has(id)) {
      return {};
    }
    pending.current.add(id);
    try {
      const expense = buildExpenseFromItem(
        {
          description: item.description,
          price: details.price,
          categoryId: details.categoryId,
          paymentMethod: item.paymentMethod,
        },
        details.date
      );

      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .insert({
          type: expense.type,
          amount: expense.amount,
          category_id: expense.categoryId,
          description: expense.description,
          date: expense.date,
          payment_method: expense.paymentMethod,
        })
        .select()
        .single();

      if (txError || !txData) {
        return { error: "לא ניתן היה ליצור את ההוצאה" };
      }

      const { error: updateError } = await supabase
        .from("wishlist_items")
        .update({
          status: "purchased",
          price: details.price,
          category_id: details.categoryId,
          transaction_id: txData.id,
        })
        .eq("id", id);

      if (updateError) {
        return { error: "לא ניתן היה לעדכן את הפריט" };
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                status: "purchased",
                price: details.price,
                categoryId: details.categoryId,
                transactionId: txData.id as string,
              }
            : i
        )
      );
      return {};
    } finally {
      pending.current.delete(id);
    }
  }

  async function undoPurchase(id: string): Promise<{ error?: string }> {
    const item = items.find((i) => i.id === id);
    if (!item || !canUndoPurchase(item)) {
      return {};
    }
    await supabase.from("transactions").delete().eq("id", item.transactionId!);
    const { error } = await supabase
      .from("wishlist_items")
      .update({ transaction_id: null })
      .eq("id", id);
    if (error) {
      return { error: "לא ניתן היה לבטל" };
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, transactionId: null } : i))
    );
    return {};
  }

  async function revertToWishlist(
    id: string,
    alsoDeleteTransaction: boolean
  ): Promise<{ error?: string }> {
    const item = items.find((i) => i.id === id);
    if (!item) return {};
    const plan = planRevertToWishlist(item);

    if (alsoDeleteTransaction && plan.transactionId) {
      await supabase.from("transactions").delete().eq("id", plan.transactionId);
    }

    const { error } = await supabase
      .from("wishlist_items")
      .update({ status: "wishlist", transaction_id: null })
      .eq("id", id);

    if (error) {
      return { error: "לא ניתן היה להחזיר לרשימה" };
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "wishlist", transactionId: null } : i
      )
    );
    return {};
  }

  async function syncTransaction(id: string): Promise<{ error?: string }> {
    const item = items.find((i) => i.id === id);
    if (!item || !item.transactionId || item.price === null || !item.categoryId) {
      return {};
    }
    const changes: Partial<Transaction> = {
      amount: item.price,
      categoryId: item.categoryId,
      description: item.description,
      paymentMethod: item.paymentMethod,
    };
    const { error } = await supabase
      .from("transactions")
      .update({
        amount: changes.amount,
        category_id: changes.categoryId,
        description: changes.description,
        payment_method: changes.paymentMethod,
      })
      .eq("id", item.transactionId);
    return error ? { error: "לא ניתן היה לעדכן את ההוצאה" } : {};
  }

  return {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    markPurchased,
    undoPurchase,
    revertToWishlist,
    syncTransaction,
  };
}
