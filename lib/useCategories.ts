"use client";

import { useEffect, useState } from "react";
import { api } from "@appdeploy/client";
import type { CategoryColor } from "./categoryColors";
import {
  planCategoryDeletion,
  validateCategoryName,
  type DeletionPlan,
} from "./categoryOperations";
import type { Category, Transaction, TransactionType } from "./types";

function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { error?: string } } })?.response
    ?.data?.error;
  return message ?? fallback;
}

export function useCategories(userId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    api
      .get("/api/categories")
      .then(({ data }) => {
        if (active) setCategories(data as Category[]);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  function namesForType(type: TransactionType, excludeId?: string) {
    return categories
      .filter((c) => c.type === type && c.id !== excludeId)
      .map((c) => c.name);
  }

  async function addCategory(input: {
    type: TransactionType;
    name: string;
    emoji: string;
    color: CategoryColor;
  }): Promise<{ error?: string }> {
    const validation = validateCategoryName(input.name, namesForType(input.type));
    if (!validation.valid) {
      return { error: validation.error };
    }

    let created: Category;
    try {
      const { data } = await api.post("/api/categories", {
        type: input.type,
        name: input.name.trim(),
        emoji: input.emoji,
        color: input.color,
      });
      created = data as Category;
    } catch (err) {
      return { error: errorMessage(err, "לא ניתן היה ליצור את הקטגוריה") };
    }

    setCategories((prev) => [...prev, created]);
    return {};
  }

  async function renameCategory(
    id: string,
    newName: string
  ): Promise<{ error?: string }> {
    const category = categories.find((c) => c.id === id);
    if (!category) return { error: "קטגוריה לא נמצאה" };

    const validation = validateCategoryName(
      newName,
      namesForType(category.type, id)
    );
    if (!validation.valid) {
      return { error: validation.error };
    }

    const trimmed = newName.trim();
    try {
      await api.put(`/api/categories/${id}`, { name: trimmed });
    } catch (err) {
      return { error: errorMessage(err, "לא ניתן היה לשנות את השם") };
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
    );
    return {};
  }

  async function updateCategoryAppearance(
    id: string,
    changes: { emoji?: string; color?: CategoryColor }
  ): Promise<{ error?: string }> {
    try {
      await api.put(`/api/categories/${id}`, changes);
    } catch (err) {
      return { error: errorMessage(err, "לא ניתן היה לעדכן את הקטגוריה") };
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
    );
    return {};
  }

  async function countTransactionsInCategory(id: string): Promise<number> {
    try {
      const { data } = await api.get("/api/transactions");
      return (data as Transaction[]).filter((t) => t.categoryId === id).length;
    } catch {
      return 0;
    }
  }

  async function deleteCategory(
    id: string,
    reassignToId?: string
  ): Promise<DeletionPlan> {
    const transactionCount = await countTransactionsInCategory(id);
    const plan = planCategoryDeletion(id, transactionCount, reassignToId);

    if (plan.action === "delete" || plan.action === "reassign-and-delete") {
      try {
        await api.post(`/api/categories/${id}/delete`, {
          reassignToId:
            plan.action === "reassign-and-delete" ? plan.reassignToId : undefined,
        });
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } catch {
        return { action: "invalid", error: "לא ניתן היה למחוק את הקטגוריה" };
      }
    }

    return plan;
  }

  return {
    categories,
    loaded,
    addCategory,
    renameCategory,
    updateCategoryAppearance,
    deleteCategory,
  };
}
