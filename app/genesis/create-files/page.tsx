/*
path :           app/genesis/create-files/page.tsx
tag :            ["genesis", "create-files", "page"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page de l'outil Create Files (multi-fichiers). Rend le
                 header de page puis délègue la soumission et l'écran succès
                 à CreateFileForm. Pas de redirection auto après succès :
                 l'utilisateur décide via les CTA de SuccessScreen. Conteneur
                 centré max-w-4xl pour une lecture confortable.

flow:            Server Component → <section> conteneur → header (h1 +
                 description) → <CreateFileForm />.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/script-integrity.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/create-files/CreateFileForm.tsx",
                  "@/app/genesis/lib/tools.ts"]
imports:         ["@/app/genesis/create-files/CreateFileForm"]
exports:         ["default (CreateFilesPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux accéder à l'outil Create Files"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { CreateFileForm } from "@/app/genesis/create-files/CreateFileForm";

export default function CreateFilesPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Create Files
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Colle un ou plusieurs scripts complets (en-tête Genesis + code).
          Chaque fichier est écrit au chemin déclaré dans son en-tête. Tout
          fichier existant est sauvegardé dans{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            data/backup/
          </code>{" "}
          puis écrasé.
        </p>
      </header>
      <CreateFileForm />
    </section>
  );
}