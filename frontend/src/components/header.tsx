"use client";

import Link from "next/link";
import { Sprout } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isAdminAddress } from "@/lib/config";
import { ClientOnly } from "@/lib/client-only";

function useSafeAccount() {
  try {
    return useAccount();
  } catch {
    return { isConnected: false, address: undefined, chainId: undefined, chain: undefined };
  }
}

function AdminNavLink({ pathname }: { pathname: string }) {
  const { address } = useSafeAccount();
  const isAdmin = isAdminAddress(address as `0x${string}` | undefined);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-150",
        pathname === "/admin"
          ? "border-2 border-ink-800 bg-sage-600 text-sage-50 shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]"
          : "border-2 border-transparent text-ink-600 hover:border-ink-800 hover:bg-white hover:text-ink-900 hover:shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]"
      )}
    >
      Farm Ops
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/marketplace", label: "Parcels" },
    { href: "/portfolio", label: "Cropfolio" },
    { href: "/stays", label: "Stays" },
  ];

  return (
    <header className="relative z-50 border-b-2 border-ink-800 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-ink-800 bg-primary-600 text-primary-50 shadow-[3px_3px_0_0_oklch(0.2_0.05_152)] transition-transform duration-150 group-hover:-translate-y-0.5 group-active:translate-y-0">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-2xl font-bold tracking-tight text-ink-900">
                Farmora
              </span>
              <span className="mt-1.5 hidden text-[10px] font-medium tracking-wide text-zinc-500 min-[420px]:block">
                Real land. Real yield. No tractor required.
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1.5 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all duration-150",
                  pathname === link.href
                    ? "border-2 border-ink-800 bg-primary-600 text-primary-50 shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]"
                    : "border-2 border-transparent text-ink-600 hover:border-ink-800 hover:bg-white hover:text-ink-900 hover:shadow-[2px_2px_0_0_oklch(0.2_0.05_152)]"
                )}
              >
                {link.label}
              </Link>
            ))}
            <ClientOnly>
              <AdminNavLink pathname={pathname} />
            </ClientOnly>
          </nav>
        </div>
        <ConnectButton
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          showBalance={{ smallScreen: false, largeScreen: true }}
          chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
        />
      </div>
    </header>
  );
}
