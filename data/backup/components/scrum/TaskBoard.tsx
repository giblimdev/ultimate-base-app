/*
path :           components/scrum/TaskBoard.tsx
tag :            ["scrum", "task", "board", "crud", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des tâches d'un projet Scrum. Composant client
                 ("use client" justifié par useState/useEffect et les
                 handlers de formulaire). Formulaire ajout (title, usId),
                 toggle done (coche la tâche via updateTask), suppression,
                 JsonEditor. Appelle addTask / updateTask / removeTask puis
                 router.refresh(). Reçoit userStories pour le select de
                 rattachement.

flow:            TaskBoard({ scrumId, initialTasks, userStories }) →
                 useState(tasks) → formulaire ajout → addTask →
                 router.refresh() → toggle done → updateTask (patch done)
                 → suppression → removeTask → JsonEditor → onApply →
                 boucle add/update → router.refresh().

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
relatedFiles:    ["@/app/(app)/scrum/actions/task.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/task",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card",
                  "@/components/ui/select"]
exports:         ["TaskBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/tasks/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les tâches d'un projet"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check } from "lucide-react";
import {
  addTask,
  updateTask,
  removeTask,
} from "@/app/(app)/scrum/actions/task";
import type { Task, UserStory } from "@/lib/scrum/types";
import { taskSchema } from "@/lib/scrum/schema";
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

type TaskBoardProps = {
  scrumId: string;
  initialTasks: Task[];
  userStories: UserStory[];
};

export function TaskBoard({
  scrumId,
  initialTasks,
  userStories,
}: TaskBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newTitle, setNewTitle] = React.useState("");
  const [newUsId, setNewUsId] = React.useState<string>("__none__");

  React.useEffect(() => setTasks(initialTasks), [initialTasks]);

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
      addTask({
        scrumId,
        data: {
          title: newTitle.trim(),
          usId: newUsId === "__none__" ? null : newUsId,
        },
      }),
    );
    setNewTitle("");
    setNewUsId("__none__");
  };

  const toggleDone = async (task: Task) => {
    await run(() =>
      updateTask({
        scrumId,
        taskId: task.id,
        patch: { done: !task.done },
      }),
    );
  };

  const handleRemove = async (taskId: string) => {
    await run(() =>
      removeTask({ scrumId, entity: "task", entityId: taskId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as Task[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = tasks.some((t) => t.id === item.id);
        if (exists) {
          await updateTask({
            scrumId,
            taskId: item.id,
            patch: {
              title: item.title,
              usId: item.usId,
              done: item.done,
            },
          });
        } else {
          await addTask({
            scrumId,
            data: {
              title: item.title,
              usId: item.usId,
              done: item.done,
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
          <CardTitle className="text-sm">Ajouter une tâche</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-title">Titre</Label>
              <Input
                id="task-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>User Story</Label>
              <Select value={newUsId} onValueChange={(v) => setNewUsId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune</SelectItem>
                  {userStories.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune tâche pour l&apos;instant.
          </p>
        ) : (
          tasks
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((task) => (
              <Card key={task.id}>
                <CardContent className="flex items-center justify-between gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => toggleDone(task)}
                    disabled={pending}
                    className="flex items-center gap-2 text-left"
                    aria-label={
                      task.done ? "Marquer non faite" : "Marquer faite"
                    }
                  >
                    <span
                      className={`inline-flex size-4 items-center justify-center rounded border ${
                        task.done
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border"
                      }`}
                    >
                      {task.done && <Check className="size-3" aria-hidden />}
                    </span>
                    <span
                      className={`text-sm ${
                        task.done ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => handleRemove(task.id)}
                    disabled={pending}
                    aria-label="Supprimer"
                  >
                    <Trash2 className="size-3" aria-hidden />
                  </Button>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      <JsonEditor<Task[]>
        label="Éditer les tâches en JSON"
        value={tasks}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={taskSchema.array() as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}