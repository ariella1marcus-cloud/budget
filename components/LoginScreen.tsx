"use client";

import { useState } from "react";

export function LoginScreen({
  onSignIn,
}: {
  onSignIn: () => Promise<string | undefined>;
}) {
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignIn() {
    setSigningIn(true);
    setErrorMessage("");
    const error = await onSignIn();
    if (error) {
      setErrorMessage(error);
      setSigningIn(false);
    }
  }

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 bg-white dark:bg-neutral-900 shadow-sm space-y-4 max-w-sm mx-auto">
      <div className="text-lg font-medium text-center">התחברות</div>
      {errorMessage && (
        <div className="text-sm text-rose-600">{errorMessage}</div>
      )}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={signingIn}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition disabled:opacity-50"
      >
        {signingIn ? "מתחברת..." : "התחברות"}
      </button>
    </div>
  );
}
