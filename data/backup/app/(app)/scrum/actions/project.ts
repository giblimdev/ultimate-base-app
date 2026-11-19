/*
path :           app/(app)/scrum/actions/project.ts
tag :            ["scrum", "action", "project", "crud", "server",
                  "create", "update", "delete"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD du projet Scrum. Trois actions :
                 createProject, updateProject, deleteProject (soft
                 delete via deltedAt). Chaque action valide l'entrée via
                 Zod (createProjectInputSchema, updateProjectInputSchema),
                 appelle requireScrumAccess (accès libre pour l'instant),
                 lit/écrit via queries.ts et mutations.ts, puis
                 revalidatePath sur les routes concernées. Retourne un
                 résultat discriminé (ok/error) pour que le client puisse
                 afficher un toast sans lever. Aucune logique métier
                 lourde : les helpers DB font le travail, l'action
                 orchestre + valide.

flow:            createProject(input) → zod.safeParse → requireScrumAccess
                 → createEmptyTree → createScrumRow → revalidatePath
                 ("/scrum/projects") → { ok: true, scrumId }. updateProject
                 (input) → zod.safeParse → requireScrumOwner → loadScrumTree
                 → merge project patch + updatedAt → replaceScrumTree →
                 revalidatePath → { ok: true }. deleteProject(scrumId) →
                 requireScrumOwner → softDeleteScrum → revalidatePath →
                 { ok: true }.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/queries.ts",
                  "@/lib/scrum/mutations.ts",
                  "@/lib/scrum/access.ts",
                  "@/lib/scrum/defaults.ts"]
imports:         ["next/cache", "@/lib/scrum/schema",
                  "@/lib/scrum/queries", "@/lib/scrum/mutations",
                  "@/lib/scrum/access", "@/lib/scrum/defaults"]
exports:         ["createProject", "updateProject", "deleteProject",
                  "ActionResult"]
useBy:           ["@/components/scrum/ProjectForm.tsx",
                  "@/app/(app)/scrum/projects/new/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx"]

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