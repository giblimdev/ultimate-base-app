/*
path :           components/scrum/FeatureBoard.tsx
tag :            ["scrum", "feature", "board", "crud", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Board CRUD des features d'un projet Scrum. Composant
                 client ("use client" justifié par useState/useEffect et
                 les handlers de formulaire). Formulaire ajout (name,
                 description), édition inline, suppression, JsonEditor.
                 Appelle addFeature / updateFeature / removeFeature puis
                 router.refresh().

flow:            FeatureBoard({ scrumId, initialFeatures }) →
                 useState(features) → formulaire ajout → addFeature →
                 router.refresh() → édition inline → updateFeature →
                 suppression → removeFeature → JsonEditor → onApply →
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
relatedFiles:    ["@/app/(app)/scrum/actions/feature.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["react", "next/navigation", "lucide-react",
                  "@/app/(app)/scrum/actions/feature",
                  "@/lib/scrum/types", "@/lib/scrum/schema",
                  "@/components/scrum/JsonEditor",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/card"]
exports:         ["FeatureBoard"]
useBy:           ["@/app/(app)/scrum/projects/[projectId]/features/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux gérer les features d'un projet"]
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
  addFeature,
  updateFeature,
  removeFeature,
} from "@/app/(app)/scrum/actions/feature";
import type { Feature } from "@/lib/scrum/types";
import { featureSchema } from "@/lib/scrum/schema";
import { JsonEditor } from "@/components/scrum/JsonEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FeatureBoardProps = {
  scrumId: string;
  initialFeatures: Feature[];
};

export function FeatureBoard({ scrumId, initialFeatures }: FeatureBoardProps) {
  const router = useRouter();
  const [features, setFeatures] = React.useState<Feature[]>(initialFeatures);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");

  React.useEffect(() => {
    setFeatures(initialFeatures);
  }, [initialFeatures]);

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
      addFeature({
        scrumId,
        data: {
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        },
      }),
    );
    setNewName("");
    setNewDescription("");
  };

  const startEdit = (feature: Feature) => {
    setEditingId(feature.id);
    setEditName(feature.name);
    setEditDescription(feature.description ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (featureId: string) => {
    if (!editName.trim()) return;
    await run(() =>
      updateFeature({
        scrumId,
        featureId,
        patch: {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        },
      }),
    );
    cancelEdit();
  };

  const handleRemove = async (featureId: string) => {
    await run(() =>
      removeFeature({ scrumId, entity: "feature", entityId: featureId }),
    );
  };

  const handleJsonApply = async (parsed: unknown) => {
    const list = Array.isArray(parsed) ? (parsed as Feature[]) : [];
    setPending(true);
    setError(null);
    try {
      for (const item of list) {
        const exists = features.some((f) => f.id === item.id);
        if (exists) {
          await updateFeature({
            scrumId,
            featureId: item.id,
            patch: { name: item.name, description: item.description },
          });
        } else {
          await addFeature({
            scrumId,
            data: { name: item.name, description: item.description },
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
          <CardTitle className="text-sm">Ajouter une feature</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="feature-name">Nom</Label>
              <Input
                id="feature-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la feature"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="feature-desc">Description</Label>
              <Input
                id="feature-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optionnel)"
                disabled={pending}
              />
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
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune feature pour l&apos;instant.
          </p>
        ) : (
          features
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((feature) => (
              <Card key={feature.id}>
                <CardContent className="flex flex-col gap-2 p-3">
                  {editingId === feature.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        disabled={pending}
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        disabled={pending}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          onClick={() => handleUpdate(feature.id)}
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
                          {feature.name}
                        </span>
                        {feature.description && (
                          <span className="text-xs text-muted-foreground">
                            {feature.description}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => startEdit(feature)}
                          disabled={pending}
                          aria-label="Éditer"
                        >
                          <Pencil className="size-3" aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => handleRemove(feature.id)}
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

      <JsonEditor<Feature[]>
        label="Éditer les features en JSON"
        value={features}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schema={featureSchema.array() as any}
        onApply={handleJsonApply}
        disabled={pending}
      />
    </div>
  );
}