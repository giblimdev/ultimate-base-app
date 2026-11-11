/*
path :           app/genesis/read-files/page.tsx
tag :            ["genesis", "read-files", "page"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page de l'outil Read Files. Rend le header de page puis
                 ReadFilesView (arborescence + viewer). Lecture seule.

flow:            Server Component → header de page → <ReadFilesView />.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/read-files/ReadFilesView.tsx"]
imports:         ["@/app/genesis/read-files/ReadFilesView"]
exports:         ["default (ReadFilesPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux accéder à l'outil Read Files"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { ReadFilesView } from "@/app/genesis/read-files/ReadFilesView";

export default function ReadFilesPage() {
  return (
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Read Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Parcours et lis les fichiers du dossier racine sélectionné. Lecture
          seule, en-tête Genesis parsé quand il existe.
        </p>
      </header>
      <ReadFilesView />
    </section>
  );
}