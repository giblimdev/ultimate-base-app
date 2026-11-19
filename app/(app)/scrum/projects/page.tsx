/*
path :           app/(app)/scrum/projects/new/page.tsx
tag :            ["scrum", "projects", "new", "page", "client",
                  "crud", "create"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page de création d'un projet Scrum. Client Component qui
                 rend un ProjectForm avec onSubmit = wrapper appelant la
                 Server Action createProject puis redirige vers le détail
                 du projet créé. Affiche les erreurs de validation.

flow:            NewProjectPage() → handleSubmit(data) →
                 createProject(data) → si ok: router.push(
                 `/scrum/projects/${scrumId}`) + router.refresh()
                 → sinon: console.error (à remplacer par toast).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/projects/page.tsx",
                   "@/app/(app)/scrum/projects/new/page.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                 ]
relatedFiles:    ["@/components/scrum/ProjectForm.tsx",
                  "@/app/(app)/scrum/actions/project.ts",
                  "@/lib/scrum/schema.ts"]
imports:         ["next/navigation",
                  "@/components/scrum/ProjectForm",
                  "@/app/(app)/scrum/actions/project",
                  "@/lib/scrum/schema"]
exports:         ["default"]
useBy:           ["@/app/(app)/scrum/projects/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer un nouveau projet Scrum"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import { useRouter } from "next/navigation";
import { ProjectForm } from "@/components/scrum/ProjectForm";
import { createProject } from "@/app/(app)/scrum/actions/project";
import type { CreateProjectInput } from "@/lib/scrum/schema";

export default function NewProjectPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateProjectInput) => {
    const result = await createProject(data);
    if (result.ok) {
      router.push(`/scrum/projects/${result.data!.scrumId}`);
      router.refresh();
    } else {
      // TODO: remplacer par un toast (sonner) quand dispo
      console.error(result.error, result.issues);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Nouveau projet
        </h1>
        <p className="text-sm text-muted-foreground">
          Créez un projet pour organiser vos features, epics et sprints.
        </p>
      </header>

      <ProjectForm onSubmit={handleSubmit} submitLabel="Créer le projet" />
    </div>
  );
}
