/*
path :           lib/scrum/schema.ts
tag :            ["scrum", "schema", "zod", "validation", "tree", "project",
                  "feature", "persona", "epic", "user-story", "task", "sprint",
                  "import"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Schémas Zod du module Scrum. Valide l'arbre complet
                 (ScrumTree) et chaque entité individuellement, ainsi que
                 les payloads des Server Actions (création, mise à jour,
                 suppression, déplacement DnD). Sert de source de vérité
                 pour la validation côté serveur (dans les actions) ET
                 côté client (dans les formulaires et le JsonEditor avant
                 envoi). Les schémas miroitent exactement les types de
                 lib/scrum/types.ts. Les schémas d'import (*ImportSchema)
                 sont permissifs : id et position sont optionnels, ce qui
                 permet le copier-coller d'un JSON simplifié dans les
                 JsonEditor des Boards.

flow:            scrumTreeSchema.safeParse(json) → { success, data | error }
                 → si ok, l'action écrit data dans Scrum.saveScrums. Les
                 schémas d'entités (featureSchema, epicSchema…) sont
                 réutilisés par les formulaires (react-hook-form +
                 zodResolver) et par les actions pour valider un seul item.
                 Les schémas d'import (featureImportSchema, epicImportSchema…)
                 sont utilisés par les JsonEditor pour accepter un JSON
                 sans id ni position, et les Server Actions addX calculent
                 l'id (newId) et la position (nextPosition).

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
relatedFiles:    ["@/lib/scrum/types.ts",
                  "@/lib/scrum/defaults.ts",
                  "@/lib/scrum/json-io.ts"]
imports:         ["zod", "@/lib/scrum/types"]
exports:         ["projectStatusSchema", "projectVisibilitySchema",
                  "projectMethodologySchema", "issuePrioritySchema",
                  "storyStatusSchema", "sprintStatusSchema",
                  "projectSchema", "featureSchema", "personaSchema",
                  "epicSchema", "userStorySchema", "taskSchema",
                  "sprintSchema", "scrumTreeSchema",
                  "createProjectInputSchema", "updateProjectInputSchema",
                  "addFeatureInputSchema", "updateFeatureInputSchema",
                  "removeEntityInputSchema", "moveUserStoryInputSchema",
                  "moveTaskInputSchema",
                  "featureImportSchema", "featureImportArraySchema",
                  "personaImportSchema", "personaImportArraySchema",
                  "epicImportSchema", "epicImportArraySchema",
                  "userStoryImportSchema", "userStoryImportArraySchema",
                  "taskImportSchema", "taskImportArraySchema",
                  "sprintImportSchema", "sprintImportArraySchema"]
useBy:           ["@/lib/scrum/json-io.ts",
                  "@/app/(app)/scrum/actions/project.ts",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts",
                  "@/app/(app)/scrum/actions/dnd.ts",
                  "@/components/scrum/EpicBoard.tsx",
                  "@/components/scrum/FeatureBoard.tsx",
                  "@/components/scrum/PersonaBoard.tsx",
                  "@/components/scrum/UserStoryBoard.tsx",
                  "@/components/scrum/TaskBoard.tsx",
                  "@/components/scrum/SprintBoard.tsx"]

userStories:     ["*en tant que développeur je veux valider l'arbre Scrum côté serveur et côté client",
                  "*en tant qu'utilisateur je veux être averti si mon JSON éditable est invalide",
                  "*en tant qu'utilisateur je veux ajouter des entités en collant un JSON simplifié"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { z } from "zod";
import type {
  Epic,
  Feature,
  Persona,
  Project,
  ScrumTree,
  Sprint,
  Task,
  UserStory,
} from "@/lib/scrum/types";

export const projectStatusSchema = z.enum([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
  "CANCELLED",
]);

export const projectVisibilitySchema = z.enum([
  "PRIVATE",
  "INTERNAL",
  "PUBLIC",
]);

export const projectMethodologySchema = z.enum([
  "SCRUM",
  "KANBAN",
  "SCRUMBAN",
  "WATERFALL",
  "HYBRID",
  "CUSTOM",
]);

export const issuePrioritySchema = z.enum([
  "LOWEST",
  "LOW",
  "MEDIUM",
  "HIGH",
  "HIGHEST",
]);

export const storyStatusSchema = z.enum(["TODO", "DOING", "DONE"]);

export const sprintStatusSchema = z.enum(["PLANNED", "ACTIVE", "DONE"]);

// ── Entités (sans annotation z.ZodType pour conserver .omit / .partial) ──

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  key: z.string().min(1).max(30),
  description: z.string().max(2000).optional(),
  status: projectStatusSchema,
  visibility: projectVisibilitySchema,
  methodology: projectMethodologySchema,
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  progressPercent: z.number().min(0).max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<Project>;

export const featureSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0),
}) satisfies z.ZodType<Feature>;

export const personaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  goals: z.string().max(2000).optional(),
  frustrations: z.string().max(2000).optional(),
  position: z.number().int().min(0),
}) satisfies z.ZodType<Persona>;

export const epicSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional(),
  priority: issuePrioritySchema,
  status: storyStatusSchema,
  position: z.number().int().min(0),
}) satisfies z.ZodType<Epic>;

export const userStorySchema = z.object({
  id: z.string().min(1),
  epicId: z.string().nullable(),
  sprintId: z.string().nullable(),
  title: z.string().min(1).max(255),
  asA: z.string().min(1).max(500),
  iWant: z.string().min(1).max(500),
  soThat: z.string().min(1).max(500),
  acceptanceCriteria: z.array(z.string().max(500)).default([]),
  storyPoints: z.number().min(0).nullable().optional(),
  priority: issuePrioritySchema,
  status: storyStatusSchema,
  position: z.number().int().min(0),
}) satisfies z.ZodType<UserStory>;

export const taskSchema = z.object({
  id: z.string().min(1),
  usId: z.string().nullable(),
  title: z.string().min(1).max(255),
  done: z.boolean(),
  position: z.number().int().min(0),
}) satisfies z.ZodType<Task>;

export const sprintSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  goal: z.string().max(2000).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: sprintStatusSchema,
  position: z.number().int().min(0),
}) satisfies z.ZodType<Sprint>;

export const scrumTreeSchema = z.object({
  project: projectSchema,
  features: z.array(featureSchema),
  personas: z.array(personaSchema),
  epics: z.array(epicSchema),
  userStories: z.array(userStorySchema),
  tasks: z.array(taskSchema),
  sprints: z.array(sprintSchema),
}) satisfies z.ZodType<ScrumTree>;

// ── Payloads des Server Actions ──────────────────────────────

export const createProjectInputSchema = z.object({
  name: z.string().min(1).max(255),
  key: z.string().min(1).max(30),
  description: z.string().max(2000).optional(),
  methodology: projectMethodologySchema.default("SCRUM"),
  visibility: projectVisibilitySchema.default("PRIVATE"),
  status: projectStatusSchema.default("PLANNING"),
});

export const updateProjectInputSchema = z.object({
  scrumId: z.string().min(1),
  patch: createProjectInputSchema.partial(),
});

export const addFeatureInputSchema = z.object({
  scrumId: z.string().min(1),
  data: featureSchema.omit({ id: true, position: true }),
});

export const updateFeatureInputSchema = z.object({
  scrumId: z.string().min(1),
  featureId: z.string().min(1),
  patch: featureSchema.omit({ id: true, position: true }).partial(),
});

export const removeEntityInputSchema = z.object({
  scrumId: z.string().min(1),
  entity: z.enum(["feature", "persona", "epic", "userStory", "task", "sprint"]),
  entityId: z.string().min(1),
});

export const moveUserStoryInputSchema = z.object({
  scrumId: z.string().min(1),
  userStoryId: z.string().min(1),
  target: z.object({
    epicId: z.string().nullable().optional(),
    sprintId: z.string().nullable().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export const moveTaskInputSchema = z.object({
  scrumId: z.string().min(1),
  taskId: z.string().min(1),
  target: z.object({
    usId: z.string().nullable().optional(),
    position: z.number().int().min(0).optional(),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;
export type AddFeatureInput = z.infer<typeof addFeatureInputSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureInputSchema>;
export type RemoveEntityInput = z.infer<typeof removeEntityInputSchema>;
export type MoveUserStoryInput = z.infer<typeof moveUserStoryInputSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskInputSchema>;

// ── Schémas d'import permissifs (JSON simplifié accepté) ──────
// Ces schémas autorisent l'absence de `id` et `position` pour permettre
// le copier-coller d'un JSON simplifié dans les JsonEditor. Le serveur
// (addX) calcule l'id via newId() et la position via nextPosition().

export const featureImportSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  position: z.number().int().min(0).optional(),
});
export const featureImportArraySchema = z.array(featureImportSchema);
export type FeatureImport = z.infer<typeof featureImportSchema>;

export const personaImportSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
  goals: z.string().max(2000).optional(),
  frustrations: z.string().max(2000).optional(),
  position: z.number().int().min(0).optional(),
});
export const personaImportArraySchema = z.array(personaImportSchema);
export type PersonaImport = z.infer<typeof personaImportSchema>;

export const epicImportSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional(),
  priority: issuePrioritySchema.optional(),
  status: storyStatusSchema.optional(),
  position: z.number().int().min(0).optional(),
});
export const epicImportArraySchema = z.array(epicImportSchema);
export type EpicImport = z.infer<typeof epicImportSchema>;

export const userStoryImportSchema = z.object({
  id: z.string().min(1).optional(),
  epicId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  title: z.string().min(1).max(255),
  asA: z.string().min(1).max(500),
  iWant: z.string().min(1).max(500),
  soThat: z.string().min(1).max(500),
  acceptanceCriteria: z.array(z.string().max(500)).optional(),
  storyPoints: z.number().min(0).nullable().optional(),
  priority: issuePrioritySchema.optional(),
  status: storyStatusSchema.optional(),
  position: z.number().int().min(0).optional(),
});
export const userStoryImportArraySchema = z.array(userStoryImportSchema);
export type UserStoryImport = z.infer<typeof userStoryImportSchema>;

export const taskImportSchema = z.object({
  id: z.string().min(1).optional(),
  usId: z.string().nullable().optional(),
  title: z.string().min(1).max(255),
  done: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});
export const taskImportArraySchema = z.array(taskImportSchema);
export type TaskImport = z.infer<typeof taskImportSchema>;

export const sprintImportSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1).max(255),
  goal: z.string().max(2000).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: sprintStatusSchema.optional(),
  position: z.number().int().min(0).optional(),
});
export const sprintImportArraySchema = z.array(sprintImportSchema);
export type SprintImport = z.infer<typeof sprintImportSchema>;