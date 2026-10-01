import type { TransactionType } from "./types";

export const CATEGORIES: Record<TransactionType, string[]> = {
  income: ["משכורת", "מתנה", "החזר כספי", "אחר"],
  expense: [
    "מזון",
    "תחבורה",
    "דיור",
    "בילויים",
    "בריאות",
    "קניות",
    "חינוך",
    "אחר",
  ],
};
