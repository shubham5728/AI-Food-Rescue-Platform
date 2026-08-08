"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { type Language } from "@/lib/i18n/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES: { code: Language; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "हिंदी", name: "हिंदी (Hindi)" },
  { code: "gu", label: "ગુજરાતી", name: "ગુજરાતી (Gujarati)" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1.5 px-2.5 text-xs font-semibold tracking-tight ${className}`}
        >
          <Globe className="size-3.5 text-primary" aria-hidden />
          <span>{currentLang.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center justify-between text-xs font-medium cursor-pointer ${
              language === lang.code ? "bg-primary-soft text-primary font-semibold" : ""
            }`}
          >
            <span>{lang.name}</span>
            {language === lang.code && <span className="text-xs">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
