/*
path :           app/(app)/scrum/actions/import-project.ts
tag :            ["scrum", "action", "import", "project", "server",
                  "create", "json"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Action d'import d'un projet Scrum complet. Reçoit
                 un ScrumTree validé (via scrumTreeSchema), réassigne un
                 nouvel id au projet et à toutes les entités (pour éviter
                 les collisions), puis crée une nouvelle ligne Scrum via
                 createScrumRow. Retourne le scrumId créé pour que le
                 client puisse rediriger.

flow:            importProjectTree(input) → scrumTreeSchema.safeParse →
                 requireScrumAccess → deepCloneWithNewIds(tree) →
                 createScrumRow({ tree, workspaceId, authorId }) →
                 revalidatePath("/scrum/projects") → { ok: true, scrumId }.

ecosystem:       Scrum = [
                   // ... (ecosystem Scrum canonique complet)
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/mutations.ts",
                  "@/lib/scrum/access.ts",
                  "@/lib/scrum/defaults.ts"]
imports:         ["next/cache", "@/lib/scrum/schema",
                  "@/lib/scrum/mutations", "@/lib/scrum/access",
                  "@/lib/scrum/defaults"]
exports:         ["importProjectTree"]
useBy:           ["@/app/(app)/scrum/projects/import/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux sauvegarder un projet entier importé depuis un JSON"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use server";

import { revalidatePath } from "next/cache";
import { scrumTreeSchema } from "@/lib/scrum/schema";
import { createScrumRow } from "@/lib/scrum/mutations";
import { requireScrumAccess } from "@/lib/scrum/access";
import { newId } from "@/lib/scrum/defaults";
import type { ScrumTree } from "@/lib/scrum/types";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

function deepCloneWithNewIds(tree: ScrumTree): ScrumTree {
  const now = new Date().toISOString();

  const project = {
    ...tree.project,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };

  const features = tree.features.map((f) => ({ ...f, id: newId() }));
  const personas = tree.personas.map((p) => ({ ...p, id: newId() }));
  const epics = tree.epics.map((e) => ({ ...e, id: newId() }));

  // Mapping des anciens ids → nouveaux ids pour les relations
  const epicIdMap = new Map(
    tree.epics.map((e, i) => [e.id, epics[i].id]),
  );
  const sprintIdMap = new Map(
    tree.sprints.map((s, i) => [s.id, tree.sprints[i].id]),
  );
  // ⚠️ sprints sont clonés juste après, on construit la map à partir des originaux
  const sprints = tree.sprints.map((s) => ({ ...s, id: newId() }));

  const userStories = tree.userStories.map((u) => ({
    ...u,
    id: newId(),
    epicId: u.epicId ? epicIdMap.get(u.epicId) ?? null : null,
    sprintId: u.sprintId ? sprintIdMap.get(u.sprintId) ?? null : null,
  }));

  const usIdMap = new Map(
    tree.userStories.map((u, i) => [u.id, userStories[i].id]),
  );

  const tasks = tree.tasks.map((t) => ({
    ...t,
    id: newId(),
    usId: t.usId ? usIdMap.get(t.usId) ?? null : null,
  }));

  return { project, features, personas, epics, userStories, tasks, sprints };
}

export async function importProjectTree(
  input: unknown,
): Promise<ActionResult<{ scrumId: string }>> {
  const parsed = scrumTreeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "JSON de projet invalide.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }

  const access = await requireScrumAccess();
  const tree = deepCloneWithNewIds(parsed.data);

  const row = await createScrumRow({
    tree,
    workspaceId: access.workspaceId,
    authorId: access.userId,
  });

  revalidatePath("/scrum/projects");
  revalidatePath("/scrum");

  return { ok: true, data: { scrumId: row.id } };
}