/*
path :           app/(app)/scrum/projects/new/page.tsx
tag :            ["scrum", "projects", "new", "page", "server", "form",
                  "crud"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page de création d'un projet Scrum. Server Component
                 wrapper : rend le header et monte ProjectForm en mode
                 "create". Aucun fetch, aucun état côté serveur. Mobile
                 first, responsive, accessible.

flow:            NewProjectPage() → header (titre + lien retour) →
                 ProjectForm({ mode: "create" }).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/new/page.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/components/scrum/ProjectForm.tsx",
                  "@/app/(app)/scrum/projects/page.tsx"]
imports:         ["next/link", "lucide-react",
                  "@/components/scrum/ProjectForm",
                  "@/components/ui/button"]
exports:         ["default"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux créer un projet Scrum"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/scrum/ProjectForm";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2">
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="w-fit"
          render={<Link href="/scrum/projects" />}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour aux projets
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Nouveau projet
        </h1>
        <p className="text-sm text-muted-foreground">
          Décrivez l&apos;essentiel. Vous pourrez ajouter features, personas,
          epics, user stories et sprints ensuite.
        </p>
      </header>

      <ProjectForm mode="create" />
    </div>
  );
}