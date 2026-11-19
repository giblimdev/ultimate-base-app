/*
path :           app/(app)/scrum/actions/us.ts
tag :            ["scrum", "action", "user-story", "us", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des user stories d'un projet Scrum.
                 Enums alignés sur lib/scrum/types.ts (IssuePriority,
                 StoryStatus). entity: "userStory" dans
                 removeEntityInputSchema.

flow:            addUserStory({ scrumId, data }) → zod.safeParse →
                 charge tree → nextPosition(tree.userStories) →
                 createUserStory → push → replaceScrumTree →
                 revalidatePath. updateUserStory({ scrumId, usId, patch })
                 → merge. removeUserStory({ scrumId, entity: "userStory",
                 entityId }) → filter + réindexe + détache les tasks.
                 reorderUserStories(scrumId, orderedIds) → map position.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/us.ts",
                   "@/components/scrum/UserStoryBoard.tsx",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts", "@/lib/scrum/queries.ts",
                  "@/lib/scrum/mutations.ts", "@/lib/scrum/access.ts",
                  "@/lib/scrum/defaults.ts"]
imports:         ["next/cache", "zod", "@/lib/scrum/queries",
                  "@/lib/scrum/mutations", "@/lib/scrum/access",
                  "@/lib/scrum/defaults", "@/lib/scrum/schema"]
exports:         ["addUserStory", "updateUserStory", "removeUserStory",
                  "reorderUserStories"]
useBy:           ["@/components/scrum/UserStoryBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les US d'un projet"]
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
import { createUserStory, nextPosition } from "@/lib/scrum/defaults";
import {
  issuePrioritySchema,
  storyStatusSchema,
  removeEntityInputSchema,
} from "@/lib/scrum/schema";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const userStoryDataSchema = z.object({
  title: z.string().min(1).max(255),
  asA: z.string().min(1).max(500),
  iWant: z.string().min(1).max(500),
  soThat: z.string().min(1).max(500),
  epicId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  acceptanceCriteria: z.array(z.string().max(500)).optional(),
  storyPoints: z.number().min(0).nullable().optional(),
  priority: issuePrioritySchema.optional(),
  status: storyStatusSchema.optional(),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/us`);
}

export async function addUserStory(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({ scrumId: z.string().min(1), data: userStoryDataSchema })
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

  const us = createUserStory({
    title: data.title,
    asA: data.asA,
    iWant: data.iWant,
    soThat: data.soThat,
    epicId: data.epicId,
    sprintId: data.sprintId,
    acceptanceCriteria: data.acceptanceCriteria,
    storyPoints: data.storyPoints,
    priority: data.priority,
    status: data.status,
    position: nextPosition(tree.userStories),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    userStories: [...tree.userStories, us],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updateUserStory(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      scrumId: z.string().min(1),
      usId: z.string().min(1),
      patch: userStoryDataSchema.partial(),
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
  const { scrumId, usId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.userStories.some((u) => u.id === usId);
  if (!found) return { ok: false, error: "User Story introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    userStories: tree.userStories.map((u) =>
      u.id === usId ? { ...u, ...patch } : u,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removeUserStory(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "userStory") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const nextTasks = tree.tasks.map((t) =>
    t.usId === entityId ? { ...t, usId: null } : t,
  );

  const next = tree.userStories
    .filter((u) => u.id !== entityId)
    .map((u, idx) => ({ ...u, position: idx }));

  await replaceScrumTree(scrumId, {
    ...tree,
    userStories: next,
    tasks: nextTasks,
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderUserStories(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.userStories
    .map((u) => ({ ...u, position: orderMap.get(u.id) ?? u.position }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, userStories: next });
  revalidateProject(scrumId);
  return { ok: true };
}