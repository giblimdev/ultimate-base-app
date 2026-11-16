/*
path :           app/(app)/user/settings/page.tsx
tag :            ["settings", "page", "theme", "lang", "preferences",
                  "user", "ux", "react-compiler"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page de paramètres utilisateur. Deux sections :
                 1. Apparence — sélecteur de thème (next-themes), 3 cartes
                    cliquables avec aperçu et coche.
                 2. Langue — sélecteur fr/en qui persiste le choix dans un
                    cookie `locale` et affiche « Bientôt » car l'UI n'est
                    pas encore traduite.
                 Compatible React Compiler : aucun setState synchrone dans
                 un useEffect. L'état client est lu via useSyncExternalStore
                 (useIsClient + useLocale). L'écriture du cookie vit dans
                 un helper hors composant.

flow :           SettingsPage() → useTheme + useIsClient + useLocale →
                 cartes thème → setTheme ; cartes langue → setLocaleCookie +
                 notifyLocale → toast.

ecosystem :      Settings = [
                   "@/app/(app)/user/settings/page.tsx",
                   "@/components/ui/card",
                   "@/components/ui/badge",
                 ]
relatedFiles :   ["@/components/layout/UserMenu.tsx",
                  "@/app/(app)/user/profile/page.tsx"]
imports :        ["react", "next-themes", "sonner", "lucide-react",
                  "@/components/ui/card", "@/components/ui/badge",
                  "@/lib/utils"]
exports :        ["default SettingsPage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux changer de thème depuis les paramètres",
                  "*en tant qu'utilisateur je veux choisir ma langue même si la traduction est partielle"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Check, Globe, Monitor, Moon, Palette, Sun } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   Helpers hors composant (React Compiler safe)
   ───────────────────────────────────────────── */

function getLocaleCookie(): string {
  if (typeof document === "undefined") return "fr";
  const row = document.cookie.split("; ").find((r) => r.startsWith("locale="));
  return row ? row.split("=")[1] : "fr";
}

function setLocaleCookie(code: string) {
  if (typeof document === "undefined") return;
  document.cookie = `locale=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

let localeListeners: Array<() => void> = [];
function subscribeLocale(cb: () => void) {
  localeListeners.push(cb);
  return () => {
    localeListeners = localeListeners.filter((l) => l !== cb);
  };
}
function notifyLocale() {
  localeListeners.forEach((l) => l());
}

function useLocale(): string {
  return React.useSyncExternalStore(
    subscribeLocale,
    getLocaleCookie,
    () => "fr",
  );
}

function useIsClient(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ─────────────────────────────────────────────
   Données
   ───────────────────────────────────────────── */

type ThemeOption = {
  value: "system" | "light" | "dark";
  label: string;
  description: string;
  icon: React.ReactNode;
  preview: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "system",
    label: "Système",
    description: "Suit le réglage de votre appareil.",
    icon: <Monitor className="size-4" />,
    preview:
      "bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
  },
  {
    value: "light",
    label: "Clair",
    description: "Fond clair en permanence.",
    icon: <Sun className="size-4" />,
    preview: "bg-gradient-to-br from-white to-zinc-100",
  },
  {
    value: "dark",
    label: "Sombre",
    description: "Fond sombre en permanence.",
    icon: <Moon className="size-4" />,
    preview: "bg-gradient-to-br from-zinc-800 to-zinc-950",
  },
];

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷", available: true },
  { code: "en", label: "English", flag: "🇬🇧", available: false },
] as const;

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const language = useLocale();

  function handleLanguageChange(code: string, available: boolean) {
    setLocaleCookie(code);
    notifyLocale();
    if (available) {
      toast.success(`Langue : ${code.toUpperCase()}`);
    } else {
      toast.info(
        "Langue enregistrée. La traduction complète arrive bientôt — l'interface reste en français pour l'instant.",
      );
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Personnalisez l&apos;apparence et la langue de votre espace.
        </p>
      </header>

      {/* Apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette
              className="size-4 text-violet-600 dark:text-violet-400"
              aria-hidden="true"
            />
            Apparence
          </CardTitle>
          <CardDescription>
            Choisissez le thème de l&apos;interface. Le changement est immédiat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const active = isClient && theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "group relative flex flex-col gap-2 rounded-xl border p-3 text-left transition-all",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/30 hover:bg-accent/30",
                  )}
                >
                  <div
                    className={cn(
                      "h-16 w-full rounded-lg border border-border/50",
                      option.preview,
                    )}
                    aria-hidden="true"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                    {active && (
                      <Check
                        className="ml-auto size-4 text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Langue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            Langue
            <Badge variant="outline" className="ml-auto text-[10px]">
              Bientôt
            </Badge>
          </CardTitle>
          <CardDescription>
            Votre choix est enregistré, mais la traduction complète n&apos;est
            pas encore disponible — l&apos;interface reste en français pour
            l&apos;instant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LANGUAGES.map((lang) => {
              const active = isClient && language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() =>
                    handleLanguageChange(lang.code, lang.available)
                  }
                  aria-pressed={active}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/30 hover:bg-accent/30",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {lang.flag}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium">{lang.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {lang.available ? "Disponible" : "Traduction à venir"}
                    </span>
                  </div>
                  {active && (
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}