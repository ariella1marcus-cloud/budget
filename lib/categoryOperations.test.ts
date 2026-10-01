import { describe, expect, it } from "vitest";
import {
  getReassignmentOptions,
  planCategoryDeletion,
  validateCategoryName,
} from "./categoryOperations";
import type { Category } from "./types";

describe("validateCategoryName", () => {
  it("rejects an empty name", () => {
    expect(validateCategoryName("", ["מזון"])).toEqual({
      valid: false,
      error: "יש להזין שם לקטגוריה",
    });
  });

  it("rejects a name that is only whitespace", () => {
    expect(validateCategoryName("   ", [])).toEqual({
      valid: false,
      error: "יש להזין שם לקטגוריה",
    });
  });

  it("rejects a duplicate name", () => {
    const result = validateCategoryName("מזון", ["תחבורה", "מזון"]);
    expect(result.valid).toBe(false);
  });

  it("rejects a duplicate name with surrounding whitespace", () => {
    const result = validateCategoryName("  מזון  ", ["מזון"]);
    expect(result.valid).toBe(false);
  });

  it("accepts a unique name", () => {
    expect(validateCategoryName("חיות מחמד", ["מזון", "תחבורה"])).toEqual({
      valid: true,
    });
  });
});

describe("planCategoryDeletion", () => {
  it("allows immediate deletion when there are no transactions", () => {
    expect(planCategoryDeletion("cat-1", 0)).toEqual({ action: "delete" });
  });

  it("requires reassignment when there are transactions and none was chosen", () => {
    expect(planCategoryDeletion("cat-1", 3)).toEqual({
      action: "needs-reassignment",
      transactionCount: 3,
    });
  });

  it("reassigns and deletes once a target category is chosen", () => {
    expect(planCategoryDeletion("cat-1", 3, "cat-2")).toEqual({
      action: "reassign-and-delete",
      reassignToId: "cat-2",
    });
  });

  it("rejects reassigning a category's transactions to itself", () => {
    const result = planCategoryDeletion("cat-1", 3, "cat-1");
    expect(result.action).toBe("invalid");
  });
});

describe("getReassignmentOptions", () => {
  const categories: Category[] = [
    { id: "1", type: "expense", name: "מזון", emoji: "🍲", color: "sage" },
    { id: "2", type: "expense", name: "תחבורה", emoji: "🚗", color: "blue" },
    { id: "3", type: "income", name: "משכורת", emoji: "💰", color: "blue" },
  ];

  it("only includes categories of the same type", () => {
    const options = getReassignmentOptions(categories, categories[0]);
    expect(options.map((c) => c.id)).toEqual(["2"]);
  });

  it("excludes the category being deleted", () => {
    const options = getReassignmentOptions(categories, categories[0]);
    expect(options.some((c) => c.id === "1")).toBe(false);
  });
});
