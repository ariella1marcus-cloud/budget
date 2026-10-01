import type { Category } from "./types";

export type NameValidation = { valid: true } | { valid: false; error: string };

export function validateCategoryName(
  name: string,
  existingNames: string[]
): NameValidation {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "יש להזין שם לקטגוריה" };
  }
  const isDuplicate = existingNames.some((existing) => existing.trim() === trimmed);
  if (isDuplicate) {
    return { valid: false, error: `כבר קיימת קטגוריה בשם "${trimmed}"` };
  }
  return { valid: true };
}

export type DeletionPlan =
  | { action: "delete" }
  | { action: "needs-reassignment"; transactionCount: number }
  | { action: "reassign-and-delete"; reassignToId: string }
  | { action: "invalid"; error: string };

export function planCategoryDeletion(
  categoryId: string,
  transactionCount: number,
  reassignToId?: string
): DeletionPlan {
  if (transactionCount === 0) {
    return { action: "delete" };
  }
  if (!reassignToId) {
    return { action: "needs-reassignment", transactionCount };
  }
  if (reassignToId === categoryId) {
    return {
      action: "invalid",
      error: "לא ניתן להעביר תנועות לאותה קטגוריה שנמחקת",
    };
  }
  return { action: "reassign-and-delete", reassignToId };
}

export function getReassignmentOptions(
  categories: Category[],
  categoryBeingDeleted: Category
): Category[] {
  return categories.filter(
    (c) => c.type === categoryBeingDeleted.type && c.id !== categoryBeingDeleted.id
  );
}
