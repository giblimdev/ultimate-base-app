/*
path :           app/(app)/scrum/projects/[projectId]/features/page.tsx
tag :            ["scrum", "projects", "features", "page", "server",
                  "crud"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page features d'un projet Scrum. Server Component wrapper
                 avec <Suspense> (requis par Next.js 16 + cacheComponents
                 pour les routes dynamiques qui lisent `params` et
                 appellent la DB). Le composant enfant FeaturesContent
                 charge l'arbre via loadScrumTree, rend FeatureBoard. Si
                 l'arbre est absent, notFound().

flow:            FeaturesPage({ params }) → <Suspense fallback> →
                 FeaturesContent(params) → await params → loadScrumTree
                 → notFound si null → header + FeatureBoard scrumId +
                 initialFeatures.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/epic.ts",
                   "@/app/(app)/scrum/actions/feature.ts",
                   "@/app/(app)/scrum/actions/persona.ts",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/app/(app)/scrum/actions/sprint.ts",
                   "@/app/(app)/scrum/actions/task.ts",
                   "@/app/(app)/scrum/actions/us.ts",
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/epics/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/features/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/personas/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/sprints/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/tasks/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/us/page.tsx",
                   "@/app/(app)/scrum/projects/new/page.tsx",
                   "@/app/(app)/scrum/projects/page.tsx",
                   "@/components/scrum/EpicBoard.tsx",
                   "@/components/scrum/FeatureBoard.tsx",
                   "@/components/scrum/JsonEditor.tsx",
                   "@/components/scrum/PersonaBoard.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/components/scrum/SprintBoard.tsx",
                   "@/components/scrum/TaskBoard.tsx",
                   "@/components/scrum/UserStoryBoard.tsx",
                   "@/lib/scrum/access.ts",
                   "@/lib/scrum/defaults.ts",
                   "@/lib/scrum/json-io.ts",
                   "@/lib/scrum/mutations.ts",
                   "@/lib/scrum/queries.ts",
                   "@/lib/scrum/schema.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/scrum/queries.ts",
                  "@/components/scrum/FeatureBoard.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx"]
imports:         ["react", "next/navigation", "next/link", "lucide-react",
                  "@/lib/scrum/queries",
                  "@/components/scrum/FeatureBoard",
                  "@/components/ui/button"]
exports:         ["default"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les features d'un projet"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadScrumTree } from "@/lib/scrum/queries";
import { FeatureBoard } from "@/components/scrum/FeatureBoard";
import { Button } from "@/components/ui/button";

async function FeaturesContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const tree = await loadScrumTree(projectId);
  if (!tree) notFound();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link href={`/scrum/projects/${projectId}`} />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Projet
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Features · {tree.project.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Découper le périmètre fonctionnel du projet.
        </p>
      </header>
      <FeatureBoard scrumId={projectId} initialFeatures={tree.features} />
    </div>
  );
}

export default function FeaturesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      }
    >
      <FeaturesContent params={params} />
    </Suspense>
  );
}