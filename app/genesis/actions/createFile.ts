/*
path :           app/genesis/actions/createFile.ts
tag :            ["genesis", "create-files", "action", "server", "multi", "backup"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Action d'écriture multi-fichiers pour Create Files.
                 Reçoit un TABLEAU de scripts complets (chaque élément =
                 en-tête  + code), parse chaque en-tête via header-parser
                 pour obtenir path/type/projectId, puis écrit CHAQUE fichier
                 au chemin déclaré dans son en-tête. Si un fichier existe, il
                 est backupé dans data/backup/<chemin-relatif> puis écrasé —
                 sans demander confirmation. Retourne un rapport par fichier.

flow:            createFilesAction({ scripts, root? }) →
                 pour chaque script : parseGenesisHeader →
                 resolveRoot → assertInsideRoot(root, header.path) →
                 writeFileSafe(root, absPath, script) (backup si existe) →
                 retour { ok, files: [{ path, type, backup }] }.
                 En cas d'erreur sur un script, retourne l'index fautif.

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

import { parseGenesisHeader } from "@/app/genesis/lib/header-parser";
import {
  assertInsideRoot,
  resolveRoot,
  writeFileSafe,
} from "@/app/genesis/lib/fs-utils";

export type CreateFilesInput = {
  scripts: string[];
  root?: string;
};

export type CreatedFile = {
  path: string;
  type: string;
  backup: string | null;
};

export type CreateFilesResult =
  | { ok: true; files: CreatedFile[] }
  | { ok: false; error: string; failedIndex?: number };

export async function createFilesAction(
  input: CreateFilesInput,
): Promise<CreateFilesResult> {
  try {
    if (!Array.isArray(input.scripts) || input.scripts.length === 0) {
      return { ok: false, error: "Aucun script fourni." };
    }

    const root = resolveRoot(input.root);
    const files: CreatedFile[] = [];

    for (let i = 0; i < input.scripts.length; i++) {
      const raw = input.scripts[i].trim();
      if (!raw) {
        return {
          ok: false,
          error: `Script #${i + 1} : contenu vide.`,
          failedIndex: i,
        };
      }

      const parsed = parseGenesisHeader(raw);
      if (!parsed.ok) {
        return {
          ok: false,
          error: `Script #${i + 1} : ${parsed.error}`,
          failedIndex: i,
        };
      }

      const absPath = assertInsideRoot(root, parsed.header.path);
      const { backup } = await writeFileSafe(root, absPath, raw);
      files.push({
        path: absPath,
        type: parsed.header.type,
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
