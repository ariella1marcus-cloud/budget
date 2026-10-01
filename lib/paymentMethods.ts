import type { PaymentMethod } from "./types";

export const PAYMENT_METHODS: PaymentMethod[] = ["my-card", "dad-card"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  "my-card": "הכרטיס שלי",
  "dad-card": "הכרטיס של אבא",
};
