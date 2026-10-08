"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function CompletePurchaseModal({
  categories,
  needsPrice,
  needsCategory,
  initialPrice,
  initialCategoryId,
  onConfirm,
  onCancel,
}: {
  categories: Category[];
  needsPrice: boolean;
  needsCategory: boolean;
  initialPrice: number | null;
  initialCategoryId: string | null;
  onConfirm: (details: {
    price: number;
    categoryId: string;
    date: string;
  }) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [price, setPrice] = useState(
    initialPrice !== null ? String(initialPrice) : ""
  );
  const [categoryId, setCategoryId] = useState(initialCategoryId ?? "");
  const [date, setDate] = useState(today());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  async function handleConfirm() {
    setError("");
    const numericPrice = Number(price);
    if (!numericPrice || numericPrice <= 0) {
      setError("יש להזין מחיר תקין");
      return;
    }
    if (!categoryId) {
      setError("יש לבחור קטגוריה");
      return;
    }
    setSubmitting(true);
    const submitError = await onConfirm({
      price: numericPrice,
      categoryId,
      date,
    });
    setSubmitting(false);
    if (submitError) setError(submitError);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-5 space-y-4">
        <div className="text-lg font-medium">עוד קצת פרטים</div>
        <div className="text-sm text-neutral-500">
          כדי לרשום את זה כהוצאה צריך {needsPrice && needsCategory
            ? "מחיר וקטגוריה"
            : needsPrice
              ? "מחיר"
              : "קטגוריה"}
          .
        </div>

        {needsPrice && (
          <div>
            <label className="block text-sm text-neutral-500 mb-1">מחיר</label>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {needsCategory && (
          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              קטגוריה
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="" className="text-black">
                בחרי קטגוריה
              </option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-neutral-500 mb-1">תאריך</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {error && <div className="text-sm text-rose-600">{error}</div>}

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 transition disabled:opacity-50"
          >
            רישום כהוצאה
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium py-3 transition"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
