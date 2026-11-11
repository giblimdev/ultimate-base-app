/*
path :           components/layout/PageHeader.tsx
tag :            ["layout", "header", "page", "design-system", "generic"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Header de page réutilisable et unifié. Remplace les quatre
                 variantes actuelles (business, dev, genesis, business).
                 Affiche un badge optionnel, un titre, une description, et
                 un slot d'actions. Server Component (aucun état). Rend un
                 <header> sémantique avec hiérarchie h1 stable et tokens
                 shadcn uniquement.

flow:            PageHeader({ badge?, title, description?, actions?, children? })
                 → <header> → ligne badge optionnel → <h1> + <p> →
                 slot actions à droite → slot children optionnel (filtres).

ecosystem:       DesignSystem = [
                   "@/components/layout/PageHeader.tsx",
                   "@/components/layout/SectionCard.tsx",
                   "@/components/layout/InfoCard.tsx",
                 ]
relatedFiles:    ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx",
                  "@/app/genesis/page.tsx"]
imports:         ["react", "@/lib/utils", "@/components/ui/badge"]
exports:         ["PageHeader", "PageHeaderProps"]
useBy:           ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx",
                  "@/app/genesis/page.tsx"]

userStories:     ["*en tant que développeur je veux un header de page cohérent partout"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type PageHeaderProps = {
  badge?: {
    label: string;
    icon?: React.ReactNode;
    variant?: "default" | "secondary" | "outline";
  };
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  badge,
  title,
  description,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {badge && (
            <Badge
              variant={badge.variant ?? "secondary"}
              className="w-fit gap-1.5"
            >
              {badge.icon}
              {badge.label}
            </Badge>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </header>
  );
}