/*
path :           lib/scrum/schema.ts
tag :            ["scrum", "schema", "zod", "validation", "tree", "project",
                  "feature", "persona", "epic", "user-story", "task", "sprint"]
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
                 lib/scrum/types.ts, et le parse du JSON éditable passe
                 par parseTreeJson qui utilise scrumTreeSchema.safeParse.

flow:            scrumTreeSchema.safeParse(json) → { success, data | error }
                 → si ok, l'action écrit data dans Scrum.saveScrums. Les
                 schémas d'entités (featureSchema, epicSchema…) sont
                 réutilisés par les formulaires (react-hook-form +
                 zodResolver) et par les actions pour valider un seul item.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
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
                  "moveTaskInputSchema"]
useBy:           ["@/lib/scrum/json-io.ts",
                  "@/app/(app)/scrum/actions/project.ts",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts",
                  "@/app/(app)/scrum/actions/dnd.ts"]

userStories:     ["*en tant que développeur je veux valider l'arbre Scrum côté serveur et côté client",
                  "*en tant qu'utilisateur je veux être averti si mon JSON éditable est invalide"]
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
