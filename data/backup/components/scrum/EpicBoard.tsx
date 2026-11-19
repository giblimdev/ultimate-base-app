/*
path :           components/scrum/EpicBoard.tsx
tag :            ["scrum", "epic", "board", "crud", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des epics d'un projet Scrum. Composant client
                 ("use client" justifié par useState/useEffect et les
                 handlers de formulaire). Formulaire ajout (title,
                 description, priority, status), édition inline,
                 suppression, JsonEditor. Appelle addEpic / updateEpic /
                 removeEpic puis router.refresh().

flow:            EpicBoard({ scrumId, initialEpics }) →
                 useState(epics) → formulaire ajout → addEpic →
                 router.refresh() → édition inline → updateEpic →
                 suppression → removeEpic → JsonEditor → onApply → boucle
                 add/update → router.refresh().

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/epic.ts",
                   "@/app/(app)/scrum/actions/feature.ts",
                   "@/app/(app)/scrum/actions/persona.ts",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/app/(app)/scrum/actions/sprint.ts",
                   "@/app/(app)/scrum/actions/task.ts",
                   "@/app/(app)/scrum/actions/us.ts",
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/epics/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/features/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/personas/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/project-detail-content.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/sprints/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/tasks/page.tsx",
                   "@/app/(app)/scrum/projects/[projectId]/us/page.tsx",
                   "@/app/(app)/scrum/projects/new/page.tsx",
                   "@/app/(app)/scrum/projects/page.tsx",
                   "@/components/scrum/EpicBoard.tsx",
                   "@/components/scrum/FeatureBoard.tsx",
                   "@/components/scrum/JsonEditor.tsx",
                   "@/components/scrum/PersonaBoard.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/components/scrum/SprintBoard.tsx",
                   "@/components/scrum/TaskBoard.tsx",
                   "@/components/scrum/UserStoryBoard.tsx",
                   "@/lib/scrum/access.ts",
                   "@/lib/scrum/defaults.ts",
                   "@/lib/scrum/json-io.ts",
                   "@/lib/scrum/mutations.ts",
                   "@/lib/scrum/queries.ts",
                   "@/lib/scrum/schema.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/app/(app)/scrum/actions/epic.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/epic",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card",
                  "@/components/ui/select", "@/components/ui/textarea"]
exports:         ["EpicBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/epics/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les epics d'un projet"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  addEpic,
  updateEpic,
  removeEpic,
} from "@/app/(app)/scrum/actions/epic";
import type { Epic } from "@/lib/scrum/types";
import { epicSchema } from "@/lib/scrum/schema";
import { JsonEditor } from "@/components/scrum/JsonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PRIORITY_OPTIONS = [
  { value: "LOWEST", label: "Très basse" },
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" },
  { value: "HIGHEST", label: "Très haute" },
] as const;

const STATUS_OPTIONS = [
  { value: "TODO", label: "À faire" },
  { value: "DOING", label: "En cours" },
  { value: "DONE", label: "Terminé" },
] as const;

type EpicBoardProps = {
  scrumId: string;
  initialEpics: Epic[];
};

export function EpicBoard({ scrumId, initialEpics }: EpicBoardProps) {
  const router = useRouter();
  const [epics, setEpics] = React.useState<Epic[]>(initialEpics);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newTitle, setNewTitle] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newPriority, setNewPriority] =
    React.useState<Epic["priority"]>("MEDIUM");
  const [newStatus, setNewStatus] = React.useState<Epic["status"]>("TODO");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editPriority, setEditPriority] =
    React.useState<Epic["priority"]>("MEDIUM");
  const [editStatus, setEditStatus] = React.useState<Epic["status"]>("TODO");

  React.useEffect(() => setEpics(initialEpics), [initialEpics]);

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setPending(true);
    setError(null);
    try {
      const result = await fn();
      if (!result.ok) {
        setError(result.error ?? "Une erreur est survenue.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await run(() =>
      addEpic({
        scrumId,
        data: {
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          priority: newPriority,
          status: newStatus,
        },
      }),
    );
    setNewTitle("");
    setNewDescription("");
    setNewPriority("MEDIUM");
    setNewStatus("TODO");
  };

  const startEdit = (e: Epic) => {
    setEditingId(e.id);
    setEditTitle(e.title);
    setEditDescription(e.description ?? "");
    setEditPriority(e.priority);
    setEditStatus(e.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditPriority("MEDIUM");
    setEditStatus("TODO");
  };

  const handleUpdate = async (epicId: string) => {
    if (!editTitle.trim()) return;
    await run(() =>
      updateEpic({
        scrumId,
        epicId,
        patch: {
          title: editTitle.trim(),
          description: editDescription.trim() || undefined,
          priority: editPriority,
          status: editStatus,
        },
      }),
    );
    cancelEdit();
  };

  const handleRemove = async (epicId: string) => {
    await run(() =>
      removeEpic({ scrumId, entity: "epic", entityId: epicId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as Epic[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = epics.some((e) => e.id === item.id);
        if (exists) {
          await updateEpic({
            scrumId,
            epicId: item.id,
            patch: {
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
            },
          });
        } else {
          await addEpic({
            scrumId,
            data: {
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
            },
          });
        }
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur JSON.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ajouter un epic</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="epic-title">Titre</Label>
              <Input
                id="epic-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titre de l'epic"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="epic-desc">Description</Label>
              <Textarea
                id="epic-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                disabled={pending}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Priorité</Label>
                <Select
                  value={newPriority}
                  onValueChange={(v) =>
                    setNewPriority(v as Epic["priority"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Statut</Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as Epic["status"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={pending || !newTitle.trim()}
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {epics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun epic pour l&apos;instant.
          </p>
        ) : (
          epics
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((epic) => (
              <Card key={epic.id}>
                <CardContent className="flex flex-col gap-2 p-3">
                  {editingId === epic.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={pending}
                      />
                      <Textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={2}
                        disabled={pending}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={editPriority}
                          onValueChange={(v) =>
                            setEditPriority(v as Epic["priority"])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editStatus}
                          onValueChange={(v) =>
                            setEditStatus(v as Epic["status"])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((o) => (
                              <SelectItem key={o.value} value={o.value}>
                                {o.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          onClick={() => handleUpdate(epic.id)}
                          disabled={pending}
                        >
                          <Check className="size-3" aria-hidden />
                          Enregistrer
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={pending}
                        >
                          <X className="size-3" aria-hidden />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {epic.title}
                        </span>
                        {epic.description && (
                          <span className="text-xs text-muted-foreground">
                            {epic.description}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {epic.priority} · {epic.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(epic)}
                          disabled={pending}
                          aria-label="Éditer"
                        >
                          <Pencil className="size-3" aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleRemove(epic.id)}
                          disabled={pending}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="size-3" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>

      <JsonEditor<Epic[]>
        label="Éditer les epics en JSON"
        value={epics}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={epicSchema.array() as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}