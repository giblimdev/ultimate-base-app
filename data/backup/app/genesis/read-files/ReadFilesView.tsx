/*
path :           app/genesis/read-files/ReadFilesView.tsx
tag :            ["genesis", "read-files", "view", "client", "tree", "viewer"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Vue client de Read Files : sélecteur de racine (RootFsPicker),
                 arborescence des fichiers (listFilesAction) et viewer du
                 fichier sélectionné (readFileAction). Affiche le contenu et
                 l'en-tête Genesis parsé s'il existe. États : chargement,
                 vide, erreur, sélection active.

flow:            state root/tree/selected/file → useEffect sur root →
                 listFilesAction → state tree → clic sur fichier →
                 readFileAction → state file → affichage contenu + en-tête.

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
relatedFiles:    ["@/app/genesis/actions/readFiles.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]
imports:         ["react",
                  "@/app/genesis/actions/readFiles",
                  "@/app/genesis/components/RootFsPicker"]
exports:         ["ReadFilesView"]
useBy:           ["@/app/genesis/read-files/page.tsx"]

userStories:     ["*en tant que développeur je veux parcourir les fichiers du projet",
                  "*en tant que développeur je veux lire le contenu d'un fichier et son en-tête"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listFilesAction,
  readFileAction,
  type FileNode,
  type ReadFileResult,
} from "@/app/genesis/actions/readFiles";
import { RootFsPicker } from "@/app/genesis/components/RootFsPicker";

export function ReadFilesView() {
  const [root, setRoot] = useState("");
  const [tree, setTree] = useState<FileNode[] | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [file, setFile] = useState<ReadFileResult | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const loadTree = useCallback(async () => {
    setLoadingTree(true);
    setTreeError(null);
    const res = await listFilesAction(root || undefined);
    if (res.ok) {
      setTree(res.tree);
    } else {
      setTreeError(res.error);
      setTree(null);
    }
    setLoadingTree(false);
  }, [root]);

  useEffect(() => {
    void loadTree();
    setSelectedPath(null);
    setFile(null);
  }, [loadTree]);

  async function onSelect(path: string) {
    setSelectedPath(path);
    setLoadingFile(true);
    const res = await readFileAction(root || undefined, path);
    setFile(res);
    setLoadingFile(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <RootFsPicker value={root} onChange={setRoot} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <aside className="flex max-h-[70vh] flex-col gap-2 overflow-auto rounded-xl border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Arborescence
            </h2>
            <button
              type="button"
              onClick={() => void loadTree()}
              disabled={loadingTree}
              className="rounded border border-border bg-background px-2 py-1 text-xs hover:bg-accent/40 disabled:opacity-50"
            >
              {loadingTree ? "…" : "Rafraîchir"}
            </button>
          </div>

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
                  onSelect={onSelect}
                />
              ))}
            </ul>
          )}
        </aside>

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3">
          {!selectedPath && (
            <p className="text-sm text-muted-foreground">
              Sélectionne un fichier dans l'arborescence.
            </p>
          )}
          {selectedPath && loadingFile && (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          )}
          {selectedPath && file && !file.ok && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {file.error}
            </p>
          )}
          {selectedPath && file && file.ok && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                <code className="break-all text-xs">{file.path}</code>
                {file.header && file.header.ok && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
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
  onSelect: (path: string) => void;
};

function TreeNode({ node, selectedPath, onSelect }: TreeNodeProps) {
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
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const active = selectedPath === node.path;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        aria-current={active ? "true" : undefined}
        className={
          "flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs font-mono hover:bg-accent/40" +
          (active ? " bg-accent/60" : "")
        }
      >
        {node.name}
      </button>
    </li>
  );
}