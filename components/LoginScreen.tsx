"use client";

import { useState } from "react";

export function LoginScreen({
  onSendMagicLink,
}: {
  onSendMagicLink: (email: string) => Promise<string | undefined>;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const error = await onSendMagicLink(email);
    if (error) {
      setErrorMessage(error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-8 text-center bg-white dark:bg-neutral-900 shadow-sm space-y-2 max-w-sm mx-auto">
        <div className="text-lg font-medium">נשלח קישור התחברות למייל שלך</div>
        <div className="text-sm text-neutral-500">
          פתחי את תיבת הדואר ולחצי על הקישור כדי להתחבר.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/10 dark:border-white/10 p-8 bg-white dark:bg-neutral-900 shadow-sm space-y-4 max-w-sm mx-auto"
    >
      <div className="text-lg font-medium text-center">התחברות</div>
      <div>
        <label className="block text-sm text-neutral-500 mb-1">
          כתובת מייל
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {status === "error" && (
        <div className="text-sm text-rose-600">{errorMessage}</div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition disabled:opacity-50"
      >
        {status === "sending" ? "שולחת..." : "שליחת קישור התחברות"}
      </button>
    </form>
  );
}
