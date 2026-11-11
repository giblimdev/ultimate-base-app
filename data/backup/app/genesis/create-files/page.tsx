/*
path :           app/genesis/create-files/page.tsx
tag :            ["genesis", "create-files", "page"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page de l'outil Create Files. Rend le formulaire de création
                 (RootFsPicker + FileTypeSelect + chemin + projectId + option
                 overwrite) et délègue la soumission à CreateFileForm.

flow:            Server Component → header de page → <CreateFileForm />.

ecosystem:       Genesis = [
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/create-files/CreateFileForm.tsx",
                  "@/app/genesis/lib/tools.ts"]
imports:         ["@/app/genesis/create-files/CreateFileForm"]
exports:         ["default (CreateFilesPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux accéder à l'outil Create Files"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { CreateFileForm } from "@/app/genesis/create-files/CreateFileForm";

export default function CreateFilesPage() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Create Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crée un fichier avec un en-tête Genesis pré-rempli selon son type,
          dans le dossier racine sélectionné.
        </p>
      </header>
      <CreateFileForm />
    </section>
  );
}
