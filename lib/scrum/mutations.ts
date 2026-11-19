/*
path :           lib/scrum/mutations.ts
tag :            ["scrum", "mutations", "write", "db", "prisma", "tree",
                  "project"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         false

role:            Couche d'écriture bas niveau du module Scrum. Expose des
                 helpers Prisma pour créer une ligne Scrum (projet vide),
                 remplacer l'arbre complet (saveScrums), mettre à jour les
                 métadonnées d'une ligne (updatedAt via Prisma), et
                 soft-delete (deltedAt). Aucune validation métier ici :
                 les Server Actions valident via Zod puis appellent ces
                 helpers. Aucun guard d'accès : accès libre pour l'instant.
                 Les helpers renvoient la ligne mise à jour pour que
                 l'action puisse revalidatePath puis répondre au client.

flow:            createScrumRow({ tree, workspaceId?, authorId? }) →
                 prisma.scrum.create({ data: { saveScrums: tree,
                 workspaceId, authorId } }) → row. replaceScrumTree(
                 scrumId, tree) → prisma.scrum.update({ where: { id },
                 data: { saveScrums: tree } }) → row. softDeleteScrum(
                 scrumId) → prisma.scrum.update({ data: { deltedAt: new
                 Date() } }).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/mutations.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/db",
                  "@/lib/scrum/types.ts",
                  "@/lib/scrum/queries.ts"]
imports:         ["@/lib/db", "@/lib/scrum/types"]
exports:         ["createScrumRow", "replaceScrumTree",
                  "softDeleteScrum"]
useBy:           ["@/app/(app)/scrum/actions/project.ts",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts",
                  "@/app/(app)/scrum/actions/dnd.ts"]

userStories:     ["*en tant que développeur je veux des helpers d'écriture simples et testables",
                  "*en tant qu'utilisateur je veux que mes modifications soient persistées immédiatement"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { prisma } from "@/lib/db";
import type { ScrumTree } from "@/lib/scrum/types";

export async function createScrumRow(input: {
  tree: ScrumTree;
  workspaceId?: string | null;
  authorId?: string | null;
}) {
  return prisma.scrum.create({
    data: {
      saveScrums: input.tree,
      workspaceId: input.workspaceId ?? null,
      authorId: input.authorId ?? null,
    },
  });
}

export async function replaceScrumTree(scrumId: string, tree: ScrumTree) {
  return prisma.scrum.update({
    where: { id: scrumId },
    data: { saveScrums: tree },
  });
}

export async function softDeleteScrum(scrumId: string) {
  return prisma.scrum.update({
    where: { id: scrumId },
    data: { deltedAt: new Date() },
  });
}