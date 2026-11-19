/*
path :           app/(app)/scrum/actions/epic.ts
tag :            ["scrum", "action", "epic", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des epics d'un projet Scrum. Quatre
                 actions : addEpic, updateEpic, removeEpic, reorderEpics.
                 Chaque action valide via Zod (issuePrioritySchema,
                 storyStatusSchema), appelle requireScrumOwner (accès
                 libre pour l'instant), charge l'arbre via loadScrumTree,
                 mute le tableau epics, réécrit via replaceScrumTree, puis
                 revalidatePath. Les positions sont recalculées à l'ajout
                 (nextPosition) et à la suppression (réindexation 0..n-1).
                 À la suppression, les user stories rattachées voient leur
                 epicId remis à null (pas de cascade destructrice).

flow:            addEpic({ scrumId, data }) → zod.safeParse → charge
                 tree → nextPosition(tree.epics) → createEpic → push →
                 replaceScrumTree → revalidatePath. updateEpic({ scrumId,
                 epicId, patch }) → charge tree → map (merge si id match)
                 → replace. removeEpic({ scrumId, entity: "epic",
                 entityId }) → filter + réindexe positions + détache les
                 US (epicId = null) → replace. reorderEpics(scrumId,
                 orderedIds) → charge tree → map position = index dans
                 orderedIds → replace.

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
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/queries.ts",
                  "@/lib/scrum/mutations.ts",
                  "@/lib/scrum/access.ts",
                  "@/lib/scrum/defaults.ts",
                  "@/app/(app)/scrum/actions/project.ts"]
imports:         ["next/cache", "zod", "@/lib/scrum/queries",
                  "@/lib/scrum/mutations", "@/lib/scrum/access",
                  "@/lib/scrum/defaults", "@/lib/scrum/schema",
                  "@/app/(app)/scrum/actions/project"]
exports:         ["addEpic", "updateEpic", "removeEpic", "reorderEpics"]
useBy:           ["@/components/scrum/EpicBoard.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/epics/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux ajouter un epic à un projet",
                  "*en tant qu'utilisateur je veux modifier ou supprimer un epic",
                  "*en tant qu'utilisateur je veux réordonner les epics"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { loadScrumTree } from "@/lib/scrum/queries";
import { replaceScrumTree } from "@/lib/scrum/mutations";
import { requireScrumOwner } from "@/lib/scrum/access";
import { createEpic, nextPosition } from "@/lib/scrum/defaults";
import {
  issuePrioritySchema,
  storyStatusSchema,
  removeEntityInputSchema,
} from "@/lib/scrum/schema";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const epicDataSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional(),
  priority: issuePrioritySchema.optional(),
  status: storyStatusSchema.optional(),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/epics`);
}

export async function addEpic(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({ scrumId: z.string().min(1), data: epicDataSchema })
    .safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, data } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const epic = createEpic({
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    position: nextPosition(tree.epics),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    epics: [...tree.epics, epic],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updateEpic(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      scrumId: z.string().min(1),
      epicId: z.string().min(1),
      patch: epicDataSchema.partial(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, epicId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.epics.some((e) => e.id === epicId);
  if (!found) return { ok: false, error: "Epic introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    epics: tree.epics.map((e) =>
      e.id === epicId ? { ...e, ...patch } : e,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removeEpic(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "epic") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const nextUserStories = tree.userStories.map((u) =>
    u.epicId === entityId ? { ...u, epicId: null } : u,
  );

  const next = tree.epics
    .filter((e) => e.id !== entityId)
    .map((e, idx) => ({ ...e, position: idx }));

  await replaceScrumTree(scrumId, {
    ...tree,
    epics: next,
    userStories: nextUserStories,
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderEpics(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.epics
    .map((e) => ({ ...e, position: orderMap.get(e.id) ?? e.position }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, epics: next });
  revalidateProject(scrumId);
  return { ok: true };
}