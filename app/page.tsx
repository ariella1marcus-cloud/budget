"use client";

import { BudgetApp } from "@/components/BudgetApp";
import { LoginScreen } from "@/components/LoginScreen";
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/lib/useAuth";

export default function Home() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <main className="max-w-3xl w-full mx-auto px-4 py-10 space-y-6">
      {user ? (
        <>
          <NavBar userEmail={user.email} onSignOut={signOut} />
          <BudgetApp userId={user.userId} />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center">התקציב שלי</h1>
          <LoginScreen onSignIn={signIn} />
        </>
      )}
    </main>
  );
}
