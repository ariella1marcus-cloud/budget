"use client";

import { useState } from "react";
import { CategoryRow } from "@/components/CategoryRow";
import { ColorPicker } from "@/components/ColorPicker";
import { LoginScreen } from "@/components/LoginScreen";
import { NavBar } from "@/components/NavBar";
import { CATEGORY_COLOR_NAMES, type CategoryColor } from "@/lib/categoryColors";
import type { DeletionPlan } from "@/lib/categoryOperations";
import type { Category, TransactionType } from "@/lib/types";
import { useAuth } from "@/lib/useAuth";
import { useCategories } from "@/lib/useCategories";

type AddCategoryInput = {
  type: TransactionType;
  name: string;
  emoji: string;
  color: CategoryColor;
};

function AddCategoryForm({
  type,
  onAdd,
}: {
  type: TransactionType;
  onAdd: (input: AddCategoryInput) => Promise<{ error?: string }>;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏷️");
  const [color, setColor] = useState<CategoryColor>(CATEGORY_COLOR_NAMES[0]);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await onAdd({ type, name, emoji, color });
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setEmoji("🏷️");
    setColor(CATEGORY_COLOR_NAMES[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          maxLength={4}
          aria-label="אימוג'י"
          className="w-12 text-center rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-2 py-1.5"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="שם קטגוריה חדשה"
          required
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-1.5"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 transition"
        >
          הוספה
        </button>
      </div>
      <ColorPicker value={color} onChange={setColor} />
      {error && <div className="text-sm text-rose-600">{error}</div>}
    </form>
  );
}

function CategorySection({
  title,
  type,
  categories,
  onAdd,
  onRename,
  onUpdateAppearance,
  onDelete,
}: {
  title: string;
  type: TransactionType;
  categories: Category[];
  onAdd: (input: AddCategoryInput) => Promise<{ error?: string }>;
  onRename: (id: string, name: string) => Promise<{ error?: string }>;
  onUpdateAppearance: (
    id: string,
    changes: { emoji?: string; color?: CategoryColor }
  ) => Promise<{ error?: string }>;
  onDelete: (id: string, reassignToId?: string) => Promise<DeletionPlan>;
}) {
  const items = categories.filter((c) => c.type === type);

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 font-medium">
        {title}
      </div>
      <div className="divide-y divide-black/5 dark:divide-white/10">
        {items.map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            categories={categories}
            onRename={onRename}
            onUpdateAppearance={onUpdateAppearance}
            onDelete={onDelete}
          />
        ))}
      </div>
      <div className="border-t border-black/5 dark:border-white/10">
        <AddCategoryForm type={type} onAdd={onAdd} />
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth();
  const {
    categories,
    loaded,
    addCategory,
    renameCategory,
    updateCategoryAppearance,
    deleteCategory,
  } = useCategories();

  if (loading) {
    return null;
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      {user ? (
        <>
          <NavBar userEmail={user.email} onSignOut={signOut} />
          {loaded && (
            <div className="space-y-6">
              <CategorySection
                title="קטגוריות הוצאה"
                type="expense"
                categories={categories}
                onAdd={addCategory}
                onRename={renameCategory}
                onUpdateAppearance={updateCategoryAppearance}
                onDelete={deleteCategory}
              />
              <CategorySection
                title="קטגוריות הכנסה"
                type="income"
                categories={categories}
                onAdd={addCategory}
                onRename={renameCategory}
                onUpdateAppearance={updateCategoryAppearance}
                onDelete={deleteCategory}
              />
            </div>
          )}
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
