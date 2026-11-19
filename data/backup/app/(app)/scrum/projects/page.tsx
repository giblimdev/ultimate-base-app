/*
path :           app/(app)/scrum/projects/page.tsx
tag :            ["scrum", "projects", "list", "page", "server",
                  "crud", "responsive"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Liste des projets Scrum. Server Component : fetch via
                 listScrumProjects, affiche chaque projet dans une
                 ProjectSummaryCard cliquable (lien vers le détail).
                 Bouton « Nouveau projet » vers /scrum/projects/new.
                 État vide explicite (aucun projet). Mobile first,
                 responsive (grid 1/2/3 cols), accessible. Aucun état
                 client, aucune logique métier.

flow:            ProjectsPage() → await listScrumProjects() → rendu
                 header + bouton nouveau → si vide: EmptyState → sinon:
                 grid de ProjectSummaryCardLink (ProjectSummaryCard +
                 Link wrapper) → chaque carte pointe vers
                 /scrum/projects/[id].

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/lib/scrum/queries.ts",
                  "@/components/scrum/ProjectSummaryCard.tsx",
                  "@/app/(app)/scrum/projects/new/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx"]
imports:         ["next/link", "lucide-react", "@/lib/scrum/queries",
                  "@/components/scrum/ProjectSummaryCard",
                  "@/components/ui/button", "@/components/ui/card"]
exports:         ["default"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux voir la liste de mes projets Scrum",
                  "*en tant qu'utilisateur je veux créer un nouveau projet depuis la liste",
                  "*en tant qu'utilisateur je veux ouvrir un projet pour le détailler"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import Link from "next/link";
import { FolderPlus, Plus } from "lucide-react";
import { listScrumProjects } from "@/lib/scrum/queries";
import { ProjectSummaryCard } from "@/components/scrum/ProjectSummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProjectsPage() {
  const projects = await listScrumProjects();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Projets Scrum
          </h1>
          <p className="text-sm text-muted-foreground">
            {projects.length === 0
              ? "Aucun projet pour l'instant."
              : `${projects.length} projet${projects.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/scrum/projects/new" />}>
          <Plus className="size-4" aria-hidden />
          Nouveau projet
        </Button>
      </header>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FolderPlus className="size-10 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Créez votre premier projet pour commencer à décrire vos
              features, epics, user stories et sprints.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/scrum/projects/new" />}
            >
              <Plus className="size-4" aria-hidden />
              Créer un projet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/scrum/projects/${project.id}`}
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
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
                  counts: project.counts,
                  startDate: project.startDate,
                  targetDate: project.targetDate,
                  updatedAt: project.updatedAt,
                }}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}