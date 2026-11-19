/*
path :           app/(app)/scrum/projects/[projectId]/dnd/page.tsx
tag :            ["scrum", "dnd", "page", "server", "tasks", "user-story",
                  "epic", "sprint", "sortable"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page DnD d'un projet Scrum. Server Component wrapper +
                 Suspense (requis par Next.js 16 + cacheComponents pour
                 les routes dynamiques). Le composant enfant DndContent
                 charge l'arbre via loadScrumTree, trie les entités par
                 position, et rend 3 DndBoard : Tasks → US, US → Epics,
                 US → Sprints. Chaque DndBoard reçoit ses items, ses
                 colonnes, un onMove (rattachement) et un onReorder
                 (réordonnancement), qui appellent les Server Actions
                 correspondantes. Le router.refresh() est géré dans
                 DndBoard après chaque action réussie.

flow:            DndPage({ params }) → <Suspense> → DndContent(params) →
                 loadScrumTree → tri par position → 3 sections :
                 <DndBoard> pour tasks→US (moveTaskToUserStory +
                 reorderTasksInUserStory), <DndBoard> pour US→epics
                 (moveUserStoryToEpic + reorderUserStoriesInEpic),
                 <DndBoard> pour US→sprints (moveUserStoryToSprint +
                 reorderUserStoriesInSprint).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/dnd.ts",
                   "@/app/(app)/scrum/actions/epic.ts",
                   "@/app/(app)/scrum/actions/feature.ts",
                   "@/app/(app)/scrum/actions/persona.ts",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/app/(app)/scrum/actions/sprint.ts",
                   "@/app/(app)/scrum/actions/task.ts",
                   "@/app/(app)/scrum/actions/us.ts",
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/dnd/page.tsx",
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
                   "@/components/scrum/DndBoard.tsx",
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
relatedFiles:    ["@/components/scrum/DndBoard.tsx",
                  "@/app/(app)/scrum/actions/dnd.ts",
                  "@/lib/scrum/queries.ts",
                  "@/lib/scrum/types.ts"]
imports:         ["react", "next/navigation", "next/link", "lucide-react",
                  "@/lib/scrum/queries",
                  "@/components/scrum/DndBoard",
                  "@/app/(app)/scrum/actions/dnd",
                  "@/components/ui/button"]
exports:         ["default"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx"]

userStories:     ["*en tant qu'utilisateur je veux glisser-déposer mes tâches et US entre les colonnes",
                  "*en tant qu'utilisateur je veux réordonner mes tâches et US dans une colonne"]
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
import {
  DndBoard,
  type DndColumn,
  type DndItem,
} from "@/components/scrum/DndBoard";
import {
  moveTaskToUserStory,
  reorderTasksInUserStory,
  moveUserStoryToEpic,
  reorderUserStoriesInEpic,
  moveUserStoryToSprint,
  reorderUserStoriesInSprint,
} from "@/app/(app)/scrum/actions/dnd";
import { Button } from "@/components/ui/button";

const NO_COLUMN_ID = "__none__";

async function DndContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const tree = await loadScrumTree(projectId);
  if (!tree) notFound();

  // Flux 1 : Tasks → US (tri par position)
  const sortedTasks = tree.tasks
    .slice()
    .sort((a, b) => a.position - b.position);
  const taskItems: DndItem[] = sortedTasks.map((t) => ({
    id: t.id,
    label: t.title,
    columnId: t.usId ?? NO_COLUMN_ID,
  }));
  const taskColumns: DndColumn[] = [
    { id: NO_COLUMN_ID, label: "Sans US" },
    ...tree.userStories.map((u) => ({ id: u.id, label: u.title })),
  ];

  // Flux 2 : US → Epics (tri par position)
  const sortedUsForEpic = tree.userStories
    .slice()
    .sort((a, b) => a.position - b.position);
  const usForEpicItems: DndItem[] = sortedUsForEpic.map((u) => ({
    id: u.id,
    label: u.title,
    description: u.asA,
    columnId: u.epicId ?? NO_COLUMN_ID,
  }));
  const epicColumns: DndColumn[] = [
    { id: NO_COLUMN_ID, label: "Sans epic" },
    ...tree.epics.map((e) => ({ id: e.id, label: e.title })),
  ];

  // Flux 3 : US → Sprints (tri par position)
  const sortedUsForSprint = tree.userStories
    .slice()
    .sort((a, b) => a.position - b.position);
  const usForSprintItems: DndItem[] = sortedUsForSprint.map((u) => ({
    id: u.id,
    label: u.title,
    description: u.asA,
    columnId: u.sprintId ?? NO_COLUMN_ID,
  }));
  const sprintColumns: DndColumn[] = [
    { id: NO_COLUMN_ID, label: "Backlog" },
    ...tree.sprints.map((s) => ({ id: s.id, label: s.name })),
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
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
          Glisser-déposer · {tree.project.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Rattachez vos tâches aux US, vos US aux epics et aux sprints, et
          réordonnez-les.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Tasks → User Stories</h2>
        <DndBoard
          items={taskItems}
          columns={taskColumns}
          onMove={async (taskId, targetUsId) => {
            await moveTaskToUserStory({
              scrumId: projectId,
              taskId,
              targetUsId: targetUsId === NO_COLUMN_ID ? null : targetUsId,
            });
          }}
          onReorder={async (columnId, orderedIds) => {
            await reorderTasksInUserStory({
              scrumId: projectId,
              usId: columnId === NO_COLUMN_ID ? null : columnId,
              orderedIds,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">US → Epics</h2>
        <DndBoard
          items={usForEpicItems}
          columns={epicColumns}
          onMove={async (usId, targetEpicId) => {
            await moveUserStoryToEpic({
              scrumId: projectId,
              usId,
              targetEpicId:
                targetEpicId === NO_COLUMN_ID ? null : targetEpicId,
            });
          }}
          onReorder={async (columnId, orderedIds) => {
            await reorderUserStoriesInEpic({
              scrumId: projectId,
              epicId: columnId === NO_COLUMN_ID ? null : columnId,
              orderedIds,
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">US → Sprints</h2>
        <DndBoard
          items={usForSprintItems}
          columns={sprintColumns}
          onMove={async (usId, targetSprintId) => {
            await moveUserStoryToSprint({
              scrumId: projectId,
              usId,
              targetSprintId:
                targetSprintId === NO_COLUMN_ID ? null : targetSprintId,
            });
          }}
          onReorder={async (columnId, orderedIds) => {
            await reorderUserStoriesInSprint({
              scrumId: projectId,
              sprintId: columnId === NO_COLUMN_ID ? null : columnId,
              orderedIds,
            });
          }}
        />
      </section>
    </div>
  );
}

export default function DndPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-12 sm:px-6">
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      }
    >
      <DndContent params={params} />
    </Suspense>
  );
}