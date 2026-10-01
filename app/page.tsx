"use client";

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
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 text-center text-neutral-500 bg-white dark:bg-neutral-900">
          מחוברת בהצלחה! בשלב הבא נחבר כאן את נתוני התקציב.
        </div>
      )}
    </main>
  );
}
