/*
path :           components/scrum/ProjectForm.tsx
tag :            ["scrum", "project", "form", "create", "edit", "rhf", "zod"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Formulaire de création / édition d'un projet Scrum.
                 Utilise react-hook-form + zodResolver sur
                 createProjectInputSchema. Gère les valeurs par défaut
                 (methodology, visibility, status) et affiche les
                 erreurs de validation. Pas de logique métier : appelle
                 onSubmit fourni par le parent (Server Action).

flow:            ProjectForm({ initial?, onSubmit, submitLabel }) →
                 useForm(CreateProjectInput) → fields name/key/
                 description/methodology/visibility/status →
                 handleSubmit → onSubmit(data).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectForm.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/schema.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/ui/button.tsx",
                  "@/components/ui/input.tsx",
                  "@/components/ui/label.tsx",
                  "@/components/ui/select.tsx",
                  "@/components/ui/textarea.tsx"]
imports:         ["react", "react-hook-form", "@hookform/resolvers/zod",
                  "@/lib/scrum/schema", "@/lib/scrum/types",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/select",
                  "@/components/ui/textarea", "@/lib/utils"]
exports:         ["ProjectForm", "ProjectFormProps"]
useBy:           ["@/app/(app)/scrum/projects/new/page.tsx",
                  "@/app/(app)/scrum/projects/[projectId]/edit/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux créer ou modifier un projet Scrum"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createProjectInputSchema,
  type CreateProjectInput,
} from "@/lib/scrum/schema";
import type { Project } from "@/lib/scrum/types";
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
import { cn } from "@/lib/utils";

export type ProjectFormProps = {
  initial?: Partial<Project>;
  onSubmit: (data: CreateProjectInput) => Promise<void> | void;
  submitLabel?: string;
  className?: string;
};

const METHODOLOGY_OPTIONS = [
  { value: "SCRUM", label: "Scrum" },
  { value: "KANBAN", label: "Kanban" },
  { value: "SCRUMBAN", label: "Scrumban" },
  { value: "WATERFALL", label: "Waterfall" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "CUSTOM", label: "Custom" },
] as const;

const VISIBILITY_OPTIONS = [
  { value: "PRIVATE", label: "Privé" },
  { value: "INTERNAL", label: "Interne" },
  { value: "PUBLIC", label: "Public" },
] as const;

const STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planification" },
  { value: "ACTIVE", label: "Actif" },
  { value: "ON_HOLD", label: "En pause" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "ARCHIVED", label: "Archivé" },
  { value: "CANCELLED", label: "Annulé" },
] as const;

export function ProjectForm({
  initial,
  onSubmit,
  submitLabel = "Enregistrer",
  className,
}: ProjectFormProps) {
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(
      createProjectInputSchema,
    ) as Resolver<CreateProjectInput>,
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
    setValue,
    watch,
    formState: { errors },
  } = form;

  const methodology = watch("methodology");
  const visibility = watch("visibility");
  const status = watch("status");

  const onValid = async (data: CreateProjectInput) => {
    setIsPending(true);
    try {
      await onSubmit(data);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      className={cn("flex flex-col gap-5", className)}
      noValidate
    >
      {/* Nom */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">
          Nom <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Mon projet"
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Clé */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="key">
          Clé <span className="text-destructive">*</span>
        </Label>
        <Input
          id="key"
          placeholder="PROJ"
          className="uppercase"
          aria-invalid={!!errors.key}
          {...register("key")}
        />
        {errors.key && (
          <p className="text-xs text-destructive">{errors.key.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description du projet (optionnel)"
          rows={3}
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Méthodologie */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="methodology">Méthodologie</Label>
        <Select
          value={methodology}
          onValueChange={(value) =>
            setValue("methodology", value as CreateProjectInput["methodology"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="methodology" aria-invalid={!!errors.methodology}>
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {METHODOLOGY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.methodology && (
          <p className="text-xs text-destructive">
            {errors.methodology.message}
          </p>
        )}
      </div>

      {/* Visibilité */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="visibility">Visibilité</Label>
        <Select
          value={visibility}
          onValueChange={(value) =>
            setValue("visibility", value as CreateProjectInput["visibility"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="visibility" aria-invalid={!!errors.visibility}>
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.visibility && (
          <p className="text-xs text-destructive">
            {errors.visibility.message}
          </p>
        )}
      </div>

      {/* Statut */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            setValue("status", value as CreateProjectInput["status"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="status" aria-invalid={!!errors.status}>
            <SelectValue placeholder="Choisir" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-xs text-destructive">{errors.status.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="mt-2 w-full sm:w-auto">
        {isPending ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}