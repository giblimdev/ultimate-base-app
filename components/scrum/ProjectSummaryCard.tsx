/*
path :           components/scrum/ProjectSummaryCard.tsx
tag :            ["scrum", "project", "card", "summary", "presentation",
                  "responsive", "design-system"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Carte résumé d'un projet Scrum, présentationnelle pure.
                 Affiche le nom, la clé, le statut, la méthodologie, la
                 progression, les compteurs (features, personas, epics,
                 user stories, tasks, sprints) et les dates clés d'un
                 projet. Composant Server Component (aucun état, aucun
                 effet, aucun fetch) : il reçoit un objet ProjectSummary
                 typé en prop. Utilisable dans la page de présentation
                 /scrum et, plus tard, dans la liste des projets alimentée
                 par la DB (modèle Scrum → saveScrums JsonB). Mobile first,
                 responsive (grille interne 2 cols sur sm, 3 sur md),
                 accessible (aria-label sur la carte, statut en texte,
                 contrastes respectés). Aucune logique métier : le calcul
                 de progression est fourni par l'appelant via
                 progressPercent.

flow:            ProjectSummaryCard({ project }) → rendu de l'en-tête
                 (nom, clé, badge statut) → grille de méta (méthodologie,
                 visibilité) → barre de progression → grille de compteurs
                 → pied de carte (dates). Aucun appel externe.

ecosystem:       Scrum = [
                   "@/app/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/app/scrum/page.tsx",
                  "@/data/nav.ts",
                  "@/data/nav.json"]
imports:         ["lucide-react", "@/lib/utils",
                  "@/components/ui/badge", "@/components/ui/card",
                  "@/components/ui/progress"]
exports:         ["ProjectSummaryCard", "ProjectSummary"]
useBy:           ["@/app/scrum/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir un résumé clair d'un projet",
                  "*en tant que développeur je veux réutiliser une carte projet dans la liste et la page de présentation"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import {
  CalendarDays,
  CircleDot,
  ClipboardList,
  GitBranch,
  Layers,
  ListTodo,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ProjectSummaryStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED"
  | "CANCELLED";

export type ProjectSummaryMethodology =
  | "SCRUM"
  | "KANBAN"
  | "SCRUMBAN"
  | "WATERFALL"
  | "HYBRID"
  | "CUSTOM";

export type ProjectSummaryVisibility = "PRIVATE" | "INTERNAL" | "PUBLIC";

export type ProjectSummary = {
  id: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectSummaryStatus;
  methodology: ProjectSummaryMethodology;
  visibility: ProjectSummaryVisibility;
  progressPercent: number;
  counts: {
    features: number;
    personas: number;
    epics: number;
    userStories: number;
    tasks: number;
    sprints: number;
  };
  startDate?: string | null;
  targetDate?: string | null;
  updatedAt?: string | null;
};

type ProjectSummaryCardProps = {
  project: ProjectSummary;
  className?: string;
};

const STATUS_LABEL: Record<ProjectSummaryStatus, string> = {
  PLANNING: "Planification",
  ACTIVE: "Actif",
  ON_HOLD: "En pause",
  COMPLETED: "Terminé",
  ARCHIVED: "Archivé",
  CANCELLED: "Annulé",
};

const STATUS_VARIANT: Record<
  ProjectSummaryStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PLANNING: "outline",
  ACTIVE: "default",
  ON_HOLD: "secondary",
  COMPLETED: "default",
  ARCHIVED: "outline",
  CANCELLED: "destructive",
};

const METHODOLOGY_LABEL: Record<ProjectSummaryMethodology, string> = {
  SCRUM: "Scrum",
  KANBAN: "Kanban",
  SCRUMBAN: "Scrumban",
  WATERFALL: "Waterfall",
  HYBRID: "Hybride",
  CUSTOM: "Personnalisée",
};

const VISIBILITY_LABEL: Record<ProjectSummaryVisibility, string> = {
  PRIVATE: "Privé",
  INTERNAL: "Interne",
  PUBLIC: "Public",
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

type CounterProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
};

function Counter({ icon: Icon, label, value }: CounterProps) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </div>
    </div>
  );
}

export function ProjectSummaryCard({
  project,
  className,
}: ProjectSummaryCardProps) {
  const percent = clampPercent(project.progressPercent);

  return (
    <Card
      className={cn("flex h-full flex-col", className)}
      aria-label={`Résumé du projet ${project.name}`}
    >
      <CardHeader className="gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate text-base">{project.name}</CardTitle>
            <CardDescription className="font-mono text-[11px] uppercase tracking-wide">
              {project.key}
            </CardDescription>
          </div>
          <Badge variant={STATUS_VARIANT[project.status]}>
            {STATUS_LABEL[project.status]}
          </Badge>
        </div>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5">
            <GitBranch className="size-3" aria-hidden />
            {METHODOLOGY_LABEL[project.methodology]}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5">
            <CircleDot className="size-3" aria-hidden />
            {VISIBILITY_LABEL[project.visibility]}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Progression</span>
            <span className="font-semibold tabular-nums text-foreground">
              {percent}%
            </span>
          </div>
          <Progress value={percent} aria-label="Progression du projet" />
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          <Counter
            icon={Layers}
            label="Features"
            value={project.counts.features}
          />
          <Counter
            icon={Users}
            label="Personas"
            value={project.counts.personas}
          />
          <Counter
            icon={Target}
            label="Epics"
            value={project.counts.epics}
          />
          <Counter
            icon={ListTodo}
            label="US"
            value={project.counts.userStories}
          />
          <Counter
            icon={ClipboardList}
            label="Tasks"
            value={project.counts.tasks}
          />
          <Counter
            icon={CalendarDays}
            label="Sprints"
            value={project.counts.sprints}
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3" aria-hidden />
          Début : {formatDate(project.startDate)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Target className="size-3" aria-hidden />
          Cible : {formatDate(project.targetDate)}
        </span>
      </CardFooter>
    </Card>
  );
}