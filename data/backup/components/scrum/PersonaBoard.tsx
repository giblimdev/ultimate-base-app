/*
path :           components/scrum/PersonaBoard.tsx
tag :            ["scrum", "persona", "board", "crud", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des personas d'un projet Scrum. Composant
                 client ("use client" justifié par useState/useEffect et
                 les handlers de formulaire). Formulaire ajout (name,
                 role, goals, frustrations), édition inline, suppression,
                 JsonEditor. Appelle addPersona / updatePersona /
                 removePersona puis router.refresh().

flow:            PersonaBoard({ scrumId, initialPersonas }) →
                 useState(personas) → formulaire ajout → addPersona →
                 router.refresh() → édition inline → updatePersona →
                 suppression → removePersona → JsonEditor → onApply →
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
relatedFiles:    ["@/app/(app)/scrum/actions/persona.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/persona",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card",
                  "@/components/ui/textarea"]
exports:         ["PersonaBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/personas/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les personas d'un projet"]
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
  addPersona,
  updatePersona,
  removePersona,
} from "@/app/(app)/scrum/actions/persona";
import type { Persona } from "@/lib/scrum/types";
import { personaSchema } from "@/lib/scrum/schema";
import { JsonEditor } from "@/components/scrum/JsonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PersonaBoardProps = {
  scrumId: string;
  initialPersonas: Persona[];
};

export function PersonaBoard({ scrumId, initialPersonas }: PersonaBoardProps) {
  const router = useRouter();
  const [personas, setPersonas] = React.useState<Persona[]>(initialPersonas);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newName, setNewName] = React.useState("");
  const [newRole, setNewRole] = React.useState("");
  const [newGoals, setNewGoals] = React.useState("");
  const [newFrustrations, setNewFrustrations] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState("");
  const [editGoals, setEditGoals] = React.useState("");
  const [editFrustrations, setEditFrustrations] = React.useState("");

  React.useEffect(() => setPersonas(initialPersonas), [initialPersonas]);

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
    if (!newName.trim() || !newRole.trim()) return;
    await run(() =>
      addPersona({
        scrumId,
        data: {
          name: newName.trim(),
          role: newRole.trim(),
          goals: newGoals.trim() || undefined,
          frustrations: newFrustrations.trim() || undefined,
        },
      }),
    );
    setNewName("");
    setNewRole("");
    setNewGoals("");
    setNewFrustrations("");
  };

  const startEdit = (p: Persona) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditRole(p.role);
    setEditGoals(p.goals ?? "");
    setEditFrustrations(p.frustrations ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditRole("");
    setEditGoals("");
    setEditFrustrations("");
  };

  const handleUpdate = async (personaId: string) => {
    if (!editName.trim() || !editRole.trim()) return;
    await run(() =>
      updatePersona({
        scrumId,
        personaId,
        patch: {
          name: editName.trim(),
          role: editRole.trim(),
          goals: editGoals.trim() || undefined,
          frustrations: editFrustrations.trim() || undefined,
        },
      }),
    );
    cancelEdit();
  };

  const handleRemove = async (personaId: string) => {
    await run(() =>
      removePersona({ scrumId, entity: "persona", entityId: personaId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as Persona[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = personas.some((p) => p.id === item.id);
        if (exists) {
          await updatePersona({
            scrumId,
            personaId: item.id,
            patch: {
              name: item.name,
              role: item.role,
              goals: item.goals,
              frustrations: item.frustrations,
            },
          });
        } else {
          await addPersona({
            scrumId,
            data: {
              name: item.name,
              role: item.role,
              goals: item.goals,
              frustrations: item.frustrations,
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
          <CardTitle className="text-sm">Ajouter un persona</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="persona-name">Nom</Label>
              <Input
                id="persona-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du persona"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="persona-role">Rôle</Label>
              <Input
                id="persona-role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Rôle (ex. Product Owner)"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="persona-goals">Objectifs</Label>
              <Textarea
                id="persona-goals"
                value={newGoals}
                onChange={(e) => setNewGoals(e.target.value)}
                rows={2}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="persona-frustrations">Frustrations</Label>
              <Textarea
                id="persona-frustrations"
                value={newFrustrations}
                onChange={(e) => setNewFrustrations(e.target.value)}
                rows={2}
                disabled={pending}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={pending || !newName.trim() || !newRole.trim()}
            >
              <Plus className="size-4" aria-hidden />
              Ajouter
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {personas.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun persona pour l&apos;instant.
          </p>
        ) : (
          personas
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((persona) => (
              <Card key={persona.id}>
                <CardContent className="flex flex-col gap-2 p-3">
                  {editingId === persona.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={pending}
                      />
                      <Input
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        disabled={pending}
                      />
                      <Textarea
                        value={editGoals}
                        onChange={(e) => setEditGoals(e.target.value)}
                        rows={2}
                        disabled={pending}
                      />
                      <Textarea
                        value={editFrustrations}
                        onChange={(e) => setEditFrustrations(e.target.value)}
                        rows={2}
                        disabled={pending}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          onClick={() => handleUpdate(persona.id)}
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
                          {persona.name} — {persona.role}
                        </span>
                        {persona.goals && (
                          <span className="text-xs text-muted-foreground">
                            Objectifs : {persona.goals}
                          </span>
                        )}
                        {persona.frustrations && (
                          <span className="text-xs text-muted-foreground">
                            Frustrations : {persona.frustrations}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(persona)}
                          disabled={pending}
                          aria-label="Éditer"
                        >
                          <Pencil className="size-3" aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleRemove(persona.id)}
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

      <JsonEditor<Persona[]>
        label="Éditer les personas en JSON"
        value={personas}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={personaSchema.array() as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}