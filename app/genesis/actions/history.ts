/*
path :           app/genesis/actions/history.ts
tag :            ["genesis", "history", "backup", "action", "server",
                  "restore", "delete"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Actions de l'historique des créations/modifications.
                 listBackupsAction(root?) parcourt data/backup/ et retourne
                 l'arborescence des fichiers sauvegardés avec métadonnées
                 (chemin d'origine, chemin backup, date, taille, hash sha256
                 tronqué). restoreBackupAction({ root, backupPath }) copie
                 le backup vers son chemin d'origine (avec un nouveau backup
                 de l'état actuel avant écrasement). deleteBackupAction
                 supprime un fichier de backup. Toutes les opérations
                 valident les chemins via assertInsideRoot pour éviter les
                 traversées.

flow:            listBackupsAction → walk data/backup/ → pour chaque
                 fichier : fs.stat + fs.readFile (hash) → retour
                 { ok: true, backups: BackupEntry[] }.
                 restoreBackupAction → resolve source + target →
                 writeFileSafe(target) (backup auto) → retour.
                 deleteBackupAction → fs.unlink → retour.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/history.ts",
                   "@/app/genesis/history/page.tsx",
                   "@/app/genesis/history/HistoryView.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                 ]
relatedFiles:    ["@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/history/HistoryView.tsx"]
imports:         ["node:fs", "node:path", "node:crypto",
                  "@/app/genesis/lib/fs-utils"]
exports:         ["listBackupsAction", "restoreBackupAction",
                  "deleteBackupAction", "BackupEntry",
                  "ListBackupsResult", "RestoreBackupResult",
                  "DeleteBackupResult"]
useBy:           ["@/app/genesis/history/HistoryView.tsx"]

userStories:     ["*en tant que développeur je veux voir l'historique des fichiers créés et modifiés",
                  "*en tant que développeur je veux restaurer un fichier depuis son backup",
                  "*en tant que développeur je veux supprimer un backup obsolète"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import {
  assertInsideRoot,
  resolveRoot,
  writeFileSafe,
} from "@/app/genesis/lib/fs-utils";

const BACKUP_DIR = "data/backup";

export type BackupEntry = {
  /** Chemin absolu du fichier de backup sur disque. */
  absolutePath: string;
  /** Chemin relatif à la racine (ex : app/business/page.tsx.2026-....bak). */
  relativePath: string;
  /** Chemin d'origine reconstitué (retire .<timestamp>.bak). */
  originalPath: string;
  /** Date de dernière modification du backup (ISO). */
  modifiedAt: string;
  /** Taille en octets. */
  size: number;
  /** Hash sha256 tronqué (12 chars) pour identifier le contenu. */
  hash: string;
};

export type ListBackupsResult =
  | { ok: true; backups: BackupEntry[]; backupRoot: string }
  | { ok: false; error: string };

export type RestoreBackupResult =
  | { ok: true; targetPath: string; backupOfCurrent: string | null }
  | { ok: false; error: string };

export type DeleteBackupResult = { ok: true } | { ok: false; error: string };

async function walkBackups(
  root: string,
  dir: string,
  acc: BackupEntry[],
): Promise<void> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkBackups(root, abs, acc);
      continue;
    }
    if (!entry.isFile()) continue;

    const relToRoot = path.relative(root, abs).split(path.sep).join("/");
    const relToBackup = path
      .relative(path.join(root, BACKUP_DIR), abs)
      .split(path.sep)
      .join("/");

    // Reconstitue le chemin d'origine en retirant le suffixe .<ts>.bak
    // ou .<ts> ajouté par backupFile.
    const originalPath = relToBackup.replace(/\.[0-9T-]+Z?\.bak$/, "");

    try {
      const stat = await fs.stat(abs);
      const content = await fs.readFile(abs);
      const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
      acc.push({
        absolutePath: abs,
        relativePath: relToRoot,
        originalPath,
        modifiedAt: stat.mtime.toISOString(),
        size: stat.size,
        hash,
      });
    } catch {
      // Fichier illisible : on l'ignore silencieusement.
    }
  }
}

export async function listBackupsAction(
  root?: string,
): Promise<ListBackupsResult> {
  try {
    const absRoot = resolveRoot(root);
    const backupRoot = path.join(absRoot, BACKUP_DIR);
    const backups: BackupEntry[] = [];
    await walkBackups(absRoot, backupRoot, backups);
    backups.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
    return { ok: true, backups, backupRoot };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function restoreBackupAction(input: {
  root?: string;
  relativePath: string;
}): Promise<RestoreBackupResult> {
  try {
    const absRoot = resolveRoot(input.root);
    const absBackup = assertInsideRoot(
      path.join(absRoot, BACKUP_DIR),
      input.relativePath,
    );

    const originalPath = input.relativePath
      .replace(/\.[0-9T-]+Z?\.bak$/, "")
      .split(path.sep)
      .join("/");

    const absTarget = assertInsideRoot(absRoot, originalPath);
    const content = await fs.readFile(absBackup, "utf8");

    const { backup } = await writeFileSafe(absRoot, absTarget, content);
    return {
      ok: true,
      targetPath: originalPath,
      backupOfCurrent: backup,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function deleteBackupAction(input: {
  root?: string;
  relativePath: string;
}): Promise<DeleteBackupResult> {
  try {
    const absRoot = resolveRoot(input.root);
    const absBackup = assertInsideRoot(
      path.join(absRoot, BACKUP_DIR),
      input.relativePath,
    );
    await fs.unlink(absBackup);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}