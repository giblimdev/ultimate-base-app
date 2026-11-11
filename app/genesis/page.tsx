/*
path :           app/genesis/page.tsx
tag :            ["genesis", "hub", "tools", "presentation", "page", "color"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page hub de présentation des outils Genesis. Liste les
                 outils sous forme de cartes cliquables. Chaque carte est
                 teintée par la couleur de sa CATÉGORIE (Fichiers=bleu,
                 Qualité=émeraude, Assistance=violet, CI/CD=ambre) — pas
                 une couleur par carte, pour que la couleur encode une
                 information (la catégorie) et non une décoration. Les
                 outils "planned" sont rendus comme des cartes désactivées
                 (pas de lien, badge "Bientôt") pour éviter les 404.

flow:            Server Component → lit GENESIS_TOOLS → rend un header →
                 grille responsive de cartes → getCategoryAccent(category)
                 → classes de couleur cohérentes → si status "ready" :
                 <Link> cliquable ; si "planned" : <div> désactivé.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/script-integrity.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/tools.ts",
                  "@/data/nav.ts",
                  "@/components/ui/BackButton.tsx"]
imports:         ["next/link",
                  "@/app/genesis/lib/tools",
                  "@/components/ui/BackButton",
                  "@/components/ui/badge",
                  "@/lib/utils"]
exports:         ["default (GenesisPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux voir tous les outils Genesis et accéder à chacun",
                  "*en tant qu'utilisateur je veux distinguer les outils disponibles des outils à venir",
                  "*en tant qu'utilisateur je veux reconnaître la catégorie d'un outil d'un coup d'œil"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import {
  GENESIS_TOOLS,
  type GenesisTool,
  type GenesisToolCategory,
} from "@/app/genesis/lib/tools";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CategoryAccent = {
  icon: string;
  badge: string;
  hover: string;
  dot: string;
};

const CATEGORY_ACCENTS: Record<GenesisToolCategory, CategoryAccent> = {
  Fichiers: {
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badge:
      "border-blue-500/30 text-blue-700 dark:text-blue-300 bg-blue-500/5",
    hover: "hover:border-blue-500/40 hover:bg-blue-500/[0.03]",
    dot: "bg-blue-500",
  },
  Qualité: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    badge:
      "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/5",
    hover: "hover:border-emerald-500/40 hover:bg-emerald-500/[0.03]",
    dot: "bg-emerald-500",
  },
  Assistance: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    badge:
      "border-violet-500/30 text-violet-700 dark:text-violet-300 bg-violet-500/5",
    hover: "hover:border-violet-500/40 hover:bg-violet-500/[0.03]",
    dot: "bg-violet-500",
  },
  "CI/CD": {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    badge:
      "border-amber-500/30 text-amber-700 dark:text-amber-300 bg-amber-500/5",
    hover: "hover:border-amber-500/40 hover:bg-amber-500/[0.03]",
    dot: "bg-amber-500",
  },
};

function getCategoryAccent(category: GenesisToolCategory): CategoryAccent {
  return CATEGORY_ACCENTS[category];
}

export default function GenesisPage() {
  const readyCount = GENESIS_TOOLS.filter((t) => t.status === "ready").length;
  const totalCount = GENESIS_TOOLS.length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div>
        <BackButton href="/" label="Retour à l'accueil" />
      </div>

      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Genesis
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Outils de développement
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Assistance au développement et contrôle qualité. Chaque outil vérifie,
          organise ou outille le projet — sans jamais générer de code métier à
          ta place.
        </p>
        <p className="text-xs text-muted-foreground">
          {readyCount} outil{readyCount > 1 ? "s" : ""} disponible
          {readyCount > 1 ? "s" : ""} sur {totalCount}
        </p>
      </header>

      {/* Légende des catégories */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Catégories
        </span>
        {(Object.keys(CATEGORY_ACCENTS) as GenesisToolCategory[]).map(
          (category) => {
            const accent = CATEGORY_ACCENTS[category];
            return (
              <span
                key={category}
                className={cn(
                  "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
                  accent.badge,
                )}
              >
                <span
                  className={cn("size-1.5 rounded-full", accent.dot)}
                  aria-hidden="true"
                />
                {category}
              </span>
            );
          },
        )}
      </div>

      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GENESIS_TOOLS.map((tool) => (
          <li key={tool.href}>
            <GenesisToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </main>
  );
}

type GenesisToolCardProps = {
  tool: GenesisTool;
};

function GenesisToolCard({ tool }: GenesisToolCardProps) {
  const Icon = tool.icon;
  const isReady = tool.status === "ready";
  const accent = getCategoryAccent(tool.category);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            isReady ? accent.icon : "bg-muted text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
        <div className="flex items-center gap-1.5">
          {!isReady && (
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[10px] uppercase tracking-wide"
            >
              Bientôt
            </Badge>
          )}
          <span
            className={cn(
              "inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10px] font-medium uppercase tracking-wide",
              isReady ? accent.badge : "border-border text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1 rounded-full",
                isReady ? accent.dot : "bg-muted-foreground",
              )}
              aria-hidden="true"
            />
            {tool.category}
          </span>
        </div>
      </div>

      <h2 className="mt-3 text-base font-semibold sm:text-lg">{tool.title}</h2>
      <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground">
        {tool.description}
      </p>

      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1 text-sm font-medium",
          isReady ? "text-primary" : "text-muted-foreground",
        )}
      >
        {isReady ? "Ouvrir" : "À venir"}
        <span aria-hidden="true">→</span>
      </span>
    </>
  );

  const baseClass =
    "group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors sm:p-5";

  if (!isReady) {
    return (
      <div
        aria-disabled="true"
        className={cn(baseClass, "cursor-not-allowed opacity-60")}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={tool.href}
      className={cn(
        baseClass,
        accent.hover,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {inner}
    </Link>
  );
}