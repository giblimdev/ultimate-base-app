/*
path :           app/genesis/actions/exclusions.ts
tag :            ["genesis", "read-files", "exclusions", "action", "server"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Actions de gestion de la liste d'exclusions :
                 getExclusionsAction (lire), addExclusionAction (ajouter un
                 dossier ou un fichier), removeExclusionAction (supprimer),
                 resetExclusionsAction (revenir aux defaults). Persiste dans
                 data/app/exclusions.json via lib/exclusions.

flow:            getExclusionsAction(root?) → loadExclusions → retour.
                 addExclusionAction({ root, kind, pattern }) → load →
                 push → save → retour.
                 removeExclusionAction({ root, kind, pattern }) → load →
                 filter → save → retour.

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
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/exclusions.ts"]
imports:         ["@/app/genesis/lib/exclusions",
                  "@/app/genesis/lib/fs-utils"]
exports:         ["getExclusionsAction", "addExclusionAction", "removeExclusionAction", "resetExclusionsAction", "ExclusionKind"]
useBy:           ["@/app/genesis/read-files/ReadFilesView.tsx"]

userStories:     ["*en tant que développeur je veux gérer la liste des dossiers et fichiers exclus"]
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
import { resolveRoot } from "@/app/genesis/lib/fs-utils";

export type ExclusionKind = "dir" | "file";

type Result =
  | { ok: true; exclusions: Exclusions }
  | { ok: false; error: string };

export async function getExclusionsAction(root?: string): Promise<Result> {
  try {
    const absRoot = resolveRoot(root);
    const exclusions = await loadExclusions(absRoot);
    return { ok: true, exclusions };
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
    const absRoot = resolveRoot(input.root);
    const current = await loadExclusions(absRoot);
    const list = input.kind === "dir" ? current.dirs : current.files;
    if (list.includes(pattern)) {
      return { ok: true, exclusions: current };
    }
    const next: Exclusions = {
      dirs: input.kind === "dir" ? [...current.dirs, pattern] : current.dirs,
      files: input.kind === "file" ? [...current.files, pattern] : current.files,
    };
    await saveExclusions(absRoot, next);
    return { ok: true, exclusions: next };
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
    const absRoot = resolveRoot(input.root);
    const current = await loadExclusions(absRoot);
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
    await saveExclusions(absRoot, next);
    return { ok: true, exclusions: next };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function resetExclusionsAction(root?: string): Promise<Result> {
  try {
    const absRoot = resolveRoot(root);
    await saveExclusions(absRoot, DEFAULT_EXCLUSIONS);
    return { ok: true, exclusions: DEFAULT_EXCLUSIONS };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}