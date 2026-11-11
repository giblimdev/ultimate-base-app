/*
path :           components/layout/InfoCard.tsx
tag :            ["layout", "card", "info", "design-system", "generic"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Carte d'information réutilisable, remplace les variantes
                 locales des pages business et dev. Icône + titre +
                 description compacte, tokens shadcn, aucune couleur brute.
                 Server Component pur (aucun état).

flow:            InfoCard({ icon, title, description }) → <Card> →
                 <CardHeader> avec icône + titre → <CardDescription>.

ecosystem:       DesignSystem = [
                   "@/components/layout/InfoCard.tsx",
                   "@/components/layout/PageHeader.tsx",
                   "@/components/layout/SectionCard.tsx",
                 ]
relatedFiles:    ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx",
                  "@/app/genesis/page.tsx"]
imports:         ["react", "@/components/ui/card"]
exports:         ["InfoCard", "InfoCardProps"]
useBy:           ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx",
                  "@/app/genesis/page.tsx"]

userStories:     ["*en tant que développeur je veux une carte info cohérente dans toutes les pages"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import * as React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"
            aria-hidden="true"
          >
            {icon}
          </span>
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-5">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}