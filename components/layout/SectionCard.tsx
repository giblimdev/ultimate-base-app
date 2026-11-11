/*
path :           components/layout/SectionCard.tsx
tag :            ["layout", "section", "card", "design-system", "generic"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Section éditoriale réutilisable pour les pages pédagogiques
                 (business onboarding, dev reference). Icône teintée par un
                 accent sémantique (pas de couleur brute), titre, sous-titre,
                 contenu. Accent passé via classe utilitaire tokenisée.

flow:            SectionCard({ id?, icon, accent, title, subtitle, children })
                 → <section id={id} className="scroll-mt-24"> → header avec
                 icône + titre + sous-titre → contenu enfants.

ecosystem:       DesignSystem = [
                   "@/components/layout/InfoCard.tsx",
                   "@/components/layout/PageHeader.tsx",
                   "@/components/layout/SectionCard.tsx",
                 ]
relatedFiles:    ["@/app/business/page.tsx", "@/app/dev/page.tsx"]
imports:         ["react", "@/lib/utils"]
exports:         ["SectionCard", "SectionCardProps"]
useBy:           ["@/app/business/page.tsx"]

userStories:     ["*en tant que développeur je veux une section éditoriale cohérente"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import * as React from "react";
import { cn } from "@/lib/utils";

export type SectionCardProps = {
  id?: string;
  icon: React.ReactNode;
  accent?: "primary" | "muted" | "destructive";
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const accentMap: Record<NonNullable<SectionCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  muted: "bg-muted text-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

export function SectionCard({
  id,
  icon,
  accent = "primary",
  title,
  subtitle,
  children,
}: SectionCardProps) {
  return (
    <section id={id} className="scroll-mt-24 flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            accentMap[accent],
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}