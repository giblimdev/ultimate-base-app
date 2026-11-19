/*
path :           app/(app)/scrum/actions/feature.ts
tag :            ["scrum", "action", "feature", "crud", "server",
                  "add", "update", "remove", "reorder"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Actions CRUD des features d'un projet Scrum.
                 Quatre actions : addFeature, updateFeature, removeFeature,
                 reorderFeatures. Chaque action valide via Zod, appelle
                 requireScrumOwner (accès libre pour l'instant), charge
                 l'arbre via loadScrumTree, mute le tableau features,
                 réécrit via replaceScrumTree, puis revalidatePath. Les
                 positions sont recalculées à l'ajout (nextPosition) et à
                 la suppression (réindexation 0..n-1). Aucune logique
                 métier lourde : l'action orchestre + valide, les helpers
                 DB font le travail.

flow:            addFeature({ scrumId, data }) → zod.safeParse → charge
                 tree → nextPosition(tree.features) → createFeature →
                 push → replaceScrumTree → revalidatePath. updateFeature
                 ({ scrumId, featureId, patch }) → charge tree → map
                 (merge si id match) → replace. removeFeature({ scrumId,
                 featureId }) → charge tree → filter + réindexe positions
                 → replace. reorderFeatures({ scrumId, orderedIds }) →
                 charge tree → map position = index dans orderedIds →
                 replace.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/actions/feature.ts",
                   "@/components/scrum/FeatureBoard.tsx",
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
exports:         ["addFeature", "updateFeature", "removeFeature",
                  "reorderFeatures"]
useBy:           ["@/components/scrum/FeatureBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux ajouter une feature à un projet",
                  "*en tant qu'utilisateur je veux modifier ou supprimer une feature",
                  "*en tant qu'utilisateur je veux réordonner les features"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use server";

import { revalidatePath } from "next/cache";
import {
  addFeatureInputSchema,
  updateFeatureInputSchema,
  removeEntityInputSchema,
} from "@/lib/scrum/schema";
import { loadScrumTree } from "@/lib/scrum/queries";
import { replaceScrumTree } from "@/lib/scrum/mutations";
import { requireScrumOwner } from "@/lib/scrum/access";
import { createFeature, nextPosition } from "@/lib/scrum/defaults";
import type { ActionResult } from "@/app/(app)/scrum/actions/project";

function revalidateProject(scrumId: string) {
  revalidatePath("/scrum/projects");
  revalidatePath(`/scrum/projects/${scrumId}`);
  revalidatePath(`/scrum/projects/${scrumId}/features`);
}

export async function addFeature(input: unknown): Promise<ActionResult> {
  const parsed = addFeatureInputSchema.safeParse(input);
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

  const feature = createFeature({
    name: data.name,
    description: data.description,
    position: nextPosition(tree.features),
  });

  await replaceScrumTree(scrumId, {
    ...tree,
    features: [...tree.features, feature],
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function updateFeature(input: unknown): Promise<ActionResult> {
  const parsed = updateFeatureInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      issues: parsed.error.issues.map(
        (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
      ),
    };
  }
  const { scrumId, featureId, patch } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const found = tree.features.some((f) => f.id === featureId);
  if (!found) return { ok: false, error: "Feature introuvable." };

  await replaceScrumTree(scrumId, {
    ...tree,
    features: tree.features.map((f) =>
      f.id === featureId ? { ...f, ...patch } : f,
    ),
  });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function removeFeature(input: unknown): Promise<ActionResult> {
  const parsed = removeEntityInputSchema.safeParse(input);
  if (!parsed.success || parsed.data.entity !== "feature") {
    return { ok: false, error: "Données invalides." };
  }
  const { scrumId, entityId } = parsed.data;
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const next = tree.features
    .filter((f) => f.id !== entityId)
    .map((f, idx) => ({ ...f, position: idx }));

  await replaceScrumTree(scrumId, { ...tree, features: next });
  revalidateProject(scrumId);
  return { ok: true };
}

export async function reorderFeatures(
  scrumId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  if (!scrumId) return { ok: false, error: "Identifiant de projet manquant." };
  await requireScrumOwner(scrumId);

  const tree = await loadScrumTree(scrumId);
  if (!tree) return { ok: false, error: "Projet introuvable." };

  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));
  const next = tree.features
    .map((f) => ({
      ...f,
      position: orderMap.get(f.id) ?? f.position,
    }))
    .sort((a, b) => a.position - b.position);

  await replaceScrumTree(scrumId, { ...tree, features: next });
  revalidateProject(scrumId);
  return { ok: true };
}