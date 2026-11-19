/*
path :           lib/scrum/types.ts
tag :            ["scrum", "types", "model", "tree", "project", "feature",
                  "persona", "epic", "user-story", "task", "sprint"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Types TypeScript du module Scrum. Décrit l'arbre complet
                 d'UN projet, tel qu'il est persisté dans le champ
                 Scrum.saveScrums (JsonB). Un ScrumTree contient le projet
                 lui-même et toutes ses entités filles (features, personas,
                 epics, user stories, tasks, sprints). Les relations se font
                 par id (epicId sur UserStory, usId sur Task). Aucune
                 dépendance React ni Prisma : ce fichier est importable
                 côté serveur ET client, et sert de contrat partagé entre
                 les Server Actions, les composants d'édition et les boards
                 DnD. Les enums miroitent les enums Prisma existants
                 (ProjectStatus, ProjectVisibility, ProjectMethodology,
                 IssuePriority) pour rester cohérents avec le schéma DB,
                 mais restent des unions de strings côté JSON.

flow:            import type { ScrumTree, Project, Feature, Persona, Epic,
                 UserStory, Task, Sprint } → utilisés par schema.ts (Zod),
                 defaults.ts (factories), queries.ts (lecture), mutations.ts
                 (écriture), json-io.ts (parse/serialize), et tous les
                 composants scrum.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/defaults.ts",
                  "@/lib/scrum/json-io.ts"]
imports:         []
exports:         ["ProjectStatus", "ProjectVisibility", "ProjectMethodology",
                  "IssuePriority", "StoryStatus", "SprintStatus",
                  "Project", "Feature", "Persona", "Epic", "UserStory",
                  "Task", "Sprint", "ScrumTree", "ScrumTreeCounts"]
useBy:           ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/defaults.ts",
                  "@/lib/scrum/json-io.ts"]

userStories:     ["*en tant que développeur je veux un contrat de types unique pour l'arbre Scrum",
                  "*en tant que développeur je veux que les types soient partageables client/serveur"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type ProjectVisibility = "PRIVATE" | "INTERNAL" | "PUBLIC";

export type ProjectMethodology =
  | "SCRUM"
  | "KANBAN"
  | "SCRUMBAN"
  | "WATERFALL"
  | "HYBRID"
  | "CUSTOM";

export type IssuePriority = "LOWEST" | "LOW" | "MEDIUM" | "HIGH" | "HIGHEST";

export type StoryStatus = "TODO" | "DOING" | "DONE";

export type SprintStatus = "PLANNED" | "ACTIVE" | "DONE";

export type Project = {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  methodology: ProjectMethodology;
  startDate?: string | null;
  targetDate?: string | null;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
};

export type Feature = {
  id: string;
  name: string;
  description?: string;
  position: number;
};

export type Persona = {
  id: string;
  name: string;
  role: string;
  goals?: string;
  frustrations?: string;
  position: number;
};

export type Epic = {
  id: string;
  title: string;
  description?: string;
  priority: IssuePriority;
  status: StoryStatus;
  position: number;
};

export type UserStory = {
  id: string;
  epicId: string | null;
  sprintId: string | null;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  storyPoints?: number | null;
  priority: IssuePriority;
  status: StoryStatus;
  position: number;
};

export type Task = {
  id: string;
  usId: string | null;
  title: string;
  done: boolean;
  position: number;
};

export type Sprint = {
  id: string;
  name: string;
  goal?: string;
  startDate?: string | null;
  endDate?: string | null;
  status: SprintStatus;
  position: number;
};

export type ScrumTree = {
  project: Project;
  features: Feature[];
  personas: Persona[];
  epics: Epic[];
  userStories: UserStory[];
  tasks: Task[];
  sprints: Sprint[];
};

export type ScrumTreeCounts = {
  features: number;
  personas: number;
  epics: number;
  userStories: number;
  tasks: number;
  sprints: number;
};