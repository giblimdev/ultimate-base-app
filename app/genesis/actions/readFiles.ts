/*
path :           app/genesis/actions/readFiles.ts
tag :            ["genesis", "read-files", "action", "server", "json", "exclusions"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Actions de lecture pour Read Files. listFilesAction
                 retourne l'arborescence FILTRÉE par les exclusions (dossiers
                 et fichiers exclus absents). readFileAction lit un fichier et
                 refuse tout chemin exclu. exportSelectionAction construit un
                 JSON des fichiers sélectionnés, l'écrit dans
                 data/app/read-files-<timestamp>.json, et retourne le contenu
                 JSON + le chemin RELATIF + le chemin ABSOLU + le nombre de
                 fichiers.

flow:            listFilesAction → loadExclusions → walk avec isExcluded.
                 readFileAction → isExcluded → refus → sinon lecture.
                 exportSelectionAction → pour chaque path → refus si exclu →
                 lecture → parse header → assemblage → écriture JSON →
                 retour { json, savedPath, savedAbsolutePath, fileCount }.

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
                  "@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/read-files/ReadFilesView.tsx"]
imports:         ["node:fs", "node:path",
                  "@/app/genesis/lib/fs-utils",
                  "@/app/genesis/lib/exclusions",
                  "@/app/genesis/lib/header-parser"]
exports:         ["listFilesAction", "readFileAction", "exportSelectionAction", "FileNode", "ListFilesResult", "ReadFileResult", "ExportResult"]
useBy:           ["@/app/genesis/read-files/ReadFilesView.tsx"]

userStories:     ["*en tant que développeur je veux parcourir les fichiers du projet",
                  "*en tant que développeur je veux lire le contenu d'un fichier et son en-tête",
                  "*en tant que développeur je veux exporter une sélection en JSON",
                  "*en tant que développeur je veux voir le chemin absolu du fichier sauvegardé",
                  "*en tant que développeur je veux que les fichiers exclus ne soient pas exposés"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  assertInsideRoot,
  resolveRoot,
} from "@/app/genesis/lib/fs-utils";
import { isExcluded, loadExclusions } from "@/app/genesis/lib/exclusions";
import { parseGenesisHeader } from "@/app/genesis/lib/header-parser";

const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".txt", ".css",
  ".html", ".yml", ".yaml", ".env", ".prisma", ".sql",
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

export type ExportResult =
  | {
      ok: true;
      json: string;
      savedPath: string;
      savedAbsolutePath: string;
      fileCount: number;
    }
  | { ok: false; error: string };

type LoadedExclusions = Awaited<ReturnType<typeof loadExclusions>>["exclusions"];

async function walk(
  absRoot: string,
  absDir: string,
  depth: number,
  excl: LoadedExclusions,
): Promise<FileNode[]> {
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    const abs = path.join(absDir, entry.name);
    const rel = path.relative(absRoot, abs).split(path.sep).join("/");

    if (isExcluded(rel, excl)) continue;

    if (entry.isDirectory()) {
      if (depth >= MAX_DEPTH) {
        nodes.push({ kind: "dir", name: entry.name, path: rel, children: [] });
        continue;
      }
      const children = await walk(absRoot, abs, depth + 1, excl);
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
    const { exclusions: excl } = await loadExclusions(root);
    const absSub = subPath ? assertInsideRoot(absRoot, subPath) : absRoot;
    const tree = await walk(absRoot, absSub, 0, excl);
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
    const { exclusions: excl } = await loadExclusions(root);
    if (isExcluded(filePath, excl)) {
      return { ok: false, error: "Fichier exclu par la configuration." };
    }
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

export async function exportSelectionAction(input: {
  root?: string;
  paths: string[];
}): Promise<ExportResult> {
  try {
    const paths = Array.from(new Set(input.paths ?? [])).filter(Boolean);
    if (paths.length === 0) {
      return { ok: false, error: "Aucun fichier sélectionné." };
    }

    const absRoot = resolveRoot(input.root);
    const { exclusions: excl } = await loadExclusions(input.root);

    const files: Array<{
      path: string;
      type: string | null;
      header: ReturnType<typeof parseGenesisHeader> | null;
      content: string;
    }> = [];

    for (const relPath of paths) {
      if (isExcluded(relPath, excl)) {
        return { ok: false, error: `Fichier exclu : ${relPath}` };
      }
      const absFile = assertInsideRoot(absRoot, relPath);
      const content = await fs.readFile(absFile, "utf8");
      const header = content.trim().startsWith("/*")
        ? parseGenesisHeader(content)
        : null;
      files.push({
        path: relPath,
        type: header && header.ok ? header.header.type : null,
        header,
        content,
      });
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      root: absRoot,
      fileCount: files.length,
      files,
    };

    const json = JSON.stringify(payload, null, 2);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const savedRel = `data/app/read-files-${ts}.json`;
    const savedAbs = path.join(absRoot, savedRel);

    await fs.mkdir(path.dirname(savedAbs), { recursive: true });
    await fs.writeFile(savedAbs, json, "utf8");

    return {
      ok: true,
      json,
      savedPath: savedRel,
      savedAbsolutePath: savedAbs,
      fileCount: files.length,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}