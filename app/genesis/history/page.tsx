/*
path :           app/genesis/history/page.tsx
tag :            ["genesis", "history", "page"]
projectId:       <ultimate-genesis>
type:            page
generic:         false

role:            Page de l'outil History. Rend le header de page puis
                 HistoryView (sélecteur de racine + liste des backups +
                 actions restaurer/supprimer). Lecture/écriture sur
                 data/backup/. Conteneur max-w-4xl pour lecture confortable.

flow:            Server Component → header (h1 + description) →
                 <HistoryView />.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/history.ts",
                   "@/app/genesis/history/HistoryView.tsx",
                   "@/app/genesis/history/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                 ]
relatedFiles:    ["@/app/genesis/history/HistoryView.tsx",
                  "@/app/genesis/actions/history.ts"]
imports:         ["@/app/genesis/history/HistoryView"]
exports:         ["default (HistoryPage)"]
useBy:           []

userStories:     ["*en tant que développeur je veux accéder à l'historique des créations et modifications"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { HistoryView } from "@/app/genesis/history/HistoryView";

export default function HistoryPage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          History
        </h1>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base">
          Tous les fichiers sauvegardés automatiquement avant écrasement par
          Create Files. Restaurez un état antérieur ou supprimez les backups
          obsolètes.
        </p>
      </header>
      <HistoryView />
    </section>
  );
}