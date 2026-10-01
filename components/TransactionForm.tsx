"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";
import type { PaymentMethod, Transaction, TransactionType } from "@/lib/types";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  onAdd,
}: {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
}) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PAYMENT_METHODS[0]
  );

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
    if (newType === "income") {
      setPaymentMethod("my-card");
    }
  }

  const availablePaymentMethods =
    type === "income" ? (["my-card"] as const) : PAYMENT_METHODS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;

    onAdd({
      type,
      amount: numericAmount,
      category,
      description,
      date,
      paymentMethod,
    });
    setAmount("");
    setDescription("");
    setDate(today());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm space-y-4"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            type === "expense"
              ? "bg-rose-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          הוצאה
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
            type === "income"
              ? "bg-emerald-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          הכנסה
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-500 mb-1">סכום</label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-1">קטגוריה</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {CATEGORIES[type].map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-1">תיאור</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="לדוגמה: קניות בסופר"
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-1">תאריך</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-1">
            אמצעי תשלום
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {availablePaymentMethods.map((m) => (
              <option key={m} value={m} className="text-black">
                {PAYMENT_METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition"
      >
        הוספה
      </button>
    </form>
  );
}
