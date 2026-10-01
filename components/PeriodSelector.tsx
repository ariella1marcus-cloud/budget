import { getPeriodLabel, type PeriodType } from "@/lib/period";

export function PeriodSelector({
  periodType,
  anchorDate,
  onPeriodTypeChange,
  onPrevious,
  onNext,
  onToday,
}: {
  periodType: PeriodType;
  anchorDate: Date;
  onPeriodTypeChange: (type: PeriodType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPeriodTypeChange("month")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            periodType === "month"
              ? "bg-indigo-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          חודשי
        </button>
        <button
          type="button"
          onClick={() => onPeriodTypeChange("week")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            periodType === "week"
              ? "bg-indigo-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          שבועי
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="תקופה קודמת"
          className="rounded-lg w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
          ‹
        </button>
        <span className="text-sm font-medium min-w-[9rem] text-center">
          {getPeriodLabel(periodType, anchorDate)}
        </span>
        <button
          type="button"
          onClick={onNext}
          aria-label="תקופה הבאה"
          className="rounded-lg w-8 h-8 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
        >
          ›
        </button>
      </div>

      <button
        type="button"
        onClick={onToday}
        className="rounded-lg px-3 py-1.5 text-sm font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
      >
        היום
      </button>
    </div>
  );
}
