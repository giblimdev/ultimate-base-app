/*
path :           app/(app)/scrum/projects/[projectId]/page.tsx
tag :            ["scrum", "projects", "detail", "hub", "page", "server",
                  "crud", "dnd"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Point d'entrée de la page hub d'un projet Scrum. Server
                 Component qui enveloppe ProjectDetailContent dans un
                 <Suspense>. Ce split est requis par Next.js 16 avec
                 cacheComponents : la lecture de `params` et l'appel DB
                 (loadScrumTree) doivent se faire dans une limite Suspense
                 pour permettre le pré-rendu de la route dynamique.

flow:            ProjectDetailPage({ params }) → <Suspense fallback> →
                 <ProjectDetailContent params={params} />.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx",
                 ]
relatedFiles:    ["@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx"]
imports:         ["react", "@/app/(app)/scrum/projects/[projectId]/project-detail-content"]
exports:         ["default"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir le résumé d'un projet et accéder à ses boards"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { Suspense } from "react";
import { ProjectDetailContent } from "./project-detail-content";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">Chargement du projet…</p>
        </div>
      }
    >
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}