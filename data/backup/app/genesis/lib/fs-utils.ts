/*
path :           app/genesis/lib/fs-utils.ts
tag :            ["genesis", "fs", "helper", "security", "backup"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Helpers FS partagés par les outils Genesis. Valide un chemin
                 cible (pas de path traversal, pas de sortie de la racine),
                 résout la racine projet par défaut, vérifie l'existence d'un
                 fichier, écrit un fichier en écrasant silencieusement après
                 BACKUP automatique dans data/backup/<chemin-relatif>. Si le
                 backup échoue, l'écriture est annulée (échec sûr).

flow:            resolveRoot(root?) → chemin racine absolu (défaut cwd) →
                 assertInsideRoot(root, target) → contrôle préfixe →
                 fileExists(absPath) → fs.stat →
                 backupFile(root, absPath) → copie vers
                 data/backup/<relPath>[.timestamp.bak] →
                 writeFileSafe(absPath, content) → backup puis écriture.

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
relatedFiles:    ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/lib/header-templates.ts",
                  "@/app/genesis/lib/header-parser.ts"]
imports:         ["node:fs", "node:path"]
exports:         ["resolveRoot", "assertInsideRoot", "fileExists", "backupFile", "writeFileSafe"]
useBy:           ["@/app/genesis/actions/createFile.ts"]

userStories:     ["*en tant que développeur je veux que tout fichier écrasé soit sauvegardé automatiquement"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { promises as fs } from "node:fs";
import path from "node:path";

export function resolveRoot(root?: string): string {
  return path.resolve(root ?? process.cwd());
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

export async function backupFile(root: string, absPath: string): Promise<string> {
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