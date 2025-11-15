"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { FiCompass, FiLogOut, FiMap, FiPlusCircle, FiUser } from "react-icons/fi";

const navItems = [
  { href: "/", label: "Dashboard", icon: FiCompass },
  { href: "/trips", label: "Trips", icon: FiMap }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthRoute = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthRoute) {
    return <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 text-xl font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white">
              TE
            </span>
            TripEasy Planner
          </Link>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition",
                    pathname === item.href ? "text-brand-600" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {session ? (
              <>
                <Link
                  href="/trips/new"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
                >
                  <FiPlusCircle className="h-4 w-4" />
                  New Trip
                </Link>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
                  <FiUser className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-700">{session.user?.name ?? session.user?.email}</span>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-1 rounded-full px-2 py-1 text-slate-500 hover:text-rose-600"
                  >
                    <FiLogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-600"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
