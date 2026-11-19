/*
path :           app/(app)/scrum/actions/project.ts
tag :            ["scrum", "action", "project", "crud", "server",
                  "create", "update", "delete"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD du projet Scrum. Quatre actions :
                 createProject, updateProject, updateProjectAction (wrapper
                 redirect pour la page edit), deleteProject (soft delete
                 via deltedAt). Chaque action valide via Zod
                 (createProjectInputSchema, updateProjectInputSchema),
                 appelle requireScrumAccess / requireScrumOwner (accès
                 libre pour l'instant), lit/écrit via queries.ts et
                 mutations.ts, puis revalidatePath. Retourne un résultat
                 discriminé (ok/error) pour que le client puisse afficher
                 un toast sans lever.

flow:            createProject(input) → zod.safeParse → requireScrumAccess
                 → createEmptyTree → createScrumRow → revalidatePath
                 ("/scrum/projects") → { ok: true, scrumId }. updateProject
                 (input) → zod.safeParse → requireScrumOwner → loadScrumTree
                 → merge project patch + updatedAt → replaceScrumTree →
                 revalidatePath → { ok: true }. updateProjectAction({ scrumId,
                 data }) → updateProject({ scrumId, patch: data }) → si ok:
                 redirect(`/scrum/projects/${scrumId}`). deleteProject
                 (scrumId) → requireScrumOwner → softDeleteScrum →
                 revalidatePath → { ok: true }.

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
                  "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx"]
imports:         ["next/cache", "next/navigation", "@/lib/scrum/schema",
                  "@/lib/scrum/queries", "@/lib/scrum/mutations",
                  "@/lib/scrum/access", "@/lib/scrum/defaults"]
exports:         ["createProject", "updateProject", "updateProjectAction",
                  "deleteProject", "ActionResult"]
useBy:           ["@/components/scrum/ProjectForm.tsx",
                  "@/app/(app)/scrum/projects/new/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts"]

userStories:     ["*en tant qu'utilisateur je veux créer un projet Scrum",
                  "*en tant qu'utilisateur je veux modifier les infos d'un projet",
                  "*en tant qu'utilisateur je veux supprimer un projet"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProjectInputSchema,
  updateProjectInputSchema,
} from "@/lib/scrum/schema";
import { loadScrumTree } from "@/lib/scrum/queries";
import {
  createScrumRow,
  replaceScrumTree,
  softDeleteScrum,
} from "@/lib/scrum/mutations";
import { requireScrumAccess, requireScrumOwner } from "@/lib/scrum/access";
import { createEmptyTree } from "@/lib/scrum/defaults";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; issues?: string[] };

export async function createProject(
  input: unknown,
): Promise<ActionResult<{ scrumId: string }>> {
  const parsed = createProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }

  const access = await requireScrumAccess();

  const tree = createEmptyTree({
    projectName: parsed.data.name,
    projectKey: parsed.data.key,
    description: parsed.data.description,
  });
  tree.project.methodology = parsed.data.methodology;
  tree.project.visibility = parsed.data.visibility;
  tree.project.status = parsed.data.status;

  const row = await createScrumRow({
    tree,
    workspaceId: access.workspaceId,
    authorId: access.userId,
  });

  revalidatePath("/scrum/projects");
  revalidatePath("/scrum");

  return { ok: true, data: { scrumId: row.id } };
}

export async function updateProject(input: unknown): Promise<ActionResult> {
  const parsed = updateProjectInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }

  const { scrumId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) {
    return { ok: false, error: "Projet introuvable." };
  }

  const now = new Date().toISOString();
  const next = {
    ...tree,
    project: {
      ...tree.project,
      ...patch,
      updatedAt: now,
    },
  };

  await replaceScrumTree(scrumId, next);
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath("/scrum");

  return { ok: true };
}

export async function updateProjectAction(input: {
  scrumId: string;
  data: unknown;
}): Promise<void> {
  const result = await updateProject({
    scrumId: input.scrumId,
    patch: input.data,
  });
  if (result.ok) {
    redirect(`/scrum/projects/${input.scrumId}`);
  }
  throw new Error(result.ok ? "Update failed" : result.error);
}

export async function deleteProject(scrumId: string): Promise<ActionResult> {
  if (!scrumId) {
    return { ok: false, error: "Identifiant de projet manquant." };
  }
  await requireScrumOwner(scrumId);
  await softDeleteScrum(scrumId);
  revalidatePath("/scrum/projects");
  revalidatePath("/scrum");
  return { ok: true };
}