"use client";

import { useEffect, useState } from "react";
import type { CategoryColor } from "./categoryColors";
import {
  planCategoryDeletion,
  validateCategoryName,
  type DeletionPlan,
} from "./categoryOperations";
import { supabase } from "./supabaseClient";
import type { Category, TransactionType } from "./types";

const UNIQUE_VIOLATION = "23505";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) {
          setCategories(data as Category[]);
        }
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

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

    const { data, error } = await supabase
      .from("categories")
      .insert({
        type: input.type,
        name: input.name.trim(),
        emoji: input.emoji,
        color: input.color,
      })
      .select()
      .single();

    if (error) {
      return {
        error:
          error.code === UNIQUE_VIOLATION
            ? `כבר קיימת קטגוריה בשם "${input.name.trim()}"`
            : "לא ניתן היה ליצור את הקטגוריה",
      };
    }

    setCategories((prev) => [...prev, data as Category]);
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
    const { error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", id);

    if (error) {
      return {
        error:
          error.code === UNIQUE_VIOLATION
            ? `כבר קיימת קטגוריה בשם "${trimmed}"`
            : "לא ניתן היה לשנות את השם",
      };
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
    const { error } = await supabase.from("categories").update(changes).eq("id", id);
    if (error) {
      return { error: "לא ניתן היה לעדכן את הקטגוריה" };
    }
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
    );
    return {};
  }

  async function countTransactionsInCategory(id: string): Promise<number> {
    const { count } = await supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);
    return count ?? 0;
  }

  async function deleteCategory(
    id: string,
    reassignToId?: string
  ): Promise<DeletionPlan> {
    const transactionCount = await countTransactionsInCategory(id);
    const plan = planCategoryDeletion(id, transactionCount, reassignToId);

    if (plan.action === "reassign-and-delete") {
      await supabase
        .from("transactions")
        .update({ category_id: plan.reassignToId })
        .eq("category_id", id);
    }

    if (plan.action === "delete" || plan.action === "reassign-and-delete") {
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
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
