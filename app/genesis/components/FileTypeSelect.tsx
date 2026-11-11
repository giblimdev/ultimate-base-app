/*
path :           app/genesis/components/FileTypeSelect.tsx
tag :            ["genesis", "create-files", "type", "select", "component", "client"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Sélecteur du type de script (page, component, action…) pour
                 Create Files. Composant client justifié par l'état contrôlé.

flow:            FileTypeSelect({ value, onChange }) → <select> sur SCRIPT_TYPES
                 → onChange(type).

ecosystem:       Genesis = [
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/header-templates.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         ["@/app/genesis/lib/header-templates"]
exports:         ["FileTypeSelect", "FileTypeSelectProps"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux choisir le type de script à créer"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import {
  SCRIPT_TYPES,
  type ScriptType,
} from "@/app/genesis/lib/header-templates";

export type FileTypeSelectProps = {
  value: ScriptType;
  onChange: (value: ScriptType) => void;
};

export function FileTypeSelect({ value, onChange }: FileTypeSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="script-type" className="text-sm font-medium">
        Type de script
      </label>
      <select
        id="script-type"
        value={value}
        onChange={(e) => onChange(e.target.value as ScriptType)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {SCRIPT_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
