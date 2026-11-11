/*
path :           app/genesis/page.tsx
tag :            ["genesis", "hub", "tools", "presentation", "page"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page hub de présentation des outils Genesis. Liste les
                 outils de développement et de contrôle qualité sous forme de
                 cartes cliquables avec lien vers chaque outil. Point d'entrée
                 de la couche C (Genesis).

flow:            Server Component → lit GENESIS_TOOLS (config statique) →
                 rend un header de section → grille responsive de cartes →
                 chaque carte pointe vers son href.

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
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/tools.ts",
                  "@/data/nav.ts",
                  "@/components/BackButton.tsx"]
imports:         ["next/link",
                  "@/app/genesis/lib/tools",
                  "@/components/BackButton"]
exports:         ["default (GenesisPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux voir tous les outils Genesis et accéder à chacun"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { GENESIS_TOOLS, type GenesisTool } from "@/app/genesis/lib/tools";

export default function GenesisPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <BackButton href="/" label="Retour à l'accueil" />
      </div>

      <header className="mb-8 sm:mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Genesis
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Outils de développement
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Assistance au développement et contrôle qualité. Chaque outil vérifie,
          organise ou outille le projet — sans jamais générer de code métier à
          ta place.
        </p>
      </header>

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

  return (
    <Link
      href={tool.href}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {tool.category}
        </span>
      </div>

      <h2 className="mt-3 text-base font-semibold sm:text-lg">{tool.title}</h2>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">
        {tool.description}
      </p>

      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
        Ouvrir
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}