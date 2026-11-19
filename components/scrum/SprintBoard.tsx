/*
path :           components/scrum/SprintBoard.tsx
tag :            ["scrum", "sprint", "board", "crud", "client", "json"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des sprints d'un projet Scrum. Composant
                 client ("use client" justifié par useState/useEffect et
                 les handlers de formulaire). Formulaire ajout (name,
                 goal, startDate, endDate, status), édition inline,
                 suppression, JsonEditor permissif (accepte JSON complet
                 avec id/position OU JSON simplifié sans id/position).
                 Appelle addSprint / updateSprint / removeSprint puis
                 router.refresh().

flow:            SprintBoard({ scrumId, initialSprints }) →
                 useState(sprints) → formulaire ajout → addSprint →
                 router.refresh() → édition inline → updateSprint →
                 suppression → removeSprint → JsonEditor → onApply →
                 boucle add/update (si item.id existe → update, sinon →
                 add) → router.refresh().

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
relatedFiles:    ["@/app/(app)/scrum/actions/sprint.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/sprint",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card",
                  "@/components/ui/select", "@/components/ui/textarea"]
exports:         ["SprintBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/sprints/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les sprints d'un projet",
                  "*en tant qu'utilisateur je veux ajouter des sprints en collant un JSON simplifié"]
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
  addSprint,
  updateSprint,
  removeSprint,
} from "@/app/(app)/scrum/actions/sprint";
import type { Sprint } from "@/lib/scrum/types";
import {
  sprintImportArraySchema,
  type SprintImport,
} from "@/lib/scrum/schema";
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

const STATUS_OPTIONS = [
  { value: "PLANNED", label: "Planifié" },
  { value: "ACTIVE", label: "Actif" },
  { value: "DONE", label: "Terminé" },
] as const;

type SprintBoardProps = {
  scrumId: string;
  initialSprints: Sprint[];
};

export function SprintBoard({ scrumId, initialSprints }: SprintBoardProps) {
  const router = useRouter();
  const [sprints, setSprints] = React.useState<Sprint[]>(initialSprints);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newName, setNewName] = React.useState("");
  const [newGoal, setNewGoal] = React.useState("");
  const [newStart, setNewStart] = React.useState("");
  const [newEnd, setNewEnd] = React.useState("");
  const [newStatus, setNewStatus] =
    React.useState<Sprint["status"]>("PLANNED");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editGoal, setEditGoal] = React.useState("");
  const [editStart, setEditStart] = React.useState("");
  const [editEnd, setEditEnd] = React.useState("");
  const [editStatus, setEditStatus] =
    React.useState<Sprint["status"]>("PLANNED");

  React.useEffect(() => setSprints(initialSprints), [initialSprints]);

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
    if (!newName.trim()) return;
    await run(() =>
      addSprint({
        scrumId,
        data: {
          name: newName.trim(),
          goal: newGoal.trim() || undefined,
          startDate: newStart.trim() || null,
          endDate: newEnd.trim() || null,
          status: newStatus,
        },
      }),
    );
    setNewName("");
    setNewGoal("");
    setNewStart("");
    setNewEnd("");
    setNewStatus("PLANNED");
  };

  const startEdit = (s: Sprint) => {
    setEditingId(s.id);
    setEditName(s.name);
    setEditGoal(s.goal ?? "");
    setEditStart(s.startDate ?? "");
    setEditEnd(s.endDate ?? "");
    setEditStatus(s.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditGoal("");
    setEditStart("");
    setEditEnd("");
    setEditStatus("PLANNED");
  };

  const handleUpdate = async (sprintId: string) => {
    if (!editName.trim()) return;
    await run(() =>
      updateSprint({
        scrumId,
        sprintId,
        patch: {
          name: editName.trim(),
          goal: editGoal.trim() || undefined,
          startDate: editStart.trim() || null,
          endDate: editEnd.trim() || null,
          status: editStatus,
        },
      }),
    );
    cancelEdit();
  };

  const handleRemove = async (sprintId: string) => {
    await run(() =>
      removeSprint({ scrumId, entity: "sprint", entityId: sprintId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as SprintImport[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = item.id
          ? sprints.some((s) => s.id === item.id)
          : false;
        if (exists && item.id) {
          await updateSprint({
            scrumId,
            sprintId: item.id,
            patch: {
              name: item.name,
              goal: item.goal,
              startDate: item.startDate,
              endDate: item.endDate,
              status: item.status,
            },
          });
        } else {
          await addSprint({
            scrumId,
            data: {
              name: item.name,
              goal: item.goal,
              startDate: item.startDate,
              endDate: item.endDate,
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
          <CardTitle className="text-sm">Ajouter un sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sprint-name">Nom</Label>
              <Input
                id="sprint-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sprint-goal">Objectif</Label>
              <Textarea
                id="sprint-goal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                rows={2}
                disabled={pending}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sprint-start">Début</Label>
                <Input
                  id="sprint-start"
                  type="date"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sprint-end">Fin</Label>
                <Input
                  id="sprint-end"
                  type="date"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  disabled={pending}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Statut</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as Sprint["status"])}
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
            <Button
              type="submit"
              size="sm"
              disabled={pending || !newName.trim()}
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {sprints.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun sprint pour l&apos;instant.
          </p>
        ) : (
          sprints
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((sprint) => (
              <Card key={sprint.id}>
                <CardContent className="flex flex-col gap-2 p-3">
                  {editingId === sprint.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={pending}
                      />
                      <Textarea
                        value={editGoal}
                        onChange={(e) => setEditGoal(e.target.value)}
                        rows={2}
                        disabled={pending}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          disabled={pending}
                        />
                        <Input
                          type="date"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          disabled={pending}
                        />
                      </div>
                      <Select
                        value={editStatus}
                        onValueChange={(v) =>
                          setEditStatus(v as Sprint["status"])
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
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          onClick={() => handleUpdate(sprint.id)}
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
                          {sprint.name}
                        </span>
                        {sprint.goal && (
                          <span className="text-xs text-muted-foreground">
                            {sprint.goal}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {sprint.status}
                          {sprint.startDate ? ` · ${sprint.startDate}` : ""}
                          {sprint.endDate ? ` → ${sprint.endDate}` : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(sprint)}
                          disabled={pending}
                          aria-label="Éditer"
                        >
                          <Pencil className="size-3" aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleRemove(sprint.id)}
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

      <JsonEditor<SprintImport[]>
        label="Coller un JSON pour ajouter/modifier des sprints (id/position optionnels)"
        value={sprints}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={sprintImportArraySchema as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}