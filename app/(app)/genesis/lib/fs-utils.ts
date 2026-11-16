/*
path :           app/genesis/lib/fs-utils.ts
tag :            ["genesis", "fs", "helper", "security", "backup", "root"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Helpers FS partagés par les outils Genesis. Fournit un
                 PROJECT_ROOT stable (racine projet résolue une seule fois,
                 indépendante de process.cwd() à chaque appel), valide un
                 chemin cible (pas de path traversal, pas de sortie de la
                 racine), vérifie l'existence d'un fichier, écrit un fichier
                 en écrasant silencieusement après BACKUP automatique dans
                 data/backup/<chemin-relatif>. Expose getEffectiveRoot()
                 pour que l'UI puisse afficher la racine réellement utilisée
                 (quand root est vide, c'est PROJECT_ROOT).

flow:            PROJECT_ROOT → path.resolve(process.cwd()) une seule fois.
                 resolveRoot(root?) → root ?? PROJECT_ROOT, résolu.
                 getEffectiveRoot(root?) → resolveRoot(root) (alias lisible).
                 assertInsideRoot(root, target) → contrôle préfixe.
                 fileExists(absPath) → fs.stat.
                 backupFile(root, absPath) → copie vers data/backup/.
                 writeFileSafe(root, absPath, content) → backup puis écriture.

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
relatedFiles:    ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/lib/header-templates.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/exclusions.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]
imports:         ["node:fs", "node:path"]
exports:         ["PROJECT_ROOT", "resolveRoot", "getEffectiveRoot",
                  "assertInsideRoot", "fileExists", "backupFile",
                  "writeFileSafe"]
useBy:           ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/actions/readFiles.ts",
                  "@/app/genesis/actions/history.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]

userStories:     ["*en tant que développeur je veux une racine projet stable et des exclusions persistantes",
                  "*en tant qu'utilisateur je veux voir la racine réellement utilisée"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Racine projet, résolue UNE SEULE FOIS au chargement du module.
 * Ne dépend pas de process.cwd() à chaque appel : évite les changements
 * de racine entre appels (Turbopack, hot-reload, sous-dossiers).
 */
export const PROJECT_ROOT: string = path.resolve(process.cwd());

export function resolveRoot(root?: string): string {
  if (root && root.trim()) {
    return path.resolve(root);
  }
  return PROJECT_ROOT;
}

/**
 * Alias lisible de resolveRoot, destiné à l'UI : retourne la racine
 * réellement utilisée (utile pour afficher "Racine : …" quand l'input
 * est vide).
 */
export function getEffectiveRoot(root?: string): string {
  return resolveRoot(root);
}

export function assertInsideRoot(root: string, target: string): string {
  const absRoot = path.resolve(root);
  const absTarget = path.resolve(absRoot, target);
  if (absTarget !== absRoot && !absTarget.startsWith(absRoot + path.sep)) {
    throw new Error("Chemin invalide : sortie de la racine interdite.");
  }
  return absTarget;
}

export async function fileExists(absPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(absPath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function backupFile(
  root: string,
  absPath: string,
): Promise<string> {
  const absRoot = path.resolve(root);
  const rel = path.relative(absRoot, absPath);
  const backupDir = path.join(absRoot, "data", "backup");
  let backupPath = path.join(backupDir, rel);

  await fs.mkdir(path.dirname(backupPath), { recursive: true });

  if (await fileExists(backupPath)) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    backupPath = `${backupPath}.${ts}.bak`;
  }

  await fs.copyFile(absPath, backupPath);
  return backupPath;
}

export async function writeFileSafe(
  root: string,
  absPath: string,
  content: string,
): Promise<{ written: true; backup: string | null }> {
  const exists = await fileExists(absPath);
  let backup: string | null = null;

  if (exists) {
    backup = await backupFile(root, absPath);
  }

  await fs.mkdir(path.dirname(absPath), { recursive: true });
  await fs.writeFile(absPath, content, "utf8");

  return { written: true, backup };
}