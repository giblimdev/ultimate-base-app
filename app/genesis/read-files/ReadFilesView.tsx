/*
path :           app/genesis/read-files/ReadFilesView.tsx
tag :            ["genesis", "read-files", "view", "client", "tree", "viewer", "json", "exclusions"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Vue client de Read Files : sélecteur de racine, arborescence
                 filtrée (exclusions), viewer, sélection multi-fichiers via
                 cases à cocher, génération d'un JSON de la sélection,
                 copie du JSON, sauvegarde dans data/app/, et panneau de gestion
                 des exclusions (ajout/suppression/reset par type).

flow:            state root/tree/selected Set/currentFile/exclusions/json →
                 useEffect sur root → listFilesAction + getExclusionsAction →
                 clic fichier → readFileAction → viewer → cocher/décocher →
                 selected Set → bouton "Exporter JSON" → exportSelectionAction
                 → json + savedPath → bouton "Copier" → clipboard → panneau
                 exclusions → addExclusionAction / removeExclusionAction /
                 resetExclusionsAction → refresh arbre.

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
relatedFiles:    ["@/app/genesis/actions/readFiles.ts",
                  "@/app/genesis/actions/exclusions.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]
imports:         ["react",
                  "@/app/genesis/actions/readFiles",
                  "@/app/genesis/actions/exclusions",
                  "@/app/genesis/components/RootFsPicker"]
exports:         ["ReadFilesView"]
useBy:           ["@/app/genesis/read-files/page.tsx"]

userStories:     ["*en tant que développeur je veux sélectionner des fichiers et exporter un JSON",
                  "*en tant que développeur je veux copier le JSON dans le presse-papier",
                  "*en tant que développeur je veux sauvegarder le JSON dans data/app/",
                  "*en tant que développeur je veux gérer les exclusions"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listFilesAction,
  readFileAction,
  exportSelectionAction,
  type FileNode,
  type ReadFileResult,
  type ExportResult,
} from "@/app/genesis/actions/readFiles";
import {
  getExclusionsAction,
  addExclusionAction,
  removeExclusionAction,
  resetExclusionsAction,
  type ExclusionKind,
} from "@/app/genesis/actions/exclusions";
import { RootFsPicker } from "@/app/genesis/components/RootFsPicker";
import type { Exclusions } from "@/app/genesis/lib/exclusions";

export function ReadFilesView() {
  const [root, setRoot] = useState("");
  const [tree, setTree] = useState<FileNode[] | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [file, setFile] = useState<ReadFileResult | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState(false);

  const [exclusions, setExclusions] = useState<Exclusions>({ dirs: [], files: [] });
  const [exclusionsOpen, setExclusionsOpen] = useState(false);
  const [newDir, setNewDir] = useState("");
  const [newFile, setNewFile] = useState("");
  const [exclError, setExclError] = useState<string | null>(null);

  const loadTree = useCallback(async () => {
    setLoadingTree(true);
    setTreeError(null);
    const res = await listFilesAction(root || undefined);
    if (res.ok) setTree(res.tree);
    else {
      setTreeError(res.error);
      setTree(null);
    }
    setLoadingTree(false);
  }, [root]);

  const loadExclusions = useCallback(async () => {
    const res = await getExclusionsAction(root || undefined);
    if (res.ok) setExclusions(res.exclusions);
    else setExclError(res.error);
  }, [root]);

  useEffect(() => {
    void loadTree();
    void loadExclusions();
    setSelectedPath(null);
    setFile(null);
    setChecked(new Set());
    setExportResult(null);
  }, [loadTree, loadExclusions]);

  async function onSelect(path: string) {
    setSelectedPath(path);
    setLoadingFile(true);
    const res = await readFileAction(root || undefined, path);
    setFile(res);
    setLoadingFile(false);
  }

  function toggleCheck(path: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  async function onExport() {
    setExporting(true);
    setExportResult(null);
    setCopied(false);
    const res = await exportSelectionAction({
      root: root || undefined,
      paths: Array.from(checked),
    });
    setExportResult(res);
    setExporting(false);
  }

  async function onCopy() {
    if (!exportResult || !exportResult.ok) return;
    await navigator.clipboard.writeText(exportResult.json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function onAdd(kind: ExclusionKind) {
    setExclError(null);
    const pattern = kind === "dir" ? newDir : newFile;
    const res = await addExclusionAction({
      root: root || undefined,
      kind,
      pattern,
    });
    if (res.ok) {
      setExclusions(res.exclusions);
      if (kind === "dir") setNewDir("");
      else setNewFile("");
      void loadTree();
    } else setExclError(res.error);
  }

  async function onRemove(kind: ExclusionKind, pattern: string) {
    setExclError(null);
    const res = await removeExclusionAction({
      root: root || undefined,
      kind,
      pattern,
    });
    if (res.ok) {
      setExclusions(res.exclusions);
      void loadTree();
    } else setExclError(res.error);
  }

  async function onReset() {
    setExclError(null);
    const res = await resetExclusionsAction(root || undefined);
    if (res.ok) {
      setExclusions(res.exclusions);
      void loadTree();
    } else setExclError(res.error);
  }

  const checkedCount = checked.size;

  return (
    <div className="flex flex-col gap-6">
      <RootFsPicker value={root} onChange={setRoot} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <aside className="flex max-h-[75vh] flex-col gap-2 overflow-auto rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Arborescence
            </h2>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setExclusionsOpen((v) => !v)}
                className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40"
              >
                Exclusions ({exclusions.dirs.length + exclusions.files.length})
              </button>
              <button
                type="button"
                onClick={() => void loadTree()}
                disabled={loadingTree}
                className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40 disabled:opacity-50"
              >
                {loadingTree ? "…" : "Rafraîchir"}
              </button>
            </div>
          </div>

          {exclusionsOpen && (
            <div className="flex flex-col gap-2 rounded border border-border bg-background p-2">
              {exclError && (
                <p className="text-xs text-red-600 dark:text-red-400">{exclError}</p>
              )}

              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Dossiers exclus
              </p>
              <ul className="flex flex-col gap-1">
                {exclusions.dirs.length === 0 && (
                  <li className="text-xs text-muted-foreground">Aucun.</li>
                )}
                {exclusions.dirs.map((d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-xs font-mono"
                  >
                    <span className="break-all">{d}</span>
                    <button
                      type="button"
                      onClick={() => void onRemove("dir", d)}
                      className="rounded px-1 text-red-600 hover:bg-red-600/10"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newDir}
                  onChange={(e) => setNewDir(e.target.value)}
                  placeholder="ex : data"
                  className="w-full rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => void onAdd("dir")}
                  className="rounded border border-border bg-card px-1.5 text-xs hover:bg-accent/40"
                >
                  +
                </button>
              </div>

              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Fichiers exclus
              </p>
              <ul className="flex flex-col gap-1">
                {exclusions.files.length === 0 && (
                  <li className="text-xs text-muted-foreground">Aucun.</li>
                )}
                {exclusions.files.map((f) => (
                  <li
                    key={f}
                    className="flex items-center justify-between gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-xs font-mono"
                  >
                    <span className="break-all">{f}</span>
                    <button
                      type="button"
                      onClick={() => void onRemove("file", f)}
                      className="rounded px-1 text-red-600 hover:bg-red-600/10"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newFile}
                  onChange={(e) => setNewFile(e.target.value)}
                  placeholder="ex : *.test.ts"
                  className="w-full rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => void onAdd("file")}
                  className="rounded border border-border bg-card px-1.5 text-xs hover:bg-accent/40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => void onReset()}
                className="mt-2 rounded border border-border bg-card px-2 py-1 text-xs hover:bg-accent/40"
              >
                Réinitialiser aux valeurs par défaut
              </button>
            </div>
          )}

          {treeError && (
            <p className="text-xs text-red-600 dark:text-red-400">{treeError}</p>
          )}
          {loadingTree && !tree && (
            <p className="text-xs text-muted-foreground">Chargement…</p>
          )}
          {tree && tree.length === 0 && (
            <p className="text-xs text-muted-foreground">Dossier vide.</p>
          )}
          {tree && tree.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {tree.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  selectedPath={selectedPath}
                  checked={checked}
                  onSelect={onSelect}
                  onToggleCheck={toggleCheck}
                />
              ))}
            </ul>
          )}
        </aside>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
            <span className="text-xs text-muted-foreground">
              {checkedCount} fichier(s) sélectionné(s) pour l'export
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => void onExport()}
                disabled={exporting || checkedCount === 0}
                className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40 disabled:opacity-50"
              >
                {exporting ? "Export…" : "Exporter JSON"}
              </button>
              <button
                type="button"
                onClick={() => void onCopy()}
                disabled={!exportResult || !exportResult.ok}
                className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40 disabled:opacity-50"
              >
                {copied ? "Copié !" : "Copier"}
              </button>
              {checkedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setChecked(new Set())}
                  className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40"
                >
                  Vider
                </button>
              )}
            </div>
          </div>

          {exportResult && !exportResult.ok && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {exportResult.error}
            </p>
          )}
          {exportResult && exportResult.ok && (
            <p className="rounded border border-green-600/30 bg-green-600/10 p-2 text-xs text-green-700 dark:text-green-400">
              JSON généré ({exportResult.fileCount} fichier(s)) — sauvegardé
              dans <code className="break-all">{exportResult.savedPath}</code>
            </p>
          )}

          {!selectedPath && (
            <p className="text-sm text-muted-foreground">
              Sélectionne un fichier dans l'arborescence pour le lire.
              Coche-le pour l'inclure dans l'export JSON.
            </p>
          )}
          {selectedPath && loadingFile && (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          )}
          {selectedPath && file && !file.ok && (
            <p className="text-sm text-red-600 dark:text-red-400">{file.error}</p>
          )}
          {selectedPath && file && file.ok && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <code className="break-all text-xs">{file.path}</code>
                {file.header && file.header.ok && (
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                    {file.header.header.type}
                  </span>
                )}
              </div>

              {file.header && file.header.ok && (
                <dl className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background p-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">path</dt>
                    <dd className="break-all font-mono">{file.header.header.path}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">projectId</dt>
                    <dd className="break-all font-mono">{file.header.header.projectId}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">type</dt>
                    <dd className="font-mono">{file.header.header.type}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">status</dt>
                    <dd className="font-mono">{file.header.header.status}</dd>
                  </div>
                </dl>
              )}
              {file.header && !file.header.ok && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  En-tête non conforme : {file.header.error}
                </p>
              )}

              <pre className="max-h-[55vh] overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed">
                <code>{file.content}</code>
              </pre>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type TreeNodeProps = {
  node: FileNode;
  selectedPath: string | null;
  checked: Set<string>;
  onSelect: (path: string) => void;
  onToggleCheck: (path: string) => void;
};

function TreeNode({
  node,
  selectedPath,
  checked,
  onSelect,
  onToggleCheck,
}: TreeNodeProps) {
  const [open, setOpen] = useState(true);

  if (node.kind === "dir") {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs hover:bg-accent/40"
        >
          <span aria-hidden="true">{open ? "▾" : "▸"}</span>
          <span className="font-mono">{node.name}/</span>
        </button>
        {open && node.children.length > 0 && (
          <ul className="ml-3 flex flex-col gap-0.5">
            {node.children.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                selectedPath={selectedPath}
                checked={checked}
                onSelect={onSelect}
                onToggleCheck={onToggleCheck}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = selectedPath === node.path;
  const isChecked = checked.has(node.path);
  return (
    <li className="flex items-center gap-1">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => onToggleCheck(node.path)}
        aria-label={`Sélectionner ${node.path}`}
        className="size-3 shrink-0"
      />
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        aria-current={active ? "true" : undefined}
        className={
          "flex-1 rounded px-1 py-0.5 text-left font-mono text-xs hover:bg-accent/40 " +
          (active ? "bg-accent/60" : "")
        }
      >
        {node.name}
      </button>
    </li>
  );
}