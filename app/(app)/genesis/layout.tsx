/*
path :           app/genesis/layout.tsx
tag :            ["layout", "genesis", "navigation", "tabs", "header",
                  "sub-navigation", "route-group"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout dédié au module Genesis (/genesis/*). Ajoute
                 une couche de navigation secondaire AU-DESSUS du shell
                 applicatif global (AppSidebar + AppHeader, montés par
                 app/(app)/layout.tsx). Affiche un header Genesis (titre
                 + description) et une barre d'onglets horizontale
                 scrollable listant les outils Genesis (Hub, Create
                 Files, Read Files, History, Header Checker, TypeScript
                 Checker, Git Manager). Les onglets "planned" sont
                 désactivés (badge "Bientôt"). Le composant ne monte NI
                 <html> NI <body> NI AppSidebar NI AppHeader : le shell
                 global est déjà rendu par le layout (app) parent.
                 Composant client justifié par usePathname (onglet
                 actif). Server Component impossible ici car
                 usePathname est un hook client.

flow :           GenesisLayout({ children }) → <div> max-w-7xl →
                 <header> (Badge Genesis + h1 + p) → <GenesisNav />
                 (barre d'onglets, usePathname pour l'état actif) →
                 <main>{children}</main>.

ecosystem :      Genesis = [
                   "@/app/(app)/genesis/layout.tsx",
                   "@/app/genesis/lib/tools.ts",
                   "@/components/ui/badge.tsx",
                   "@/components/ui/button.tsx",
                   "@/lib/utils.ts",
                 ]
relatedFiles :   ["@/app/(app)/layout.tsx",
                  "@/app/genesis/lib/tools.ts",
                  "@/data/nav.ts",
                  "@/components/ui/badge.tsx"]
imports :        ["react", "next/link", "next/navigation",
                  "@/app/genesis/lib/tools", "@/components/ui/badge",
                  "@/lib/utils"]
exports :        ["default GenesisLayout"]
useBy :          ["@/app/(app)/genesis/page.tsx",
                  "@/app/(app)/genesis/create-files/page.tsx",
                  "@/app/(app)/genesis/read-files/page.tsx",
                  "@/app/(app)/genesis/history/page.tsx"]

userStories :    ["*en tant que développeur je veux naviguer entre les outils Genesis sans revenir au hub",
                  "*en tant que développeur je veux voir quel outil Genesis est actif",
                  "*en tant que développeur je veux distinguer les outils disponibles des outils à venir"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✘false
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GENESIS_TOOLS,
  type GenesisTool,
  type GenesisToolCategory,
} from "@/app/(app)/genesis/lib/tools";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: GenesisToolCategory[] = [
  "Fichiers",
  "Qualité",
  "Assistance",
  "CI/CD",
];

function isToolActive(pathname: string, tool: GenesisTool): boolean {
  if (tool.href === "/genesis") {
    return pathname === "/genesis";
  }
  return pathname === tool.href || pathname.startsWith(tool.href + "/");
}

export default function GenesisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const readyTools = GENESIS_TOOLS.filter((t) => t.status === "ready");
  const plannedTools = GENESIS_TOOLS.filter((t) => t.status === "planned");

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* ── Header Genesis ───────────────────── */}
      <header className="flex flex-col gap-3">
        <Badge
          variant="outline"
          className="w-fit gap-1.5 border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
        >
          <span
            className="size-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Genesis · Outils de développement
        </Badge>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Boîte à outils développeur
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Assistance au développement et contrôle qualité. Chaque outil
            vérifie, organise ou outille le projet — sans jamais générer de code
            métier à ta place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums">
            {readyTools.length} outil{readyTools.length > 1 ? "s" : ""}{" "}
            disponible{readyTools.length > 1 ? "s" : ""}
          </span>
          {plannedTools.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {plannedTools.length} à venir
              </span>
            </>
          )}
        </div>
      </header>

      {/* ── Barre d'onglets Genesis ──────────── */}
      <nav
        aria-label="Outils Genesis"
        className="flex flex-col gap-2 rounded-xl border border-border bg-card/60 p-2"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORY_ORDER.map((category) => {
            const tools = GENESIS_TOOLS.filter((t) => t.category === category);
            if (tools.length === 0) return null;

            return (
              <div
                key={category}
                className="flex shrink-0 items-center gap-1.5"
              >
                <span className="px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {category}
                </span>
                {tools.map((tool) => {
                  const active = isToolActive(pathname, tool);
                  const planned = tool.status === "planned";
                  const Icon = tool.icon;

                  return (
                    <Link
                      key={tool.href}
                      href={planned ? "#" : tool.href}
                      aria-current={active ? "page" : undefined}
                      aria-disabled={planned || undefined}
                      onClick={
                        planned
                          ? (e) => {
                              e.preventDefault();
                            }
                          : undefined
                      }
                      className={cn(
                        "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : planned
                            ? "cursor-not-allowed border-border/50 bg-background/50 text-muted-foreground/60"
                            : "border-border bg-background text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5",
                      )}
                    >
                      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="whitespace-nowrap">{tool.title}</span>
                      {planned && (
                        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                          bientôt
                        </span>
                      )}
                    </Link>
                  );
                })}
                <span
                  className="px-1 text-muted-foreground/30"
                  aria-hidden="true"
                >
                  ·
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Contenu ──────────────────────────── */}
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
