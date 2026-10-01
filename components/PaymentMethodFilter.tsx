import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "@/lib/paymentMethods";
import type { PaymentMethod } from "@/lib/types";

export type PaymentMethodOrAll = PaymentMethod | "all";

export function PaymentMethodFilter({
  value,
  onChange,
}: {
  value: PaymentMethodOrAll;
  onChange: (value: PaymentMethodOrAll) => void;
}) {
  const options: { value: PaymentMethodOrAll; label: string }[] = [
    { value: "all", label: "הכול" },
    ...PAYMENT_METHODS.map((m) => ({ value: m, label: PAYMENT_METHOD_LABELS[m] })),
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === option.value
              ? "bg-indigo-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
