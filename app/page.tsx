"use client";

import { useState } from "react";
import {
  PaymentMethodFilter,
  type PaymentMethodOrAll,
} from "@/components/PaymentMethodFilter";
import { PeriodSelector } from "@/components/PeriodSelector";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import {
  addPeriod,
  getDefaultWeekAnchor,
  getPeriodRange,
  isDateInRange,
  type PeriodType,
} from "@/lib/period";
import { useTransactions } from "@/lib/useTransactions";

export default function Home() {
  const { transactions, addTransaction, deleteTransaction, loaded } =
    useTransactions();
  const [filter, setFilter] = useState<PaymentMethodOrAll>("all");
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  function handlePeriodTypeChange(newType: PeriodType) {
    if (newType === "week" && periodType === "month") {
      setAnchorDate((prev) => getDefaultWeekAnchor(prev, new Date()));
    }
    setPeriodType(newType);
  }

  const periodRange = getPeriodRange(periodType, anchorDate);
  const periodTransactions = transactions.filter((t) =>
    isDateInRange(t.date, periodRange)
  );
  const visibleTransactions =
    filter === "all"
      ? periodTransactions
      : periodTransactions.filter((t) => t.paymentMethod === filter);

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">התקציב שלי</h1>

      {loaded && (
        <>
          <PeriodSelector
            periodType={periodType}
            anchorDate={anchorDate}
            onPeriodTypeChange={handlePeriodTypeChange}
            onPrevious={() =>
              setAnchorDate((prev) => addPeriod(periodType, prev, -1))
            }
            onNext={() =>
              setAnchorDate((prev) => addPeriod(periodType, prev, 1))
            }
            onToday={() => setAnchorDate(new Date())}
          />
          <SummaryCards
            transactions={transactions}
            periodType={periodType}
            anchorDate={anchorDate}
          />
          <TransactionForm onAdd={addTransaction} />
          <PaymentMethodFilter value={filter} onChange={setFilter} />
          <TransactionList
            transactions={visibleTransactions}
            onDelete={deleteTransaction}
          />
        </>
      )}
    </main>
  );
}
