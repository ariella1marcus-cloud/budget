import type { Transaction } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatRow({
  label,
  value,
  color,
  emphasize = false,
}: {
  label: string;
  value: number;
  color: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className={`${emphasize ? "font-bold" : "font-semibold"} ${color}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function SummaryCards({ transactions }: { transactions: Transaction[] }) {
  const myCardTransactions = transactions.filter(
    (t) => t.paymentMethod === "my-card"
  );
  const myCardIncome = myCardTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const myCardExpense = myCardTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const myCardBalance = myCardIncome - myCardExpense;

  const dadCardExpense = transactions
    .filter((t) => t.paymentMethod === "dad-card" && t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm space-y-2">
        <div className="text-sm text-neutral-500 font-medium mb-1">
          הכרטיס שלי
        </div>
        <StatRow label="הכנסות" value={myCardIncome} color="text-emerald-600" />
        <StatRow label="הוצאות" value={myCardExpense} color="text-rose-600" />
        <div className="pt-2 border-t border-black/5 dark:border-white/10">
          <StatRow
            label="מאזן"
            value={myCardBalance}
            color={myCardBalance >= 0 ? "text-emerald-600" : "text-rose-600"}
            emphasize
          />
        </div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="text-sm text-neutral-500">הכרטיס של אבא</div>
        <div className="text-2xl font-bold mt-1 text-rose-600">
          {formatCurrency(dadCardExpense)}
        </div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="text-sm text-neutral-500">סה״כ הוצאות</div>
        <div className="text-2xl font-bold mt-1 text-rose-600">
          {formatCurrency(totalExpense)}
        </div>
      </div>
    </div>
  );
}
