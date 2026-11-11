/*
path :           app/genesis/create-files/CreateFileForm.tsx
tag :            ["genesis", "create-files", "form", "client", "action", "ux", "multi", "integrity", "success"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Formulaire client de Create Files, multi-fichiers avec zones
                 automatiques et vérification d'intégrité. Après un succès,
                 le formulaire est REMPLACÉ par un écran SuccessScreen
                 persistant (pas de redirection auto, pas de timer) : paths
                 créés, backups éventuels, CTA "Voir dans Read Files",
                 "Copier le rapport", "Créer un nouveau batch". Aucune case
                 overwrite : backup automatique. Guard anti-double-soumission
                 post-succès (canSubmit bloqué tant que result.ok non reset).

flow:            state scripts/forced/root/result/phase → onChange d'une
                 zone → checkScriptIntegrity → si complète ou forcée, ajoute
                 une zone vide → aperçu parseGenesisHeader par zone → bouton
                 Créer actif si toutes zones remplies valides ET (complètes
                 OU forcées) ET pas de succès en cours → createFilesAction →
                 feedback. Si result.ok → phase "result" → SuccessScreen avec
                 items mappés depuis result.files. "Créer un nouveau batch" →
                 resetForm() → phase "edit". "Copier le rapport" →
                 navigator.clipboard.writeText(buildReport).

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
                  "@/app/genesis/components/RootFsPicker.tsx",
                  "@/app/genesis/lib/header-parser.ts",
                  "@/app/genesis/lib/script-integrity.ts",
                  "@/components/layout/SuccessScreen.tsx"]
imports:         ["react", "next/link", "sonner",
                  "@/app/genesis/actions/createFile",
                  "@/app/genesis/components/RootFsPicker",
                  "@/app/genesis/lib/header-parser",
                  "@/app/genesis/lib/script-integrity",
                  "@/components/layout/SuccessScreen",
                  "@/components/ui/button"]
exports:         ["CreateFileForm"]
useBy:           ["@/app/genesis/create-files/page.tsx"]

userStories:     ["*en tant que développeur je veux coller plusieurs scripts et les créer en une fois",
                  "*en tant que développeur je veux qu'une nouvelle zone apparaisse seulement si le script est complet",
                  "*en tant que développeur je veux forcer l'ajout d'une zone malgré un avertissement",
                  "*en tant que développeur je veux voir clairement le résultat et décider moi-même de la suite"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createFilesAction,
  type CreateFilesResult,
} from "@/app/genesis/actions/createFile";
import { RootFsPicker } from "@/app/genesis/components/RootFsPicker";
import { parseGenesisHeader } from "@/app/genesis/lib/header-parser";
import { checkScriptIntegrity } from "@/app/genesis/lib/script-integrity";
import { SuccessScreen } from "@/components/layout/SuccessScreen";
import { Button } from "@/components/ui/button";

type Phase = "edit" | "result";

export function CreateFileForm() {
  const [scripts, setScripts] = React.useState<string[]>([""]);
  const [forced, setForced] = React.useState<Set<number>>(new Set());
  const [root, setRoot] = React.useState("");
  const [result, setResult] = React.useState<CreateFilesResult | null>(null);
  const [pending, setPending] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("edit");

  const blockStates = React.useMemo(
    () =>
      scripts.map((s) => {
        if (!s.trim()) {
          return { empty: true, header: null, integrity: null } as const;
        }
        return {
          empty: false,
          header: parseGenesisHeader(s),
          integrity: checkScriptIntegrity(s),
        } as const;
      }),
    [scripts],
  );

  const filledIndices = scripts
    .map((s, i) => (s.trim() ? i : -1))
    .filter((i) => i >= 0);

  const filledValid = filledIndices.every((i) => {
    const b = blockStates[i];
    if (!b || b.empty) return false;
    if (!b.header || !b.header.ok) return false;
    if (!b.integrity || !b.integrity.ok) {
      return forced.has(i);
    }
    return true;
  });

  const hasSuccess = result !== null && result.ok;
  const canSubmit =
    filledIndices.length > 0 && filledValid && !pending && !hasSuccess;

  function updateScript(index: number, value: string) {
    setScripts((prev) => {
      const next = prev.map((s, i) => (i === index ? value : s));
      const isLast = index === next.length - 1;
      const trimmed = value.trim();
      if (!isLast || !trimmed) return next;

      const header = parseGenesisHeader(value);
      const integrity = checkScriptIntegrity(value);
      const acceptable = header.ok && (integrity.ok || forced.has(index));
      if (acceptable) next.push("");
      return next;
    });
  }

  function toggleForced(index: number) {
    setForced((prev) => {
      const next = new Set(prev);
      const value = scripts[index] ?? "";
      const header = parseGenesisHeader(value);
      const integrity = checkScriptIntegrity(value);
      const acceptable = header.ok && integrity.ok;
      if (acceptable) return next;
      if (next.has(index)) next.delete(index);
      else next.add(index);
      if (next.has(index)) {
        setScripts((prevScripts) => {
          const last = prevScripts[prevScripts.length - 1];
          if (last.trim() && prevScripts.length === index + 1) {
            return [...prevScripts, ""];
          }
          return prevScripts;
        });
      }
      return next;
    });
  }

  function removeScript(index: number) {
    setScripts((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
    setForced((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  function resetForm() {
    setScripts([""]);
    setForced(new Set());
    setRoot("");
    setResult(null);
    setPhase("edit");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setPending(true);
    setResult(null);
    const filled = scripts.filter((s) => s.trim().length > 0);
    const res = await createFilesAction({ scripts: filled, root });
    setResult(res);
    setPending(false);
    if (res.ok) {
      setPhase("result");
      toast.success(
        `${res.files.length} fichier${res.files.length > 1 ? "s" : ""} créé${res.files.length > 1 ? "s" : ""}`,
      );
    }
  }

  function buildReport(res: Extract<CreateFilesResult, { ok: true }>): string {
    const header = `${res.files.length} fichier(s) créé(s) — ${new Date().toISOString()}\n\n`;
    const body = res.files
      .map((f) => {
        const line = `✓ ${f.path} (${f.type})`;
        return f.backup ? `${line}\n  backup: ${f.backup}` : line;
      })
      .join("\n");
    const footer = `\n\nRoot: ${root || "(racine projet)"}`;
    return header + body + footer;
  }

  async function onCopyReport() {
    if (!result || !result.ok) return;
    try {
      await navigator.clipboard.writeText(buildReport(result));
      toast.success("Rapport copié dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le rapport");
    }
  }

  if (phase === "result" && result && result.ok) {
    return (
      <SuccessScreen
        title={`${result.files.length} fichier${result.files.length > 1 ? "s" : ""} créé${result.files.length > 1 ? "s" : ""}`}
        description="Les fichiers ont été écrits à leur chemin d'en-tête. Les fichiers écrasés ont été sauvegardés dans data/backup/."
        items={result.files.map((f) => ({
          id: f.path,
          label: f.path,
          meta: f.type,
          sublabel: f.backup ? `backup : ${f.backup}` : undefined,
        }))}
        primaryAction={
          <Link href="/genesis/read-files">
            <Button type="button" variant="default">
              Voir dans Read Files
            </Button>
          </Link>
        }
        secondaryAction={
          <Button type="button" variant="outline" onClick={onCopyReport}>
            Copier le rapport
          </Button>
        }
        tertiaryAction={
          <Button type="button" variant="ghost" onClick={resetForm}>
            Créer un nouveau batch
          </Button>
        }
      />
    );
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
            2. Scripts ({filledIndices.length})
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Colle un script complet par zone. Une nouvelle zone apparaît
            automatiquement dès que la dernière est complète. Un script tronqué
            n&apos;ajoute pas de zone : coche « Forcer » pour passer outre.
          </p>
        </div>

        <ul className="flex flex-col gap-4">
          {scripts.map((value, index) => {
            const block = blockStates[index];
            const isLastEmpty =
              index === scripts.length - 1 && value.trim() === "";
            const headerOk = block && !block.empty && block.header?.ok === true;
            const integrityOk =
              block && !block.empty && block.integrity?.ok === true;
            const isForced = forced.has(index);

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
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => removeScript(index)}
                      disabled={pending}
                    >
                      Supprimer
                    </Button>
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

                {!block || block.empty ? null : (
                  <div className="flex flex-col gap-2">
                    {headerOk && integrityOk && (
                      <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                        <span className="flex flex-wrap items-center gap-2 font-mono">
                          <span>✓ Complet</span>
                          <span className="break-all">
                            {block.header!.header.path}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5">
                            {block.header!.header.type}
                          </span>
                        </span>
                      </div>
                    )}

                    {headerOk && !integrityOk && (
                      <div className="rounded-lg border border-amber-600/30 bg-amber-600/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                        <p className="font-semibold">
                          ⚠ Script possiblement tronqué
                        </p>
                        <ul className="mt-1 list-disc pl-4">
                          {block.integrity!.reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                        <label className="mt-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isForced}
                            onChange={() => toggleForced(index)}
                          />
                          Forcer l&apos;ajout / la création malgré
                          l&apos;avertissement
                        </label>
                      </div>
                    )}

                    {!headerOk && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                        {block.header && !block.header.ok
                          ? block.header.error
                          : "En-tête invalide."}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button type="submit" disabled={!canSubmit}>
          {pending
            ? "Création…"
            : `Créer ${filledIndices.length} fichier${filledIndices.length > 1 ? "s" : ""}`}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={pending}
        >
          Réinitialiser
        </Button>
      </div>

      {result && !result.ok && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <strong>Erreur :</strong> {result.error}
        </div>
      )}
    </form>
  );
}