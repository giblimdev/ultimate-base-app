/*
path :           app/genesis/lib/exclusions.ts
tag :            ["genesis", "read-files", "exclusions", "helper", "security"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Gère la liste d'exclusions de l'outil Read Files : chargement
                 et sauvegarde dans data/app/exclusions.json, application aux
                 chemins relatifs, matching par préfixe et glob simple.
                 loadExclusions distingue "fichier absent" (création des
                 defaults) de "fichier illisible" (erreur remontée, pas
                 d'écrasement). Expose le chemin absolu du fichier pour
                 diagnostic UI.

flow:            loadExclusions(root) → tente fs.readFile → si ENOENT,
                 crée le fichier avec defaults → si autre erreur, retourne
                 un objet avec error (pas d'écrasement). saveExclusions écrit.
                 isExcluded matche dirs (préfixe) et files (glob).

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
relatedFiles:    ["@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/readFiles.ts",
                  "@/app/genesis/lib/fs-utils.ts"]
imports:         ["node:fs", "node:path",
                  "@/app/genesis/lib/fs-utils"]
exports:         ["Exclusions", "ExclusionsLoadResult", "loadExclusions", "saveExclusions", "isExcluded", "DEFAULT_EXCLUSIONS", "getExclusionsPath"]
useBy:           ["@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/readFiles.ts"]

userStories:     ["*en tant que développeur je veux exclure certains dossiers et fichiers de Read Files",
                  "*en tant que développeur je veux que les exclusions persistent entre rechargements"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveRoot } from "@/app/genesis/lib/fs-utils";

export type Exclusions = {
  dirs: string[];
  files: string[];
};

export type ExclusionsLoadResult = {
  exclusions: Exclusions;
  path: string;
  created: boolean;
};

export const DEFAULT_EXCLUSIONS: Exclusions = {
  dirs: [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".turbo",
    "data/app",
  ],
  files: [
    ".env",
    ".env.local",
    ".env.production",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
  ],
};

export function getExclusionsPath(root?: string): string {
  const absRoot = resolveRoot(root);
  return path.join(absRoot, "data", "app", "exclusions.json");
}

export async function loadExclusions(
  root?: string,
): Promise<ExclusionsLoadResult> {
  const absRoot = resolveRoot(root);
  const absFile = getExclusionsPath(absRoot);
  const absDir = path.dirname(absFile);

  try {
    const raw = await fs.readFile(absFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<Exclusions>;
    return {
      exclusions: {
        dirs: Array.isArray(parsed.dirs) ? parsed.dirs : [],
        files: Array.isArray(parsed.files) ? parsed.files : [],
      },
      path: absFile,
      created: false,
    };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      await fs.mkdir(absDir, { recursive: true });
      await fs.writeFile(
        absFile,
        JSON.stringify(DEFAULT_EXCLUSIONS, null, 2),
        "utf8",
      );
      return { exclusions: DEFAULT_EXCLUSIONS, path: absFile, created: true };
    }
    throw new Error(
      `Impossible de lire ${absFile} : ${err instanceof Error ? err.message : "erreur inconnue"}`,
    );
  }
}

export async function saveExclusions(
  root: string | undefined,
  excl: Exclusions,
): Promise<string> {
  const absRoot = resolveRoot(root);
  const absFile = getExclusionsPath(absRoot);
  const absDir = path.dirname(absFile);
  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(absFile, JSON.stringify(excl, null, 2), "utf8");
  return absFile;
}

function matchGlob(pattern: string, value: string): boolean {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "§§")
    .replace(/\*/g, "[^/]*")
    .replace(/§§/g, ".*");
  return new RegExp(`^${escaped}$`).test(value);
}

export function isExcluded(relPath: string, excl: Exclusions): boolean {
  const normalized = relPath.replace(/\\/g, "/");

  for (const dir of excl.dirs) {
    const d = dir.replace(/\/+$/, "");
    if (normalized === d || normalized.startsWith(d + "/")) return true;
  }

  for (const file of excl.files) {
    if (matchGlob(file, normalized)) return true;
    if (normalized === file) return true;
    if (normalized.endsWith("/" + file)) return true;
  }

  return false;
}