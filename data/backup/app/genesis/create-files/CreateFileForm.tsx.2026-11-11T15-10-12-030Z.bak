/*
path :           app/genesis/create-files/CreateFileForm.tsx
tag :            ["genesis", "create-files", "form", "client", "action", "ux", "multi"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Formulaire client de Create Files, multi-fichiers avec zones
                 automatiques. Une zone vide est TOUJOURS présente en bas de
                 liste ; dès que l'utilisateur y colle un script, une nouvelle
                 zone vide apparaît automatiquement (pas de bouton "+ Ajouter").
                 Chaque zone = un textarea (un script complet). Aperçu parsé
                 par zone (path/type/projectId ou erreur,  refusé). Aucune
                 case overwrite : tout fichier existant est backupé dans
                 data/backup/ puis écrasé. Appelle createFilesAction({ scripts, root }).

flow:            state scripts: string[] toujours avec une chaîne vide en fin
                 → onChange d'une zone → si le dernier élément devient non vide,
                 ajoute une nouvelle chaîne vide → aperçu parseGenesisHeader
                 par zone → bouton "Créer N fichier(s)" actif si au moins un
                 script valide et aucune zone remplie invalide → createFilesAction
                 → feedback par fichier (chemin + backup éventuel).

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
                  "@/app/genesis/components/RootFsPicker.tsx",
                  "@/app/genesis/lib/header-parser.ts"]
imports:         ["react",
                  "@/app/genesis/actions/createFile",
                  "@/app/genesis/components/RootFsPicker",
                  "@/app/genesis/lib/header-parser"]
exports:         ["CreateFileForm"]
useBy:           ["@/app/genesis/create-files/page.tsx"]

userStories:     ["*en tant que développeur je veux coller plusieurs scripts et les créer en une fois",
                  "*en tant que développeur je veux qu'une nouvelle zone apparaisse automatiquement quand je remplis la dernière",
                  "*en tant que développeur je veux que tout fichier écrasé soit sauvegardé automatiquement"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import { useMemo, useState } from "react";
import {
  createFilesAction,
  type CreateFilesResult,
} from "@/app/genesis/actions/createFile";
import { RootFsPicker } from "@/app/genesis/components/RootFsPicker";
import { parseGenesisHeader } from "@/app/genesis/lib/header-parser";

export function CreateFileForm() {
  const [scripts, setScripts] = useState<string[]>([""]);
  const [root, setRoot] = useState("");
  const [result, setResult] = useState<CreateFilesResult | null>(null);
  const [pending, setPending] = useState(false);

  const parsedBlocks = useMemo(
    () => scripts.map((s) => (s.trim() ? parseGenesisHeader(s) : null)),
    [scripts],
  );

  const filledBlocks = scripts.filter((s) => s.trim().length > 0);
  const allFilledValid =
    filledBlocks.length > 0 &&
    parsedBlocks.every((p) => p === null || p.ok === true);

  function updateScript(index: number, value: string) {
    setScripts((prev) => {
      const next = prev.map((s, i) => (i === index ? value : s));
      const last = next[next.length - 1];
      if (last.trim().length > 0) {
        next.push("");
      }
      return next;
    });
  }

  function removeScript(index: number) {
    setScripts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  function resetForm() {
    setScripts([""]);
    setRoot("");
    setResult(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || !allFilledValid) return;
    setPending(true);
    setResult(null);
    const res = await createFilesAction({ scripts: filledBlocks, root });
    setResult(res);
    setPending(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            1. Dossier racine
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Où écrire les fichiers. Le chemin exact de chaque fichier est lu
            dans son en-tête.
          </p>
        </div>
        <RootFsPicker value={root} onChange={setRoot} />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2. Scripts ({filledBlocks.length})
          </h2>
        </div>

        <ul className="flex flex-col gap-4">
          {scripts.map((value, index) => {
            const parsed = parsedBlocks[index];
            const isLastEmpty =
              index === scripts.length - 1 && value.trim() === "";
            return (
              <li
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Script #{index + 1}
                    {isLastEmpty && " (nouveau)"}
                  </span>
                  {!isLastEmpty && (
                    <button
                      type="button"
                      onClick={() => removeScript(index)}
                      disabled={pending}
                      className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-600/10 disabled:opacity-40"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <textarea
                  value={value}
                  onChange={(e) => updateScript(index, e.target.value)}
                  rows={isLastEmpty ? 6 : 12}
                  spellCheck={false}
                  placeholder={`/*\npath :           app/exemple/page.tsx\nprojectId:       <ultimate-genesis>\ntype:            page\n...\n*/\nexport default function Page() {\n  return <main />;\n}`}
                  className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                />

                {value.trim() && (
                  <div className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs">
                    {parsed && !parsed.ok && (
                      <span className="text-red-600 dark:text-red-400">
                        {parsed.error}
                      </span>
                    )}
                    {parsed && parsed.ok && (
                      <span className="flex flex-wrap items-center gap-2 font-mono">
                        <span className="break-all">{parsed.header.path}</span>
                        <span className="rounded bg-muted px-1.5 py-0.5">
                          {parsed.header.type}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!allFilledValid || pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Création…"
            : `Créer ${filledBlocks.length} fichier${filledBlocks.length > 1 ? "s" : ""}`}
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent/40 disabled:opacity-50"
        >
          Réinitialiser
        </button>
      </div>

      {result && (
        <div
          role="status"
          aria-live="polite"
          className={
            result.ok
              ? "rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400"
              : "rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-700 dark:text-red-400"
          }
        >
          {result.ok ? (
            <div className="flex flex-col gap-3">
              <p>
                <strong>{result.files.length} fichier(s) créé(s).</strong>
              </p>
              <ul className="flex flex-col gap-2">
                {result.files.map((f) => (
                  <li
                    key={f.path}
                    className="rounded border border-border bg-card px-2 py-1.5 font-mono text-xs"
                  >
                    <div className="break-all">
                      <span className="rounded bg-muted px-1.5 py-0.5">
                        {f.type}
                      </span>{" "}
                      {f.path}
                    </div>
                    {f.backup && (
                      <div className="mt-1 break-all text-muted-foreground">
                        backup : {f.backup}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={resetForm}
                className="self-start rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent/40"
              >
                Créer d&apos;autres fichiers
              </button>
            </div>
          ) : (
            <p>
              <strong>Erreur :</strong> {result.error}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
