import type { Transaction } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "medium" }).format(
    new Date(date)
  );
}

export function TransactionList({
  transactions,
  onDelete,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 text-center text-neutral-500 bg-white dark:bg-neutral-900">
        עדיין אין תנועות. הוסיפי הכנסה או הוצאה כדי להתחיל.
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm divide-y divide-black/5 dark:divide-white/10 overflow-hidden">
      {sorted.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <div className="font-medium truncate">
              {t.description || t.category}
            </div>
            <div className="text-sm text-neutral-500">
              {t.category} · {formatDate(t.date)}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className={`font-semibold ${
                t.type === "income" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {t.type === "income" ? "+" : "-"}
              {formatCurrency(t.amount)}
            </span>
            <button
              onClick={() => onDelete(t.id)}
              aria-label="מחיקת תנועה"
              className="text-neutral-400 hover:text-rose-600 transition text-sm"
            >
              מחיקה
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
