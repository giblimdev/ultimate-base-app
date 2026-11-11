/*
path :           app/genesis/components/RootFsPicker.tsx
tag :            ["genesis", "fs", "picker", "component", "client", "ux"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Sélecteur de dossier racine (par défaut : racine du
                 projet). Utilisé par Create Files, Read Files et History.
                 UX pro : bouton "Parcourir" (window.showDirectoryPicker
                 quand disponible), bouton "Racine projet" (reset), input
                 texte en fallback pour les navigateurs sans API. Affiche
                 la racine EFFECTIVE réellement utilisée (via
                 resolveRootAction) et un indicateur de validité
                 (existe / est un dossier). Composant client justifié par
                 l'état contrôlé et les appels à showDirectoryPicker.

flow:            RootFsPicker({ value, onChange, label? }) →
                 useEffect(value) → resolveRootAction(value) → affiche
                 effectiveRoot + badge (valide / introuvable) →
                 bouton "Parcourir" → showDirectoryPicker() → récupère
                 handle.name → onChange(name) → bouton "Racine projet" →
                 onChange("").

ecosystem:       Genesis = [
                   "@/app/genesis/actions/resolveRoot.ts",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                 ]
relatedFiles:    ["@/app/genesis/actions/resolveRoot.ts",
                  "@/app/genesis/lib/fs-utils.ts"]
imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/resolveRoot",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/input"]
exports:         ["RootFsPicker", "RootFsPickerProps"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx",
                  "@/app/genesis/read-files/ReadFilesView.tsx",
                  "@/app/genesis/history/HistoryView.tsx"]

userStories:     ["*en tant que développeur je veux choisir le dossier racine de lecture/écriture",
                  "*en tant que développeur je veux voir la racine réellement utilisée",
                  "*en tant que développeur je veux savoir si mon chemin est valide"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import { FolderOpen, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  resolveRootAction,
  type ResolveRootResult,
} from "@/app/genesis/actions/resolveRoot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type RootFsPickerProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: () => Promise<{ name: string }>;
};

export function RootFsPicker({
  value,
  onChange,
  label = "Dossier racine",
}: RootFsPickerProps) {
  const [resolved, setResolved] = React.useState<ResolveRootResult | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [browsing, setBrowsing] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    resolveRootAction(value || undefined)
      .then((res) => {
        if (!cancelled) setResolved(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const canBrowse =
    typeof window !== "undefined" &&
    typeof (window as DirectoryPickerWindow).showDirectoryPicker ===
      "function";

  async function onBrowse() {
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
    if (!picker) {
      toast.error(
        "La sélection de dossier n'est pas supportée par ce navigateur. Saisissez le chemin manuellement.",
      );
      return;
    }
    setBrowsing(true);
    try {
      const handle = await picker();
      // Le navigateur ne donne jamais le chemin absolu (sécurité).
      // On envoie le nom du dossier ; le serveur le résoudra via
      // path.resolve(name). Pour un chemin absolu, l'utilisateur
      // doit le saisir manuellement.
      onChange(handle.name);
      toast.success(`Dossier sélectionné : ${handle.name}`);
    } catch (err) {
      if ((err as DOMException)?.name !== "AbortError") {
        toast.error("Impossible d'ouvrir le sélecteur de dossier.");
      }
    } finally {
      setBrowsing(false);
    }
  }

  const isValid =
    resolved && resolved.ok && resolved.exists && resolved.isDirectory;
  const isInvalid =
    resolved && resolved.ok && (!resolved.exists || !resolved.isDirectory);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <label htmlFor="root-fs" className="text-sm font-medium">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">
          Où lire et écrire les fichiers. Par défaut : racine du projet.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="root-fs"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="(défaut : racine du projet)"
          className="min-w-0 flex-1"
        />
        <div className="flex gap-2">
          {canBrowse && (
            <Button
              type="button"
              variant="outline"
              onClick={onBrowse}
              disabled={browsing}
            >
              <FolderOpen className="size-4" aria-hidden="true" />
              Parcourir
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onChange("")}
            disabled={!value}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Racine projet
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {loading && (
          <Badge variant="outline" className="text-xs">
            Vérification…
          </Badge>
        )}
        {!loading && resolved && resolved.ok && (
          <>
            <Badge
              variant="outline"
              className="gap-1 font-mono text-[11px] font-normal"
            >
              Racine effective : {resolved.effectiveRoot}
            </Badge>
            {isValid && (
              <Badge
                variant="outline"
                className="gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3" aria-hidden="true" />
                Valide
              </Badge>
            )}
            {isInvalid && (
              <Badge
                variant="outline"
                className="gap-1 border-destructive/30 text-destructive"
              >
                <AlertCircle className="size-3" aria-hidden="true" />
                Introuvable
              </Badge>
            )}
          </>
        )}
        {!loading && resolved && !resolved.ok && (
          <Badge variant="outline" className="text-destructive">
            {resolved.error}
          </Badge>
        )}
      </div>
    </div>
  );
}