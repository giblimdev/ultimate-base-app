/*
path :           components/scrum/JsonEditor.tsx
tag :            ["scrum", "json", "editor", "client", "copy-paste",
                  "validation", "zod", "mass-edit"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Éditeur JSON générique pour l'édition en masse (copier/
                 coller) des entités Scrum. Composant client justifié par
                 l'état local du textarea, la validation Zod à la volée et
                 les handlers Formater/Appliquer/Réinitialiser. Reçoit une
                 valeur initiale (objet ou tableau), un schéma Zod optionnel
                 pour valider avant d'appeler onApply, et un callback
                 onApply(parsed) qui déclenche la Server Action côté parent.
                 Affiche les erreurs de syntaxe et de schéma inline, sans
                 crasher. Mobile first, accessible (label, aria-invalid,
                 aria-describedby). Ne fait AUCUN appel réseau lui-même :
                 la responsabilité de l'action est déléguée au parent.

flow:            JsonEditor({ label, value, schema?, onApply, disabled? })
                 → useState(text = pretty(value)) → utilisateur édite →
                 Formater → JSON.parse + stringify(2) → Appliquer →
                 JSON.parse (try/catch) → schema.safeParse (si fourni) →
                 si ok: onApply(parsed) → sinon: setError(issues) →
                 Réinitialiser → setText(pretty(value)).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/JsonEditor.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/lib/scrum/json-io.ts",
                  "@/lib/scrum/schema.ts",
                  "@/components/ui/textarea.tsx",
                  "@/components/ui/button.tsx"]
imports:         ["react", "lucide-react", "zod",
                  "@/components/ui/textarea",
                  "@/components/ui/button", "@/lib/utils"]
exports:         ["JsonEditor"]
useBy:           ["@/components/scrum/FeatureBoard.tsx",
                  "@/components/scrum/PersonaBoard.tsx",
                  "@/components/scrum/EpicBoard.tsx",
                  "@/components/scrum/UserStoryBoard.tsx",
                  "@/components/scrum/SprintBoard.tsx"]

userStories:     ["*en tant qu'utilisateur je veux éditer mes entités en masse via un JSON",
                  "*en tant qu'utilisateur je veux être averti si mon JSON est invalide",
                  "*en tant que développeur je veux un éditeur JSON réutilisable pour tous les CRUD"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
"use client";

import * as React from "react";
import { Check, RotateCcw, Sparkles } from "lucide-react";
import type { ZodType } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JsonEditorProps<T> = {
  label: string;
  value: T;
  schema?: ZodType<T>;
  onApply: (parsed: T) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
};

function pretty(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
}

export function JsonEditor<T>({
  label,
  value,
  schema,
  onApply,
  disabled,
  className,
}: JsonEditorProps<T>) {
  const [text, setText] = React.useState(() => pretty(value));
  const [error, setError] = React.useState<string | null>(null);
  const [issues, setIssues] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    setText(pretty(value));
    setError(null);
    setIssues([]);
  }, [value]);

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text);
      setText(pretty(parsed));
      setError(null);
      setIssues([]);
    } catch (err) {
      setError(
        err instanceof Error ? `JSON invalide : ${err.message}` : "JSON invalide.",
      );
    }
  };

  const handleReset = () => {
    setText(pretty(value));
    setError(null);
    setIssues([]);
  };

  const handleApply = async () => {
    setError(null);
    setIssues([]);

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      setError(
        err instanceof Error ? `JSON invalide : ${err.message}` : "JSON invalide.",
      );
      return;
    }

    if (schema) {
      const result = schema.safeParse(parsed);
      if (!result.success) {
        setError("Le JSON ne respecte pas le schéma attendu.");
        setIssues(
          result.error.issues.map(
            (i) => `${i.path.join(".") || "(racine)"} : ${i.message}`,
          ),
        );
        return;
      }
      parsed = result.data;
    }

    setPending(true);
    try {
      await onApply(parsed as T);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleFormat}
            disabled={disabled || pending}
          >
            <Sparkles className="size-3" aria-hidden />
            Formater
          </Button>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleReset}
            disabled={disabled || pending}
          >
            <RotateCcw className="size-3" aria-hidden />
            Réinitialiser
          </Button>
          <Button
            type="button"
            size="xs"
            onClick={handleApply}
            disabled={disabled || pending}
          >
            <Check className="size-3" aria-hidden />
            Appliquer
          </Button>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="min-h-40 font-mono text-xs"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "json-editor-error" : undefined}
        disabled={disabled || pending}
      />

      {error && (
        <div
          id="json-editor-error"
          className="flex flex-col gap-1 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive"
        >
          <p className="font-medium">{error}</p>
          {issues.length > 0 && (
            <ul className="flex list-disc flex-col gap-0.5 pl-4">
              {issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}