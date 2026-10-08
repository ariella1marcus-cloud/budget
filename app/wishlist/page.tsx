"use client";

import { useRef, useState } from "react";
import { CompletePurchaseModal } from "@/components/CompletePurchaseModal";
import { LoginScreen } from "@/components/LoginScreen";
import { NavBar } from "@/components/NavBar";
import { WishlistItemCard } from "@/components/WishlistItemCard";
import {
  WishlistItemForm,
  type WishlistFormValues,
} from "@/components/WishlistItemForm";
import type { WishlistPriority } from "@/lib/types";
import { useAuth } from "@/lib/useAuth";
import { useCategories } from "@/lib/useCategories";
import { useWishlist } from "@/lib/useWishlist";
import { isItemComplete } from "@/lib/wishlistOperations";
import {
  WISHLIST_PRIORITIES,
  WISHLIST_PRIORITY_LABELS,
} from "@/lib/wishlistPriority";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortBy = "priority" | "price" | "newest";
const PRIORITY_ORDER: Record<WishlistPriority, number> = {
  must: 0,
  want: 1,
  maybe: 2,
};

function WishlistApp() {
  const { categories } = useCategories();
  const {
    items,
    loaded,
    addItem,
    updateItem,
    deleteItem,
    markPurchased,
    undoPurchase,
    revertToWishlist,
  } = useWishlist();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [revertConfirmId, setRevertConfirmId] = useState<string | null>(null);
  const [undoItemId, setUndoItemId] = useState<string | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [sortBy, setSortBy] = useState<SortBy>("priority");
  const [filterPriority, setFilterPriority] = useState<WishlistPriority | "all">(
    "all"
  );
  const [search, setSearch] = useState("");

  if (!loaded) return null;

  const active = items.filter((i) => i.status === "wishlist");
  const purchased = items.filter((i) => i.status === "purchased");

  const filtered = active
    .filter((i) => filterPriority === "all" || i.priority === filterPriority)
    .filter((i) => i.description.includes(search));

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sortBy === "price") return (b.price ?? -1) - (a.price ?? -1);
    return 0; // "newest": items already arrive newest-first from the hook
  });

  const withPrice = active.filter((i) => i.price !== null);
  const totalActivePrice = withPrice.reduce((sum, i) => sum + (i.price ?? 0), 0);
  const noPriceCount = active.length - withPrice.length;
  const totalPurchased = purchased.reduce((sum, i) => sum + (i.price ?? 0), 0);

  function showUndo(id: string) {
    setUndoItemId(id);
    clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setUndoItemId(null), 6000);
  }

  async function handleToggle(item: (typeof items)[number]) {
    if (isItemComplete(item)) {
      const result = await markPurchased(item.id, {
        price: item.price!,
        categoryId: item.categoryId!,
        date: today(),
      });
      if (!result.error) showUndo(item.id);
    } else {
      setCompletingId(item.id);
    }
  }

  async function handleUndo() {
    if (!undoItemId) return;
    await undoPurchase(undoItemId);
    setUndoItemId(null);
    clearTimeout(undoTimerRef.current);
  }

  async function handleRevertClick(itemId: string) {
    const item = items.find((i) => i.id === itemId);
    if (item?.transactionId) {
      setRevertConfirmId(itemId);
    } else {
      await revertToWishlist(itemId, false);
    }
  }

  const editingItem = items.find((i) => i.id === editingId);
  const completingItem = items.find((i) => i.id === completingId);
  const revertConfirmItem = items.find((i) => i.id === revertConfirmId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">משאלות</h2>
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 transition"
        >
          + הוספה
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="text-sm text-neutral-500">
            ברשימה ({active.length} פריטים
            {noPriceCount > 0 ? `, ${noPriceCount} בלי מחיר` : ""})
          </div>
          <div className="text-2xl font-bold mt-1">
            {formatCurrency(totalActivePrice)}
          </div>
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="text-sm text-neutral-500">נקנה עד כה</div>
          <div className="text-2xl font-bold mt-1">
            {formatCurrency(totalPurchased)}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש לפי תיאור"
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="priority" className="text-black">מיון: עדיפות</option>
          <option value="price" className="text-black">מיון: מחיר</option>
          <option value="newest" className="text-black">מיון: החדש ביותר</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as WishlistPriority | "all")
          }
          className="rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all" className="text-black">כל העדיפויות</option>
          {WISHLIST_PRIORITIES.map((p) => (
            <option key={p} value={p} className="text-black">
              {WISHLIST_PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 text-center text-neutral-500 bg-white dark:bg-neutral-900">
          {active.length === 0
            ? "הרשימה ריקה. לחצי על \"הוספה\" כדי להוסיף את הדבר הראשון שאת רוצה."
            : "אין פריטים שתואמים לחיפוש/לסינון."}
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm divide-y divide-black/5 dark:divide-white/10 overflow-hidden">
          {sorted.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              category={categories.find((c) => c.id === item.categoryId)}
              onTogglePurchased={() => handleToggle(item)}
              onEdit={() => setEditingId(item.id)}
              onDelete={() => deleteItem(item.id)}
              onRevert={() => handleRevertClick(item.id)}
            />
          ))}
        </div>
      )}

      {purchased.length > 0 && (
        <details className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <summary className="px-4 py-3 font-medium cursor-pointer">
            נקנו ({purchased.length})
          </summary>
          <div className="divide-y divide-black/5 dark:divide-white/10">
            {purchased.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                category={categories.find((c) => c.id === item.categoryId)}
                onTogglePurchased={() => {}}
                onEdit={() => {}}
                onDelete={() => deleteItem(item.id)}
                onRevert={() => handleRevertClick(item.id)}
              />
            ))}
          </div>
        </details>
      )}

      {showAddForm && (
        <WishlistItemForm
          categories={categories}
          onCancel={() => setShowAddForm(false)}
          onSubmit={async (values: WishlistFormValues) => {
            const result = await addItem({
              description: values.description.trim(),
              url: values.url.trim() || null,
              price: values.price ? Number(values.price) : null,
              categoryId: values.categoryId || null,
              paymentMethod: values.paymentMethod,
              priority: values.priority,
              note: values.note.trim() || null,
            });
            if (!result.error) setShowAddForm(false);
            return result.error;
          }}
        />
      )}

      {editingItem && (
        <WishlistItemForm
          categories={categories}
          initialValues={{
            description: editingItem.description,
            url: editingItem.url ?? "",
            price: editingItem.price !== null ? String(editingItem.price) : "",
            categoryId: editingItem.categoryId ?? "",
            paymentMethod: editingItem.paymentMethod,
            priority: editingItem.priority,
            note: editingItem.note ?? "",
          }}
          onCancel={() => setEditingId(null)}
          onSubmit={async (values: WishlistFormValues) => {
            const result = await updateItem(editingItem.id, {
              description: values.description.trim(),
              url: values.url.trim() || null,
              price: values.price ? Number(values.price) : null,
              categoryId: values.categoryId || null,
              paymentMethod: values.paymentMethod,
              priority: values.priority,
              note: values.note.trim() || null,
            });
            if (!result.error) setEditingId(null);
            return result.error;
          }}
        />
      )}

      {completingItem && (
        <CompletePurchaseModal
          categories={categories}
          needsPrice={completingItem.price === null}
          needsCategory={completingItem.categoryId === null}
          initialPrice={completingItem.price}
          initialCategoryId={completingItem.categoryId}
          onCancel={() => setCompletingId(null)}
          onConfirm={async (details) => {
            const result = await markPurchased(completingItem.id, details);
            if (!result.error) {
              showUndo(completingItem.id);
              setCompletingId(null);
            }
            return result.error;
          }}
        />
      )}

      {revertConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
          <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-white dark:bg-neutral-900 p-5 space-y-4">
            <div className="text-lg font-medium">החזרה לרשימה</div>
            <div className="text-sm text-neutral-500">
              לפריט הזה יש הוצאה מקושרת. למחוק גם אותה?
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={async () => {
                  await revertToWishlist(revertConfirmItem.id, true);
                  setRevertConfirmId(null);
                }}
                className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 transition"
              >
                כן, למחוק גם את ההוצאה
              </button>
              <button
                type="button"
                onClick={async () => {
                  await revertToWishlist(revertConfirmItem.id, false);
                  setRevertConfirmId(null);
                }}
                className="rounded-lg bg-neutral-100 dark:bg-neutral-800 font-medium py-3 transition"
              >
                לא, להשאיר את ההוצאה
              </button>
              <button
                type="button"
                onClick={() => setRevertConfirmId(null)}
                className="text-sm text-neutral-500 py-1"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {undoItemId && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-4 z-50 rounded-xl bg-neutral-900 text-white px-4 py-3 flex items-center justify-between gap-4 shadow-lg">
          <span className="text-sm">נרשם כהוצאה ✓</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition"
          >
            בטלי
          </button>
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth();

  if (loading) return null;

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      {user ? (
        <>
          <NavBar userEmail={user.email} onSignOut={signOut} />
          <WishlistApp />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center">התקציב שלי</h1>
          <LoginScreen
            onSendMagicLink={(email) => signInWithMagicLink(email)}
          />
        </>
      )}
    </main>
  );
}
