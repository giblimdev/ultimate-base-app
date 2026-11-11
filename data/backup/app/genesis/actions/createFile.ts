/*
path :           app/genesis/actions/createFile.ts
tag :            ["genesis", "create-files", "action", "server", "multi", "backup"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Action d'écriture multi-fichiers pour Create Files.
                 Reçoit le CONTENU COMPLET d'un ou plusieurs scripts (en-tête
                 / + code, séparés par "// ===GENESIS-FILE==="), parse
                 chaque en-tête via header-parser pour obtenir path/type/
                 projectId, puis écrit CHAQUE fichier au chemin déclaré dans
                 son en-tête. Si un fichier existe, il est backupé dans
                 data/backup/<chemin-relatif> puis écrasé — sans demander
                 confirmation. Retourne un rapport par fichier.

flow:            createFilesAction({ content, root? }) →
                 parseGenesisScripts(content) → si invalide, retour erreur →
                 resolveRoot → pour chaque script :
                   assertInsideRoot(root, script.header.path) →
                   writeFileSafe(root, absPath, script.content) (backup si existe)
                 → retour { ok, results: [{ path, type, backup }] }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         ["@/app/genesis/lib/header-parser",
                  "@/app/genesis/lib/fs-utils"]
exports:         ["createFilesAction", "CreateFilesInput", "CreateFilesResult", "CreatedFile"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux créer plusieurs fichiers en une fois",
                  "*en tant que développeur je veux que tout fichier écrasé soit sauvegardé automatiquement"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { parseGenesisScripts } from "@/app/genesis/lib/header-parser";
import {
  assertInsideRoot,
  resolveRoot,
  writeFileSafe,
} from "@/app/genesis/lib/fs-utils";

export type CreateFilesInput = {
  content: string;
  root?: string;
};

export type CreatedFile = {
  path: string;
  type: string;
  backup: string | null;
};

export type CreateFilesResult =
  | { ok: true; files: CreatedFile[] }
  | { ok: false; error: string };

export async function createFilesAction(
  input: CreateFilesInput,
): Promise<CreateFilesResult> {
  try {
    if (!input.content.trim()) {
      return { ok: false, error: "Le contenu est vide." };
    }

    const parsed = parseGenesisScripts(input.content);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }

    const root = resolveRoot(input.root);
    const files: CreatedFile[] = [];

    for (const script of parsed.scripts) {
      const absPath = assertInsideRoot(root, script.header.path);
      const { backup } = await writeFileSafe(root, absPath, script.content);
      files.push({
        path: absPath,
        type: script.header.type,
        backup,
      });
    }

    return { ok: true, files };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}
