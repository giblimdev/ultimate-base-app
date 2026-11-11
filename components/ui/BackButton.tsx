/*
path :           components/ui/BackButton.tsx
tag :            ["ui", "navigation", "back", "generic", "link"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Bouton de retour transverse. Rend un lien Next.js stylé
                 (icône flèche + libellé) vers un href donné. Réutilisable
                 dans toutes les couches (App, Genesis, Scrum, Business).
                 Présentation pure, accessible (aria-label, focus visible,
                 zone tactile mobile). Utilise cn (pas clsx) pour rester
                 dans le design system et les tokens shadcn.

flow:            BackButton({ href, label, className? }) → <Link href> →
                 icône ArrowLeft (aria-hidden) + texte du label →
                 styles design system (border, hover, focus-visible, ring).

ecosystem:       UI = [
                   "@/components/ui/BackButton.tsx",
                 ]
relatedFiles:    ["@/app/genesis/page.tsx"]
imports:         ["next/link", "lucide-react", "@/lib/utils"]
exports:         ["BackButton", "BackButtonProps"]
useBy:           ["@/app/genesis/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux revenir à la page précédente ou à un point d'entrée"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type BackButtonProps = {
  href: string;
  label?: string;
  className?: string;
};

export function BackButton({
  href,
  label = "Retour",
  className,
}: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex min-h-9 min-w-9 touch-manipulation items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
        "hover:border-primary/40 hover:bg-accent/40 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}