/*
path :           app/(app)/scrum/projects/[projectId]/project-detail-content.tsx
tag :            ["scrum", "projects", "detail", "hub", "server",
                  "crud", "dnd"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Contenu de la page hub d'un projet Scrum. Server
                 Component async : await params, charge l'arbre via
                 loadScrumTree, affiche le résumé du projet
                 (ProjectSummaryCard), les liens vers les boards CRUD/DnD
                 (features, personas, epics, user stories, tasks, sprints)
                 et un lien vers l'édition du projet. Si l'arbre est
                 absent (projet introuvable ou saveScrums null), affiche
                 un état vide avec retour à la liste. Les boards sont
                 désactivés (badge « bientôt ») tant qu'ils ne sont pas
                 implémentés (lots 4-6). Mobile first, responsive,
                 accessible.

flow:            ProjectDetailContent({ params }) → await params → await
                 loadScrumTree(projectId) → si null: NotFoundState →
                 sinon: header (nom + clé + statut) + ProjectSummaryCard
                 + grille de liens boards + lien éditer.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                 ]
relatedFiles:    ["@/lib/scrum/queries.ts",
                  "@/components/scrum/ProjectSummaryCard.tsx",
                  "@/app/(app)/scrum/projects/page.tsx",
                  "@/components/scrum/ProjectForm.tsx"]
imports:         ["next/link", "lucide-react", "@/lib/scrum/queries",
                  "@/components/scrum/ProjectSummaryCard",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/card"]
exports:         ["ProjectDetailContent"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir le résumé d'un projet et accéder à ses boards",
                  "*en tant qu'utilisateur je veux éditer les infos d'un projet"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  ClipboardList,
  Layers,
  ListTodo,
  Pencil,
  Target,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { loadScrumTree } from "@/lib/scrum/queries";
import { ProjectSummaryCard } from "@/components/scrum/ProjectSummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BoardLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  ready: boolean;
};

function boardsFor(projectId: string): BoardLink[] {
  return [
    {
      id: "features",
      label: "Features",
      description: "Découper le périmètre fonctionnel.",
      href: `/scrum/projects/${projectId}/features`,
      icon: Layers,
      ready: false,
    },
    {
      id: "personas",
      label: "Personas",
      description: "Décrire les utilisateurs cibles.",
      href: `/scrum/projects/${projectId}/personas`,
      icon: UserRound,
      ready: false,
    },
    {
      id: "epics",
      label: "Epics",
      description: "Regrouper les US en epics.",
      href: `/scrum/projects/${projectId}/epics`,
      icon: Target,
      ready: false,
    },
    {
      id: "us",
      label: "User Stories",
      description: "Rédiger et estimer les US.",
      href: `/scrum/projects/${projectId}/us`,
      icon: ListTodo,
      ready: false,
    },
    {
      id: "tasks",
      label: "Tasks",
      description: "Décomposer les US en tâches.",
      href: `/scrum/projects/${projectId}/tasks`,
      icon: ClipboardList,
      ready: false,
    },
    {
      id: "sprints",
      label: "Sprints",
      description: "Planifier les itérations.",
      href: `/scrum/projects/${projectId}/sprints`,
      icon: CalendarRange,
      ready: false,
    },
  ];
}

export async function ProjectDetailContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const tree = await loadScrumTree(projectId);

  if (!tree) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Projet introuvable
        </h1>
        <p className="text-sm text-muted-foreground">
          Ce projet n&apos;existe pas ou a été supprimé.
        </p>
        <Button
          nativeButton={false}
          variant="outline"
          className="w-fit"
          render={<Link href="/scrum/projects" />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour aux projets
        </Button>
      </div>
    );
  }

  const project = tree.project;
  const boards = boardsFor(projectId);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Button
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="w-fit"
            render={<Link href="/scrum/projects" />}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Projets
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono uppercase">
              {project.key}
            </Badge>
            <span>{project.methodology}</span>
            <span>·</span>
            <span>{project.visibility}</span>
          </div>
        </div>
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={`/scrum/projects/${projectId}/edit`} />}
        >
          <Pencil className="size-4" aria-hidden />
          Éditer
        </Button>
      </header>

      <ProjectSummaryCard
        project={{
          id: project.id,
          name: project.name,
          key: project.key,
          description: project.description,
          status: project.status,
          methodology: project.methodology,
          visibility: project.visibility,
          progressPercent: project.progressPercent,
          counts: {
            features: tree.features.length,
            personas: tree.personas.length,
            epics: tree.epics.length,
            userStories: tree.userStories.length,
            tasks: tree.tasks.length,
            sprints: tree.sprints.length,
          },
          startDate: project.startDate,
          targetDate: project.targetDate,
          updatedAt: project.updatedAt,
        }}
      />

      <section aria-labelledby="boards-title" className="flex flex-col gap-3">
        <h2 id="boards-title" className="text-lg font-semibold tracking-tight">
          Boards du projet
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const Icon = board.icon;
            return (
              <Card key={board.id} className="h-full">
                <CardHeader className="gap-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    <CardTitle className="text-sm">{board.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <CardDescription className="text-xs">
                    {board.description}
                  </CardDescription>
                  {board.ready ? (
                    <Button
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                      render={<Link href={board.href} />}
                    >
                      Ouvrir
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Bientôt disponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}