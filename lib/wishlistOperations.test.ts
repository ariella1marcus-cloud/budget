import { describe, expect, it } from "vitest";
import {
  buildExpenseFromItem,
  canStartPurchase,
  canUndoPurchase,
  extractDomain,
  isItemComplete,
  isSafeUrl,
  planRevertToWishlist,
} from "./wishlistOperations";
import type { WishlistItem } from "./types";

function makeItem(overrides: Partial<WishlistItem> = {}): WishlistItem {
  return {
    id: "item-1",
    status: "wishlist",
    description: "משהו",
    url: null,
    price: null,
    categoryId: null,
    paymentMethod: "dad-card",
    priority: "want",
    note: null,
    transactionId: null,
    ...overrides,
  };
}

describe("isSafeUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isSafeUrl("https://amazon.com/item")).toBe(true);
    expect(isSafeUrl("http://example.com")).toBe(true);
  });

  it("rejects a javascript: URL", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects other dangerous or unknown schemes", () => {
    expect(isSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeUrl("ftp://example.com")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isSafeUrl("not a url")).toBe(false);
    expect(isSafeUrl("")).toBe(false);
  });
});

describe("extractDomain", () => {
  it("extracts the bare hostname without www", () => {
    expect(extractDomain("https://www.amazon.com/dp/B000")).toBe("amazon.com");
  });

  it("extracts the hostname when there is no www", () => {
    expect(extractDomain("https://example.co.il/path?x=1")).toBe("example.co.il");
  });

  it("returns an empty string for invalid URLs", () => {
    expect(extractDomain("javascript:alert(1)")).toBe("");
  });
});

describe("isItemComplete", () => {
  it("is false when price is missing", () => {
    expect(isItemComplete({ price: null, categoryId: "cat-1" })).toBe(false);
  });

  it("is false when category is missing", () => {
    expect(isItemComplete({ price: 100, categoryId: null })).toBe(false);
  });

  it("is false when both are missing", () => {
    expect(isItemComplete({ price: null, categoryId: null })).toBe(false);
  });

  it("is true when both price and category are present", () => {
    expect(isItemComplete({ price: 250, categoryId: "cat-1" })).toBe(true);
  });
});

describe("buildExpenseFromItem", () => {
  it("maps the item fields onto a new expense transaction", () => {
    const expense = buildExpenseFromItem(
      {
        description: "אוזניות",
        price: 250,
        categoryId: "cat-1",
        paymentMethod: "dad-card",
      },
      "2026-10-08"
    );
    expect(expense).toEqual({
      type: "expense",
      amount: 250,
      categoryId: "cat-1",
      description: "אוזניות",
      date: "2026-10-08",
      paymentMethod: "dad-card",
    });
  });
});

describe("canStartPurchase", () => {
  it("allows marking a wishlist item as purchased", () => {
    expect(canStartPurchase(makeItem({ status: "wishlist" }))).toBe(true);
  });

  it("blocks marking an already-purchased item again (double-click guard)", () => {
    expect(canStartPurchase(makeItem({ status: "purchased" }))).toBe(false);
  });
});

describe("canUndoPurchase", () => {
  it("allows undo when the item is purchased with a linked transaction", () => {
    expect(
      canUndoPurchase(makeItem({ status: "purchased", transactionId: "tx-1" }))
    ).toBe(true);
  });

  it("blocks undo when there is no linked transaction", () => {
    expect(
      canUndoPurchase(makeItem({ status: "purchased", transactionId: null }))
    ).toBe(false);
  });

  it("blocks undo when the item was never purchased", () => {
    expect(
      canUndoPurchase(makeItem({ status: "wishlist", transactionId: null }))
    ).toBe(false);
  });
});

describe("planRevertToWishlist", () => {
  it("flags a linked transaction so the caller can ask before deleting it", () => {
    expect(planRevertToWishlist(makeItem({ transactionId: "tx-1" }))).toEqual({
      hasLinkedTransaction: true,
      transactionId: "tx-1",
    });
  });

  it("reports no linked transaction when there isn't one", () => {
    expect(planRevertToWishlist(makeItem({ transactionId: null }))).toEqual({
      hasLinkedTransaction: false,
      transactionId: null,
    });
  });
});
