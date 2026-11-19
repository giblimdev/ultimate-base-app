/*
path :           app/(app)/scrum/actions/task.ts
tag :            ["scrum", "action", "task", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des tâches d'un projet Scrum.
                 entity: "task" dans removeEntityInputSchema.

flow:            addTask({ scrumId, data }) → zod.safeParse → charge
                 tree → nextPosition(tree.tasks) → createTask → push →
                 replaceScrumTree → revalidatePath. updateTask({ scrumId,
                 taskId, patch }) → merge. removeTask({ scrumId, entity:
                 "task", entityId }) → filter + réindexe. reorderTasks
                 (scrumId, orderedIds) → map position.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/task.ts",
                   "@/components/scrum/TaskBoard.tsx",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts", "@/lib/scrum/queries.ts",
                  "@/lib/scrum/mutations.ts", "@/lib/scrum/access.ts",
                  "@/lib/scrum/defaults.ts"]
imports:         ["next/cache", "zod", "@/lib/scrum/queries",
                  "@/lib/scrum/mutations", "@/lib/scrum/access",
                  "@/lib/scrum/defaults", "@/lib/scrum/schema"]
exports:         ["addTask", "updateTask", "removeTask", "reorderTasks"]
useBy:           ["@/components/scrum/TaskBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les tâches d'un projet"]
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
import { createTask, nextPosition } from "@/lib/scrum/defaults";
import { removeEntityInputSchema } from "@/lib/scrum/schema";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const taskDataSchema = z.object({
  title: z.string().min(1).max(255),
  usId: z.string().nullable().optional(),
  done: z.boolean().optional(),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/tasks`);
}

export async function addTask(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({ scrumId: z.string().min(1), data: taskDataSchema })
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

  const task = createTask({
    title: data.title,
    usId: data.usId,
    done: data.done,
    position: nextPosition(tree.tasks),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    tasks: [...tree.tasks, task],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updateTask(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      scrumId: z.string().min(1),
      taskId: z.string().min(1),
      patch: taskDataSchema.partial(),
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
  const { scrumId, taskId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.tasks.some((t) => t.id === taskId);
  if (!found) return { ok: false, error: "Tâche introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    tasks: tree.tasks.map((t) =>
      t.id === taskId ? { ...t, ...patch } : t,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removeTask(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "task") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const next = tree.tasks
    .filter((t) => t.id !== entityId)
    .map((t, idx) => ({ ...t, position: idx }));

  await replaceScrumTree(scrumId, { ...tree, tasks: next });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderTasks(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.tasks
    .map((t) => ({ ...t, position: orderMap.get(t.id) ?? t.position }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, tasks: next });
  revalidateProject(scrumId);
  return { ok: true };
}