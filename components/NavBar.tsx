"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavBar({
  userEmail,
  onSignOut,
}: {
  userEmail?: string;
  onSignOut: () => void;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "הבית" },
    { href: "/categories", label: "קטגוריות" },
  ];

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">התקציב שלי</h1>
        <nav className="flex gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-1.5 rounded-lg transition ${
                pathname === link.href
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {userEmail && (
        <button
          onClick={onSignOut}
          className="text-sm text-neutral-500 hover:text-rose-600 transition"
        >
          התנתקות ({userEmail})
        </button>
      )}
    </div>
  );
}
