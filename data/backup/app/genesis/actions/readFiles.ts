/*
path :           app/genesis/actions/readFiles.ts
tag :            ["genesis", "read-files", "action", "server"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Actions de lecture pour l'outil Read Files. Deux
                 actions : listFiles(root?, subPath?) retourne l'arborescence
                 (dossiers + fichiers) sous la racine choisie ; readFile(root?,
                 path) retourne le contenu d'un fichier (texte) ainsi que son
                 en-tête Genesis parsé s'il en a un. Lecture seule, aucune
                 écriture, aucun accès hors racine.

flow:            listFiles → resolveRoot → assertInsideRoot → fs.readdir récursif
                 (profondeur limitée) → filtre extensions texte → retour arbre.
                 readFile → resolveRoot → assertInsideRoot → fs.readFile →
                 parseGenesisHeader (best effort) → retour { content, header }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/read-files/ReadFilesView.tsx"]
imports:         ["node:fs", "node:path",
                  "@/app/genesis/lib/fs-utils",
                  "@/app/genesis/lib/header-parser"]
exports:         ["listFilesAction", "readFileAction", "FileNode", "ListFilesResult", "ReadFileResult"]
useBy:           ["@/app/genesis/read-files/ReadFilesView.tsx"]

userStories:     ["*en tant que développeur je veux parcourir les fichiers du projet",
                  "*en tant que développeur je veux lire le contenu d'un fichier et son en-tête"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { assertInsideRoot, resolveRoot } from "@/app/genesis/lib/fs-utils";
import { parseGenesisHeader } from "@/app/genesis/lib/header-parser";

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".css",
  ".html", ".yml", ".yaml", ".env", ".prisma", ".sql",
]);

const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", "dist", "build", ".turbo",
]);

const MAX_DEPTH = 8;

export type FileNode =
  | { kind: "dir"; name: string; path: string; children: FileNode[] }
  | { kind: "file"; name: string; path: string; ext: string };

export type ListFilesResult =
  | { ok: true; tree: FileNode[] }
  | { ok: false; error: string };

export type ReadFileResult =
  | {
      ok: true;
      path: string;
      content: string;
      header: ReturnType<typeof parseGenesisHeader> | null;
    }
  | { ok: false; error: string };

async function walk(
  absRoot: string,
  absDir: string,
  depth: number,
): Promise<FileNode[]> {
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env") continue;
    const abs = path.join(absDir, entry.name);
    const rel = path.relative(absRoot, abs).split(path.sep).join("/");

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (depth >= MAX_DEPTH) {
        nodes.push({ kind: "dir", name: entry.name, path: rel, children: [] });
        continue;
      }
      const children = await walk(absRoot, abs, depth + 1);
      nodes.push({ kind: "dir", name: entry.name, path: rel, children });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!TEXT_EXTENSIONS.has(ext) && entry.name !== ".env") continue;
      nodes.push({ kind: "file", name: entry.name, path: rel, ext });
    }
  }

  nodes.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export async function listFilesAction(
  root?: string,
  subPath?: string,
): Promise<ListFilesResult> {
  try {
    const absRoot = resolveRoot(root);
    const absSub = subPath
      ? assertInsideRoot(absRoot, subPath)
      : absRoot;
    const tree = await walk(absRoot, absSub, 0);
    return { ok: true, tree };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}

export async function readFileAction(
  root?: string,
  filePath?: string,
): Promise<ReadFileResult> {
  try {
    if (!filePath) {
      return { ok: false, error: "Chemin de fichier manquant." };
    }
    const absRoot = resolveRoot(root);
    const absFile = assertInsideRoot(absRoot, filePath);

    const content = await fs.readFile(absFile, "utf8");

    const header = content.trim().startsWith("/*")
      ? parseGenesisHeader(content)
      : null;

    return { ok: true, path: filePath, content, header };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}