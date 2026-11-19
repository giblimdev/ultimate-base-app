/*
path :           components/scrum/ProjectForm.tsx
tag :            ["scrum", "project", "form", "client", "react-hook-form",
                  "zod", "create", "update"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Formulaire de création / édition d'un projet Scrum.
                 Composant client justifié par react-hook-form, les
                 handlers de soumission et l'appel aux Server Actions.
                 Utilise zodResolver avec createProjectInputSchema pour
                 valider côté client avant envoi, puis appelle
                 createProject ou updateProject selon le mode. Mobile
                 first, accessible (labels associés, aria-invalid,
                 messages d'erreur sous les champs). Affiche un état
                 loading (disabled + spinner texte) et redirige vers
                 /scrum/projects après création réussie.

flow:            ProjectForm({ mode, scrumId?, initial? }) → useForm(
                 defaultValues) → onSubmit → createProject/updateProject
                 → si ok: router.push + toast.success → sinon:
                 toast.error + setError sur les champs concernés.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/app/(app)/scrum/actions/project.ts",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/app/(app)/scrum/actions/project.ts",
                  "@/lib/scrum/schema.ts",
                  "@/components/ui/input.tsx",
                  "@/components/ui/textarea.tsx",
                  "@/components/ui/label.tsx",
                  "@/components/ui/button.tsx"]
imports:         ["react", "next/navigation", "react-hook-form",
                  "@hookform/resolvers/zod", "sonner", "lucide-react",
                  "@/lib/scrum/schema", "@/app/(app)/scrum/actions/project",
                  "@/components/ui/input", "@/components/ui/textarea",
                  "@/components/ui/label", "@/components/ui/button"]
exports:         ["ProjectForm"]
useBy:           ["@/app/(app)/scrum/projects/new/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer un projet via un formulaire clair",
                  "*en tant qu'utilisateur je veux modifier un projet existant",
                  "*en tant qu'utilisateur je veux être averti si mon formulaire est invalide"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createProjectInputSchema,
  type CreateProjectInput,
} from "@/lib/scrum/schema";
import {
  createProject,
  updateProject,
} from "@/app/(app)/scrum/actions/project";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ProjectFormProps = {
  mode: "create" | "edit";
  scrumId?: string;
  initial?: Partial<CreateProjectInput>;
};

export function ProjectForm({ mode, scrumId, initial }: ProjectFormProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectInputSchema),
    defaultValues: {
      name: initial?.name ?? "",
      key: initial?.key ?? "",
      description: initial?.description ?? "",
      methodology: initial?.methodology ?? "SCRUM",
      visibility: initial?.visibility ?? "PRIVATE",
      status: initial?.status ?? "PLANNING",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = form;

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    try {
      if (mode === "create") {
        const res = await createProject(values);
        if (!res.ok) {
          toast.error(res.error);
          res.issues?.forEach((issue) => {
            const [field] = issue.split(" : ");
            if (field && field in values) {
              setError(field as keyof CreateProjectInput, {
                message: issue,
              });
            }
          });
          return;
        }
        toast.success("Projet créé.");
        router.push(`/scrum/projects/${res.data?.scrumId ?? ""}`);
        router.refresh();
      } else {
        if (!scrumId) {
          toast.error("Identifiant de projet manquant.");
          return;
        }
        const res = await updateProject({ scrumId, patch: values });
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        toast.success("Projet mis à jour.");
        router.push(`/scrum/projects/${scrumId}`);
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" required>
            Nom du projet
          </Label>
          <Input
            id="name"
            placeholder="Refonte espace client"
            aria-invalid={errors.name ? true : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="key" required>
            Clé
          </Label>
          <Input
            id="key"
            placeholder="CLI"
            aria-invalid={errors.key ? true : undefined}
            {...register("key")}
          />
          {errors.key && (
            <p className="text-xs text-destructive">{errors.key.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Objectif du projet en une phrase…"
          aria-invalid={errors.description ? true : undefined}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="methodology">Méthodologie</Label>
          <select
            id="methodology"
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
            {...register("methodology")}
          >
            <option value="SCRUM">Scrum</option>
            <option value="KANBAN">Kanban</option>
            <option value="SCRUMBAN">Scrumban</option>
            <option value="WATERFALL">Waterfall</option>
            <option value="HYBRID">Hybride</option>
            <option value="CUSTOM">Personnalisée</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="visibility">Visibilité</Label>
          <select
            id="visibility"
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
            {...register("visibility")}
          >
            <option value="PRIVATE">Privé</option>
            <option value="INTERNAL">Interne</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Statut</Label>
          <select
            id="status"
            className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm"
            {...register("status")}
          >
            <option value="PLANNING">Planification</option>
            <option value="ACTIVE">Actif</option>
            <option value="ON_HOLD">En pause</option>
            <option value="COMPLETED">Terminé</option>
            <option value="ARCHIVED">Archivé</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {mode === "create" ? "Créer le projet" : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.back()}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}