/*
path :           app/genesis/history/HistoryView.tsx
tag :            ["genesis", "history", "view", "client", "backup",
                  "restore", "delete"]
projectId:       <ultimate-genesis>
type:            component
generic:         false

role:            Vue client de l'historique des créations/modifications.
                 Sélecteur de racine (RootFsPicker), liste des backups
                 triés par date décroissante, filtres (recherche texte,
                 filtre par type d'extension), actions par ligne
                 (restaurer, supprimer avec confirmation inline). États :
                 chargement, vide, erreur, pending par ligne. Utilise les
                 Server Actions listBackupsAction, restoreBackupAction,
                 deleteBackupAction. Feedback toast (sonner) à chaque
                 action. Composant client justifié par les appels Server
                 Actions et l'état local.

flow:            HistoryView() → state root/backups/loading/error/
                 search/pendingPath → useEffect(root) →
                 listBackupsAction → state backups → filtre par search →
                 bouton Restaurer → confirmation → restoreBackupAction →
                 toast.success + refetch → bouton Supprimer →
                 confirmation → deleteBackupAction → toast.success +
                 refetch.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/history.ts",
                   "@/app/genesis/history/HistoryView.tsx",
                   "@/app/genesis/history/page.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                 ]
relatedFiles:    ["@/app/genesis/actions/history.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]
imports:         ["react", "lucide-react", "sonner",
                  "@/app/genesis/actions/history",
                  "@/app/genesis/components/RootFsPicker",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/card", "@/components/ui/input",
                  "@/components/ui/separator"]
exports:         ["HistoryView"]
useBy:           ["@/app/genesis/history/page.tsx"]

userStories:     ["*en tant que développeur je veux voir l'historique des fichiers créés et modifiés",
                  "*en tant que développeur je veux restaurer un fichier depuis son backup",
                  "*en tant que développeur je veux supprimer un backup obsolète",
                  "*en tant que développeur je veux filtrer l'historique par chemin"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  History as HistoryIcon,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteBackupAction,
  listBackupsAction,
  restoreBackupAction,
  type BackupEntry,
} from "@/app/genesis/actions/history";
import { RootFsPicker } from "@/app/genesis/components/RootFsPicker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR");
  } catch {
    return iso;
  }
}

export function HistoryView() {
  const [root, setRoot] = React.useState("");
  const [backups, setBackups] = React.useState<BackupEntry[] | null>(null);
  const [backupRoot, setBackupRoot] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [pendingPath, setPendingPath] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listBackupsAction(root || undefined);
    if (res.ok) {
      setBackups(res.backups);
      setBackupRoot(res.backupRoot);
    } else {
      setBackups(null);
      setError(res.error);
    }
    setLoading(false);
  }, [root]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!backups) return [];
    const needle = search.trim().toLowerCase();
    if (!needle) return backups;
    return backups.filter(
      (b) =>
        b.originalPath.toLowerCase().includes(needle) ||
        b.relativePath.toLowerCase().includes(needle),
    );
  }, [backups, search]);

  async function onRestore(entry: BackupEntry) {
    if (
      !window.confirm(
        `Restaurer ce backup vers ${entry.originalPath} ?\n\nLe fichier actuel sera sauvegardé avant écrasement.`,
      )
    ) {
      return;
    }
    setPendingPath(entry.relativePath);
    const res = await restoreBackupAction({
      root: root || undefined,
      relativePath: entry.relativePath,
    });
    setPendingPath(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Restauré : ${res.targetPath}`);
    void load();
  }

  async function onDelete(entry: BackupEntry) {
    if (
      !window.confirm(
        `Supprimer définitivement ce backup ?\n\n${entry.relativePath}`,
      )
    ) {
      return;
    }
    setPendingPath(entry.relativePath);
    const res = await deleteBackupAction({
      root: root || undefined,
      relativePath: entry.relativePath,
    });
    setPendingPath(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Backup supprimé");
    void load();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                aria-hidden="true"
              >
                <HistoryIcon className="size-5" />
              </span>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">
                  Historique des backups
                </CardTitle>
                <CardDescription>
                  Fichiers sauvegardés automatiquement avant chaque écrasement
                  par Create Files. Restaurez ou supprimez un backup.
                </CardDescription>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Rafraîchir
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <RootFsPicker value={root} onChange={setRoot} label="Dossier racine" />

          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer par chemin (ex : app/business)"
              className="pl-8"
              aria-label="Filtrer les backups"
              autoComplete="off"
            />
          </div>

          {backupRoot && (
            <p className="break-all font-mono text-[11px] text-muted-foreground">
              Dossier backups : {backupRoot}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Chargement…
        </div>
      ) : !backups || backups.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-5 py-16 text-center">
          <HistoryIcon
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">Aucun backup</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Aucun fichier n&apos;a encore été écrasé par Create Files. Les
            backups apparaîtront ici après la première modification.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-10 text-center">
          <p className="text-sm font-medium">Aucun résultat</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aucun backup ne correspond à « {search} ».
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((entry) => {
            const isPending = pendingPath === entry.relativePath;
            return (
              <li
                key={entry.relativePath}
                className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <code className="break-all font-mono text-xs font-medium">
                    {entry.originalPath}
                  </code>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {entry.hash}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {formatBytes(entry.size)}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(entry.modifiedAt)}
                  </span>
                </div>
                <code className="break-all font-mono text-[11px] text-muted-foreground">
                  {entry.relativePath}
                </code>
                <Separator />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void onRestore(entry)}
                    disabled={isPending}
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Restaurer
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void onDelete(entry)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Supprimer
                  </Button>
                  {isPending && (
                    <Loader2
                      className="size-4 animate-spin text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && backups && backups.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} sur {backups.length} backup
          {backups.length > 1 ? "s" : ""} affiché
          {filtered.length > 1 ? "s" : ""}.
        </p>
      )}
    </div>
  );
}