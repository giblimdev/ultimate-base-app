/*
path :           components/layout/SuccessScreen.tsx
tag :            ["layout", "success", "feedback", "design-system", "generic"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Écran de succès réutilisable, affiché après une action
                 irréversible réussie (création de fichiers, export, etc.).
                 Remplace complètement le formulaire d'origine — pas de
                 coexistence formulaire/résultat. Affiche un en-tête de
                 confirmation, une liste d'items avec chemins et métadonnées,
                 et jusqu'à trois CTA hiérarchisés (primaire, secondaire,
                 tertiaire). Server Component pur, aucun état, aucune
                 redirection automatique : toutes les actions sont explicites
                 et contrôlées par l'utilisateur (conforme WCAG 2.2.1 Timing
                 Adjustable). Accessible : role="status", aria-live="polite",
                 icône décorative aria-hidden.

flow:            SuccessScreen({ title, description, items, primaryAction,
                 secondaryAction?, tertiaryAction? }) → <section role="status"
                 aria-live="polite"> → <Card> → <CardHeader> avec icône ✓ +
                 titre + description → <CardContent> avec liste d'items
                 (label + meta + sublabel) → groupe d'actions hiérarchisé
                 (primaire, secondaire, tertiaire aligné à droite).

ecosystem:       DesignSystem = [
                   "@/components/layout/InfoCard.tsx",
                   "@/components/layout/PageHeader.tsx",
                   "@/components/layout/SectionCard.tsx",
                   "@/components/layout/SuccessScreen.tsx",
                 ]
relatedFiles:    ["@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         ["react", "lucide-react", "@/lib/utils",
                  "@/components/ui/card"]
exports:         ["SuccessScreen", "SuccessScreenProps", "SuccessItem"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant qu'utilisateur je veux un écran de confirmation clair après une action réussie",
                  "*en tant qu'utilisateur je veux décider moi-même quand quitter l'écran de succès"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import * as React from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export type SuccessItem = {
  id: string;
  label: string;
  meta?: string;
  sublabel?: string;
};

export type SuccessScreenProps = {
  title: string;
  description?: string;
  items: SuccessItem[];
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
  tertiaryAction?: React.ReactNode;
  className?: string;
};

export function SuccessScreen({
  title,
  description,
  items,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  className,
}: SuccessScreenProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn("flex flex-col gap-6", className)}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            >
              <CheckCircle2 className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              {description && (
                <p className="text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {items.length > 0 && (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="break-all font-mono text-xs">
                      {item.label}
                    </code>
                    {item.meta && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                        {item.meta}
                      </span>
                    )}
                  </div>
                  {item.sublabel && (
                    <code className="break-all font-mono text-[11px] text-muted-foreground">
                      {item.sublabel}
                    </code>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {primaryAction}
            {secondaryAction}
            {tertiaryAction && (
              <div className="sm:ml-auto">{tertiaryAction}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}