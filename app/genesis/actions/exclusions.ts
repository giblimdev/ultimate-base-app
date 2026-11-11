/*
path :           app/genesis/actions/exclusions.ts
tag :            ["genesis", "read-files", "exclusions", "action", "server"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Actions de gestion de la liste d'exclusions :
                 getExclusionsAction (lire + chemin du fichier),
                 addExclusionAction (ajouter), removeExclusionAction
                 (supprimer), resetExclusionsAction (defaults). Persiste dans
                 data/app/exclusions.json. Utilise PROJECT_ROOT par défaut
                 (stable) au lieu de process.cwd() à chaque appel.

flow:            getExclusionsAction(root?) → loadExclusions → retour
                 { exclusions, path, created }.
                 addExclusionAction({ root, kind, pattern }) → load →
                 push → save → retour.
                 removeExclusionAction({ root, kind, pattern }) → load →
                 filter → save → retour.
                 resetExclusionsAction(root?) → save(DEFAULT) → retour.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/script-integrity.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/exclusions.ts",
                  "@/app/genesis/lib/fs-utils.ts"]
imports:         ["@/app/genesis/lib/exclusions"]
exports:         ["getExclusionsAction", "addExclusionAction", "removeExclusionAction", "resetExclusionsAction", "ExclusionKind"]
useBy:           ["@/app/genesis/read-files/ReadFilesView.tsx"]

userStories:     ["*en tant que développeur je veux gérer la liste des dossiers et fichiers exclus",
                  "*en tant que développeur je veux que les exclusions persistent entre rechargements"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import {
  DEFAULT_EXCLUSIONS,
  loadExclusions,
  saveExclusions,
  type Exclusions,
} from "@/app/genesis/lib/exclusions";

export type ExclusionKind = "dir" | "file";

type OkResult = {
  ok: true;
  exclusions: Exclusions;
  path: string;
};
type ErrResult = { ok: false; error: string };
type Result = OkResult | ErrResult;

export async function getExclusionsAction(root?: string): Promise<Result> {
  try {
    const res = await loadExclusions(root);
    return { ok: true, exclusions: res.exclusions, path: res.path };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function addExclusionAction(input: {
  root?: string;
  kind: ExclusionKind;
  pattern: string;
}): Promise<Result> {
  try {
    const pattern = input.pattern.trim().replace(/\\/g, "/");
    if (!pattern) {
      return { ok: false, error: "Le motif est vide." };
    }
    const loaded = await loadExclusions(input.root);
    const current = loaded.exclusions;
    const list = input.kind === "dir" ? current.dirs : current.files;
    if (list.includes(pattern)) {
      return { ok: true, exclusions: current, path: loaded.path };
    }
    const next: Exclusions = {
      dirs: input.kind === "dir" ? [...current.dirs, pattern] : current.dirs,
      files: input.kind === "file" ? [...current.files, pattern] : current.files,
    };
    const absPath = await saveExclusions(input.root, next);
    return { ok: true, exclusions: next, path: absPath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function removeExclusionAction(input: {
  root?: string;
  kind: ExclusionKind;
  pattern: string;
}): Promise<Result> {
  try {
    const loaded = await loadExclusions(input.root);
    const current = loaded.exclusions;
    const next: Exclusions = {
      dirs:
        input.kind === "dir"
          ? current.dirs.filter((d) => d !== input.pattern)
          : current.dirs,
      files:
        input.kind === "file"
          ? current.files.filter((f) => f !== input.pattern)
          : current.files,
    };
    const absPath = await saveExclusions(input.root, next);
    return { ok: true, exclusions: next, path: absPath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function resetExclusionsAction(root?: string): Promise<Result> {
  try {
    const absPath = await saveExclusions(root, DEFAULT_EXCLUSIONS);
    return { ok: true, exclusions: DEFAULT_EXCLUSIONS, path: absPath };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}