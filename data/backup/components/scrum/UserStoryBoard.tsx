/*
path :           components/scrum/UserStoryBoard.tsx
tag :            ["scrum", "user-story", "us", "board", "crud", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des user stories d'un projet Scrum. Composant
                 client ("use client" justifié par useState/useEffect et
                 les handlers de formulaire). Formulaire ajout (title,
                 asA, iWant, soThat, epicId, sprintId, storyPoints,
                 priority, status), édition inline, suppression,
                 JsonEditor. Appelle addUserStory / updateUserStory /
                 removeUserStory puis router.refresh(). Reçoit epics et
                 sprints pour les selects de rattachement.

flow:            UserStoryBoard({ scrumId, initialUserStories, epics,
                 sprints }) → useState(stories) → formulaire ajout →
                 addUserStory → router.refresh() → édition inline →
                 updateUserStory → suppression → removeUserStory →
                 JsonEditor → onApply → boucle add/update →
                 router.refresh().

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
relatedFiles:    ["@/app/(app)/scrum/actions/us.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/us",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card",
                  "@/components/ui/select", "@/components/ui/textarea"]
exports:         ["UserStoryBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/us/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les US d'un projet"]
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
  addUserStory,
  updateUserStory,
  removeUserStory,
} from "@/app/(app)/scrum/actions/us";
import type { Epic, Sprint, UserStory } from "@/lib/scrum/types";
import { userStorySchema } from "@/lib/scrum/schema";
import { JsonEditor } from "@/components/scrum/JsonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

type UserStoryBoardProps = {
  scrumId: string;
  initialUserStories: UserStory[];
  epics: Epic[];
  sprints: Sprint[];
};

export function UserStoryBoard({
  scrumId,
  initialUserStories,
  epics,
  sprints,
}: UserStoryBoardProps) {
  const router = useRouter();
  const [stories, setStories] =
    React.useState<UserStory[]>(initialUserStories);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newTitle, setNewTitle] = React.useState("");
  const [newAsA, setNewAsA] = React.useState("");
  const [newIWant, setNewIWant] = React.useState("");
  const [newSoThat, setNewSoThat] = React.useState("");
  const [newEpicId, setNewEpicId] = React.useState<string>("__none__");
  const [newSprintId, setNewSprintId] = React.useState<string>("__none__");
  const [newPoints, setNewPoints] = React.useState("");
  const [newPriority, setNewPriority] =
    React.useState<UserStory["priority"]>("MEDIUM");
  const [newStatus, setNewStatus] =
    React.useState<UserStory["status"]>("TODO");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editAsA, setEditAsA] = React.useState("");
  const [editIWant, setEditIWant] = React.useState("");
  const [editSoThat, setEditSoThat] = React.useState("");
  const [editEpicId, setEditEpicId] = React.useState<string>("__none__");
  const [editSprintId, setEditSprintId] = React.useState<string>("__none__");
  const [editPoints, setEditPoints] = React.useState("");
  const [editPriority, setEditPriority] =
    React.useState<UserStory["priority"]>("MEDIUM");
  const [editStatus, setEditStatus] =
    React.useState<UserStory["status"]>("TODO");

  React.useEffect(() => setStories(initialUserStories), [initialUserStories]);

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
    if (
      !newTitle.trim() ||
      !newAsA.trim() ||
      !newIWant.trim() ||
      !newSoThat.trim()
    )
      return;
    await run(() =>
      addUserStory({
        scrumId,
        data: {
          title: newTitle.trim(),
          asA: newAsA.trim(),
          iWant: newIWant.trim(),
          soThat: newSoThat.trim(),
          epicId: newEpicId === "__none__" ? null : newEpicId,
          sprintId: newSprintId === "__none__" ? null : newSprintId,
          storyPoints: newPoints.trim() ? Number(newPoints) : null,
          priority: newPriority,
          status: newStatus,
        },
      }),
    );
    setNewTitle("");
    setNewAsA("");
    setNewIWant("");
    setNewSoThat("");
    setNewEpicId("__none__");
    setNewSprintId("__none__");
    setNewPoints("");
    setNewPriority("MEDIUM");
    setNewStatus("TODO");
  };

  const startEdit = (u: UserStory) => {
    setEditingId(u.id);
    setEditTitle(u.title);
    setEditAsA(u.asA);
    setEditIWant(u.iWant);
    setEditSoThat(u.soThat);
    setEditEpicId(u.epicId ?? "__none__");
    setEditSprintId(u.sprintId ?? "__none__");
    setEditPoints(u.storyPoints?.toString() ?? "");
    setEditPriority(u.priority);
    setEditStatus(u.status);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditAsA("");
    setEditIWant("");
    setEditSoThat("");
    setEditEpicId("__none__");
    setEditSprintId("__none__");
    setEditPoints("");
    setEditPriority("MEDIUM");
    setEditStatus("TODO");
  };

  const handleUpdate = async (usId: string) => {
    if (
      !editTitle.trim() ||
      !editAsA.trim() ||
      !editIWant.trim() ||
      !editSoThat.trim()
    )
      return;
    await run(() =>
      updateUserStory({
        scrumId,
        usId,
        patch: {
          title: editTitle.trim(),
          asA: editAsA.trim(),
          iWant: editIWant.trim(),
          soThat: editSoThat.trim(),
          epicId: editEpicId === "__none__" ? null : editEpicId,
          sprintId: editSprintId === "__none__" ? null : editSprintId,
          storyPoints: editPoints.trim() ? Number(editPoints) : null,
          priority: editPriority,
          status: editStatus,
        },
      }),
    );
    cancelEdit();
  };

  const handleRemove = async (usId: string) => {
    await run(() =>
      removeUserStory({ scrumId, entity: "userStory", entityId: usId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as UserStory[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = stories.some((s) => s.id === item.id);
        if (exists) {
          await updateUserStory({
            scrumId,
            usId: item.id,
            patch: {
              title: item.title,
              asA: item.asA,
              iWant: item.iWant,
              soThat: item.soThat,
              epicId: item.epicId,
              sprintId: item.sprintId,
              acceptanceCriteria: item.acceptanceCriteria,
              storyPoints: item.storyPoints,
              priority: item.priority,
              status: item.status,
            },
          });
        } else {
          await addUserStory({
            scrumId,
            data: {
              title: item.title,
              asA: item.asA,
              iWant: item.iWant,
              soThat: item.soThat,
              epicId: item.epicId,
              sprintId: item.sprintId,
              acceptanceCriteria: item.acceptanceCriteria,
              storyPoints: item.storyPoints,
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
          <CardTitle className="text-sm">Ajouter une user story</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="us-title">Titre</Label>
              <Input
                id="us-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="us-asA">En tant que…</Label>
              <Input
                id="us-asA"
                value={newAsA}
                onChange={(e) => setNewAsA(e.target.value)}
                placeholder="utilisateur"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="us-iWant">Je veux…</Label>
              <Input
                id="us-iWant"
                value={newIWant}
                onChange={(e) => setNewIWant(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="us-soThat">Afin de…</Label>
              <Input
                id="us-soThat"
                value={newSoThat}
                onChange={(e) => setNewSoThat(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Epic</Label>
                <Select
                  value={newEpicId}
                  onValueChange={(v) => setNewEpicId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun</SelectItem>
                    {epics.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Sprint</Label>
                <Select
                  value={newSprintId}
                  onValueChange={(v) => setNewSprintId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Aucun</SelectItem>
                    {sprints.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="us-points">Points</Label>
                <Input
                  id="us-points"
                  type="number"
                  min={0}
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Priorité</Label>
                <Select
                  value={newPriority}
                  onValueChange={(v) =>
                    setNewPriority(v as UserStory["priority"])
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
                  onValueChange={(v) =>
                    setNewStatus(v as UserStory["status"])
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
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={
                pending ||
                !newTitle.trim() ||
                !newAsA.trim() ||
                !newIWant.trim() ||
                !newSoThat.trim()
              }
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {stories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune user story pour l&apos;instant.
          </p>
        ) : (
          stories
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((us) => (
              <Card key={us.id}>
                <CardContent className="flex flex-col gap-2 p-3">
                  {editingId === us.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        disabled={pending}
                      />
                      <Input
                        value={editAsA}
                        onChange={(e) => setEditAsA(e.target.value)}
                        disabled={pending}
                      />
                      <Input
                        value={editIWant}
                        onChange={(e) => setEditIWant(e.target.value)}
                        disabled={pending}
                      />
                      <Input
                        value={editSoThat}
                        onChange={(e) => setEditSoThat(e.target.value)}
                        disabled={pending}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={editEpicId}
                          onValueChange={(v) => setEditEpicId(v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Aucun</SelectItem>
                            {epics.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={editSprintId}
                          onValueChange={(v) => setEditSprintId(v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Aucun</SelectItem>
                            {sprints.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          min={0}
                          value={editPoints}
                          onChange={(e) => setEditPoints(e.target.value)}
                          disabled={pending}
                        />
                        <Select
                          value={editPriority}
                          onValueChange={(v) =>
                            setEditPriority(v as UserStory["priority"])
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
                            setEditStatus(v as UserStory["status"])
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
                          onClick={() => handleUpdate(us.id)}
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
                        <span className="text-sm font-medium">{us.title}</span>
                        <span className="text-xs text-muted-foreground">
                          En tant que {us.asA}, je veux {us.iWant} afin de{" "}
                          {us.soThat}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {us.priority} · {us.status}
                          {us.storyPoints != null
                            ? ` · ${us.storyPoints} pts`
                            : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(us)}
                          disabled={pending}
                          aria-label="Éditer"
                        >
                          <Pencil className="size-3" aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleRemove(us.id)}
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

      <JsonEditor<UserStory[]>
        label="Éditer les US en JSON"
        value={stories}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={userStorySchema.array() as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}