/*
path :           lib/design/accents.ts
tag :            ["design", "tokens", "accents", "config", "generic"]
projectId:       <UltimateBaseApp>
type:            config
generic:         true

role:            Source de vérité des accents sémantiques par module. Remplace
                 les gradients codés en dur (from-orange-500 to-rose-500…)
                 par des classes tokenisées compatibles dark mode. Chaque
                 module a un accent "primary" (icône/badge) et un "subtle"
                 (fond de carte). Consommé par AppSidebar, SectionCard et
                 les pages pour rester cohérent.

flow:            ACCENTS (Record<ModuleId, Accent>) → importé par les
                 pages → accent.primary / accent.subtle / accent.text.
                 getAccent(id) → fallback sûr.

ecosystem:       DesignSystem = [
                   "@/lib/design/accents.ts",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/layout/SectionCard.tsx",
                 ]
relatedFiles:    ["@/data/nav.ts",
                  "@/components/layout/AppSidebar.tsx",
                  "@/components/layout/SectionCard.tsx"]
imports:         []
exports:         ["ACCENTS", "Accent", "ModuleId", "getAccent"]
useBy:           ["@/data/nav.ts",
                  "@/components/layout/AppSidebar.tsx",
                  "@/components/layout/SectionCard.tsx"]

userStories:     ["*en tant que développeur je veux des accents de module cohérents et compatibles dark mode"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
export type ModuleId = "app" | "scrum" | "genesis" | "business" | "dev";

export type Accent = {
  /** Classes pour l'icône/badge du module (texte coloré). */
  text: string;
  /** Classes pour le fond subtil de carte. */
  subtle: string;
  /** Classes pour l'icône dans un carré coloré. */
  icon: string;
};

export const ACCENTS: Record<ModuleId, Accent> = {
  app: {
    text: "text-blue-600 dark:text-blue-400",
    subtle: "bg-blue-500/5 ring-blue-500/20",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  scrum: {
    text: "text-violet-600 dark:text-violet-400",
    subtle: "bg-violet-500/5 ring-violet-500/20",
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  genesis: {
    text: "text-emerald-600 dark:text-emerald-400",
    subtle: "bg-emerald-500/5 ring-emerald-500/20",
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  business: {
    text: "text-orange-600 dark:text-orange-400",
    subtle: "bg-orange-500/5 ring-orange-500/20",
    icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  },
  dev: {
    text: "text-zinc-600 dark:text-zinc-400",
    subtle: "bg-zinc-500/5 ring-zinc-500/20",
    icon: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  },
};

export function getAccent(id: ModuleId): Accent {
  return ACCENTS[id] ?? ACCENTS.app;
}