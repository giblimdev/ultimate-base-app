/*
path :           app/(app)/scrum/actions/sprint.ts
tag :            ["scrum", "action", "sprint", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des sprints d'un projet Scrum. Quatre
                 actions : addSprint, updateSprint, removeSprint,
                 reorderSprints. Un sprint peut contenir des US via
                 sprintId (DnD US→sprint géré par dnd.ts, pas ici). Valide
                 via Zod (sprintStatusSchema), appelle requireScrumOwner,
                 charge l'arbre, mute sprints, réécrit via
                 replaceScrumTree, revalidatePath. À la suppression, les US
                 rattachées voient leur sprintId remis à null. L'enum
                 entity de removeEntityInputSchema est "sprint".

flow:            addSprint({ scrumId, data }) → zod.safeParse → charge
                 tree → nextPosition(tree.sprints) → createSprint → push
                 → replaceScrumTree → revalidatePath. updateSprint
                 ({ scrumId, sprintId, patch }) → merge. removeSprint
                 ({ scrumId, entity: "sprint", entityId }) → filter +
                 réindexe + détache les US. reorderSprints(scrumId,
                 orderedIds) → map position.

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
exports:         ["addSprint", "updateSprint", "removeSprint",
                  "reorderSprints"]
useBy:           ["@/components/scrum/SprintBoard.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/sprints/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux planifier un sprint",
                  "*en tant qu'utilisateur je veux modifier ou supprimer un sprint",
                  "*en tant qu'utilisateur je veux réordonner les sprints"]
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
import { createSprint, nextPosition } from "@/lib/scrum/defaults";
import {
  sprintStatusSchema,
  removeEntityInputSchema,
} from "@/lib/scrum/schema";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const sprintDataSchema = z.object({
  name: z.string().min(1).max(255),
  goal: z.string().max(2000).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: sprintStatusSchema.optional(),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/sprints`);
}

export async function addSprint(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({ scrumId: z.string().min(1), data: sprintDataSchema })
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

  const sprint = createSprint({
    name: data.name,
    goal: data.goal,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status,
    position: nextPosition(tree.sprints),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    sprints: [...tree.sprints, sprint],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updateSprint(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      scrumId: z.string().min(1),
      sprintId: z.string().min(1),
      patch: sprintDataSchema.partial(),
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
  const { scrumId, sprintId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.sprints.some((s) => s.id === sprintId);
  if (!found) return { ok: false, error: "Sprint introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    sprints: tree.sprints.map((s) =>
      s.id === sprintId ? { ...s, ...patch } : s,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removeSprint(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "sprint") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const nextUserStories = tree.userStories.map((u) =>
    u.sprintId === entityId ? { ...u, sprintId: null } : u,
  );

  const next = tree.sprints
    .filter((s) => s.id !== entityId)
    .map((s, idx) => ({ ...s, position: idx }));

  await replaceScrumTree(scrumId, {
    ...tree,
    sprints: next,
    userStories: nextUserStories,
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderSprints(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.sprints
    .map((s) => ({ ...s, position: orderMap.get(s.id) ?? s.position }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, sprints: next });
  revalidateProject(scrumId);
  return { ok: true };
}