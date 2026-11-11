/*
path :           app/genesis/components/RootFsPicker.tsx
tag :            ["genesis", "fs", "picker", "component", "client"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Sélecteur de dossier racine (par défaut : racine du projet).
                 Utilisé par Create Files et Read Files pour savoir où lire/écrire.
                 Composant client justifié par l'état contrôlé (value/onChange).

flow:            RootFsPicker({ value, onChange, label? }) → input texte
                 (chemin racine) → bouton "Réinitialiser" → onChange(path).

ecosystem:       Genesis = [
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         ["react"]
exports:         ["RootFsPicker", "RootFsPickerProps"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux choisir le dossier racine de lecture/écriture"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

export type RootFsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function RootFsPicker({
  value,
  onChange,
  label = "Dossier racine",
}: RootFsPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="root-fs" className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id="root-fs"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="(défaut : racine du projet)"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/40"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
