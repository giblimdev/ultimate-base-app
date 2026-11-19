/*
path :           lib/scrum/queries.ts
tag :            ["scrum", "queries", "read", "db", "prisma", "tree",
                  "project", "list"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         false

role:            Couche de lecture du module Scrum. Expose les requêtes
                 Prisma pour lister les projets (lignes Scrum non
                 supprimées), charger un projet complet par son id, et
                 extraire l'arbre ScrumTree depuis le champ saveScrums
                 (JsonB). Aucun guard d'accès pour l'instant : les pages
                 Scrum sont en accès libre, le branchement RBAC/workspace
                 se fera plus tard dans access.ts. Les fonctions ne lèvent
                 pas d'exception métier : elles retournent null si le
                 projet n'existe pas ou si saveScrums est vide, et
                 l'appelant décide. La validation du JSON est faite par
                 scrumTreeSchema dans json-io (parseTreeJson) ; ici on
                 stocke/relit le JSON brut typé ScrumTree en confiance,
                 car il a été validé à l'écriture.

flow:            listScrumProjects() → prisma.scrum.findMany({ where:
                 { deltedAt: null }, orderBy: createdAt desc }) → mappe
                 chaque ligne vers un ProjectSummary minimal (id, name,
                 key, status, methodology, visibility, progressPercent,
                 counts calculés depuis saveScrums, dates). loadScrumTree
                 (scrumId) → prisma.scrum.findUnique → parse saveScrums
                 → ScrumTree | null. ensureScrumTree(scrumId) → si
                 saveScrums null, crée un arbre vide via createEmptyTree
                 et l'écrit (utile pour les brouillons).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/queries.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/db",
                  "@/lib/scrum/types.ts",
                  "@/lib/scrum/defaults.ts",
                  "@/lib/scrum/mutations.ts"]
imports:         ["@/lib/db", "@/lib/scrum/types",
                  "@/lib/scrum/defaults"]
exports:         ["listScrumProjects", "loadScrumTree",
                  "ensureScrumTree", "ScrumListItem"]
useBy:           ["@/app/(app)/scrum/projects/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                  "@/app/(app)/scrum/actions/project.ts"]

userStories:     ["*en tant qu'utilisateur je veux voir la liste de mes projets Scrum",
                  "*en tant qu'utilisateur je veux ouvrir un projet et retrouver tout son arbre"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { prisma } from "@/lib/db";
import type {
  ProjectStatus,
  ProjectVisibility,
  ProjectMethodology,
  ScrumTree,
  ScrumTreeCounts,
} from "@/lib/scrum/types";
import { createEmptyTree } from "@/lib/scrum/defaults";

export type ScrumListItem = {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  methodology: ProjectMethodology;
  progressPercent: number;
  counts: ScrumTreeCounts;
  startDate?: string | null;
  targetDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

function countTree(tree: ScrumTree): ScrumTreeCounts {
  return {
    features: tree.features.length,
    personas: tree.personas.length,
    epics: tree.epics.length,
    userStories: tree.userStories.length,
    tasks: tree.tasks.length,
    sprints: tree.sprints.length,
  };
}

function emptyCounts(): ScrumTreeCounts {
  return {
    features: 0,
    personas: 0,
    epics: 0,
    userStories: 0,
    tasks: 0,
    sprints: 0,
  };
}

function asTree(raw: unknown): ScrumTree | null {
  if (!raw || typeof raw !== "object") return null;
  // Le JSON a été validé à l'écriture via scrumTreeSchema ; on fait
  // confiance à la forme ici. Un parse strict serait redondant et
  // coûteux sur chaque lecture.
  const candidate = raw as ScrumTree;
  if (!candidate.project || !Array.isArray(candidate.features)) {
    return null;
  }
  return candidate;
}

export async function listScrumProjects(): Promise<ScrumListItem[]> {
  const rows = await prisma.scrum.findMany({
    where: { deltedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => {
    const tree = asTree(row.saveScrums);
    const project = tree?.project;
    return {
      id: row.id,
      name: project?.name ?? "Projet sans nom",
      key: project?.key ?? "—",
      description: project?.description,
      status: project?.status ?? "PLANNING",
      visibility: project?.visibility ?? "PRIVATE",
      methodology: project?.methodology ?? "SCRUM",
      progressPercent: project?.progressPercent ?? 0,
      counts: tree ? countTree(tree) : emptyCounts(),
      startDate: project?.startDate ?? null,
      targetDate: project?.targetDate ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  });
}

export async function loadScrumTree(
  scrumId: string,
): Promise<ScrumTree | null> {
  const row = await prisma.scrum.findFirst({
    where: { id: scrumId, deltedAt: null },
  });
  if (!row) return null;
  return asTree(row.saveScrums);
}

export async function ensureScrumTree(scrumId: string): Promise<ScrumTree | null> {
  const row = await prisma.scrum.findFirst({
    where: { id: scrumId, deltedAt: null },
  });
  if (!row) return null;

  const existing = asTree(row.saveScrums);
  if (existing) return existing;

  const tree = createEmptyTree({
    projectName: "Nouveau projet",
    projectKey: "NEW",
  });

  await prisma.scrum.update({
    where: { id: scrumId },
    data: { saveScrums: tree },
  });

  return tree;
}