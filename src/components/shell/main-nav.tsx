"use client";

import {
  BarChart3,
  LayoutDashboard,
  Navigation,
  PackageSearch,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tracking", label: "GPS Dispatch", icon: Navigation },
  { href: "/donations", label: "Donations", icon: PackageSearch },
  { href: "/recipients", label: "Recipients", icon: Users, roles: ["donor"] },
  { href: "/impact", label: "Impact", icon: BarChart3 },
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
                ? "bg-primary-soft text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
