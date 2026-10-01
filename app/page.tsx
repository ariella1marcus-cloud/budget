"use client";

import { BudgetApp } from "@/components/BudgetApp";
import { LoginScreen } from "@/components/LoginScreen";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">התקציב שלי</h1>
        {user && (
          <button
            onClick={signOut}
            className="text-sm text-neutral-500 hover:text-rose-600 transition"
          >
            התנתקות ({user.email})
          </button>
        )}
      </div>

      {!user ? (
        <LoginScreen
          onSendMagicLink={(email) => signInWithMagicLink(email)}
        />
      ) : (
        <BudgetApp />
      )}
    </main>
  );
}
