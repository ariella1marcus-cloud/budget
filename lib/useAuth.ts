"use client";

import { useEffect, useState } from "react";
import { auth } from "@appdeploy/client";

type AuthUser = { userId: string; email?: string };

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    auth
      .getUser()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function signIn(): Promise<string | undefined> {
    try {
      const result = await auth.signIn();
      setUser(result.user);
      return undefined;
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "popup_blocked") {
        return "הדפדפן חסם את חלון ההתחברות. יש לאפשר חלונות קופצים ולנסות שוב";
      }
      if (code === "popup_closed") {
        return "חלון ההתחברות נסגר לפני שההתחברות הסתיימה";
      }
      return "ההתחברות נכשלה, נסי שוב";
    }
  }

  async function signOut() {
    await auth.signOut();
    setUser(null);
  }

  return { user, loading, signIn, signOut };
}
