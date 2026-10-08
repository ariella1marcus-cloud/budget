"use client";

import { useState } from "react";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";
import type { Category, PaymentMethod, WishlistPriority } from "@/lib/types";
import { isSafeUrl } from "@/lib/wishlistOperations";
import {
  WISHLIST_PRIORITIES,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/wishlistPriority";

export type WishlistFormValues = {
  description: string;
  url: string;
  price: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  priority: WishlistPriority;
  note: string;
};

const emptyValues: WishlistFormValues = {
  description: "",
  url: "",
  price: "",
  categoryId: "",
  paymentMethod: "dad-card",
  priority: "want",
  note: "",
};

export function WishlistItemForm({
  categories,
  initialValues,
  onSubmit,
  onCancel,
}: {
  categories: Category[];
  initialValues?: WishlistFormValues;
  onSubmit: (values: WishlistFormValues) => Promise<string | void>;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<WishlistFormValues>(
    initialValues ?? emptyValues
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!values.description.trim()) {
      setError("יש להזין תיאור");
      return;
    }
    if (values.url.trim() && !isSafeUrl(values.url.trim())) {
      setError("הקישור חייב להתחיל ב-http:// או https://");
      return;
    }

    setSubmitting(true);
    const submitError = await onSubmit(values);
    setSubmitting(false);
    if (submitError) {
      setError(submitError);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-5 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="text-lg font-medium">
          {initialValues ? "עריכת פריט" : "פריט חדש"}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              תיאור
            </label>
            <input
              value={values.description}
              onChange={(e) =>
                setValues((v) => ({ ...v, description: e.target.value }))
              }
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              קישור (לא חובה)
            </label>
            <input
              type="url"
              dir="ltr"
              value={values.url}
              onChange={(e) => setValues((v) => ({ ...v, url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-neutral-500 mb-1">
                מחיר (לא חובה)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={values.price}
                onChange={(e) =>
                  setValues((v) => ({ ...v, price: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-500 mb-1">
                קטגוריה (לא חובה)
              </label>
              <select
                value={values.categoryId}
                onChange={(e) =>
                  setValues((v) => ({ ...v, categoryId: e.target.value }))
                }
                className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" className="text-black">
                  ללא
                </option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id} className="text-black">
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              ממה אשלם
            </label>
            <select
              value={values.paymentMethod}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  paymentMethod: e.target.value as PaymentMethod,
                }))
              }
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="text-black">
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              עדיפות
            </label>
            <div className="flex gap-2">
              {WISHLIST_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, priority: p }))}
                  className={`flex-1 rounded-lg py-3 text-sm font-medium transition ${
                    values.priority === p
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {WISHLIST_PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-neutral-500 mb-1">
              הערה (לא חובה)
            </label>
            <textarea
              value={values.note}
              onChange={(e) =>
                setValues((v) => ({ ...v, note: e.target.value }))
              }
              rows={2}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <div className="text-sm text-rose-600">{error}</div>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 transition disabled:opacity-50"
            >
              שמירה
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium py-3 transition"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
