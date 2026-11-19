/*
path :           app/(app)/scrum/actions/persona.ts
tag :            ["scrum", "action", "persona", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des personas d'un projet Scrum.
                 Quatre actions : addPersona, updatePersona,
                 removePersona, reorderPersonas. Même structure que
                 feature.ts (validation Zod, chargement de l'arbre,
                 mutation du tableau, réécriture via replaceScrumTree,
                 revalidatePath). Les positions sont recalculées à
                 l'ajout et après suppression. Aucune logique métier
                 lourde.

flow:            addPersona({ scrumId, data }) → zod.safeParse → charge
                 tree → nextPosition(tree.personas) → createPersona →
                 push → replaceScrumTree → revalidatePath. updatePersona
                 ({ scrumId, personaId, patch }) → merge. removePersona
                 ({ scrumId, personaId }) → filter + réindexe. reorder
                 Personas(scrumId, orderedIds) → map position.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/actions/persona.ts",
                   "@/components/scrum/PersonaBoard.tsx",
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
exports:         ["addPersona", "updatePersona", "removePersona",
                  "reorderPersonas"]
useBy:           ["@/components/scrum/PersonaBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux ajouter un persona à un projet",
                  "*en tant qu'utilisateur je veux modifier ou supprimer un persona",
                  "*en tant qu'utilisateur je veux réordonner les personas"]
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
import { createPersona, nextPosition } from "@/lib/scrum/defaults";
import { removeEntityInputSchema } from "@/lib/scrum/schema";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

const personaDataSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  goals: z.string().max(2000).optional(),
  frustrations: z.string().max(2000).optional(),
});

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/personas`);
}

export async function addPersona(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({ scrumId: z.string().min(1), data: personaDataSchema })
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

  const persona = createPersona({
    name: data.name,
    role: data.role,
    goals: data.goals,
    frustrations: data.frustrations,
    position: nextPosition(tree.personas),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    personas: [...tree.personas, persona],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updatePersona(input: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      scrumId: z.string().min(1),
      personaId: z.string().min(1),
      patch: personaDataSchema.partial(),
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
  const { scrumId, personaId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.personas.some((p) => p.id === personaId);
  if (!found) return { ok: false, error: "Persona introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    personas: tree.personas.map((p) =>
      p.id === personaId ? { ...p, ...patch } : p,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removePersona(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "persona") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const next = tree.personas
    .filter((p) => p.id !== entityId)
    .map((p, idx) => ({ ...p, position: idx }));

  await replaceScrumTree(scrumId, { ...tree, personas: next });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderPersonas(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.personas
    .map((p) => ({ ...p, position: orderMap.get(p.id) ?? p.position }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, personas: next });
  revalidateProject(scrumId);
  return { ok: true };
}