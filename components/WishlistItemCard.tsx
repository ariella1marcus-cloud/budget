"use client";

import { useState } from "react";
import { CategoryBadge } from "@/components/CategoryBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";
import type { Category, WishlistItem } from "@/lib/types";
import { extractDomain } from "@/lib/wishlistOperations";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function WishlistItemCard({
  item,
  category,
  onTogglePurchased,
  onEdit,
  onDelete,
  onRevert,
}: {
  item: WishlistItem;
  category: Category | undefined;
  onTogglePurchased: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRevert: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isPurchased = item.status === "purchased";

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={isPurchased}
        aria-label="סימון כנקנה"
        onClick={onTogglePurchased}
        disabled={isPurchased}
        className={`shrink-0 mt-0.5 w-11 h-11 rounded-lg border-2 flex items-center justify-center transition ${
          isPurchased
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "border-black/20 dark:border-white/20 text-transparent hover:border-indigo-500"
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="font-medium break-words">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {item.description}
            </a>
          ) : (
            item.description
          )}
        </div>
        {item.url && (
          <div dir="ltr" className="text-xs text-neutral-400">
            {extractDomain(item.url)}
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {item.price !== null && (
            <span className="font-semibold">{formatCurrency(item.price)}</span>
          )}
          <PriorityBadge priority={item.priority} />
          {category && <CategoryBadge category={category} />}
          <span className="text-neutral-500">
            {PAYMENT_METHOD_LABELS[item.paymentMethod]}
          </span>
        </div>
        {item.note && (
          <div className="text-sm text-neutral-500">{item.note}</div>
        )}
      </div>

      <div className="flex flex-col gap-2 shrink-0 items-end">
        {isPurchased ? (
          <button
            onClick={onRevert}
            type="button"
            className="text-sm text-neutral-500 hover:text-indigo-600 transition"
          >
            החזר לרשימה
          </button>
        ) : (
          <button
            onClick={onEdit}
            type="button"
            className="text-sm text-neutral-500 hover:text-indigo-600 transition"
          >
            עריכה
          </button>
        )}
        {confirmingDelete ? (
          <div className="flex gap-1">
            <button
              onClick={onDelete}
              type="button"
              className="text-sm text-rose-600"
            >
              אישור
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              type="button"
              className="text-sm text-neutral-500"
            >
              ביטול
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingDelete(true)}
            type="button"
            className="text-sm text-neutral-500 hover:text-rose-600 transition"
          >
            מחיקה
          </button>
        )}
      </div>
    </div>
  );
}
