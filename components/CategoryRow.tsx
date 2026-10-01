"use client";

import { useState } from "react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ColorPicker } from "@/components/ColorPicker";
import type { CategoryColor } from "@/lib/categoryColors";
import type { DeletionPlan } from "@/lib/categoryOperations";
import { getReassignmentOptions } from "@/lib/categoryOperations";
import type { Category } from "@/lib/types";

type Mode = "view" | "edit" | "confirm-delete" | "reassign";

export function CategoryRow({
  category,
  categories,
  onRename,
  onUpdateAppearance,
  onDelete,
}: {
  category: Category;
  categories: Category[];
  onRename: (id: string, name: string) => Promise<{ error?: string }>;
  onUpdateAppearance: (
    id: string,
    changes: { emoji?: string; color?: CategoryColor }
  ) => Promise<{ error?: string }>;
  onDelete: (id: string, reassignToId?: string) => Promise<DeletionPlan>;
}) {
  const [mode, setMode] = useState<Mode>("view");
  const [name, setName] = useState(category.name);
  const [emoji, setEmoji] = useState(category.emoji);
  const [color, setColor] = useState<CategoryColor>(category.color);
  const [error, setError] = useState("");
  const [transactionCount, setTransactionCount] = useState(0);
  const [reassignTo, setReassignTo] = useState("");

  const reassignOptions = getReassignmentOptions(categories, category);

  function startEdit() {
    setName(category.name);
    setEmoji(category.emoji);
    setColor(category.color);
    setError("");
    setMode("edit");
  }

  async function saveEdit() {
    setError("");
    if (name.trim() !== category.name) {
      const result = await onRename(category.id, name);
      if (result.error) {
        setError(result.error);
        return;
      }
    }
    if (emoji !== category.emoji || color !== category.color) {
      await onUpdateAppearance(category.id, { emoji, color });
    }
    setMode("view");
  }

  async function confirmDelete() {
    const plan = await onDelete(category.id);
    if (plan.action === "needs-reassignment") {
      setTransactionCount(plan.transactionCount);
      setReassignTo(reassignOptions[0]?.id ?? "");
      setMode("reassign");
    }
  }

  async function confirmReassignAndDelete() {
    if (!reassignTo) return;
    await onDelete(category.id, reassignTo);
  }

  if (mode === "edit") {
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-12 text-center rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-2 py-1.5"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-1.5"
          />
        </div>
        <ColorPicker value={color} onChange={setColor} />
        {error && <div className="text-sm text-rose-600">{error}</div>}
        <div className="flex gap-2">
          <button
            onClick={saveEdit}
            type="button"
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 transition"
          >
            שמירה
          </button>
          <button
            onClick={() => setMode("view")}
            type="button"
            className="rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm px-3 py-1.5 transition"
          >
            ביטול
          </button>
        </div>
      </div>
    );
  }

  if (mode === "confirm-delete") {
    return (
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="text-sm">למחוק את &quot;{category.name}&quot;?</span>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={confirmDelete}
            type="button"
            className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm px-3 py-1.5 transition"
          >
            כן, למחוק
          </button>
          <button
            onClick={() => setMode("view")}
            type="button"
            className="rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm px-3 py-1.5 transition"
          >
            ביטול
          </button>
        </div>
      </div>
    );
  }

  if (mode === "reassign") {
    return (
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="text-sm">
          יש {transactionCount} תנועות בקטגוריה הזו. לאן להעביר אותן לפני
          המחיקה?
        </div>
        {reassignOptions.length > 0 ? (
          <>
            <select
              value={reassignTo}
              onChange={(e) => setReassignTo(e.target.value)}
              className="rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-1.5"
            >
              {reassignOptions.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={confirmReassignAndDelete}
                type="button"
                className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm px-3 py-1.5 transition"
              >
                העברה ומחיקה
              </button>
              <button
                onClick={() => setMode("view")}
                type="button"
                className="rounded-lg bg-neutral-100 dark:bg-neutral-800 text-sm px-3 py-1.5 transition"
              >
                ביטול
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-neutral-500">
            אין קטגוריה אחרת מאותו סוג להעביר אליה. הוסיפי קודם קטגוריה
            חדשה.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <CategoryBadge category={category} />
      <div className="flex gap-3 shrink-0">
        <button
          onClick={startEdit}
          type="button"
          className="text-sm text-neutral-500 hover:text-indigo-600 transition"
        >
          עריכה
        </button>
        <button
          onClick={() => setMode("confirm-delete")}
          type="button"
          className="text-sm text-neutral-500 hover:text-rose-600 transition"
        >
          מחיקה
        </button>
      </div>
    </div>
  );
}
