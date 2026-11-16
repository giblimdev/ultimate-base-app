/*
path :           components/layout/PublicHeader.tsx
tag :            ["layout", "navigation", "header", "public", "client",
                  "user-menu"]
projectId :      <UltimateBaseApp>
type :           component
generic :        true

role :           Header public de la landing et des pages légales. Contient
                 le logo (lien vers /), des liens de navigation (Fonctionnalités,
                 Tarifs — optionnels), et le UserMenu à droite. Le UserMenu
                 affiche « Se connecter » + « Créer un compte » si non
                 connecté, ou l'avatar + menu profil/thème/déconnexion si
                 connecté. Composant client justifié par usePathname (état
                 actif) et par UserMenu (qui lit la session côté client).

flow :           PublicHeader() → usePathname → logo + nav + <UserMenu />.

ecosystem :      Public = [
                   "@/components/layout/PublicHeader.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/UserMenu.tsx",
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                 ]
relatedFiles :   ["@/components/layout/UserMenu.tsx",
                  "@/components/layout/PublicFooter.tsx",
                  "@/app/(public)/layout.tsx"]
imports :        ["next/link", "next/navigation", "lucide-react",
                  "@/components/layout/UserMenu", "@/lib/utils"]
exports :        ["PublicHeader"]
useBy :          ["@/app/(public)/layout.tsx"]

userStories :    ["*en tant que visiteur je veux accéder à la connexion depuis la landing",
                  "*en tant qu'utilisateur connecté je veux voir mon avatar sur la landing"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#modules", label: "Modules" },
  { href: "/legal/terms", label: "CGU" },
  { href: "/legal/privacy", label: "Confidentialité" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-accent/40"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 text-white shadow-sm">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <span className="hidden sm:inline">Ultimate Base App</span>
      </Link>

      {/* Navigation desktop */}
      <nav
        aria-label="Navigation publique"
        className="ml-4 hidden items-center gap-1 md:flex"
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Espace flexible */}
      <div className="flex-1" />

      {/* Menu utilisateur (login/register ou avatar) */}
      <UserMenu />
    </header>
  );
}