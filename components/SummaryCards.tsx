import type { Transaction } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  const cards = [
    { label: "הכנסות", value: income, color: "text-emerald-600" },
    { label: "הוצאות", value: expense, color: "text-rose-600" },
    {
      label: "מאזן",
      value: balance,
      color: balance >= 0 ? "text-emerald-600" : "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm"
        >
          <div className="text-sm text-neutral-500">{card.label}</div>
          <div className={`text-2xl font-bold mt-1 ${card.color}`}>
            {formatCurrency(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
