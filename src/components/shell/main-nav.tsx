"use client";

import {
  BarChart3,
  LayoutDashboard,
  PackageSearch,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { Translations } from "@/lib/i18n/translations";

interface NavItem {
  href: string;
  translationKey: keyof Translations;
  icon: LucideIcon;
  roles?: UserRole[];
}

const ITEMS: NavItem[] = [
  { href: "/dashboard", translationKey: "navDashboard", icon: LayoutDashboard },
  { href: "/donations", translationKey: "navDonations", icon: PackageSearch },
  { href: "/recipients", translationKey: "navRecipients", icon: Users, roles: ["donor"] },
  { href: "/impact", translationKey: "navImpact", icon: BarChart3 },
];

export function MainNav({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <nav
      aria-label="Main"
      className={cn("flex items-center gap-1 overflow-x-auto", className)}
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary-soft text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            <span className="hidden md:inline">{t(item.translationKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

