/*
path :           lib/scrum/defaults.ts
tag :            ["scrum", "defaults", "factory", "tree", "empty",
                  "project", "feature", "persona", "epic", "user-story",
                  "task", "sprint"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Fabriques d'objets du module Scrum. Fournit createEmptyTree
                 (arbre vide prêt à être persisté), et une factory par
                 entité (createFeature, createEpic, createUserStory…) qui
                 génère un id via crypto.randomUUID() et applique les valeurs
                 par défaut cohérentes avec les types et les schémas Zod.
                 Utilisé par les Server Actions (création d'entités) et par
                 les formulaires (valeurs initiales). Aucune dépendance React
                 ni Prisma : importable client et serveur. Les positions sont
                 calculées par l'appelant (nextPosition), pas par la factory.

flow:            createEmptyTree({ projectName, projectKey }) → ScrumTree
                 avec project + 6 tableaux vides. createFeature(data) →
                 Feature avec id/position. Idem pour toutes les entités.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/defaults.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/scrum/types.ts",
                  "@/lib/scrum/schema.ts"]
imports:         ["@/lib/scrum/types"]
exports:         ["newId", "nextPosition", "createEmptyTree",
                  "createFeature", "createPersona", "createEpic",
                  "createUserStory", "createTask", "createSprint"]
useBy:           ["@/app/(app)/scrum/actions/project.ts",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts"]

userStories:     ["*en tant que développeur je veux créer un arbre Scrum vide en une ligne",
                  "*en tant que développeur je veux des factories cohérentes avec les schémas Zod"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
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

export function newId(): string {
  return crypto.randomUUID();
}

export function nextPosition(items: { position: number }[]): number {
  if (items.length === 0) return 0;
  return Math.max(...items.map((i) => i.position)) + 1;
}

export function createEmptyTree(input: {
  projectName: string;
  projectKey: string;
  description?: string;
}): ScrumTree {
  const now = new Date().toISOString();
  const project: Project = {
    id: newId(),
    name: input.projectName,
    key: input.projectKey,
    description: input.description,
    status: "PLANNING",
    visibility: "PRIVATE",
    methodology: "SCRUM",
    startDate: null,
    targetDate: null,
    progressPercent: 0,
    createdAt: now,
    updatedAt: now,
  };

  return {
    project,
    features: [],
    personas: [],
    epics: [],
    userStories: [],
    tasks: [],
    sprints: [],
  };
}

export function createFeature(input: {
  name: string;
  description?: string;
  position: number;
}): Feature {
  return {
    id: newId(),
    name: input.name,
    description: input.description,
    position: input.position,
  };
}

export function createPersona(input: {
  name: string;
  role: string;
  goals?: string;
  frustrations?: string;
  position: number;
}): Persona {
  return {
    id: newId(),
    name: input.name,
    role: input.role,
    goals: input.goals,
    frustrations: input.frustrations,
    position: input.position,
  };
}

export function createEpic(input: {
  title: string;
  description?: string;
  priority?: Epic["priority"];
  status?: Epic["status"];
  position: number;
}): Epic {
  return {
    id: newId(),
    title: input.title,
    description: input.description,
    priority: input.priority ?? "MEDIUM",
    status: input.status ?? "TODO",
    position: input.position,
  };
}

export function createUserStory(input: {
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  epicId?: string | null;
  sprintId?: string | null;
  acceptanceCriteria?: string[];
  storyPoints?: number | null;
  priority?: UserStory["priority"];
  status?: UserStory["status"];
  position: number;
}): UserStory {
  return {
    id: newId(),
    epicId: input.epicId ?? null,
    sprintId: input.sprintId ?? null,
    title: input.title,
    asA: input.asA,
    iWant: input.iWant,
    soThat: input.soThat,
    acceptanceCriteria: input.acceptanceCriteria ?? [],
    storyPoints: input.storyPoints ?? null,
    priority: input.priority ?? "MEDIUM",
    status: input.status ?? "TODO",
    position: input.position,
  };
}

export function createTask(input: {
  title: string;
  usId?: string | null;
  done?: boolean;
  position: number;
}): Task {
  return {
    id: newId(),
    usId: input.usId ?? null,
    title: input.title,
    done: input.done ?? false,
    position: input.position,
  };
}

export function createSprint(input: {
  name: string;
  goal?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: Sprint["status"];
  position: number;
}): Sprint {
  return {
    id: newId(),
    name: input.name,
    goal: input.goal,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    status: input.status ?? "PLANNED",
    position: input.position,
  };
}