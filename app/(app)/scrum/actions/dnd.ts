/*
path :           app/(app)/scrum/actions/dnd.ts
tag :            ["scrum", "action", "dnd", "move", "reorder", "task",
                  "user-story", "epic", "sprint", "server"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions dédiées au glisser-déposer (dnd-kit).
                 Six actions : moveTaskToUserStory, moveUserStoryToEpic,
                 moveUserStoryToSprint (rattachement/détachement), et
                 reorderTasksInUserStory, reorderUserStoriesInEpic,
                 reorderUserStoriesInSprint (réordonnancement intra-
                 colonne, persistance des positions). Chaque action valide
                 via Zod, charge l'arbre via loadScrumTree, mute les
                 champs concernés (usId/epicId/sprintId et position),
                 réécrit via replaceScrumTree, puis revalidatePath.

flow:            moveTaskToUserStory({ scrumId, taskId, targetUsId }) →
                 map tasks (usId = targetUsId) → replace. reorderTasks
                 InUserStory({ scrumId, usId, orderedIds }) → map tasks
                 (position = index dans orderedIds) → replace. Idem pour
                 moveUserStoryToEpic / reorderUserStoriesInEpic et
                 moveUserStoryToSprint / reorderUserStoriesInSprint.

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
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/queries.ts",
                  "@/lib/scrum/mutations.ts",
                  "@/lib/scrum/access.ts",
                  "@/app/(app)/scrum/actions/project.ts"]
imports:         ["next/cache", "zod", "@/lib/scrum/queries",
                  "@/lib/scrum/mutations", "@/lib/scrum/access",
                  "@/app/(app)/scrum/actions/project"]
exports:         ["moveTaskToUserStory", "moveUserStoryToEpic",
                  "moveUserStoryToSprint", "reorderTasksInUserStory",
                  "reorderUserStoriesInEpic", "reorderUserStoriesInSprint"]
useBy:           ["@/components/scrum/DndBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux glisser une tâche sur une US pour la rattacher",
                  "*en tant qu'utilisateur je veux réordonner les tâches dans une US",
                  "*en tant qu'utilisateur je veux glisser une US sur un epic pour la rattacher",
                  "*en tant qu'utilisateur je veux réordonner les US dans un epic",
                  "*en tant qu'utilisateur je veux glisser une US sur un sprint pour la planifier",
                  "*en tant qu'utilisateur je veux réordonner les US dans un sprint"]
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
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const moveTaskInputSchema = z.object({
  scrumId: z.string().min(1),
  taskId: z.string().min(1),
  targetUsId: z.string().nullable(),
});

const moveUserStoryToEpicInputSchema = z.object({
  scrumId: z.string().min(1),
  usId: z.string().min(1),
  targetEpicId: z.string().nullable(),
});

const moveUserStoryToSprintInputSchema = z.object({
  scrumId: z.string().min(1),
  usId: z.string().min(1),
  targetSprintId: z.string().nullable(),
});

const reorderTasksInUserStoryInputSchema = z.object({
  scrumId: z.string().min(1),
  usId: z.string().nullable(),
  orderedIds: z.array(z.string().min(1)),
});

const reorderUserStoriesInEpicInputSchema = z.object({
  scrumId: z.string().min(1),
  epicId: z.string().nullable(),
  orderedIds: z.array(z.string().min(1)),
});

const reorderUserStoriesInSprintInputSchema = z.object({
  scrumId: z.string().min(1),
  sprintId: z.string().nullable(),
  orderedIds: z.array(z.string().min(1)),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/tasks`);
  revalidatePath(`/scrum/projects/${scrumId}/us`);
  revalidatePath(`/scrum/projects/${scrumId}/epics`);
  revalidatePath(`/scrum/projects/${scrumId}/sprints`);
  revalidatePath(`/scrum/projects/${scrumId}/dnd`);
}

// ── Flux 1 : Tasks → User Stories ────────────────────────────

export async function moveTaskToUserStory(
  input: unknown,
): Promise<ActionResult> {
  const parsed = moveTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, taskId, targetUsId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.tasks.some((t) => t.id === taskId);
  if (!found) return { ok: false, error: "Tâche introuvable." };

  if (targetUsId) {
    const usExists = tree.userStories.some((u) => u.id === targetUsId);
    if (!usExists) return { ok: false, error: "User Story introuvable." };
  }

  await replaceScrumTree(scrumId, {
    ...tree,
    tasks: tree.tasks.map((t) =>
      t.id === taskId ? { ...t, usId: targetUsId } : t,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderTasksInUserStory(
  input: unknown,
): Promise<ActionResult> {
  const parsed = reorderTasksInUserStoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, usId, orderedIds } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));

  const nextTasks = tree.tasks.map((t) => {
    // Seules les tâches de la colonne cible (usId) sont réindexées
    if ((t.usId ?? null) === (usId ?? null)) {
      const newPos = orderMap.get(t.id);
      return newPos !== undefined ? { ...t, position: newPos } : t;
    }
    return t;
  });

  await replaceScrumTree(scrumId, { ...tree, tasks: nextTasks });
  revalidateProject(scrumId);
  return { ok: true };
}

// ── Flux 2 : User Stories → Epics ────────────────────────────

export async function moveUserStoryToEpic(
  input: unknown,
): Promise<ActionResult> {
  const parsed = moveUserStoryToEpicInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, usId, targetEpicId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.userStories.some((u) => u.id === usId);
  if (!found) return { ok: false, error: "User Story introuvable." };

  if (targetEpicId) {
    const epicExists = tree.epics.some((e) => e.id === targetEpicId);
    if (!epicExists) return { ok: false, error: "Epic introuvable." };
  }

  await replaceScrumTree(scrumId, {
    ...tree,
    userStories: tree.userStories.map((u) =>
      u.id === usId ? { ...u, epicId: targetEpicId } : u,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderUserStoriesInEpic(
  input: unknown,
): Promise<ActionResult> {
  const parsed = reorderUserStoriesInEpicInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, epicId, orderedIds } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));

  const nextUserStories = tree.userStories.map((u) => {
    if ((u.epicId ?? null) === (epicId ?? null)) {
      const newPos = orderMap.get(u.id);
      return newPos !== undefined ? { ...u, position: newPos } : u;
    }
    return u;
  });

  await replaceScrumTree(scrumId, { ...tree, userStories: nextUserStories });
  revalidateProject(scrumId);
  return { ok: true };
}

// ── Flux 3 : User Stories → Sprints ──────────────────────────

export async function moveUserStoryToSprint(
  input: unknown,
): Promise<ActionResult> {
  const parsed = moveUserStoryToSprintInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, usId, targetSprintId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.userStories.some((u) => u.id === usId);
  if (!found) return { ok: false, error: "User Story introuvable." };

  if (targetSprintId) {
    const sprintExists = tree.sprints.some((s) => s.id === targetSprintId);
    if (!sprintExists) return { ok: false, error: "Sprint introuvable." };
  }

  await replaceScrumTree(scrumId, {
    ...tree,
    userStories: tree.userStories.map((u) =>
      u.id === usId ? { ...u, sprintId: targetSprintId } : u,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderUserStoriesInSprint(
  input: unknown,
): Promise<ActionResult> {
  const parsed = reorderUserStoriesInSprintInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, sprintId, orderedIds } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));

  const nextUserStories = tree.userStories.map((u) => {
    if ((u.sprintId ?? null) === (sprintId ?? null)) {
      const newPos = orderMap.get(u.id);
      return newPos !== undefined ? { ...u, position: newPos } : u;
    }
    return u;
  });

  await replaceScrumTree(scrumId, { ...tree, userStories: nextUserStories });
  revalidateProject(scrumId);
  return { ok: true };
}