/*
path :           lib/scrum/json-io.ts
tag :            ["scrum", "json", "parse", "serialize", "editable",
                  "tree", "validation"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Parse et sérialise l'arbre Scrum au format JSON éditable
                 (copier/coller) utilisé dans les JsonEditor des CRUD. Le
                 parse valide systématiquement via scrumTreeSchema et
                 retourne un résultat discriminé (ok / erreurs formatées)
                 pour que l'UI puisse afficher un message clair sans crash.
                 La sérialisation produit un JSON pretty-print stable (2
                 espaces, ordre des clés préservé par les types), réutilisable
                 tel quel par l'utilisateur. Ne lève jamais : les erreurs
                 sont retournées, pas jetées.

flow:            parseTreeJson(text) → JSON.parse (try/catch) →
                 scrumTreeSchema.safeParse → { ok: true, tree } ou
                 { ok: false, error }. serializeTreeJson(tree) →
                 JSON.stringify(tree, null, 2).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/json-io.ts",
                   "@/lib/scrum/schema.ts",
                   "@/lib/scrum/types.ts",
                 ]
relatedFiles:    ["@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts",
                  "@/components/scrum/JsonEditor.tsx"]
imports:         ["@/lib/scrum/schema", "@/lib/scrum/types"]
exports:         ["ParseTreeJsonResult", "parseTreeJson",
                  "serializeTreeJson"]
useBy:           ["@/components/scrum/JsonEditor.tsx",
                  "@/app/(app)/scrum/actions/project.ts"]

userStories:     ["*en tant qu'utilisateur je veux coller un JSON valide pour éditer en masse",
                  "*en tant qu'utilisateur je veux un message clair si mon JSON est invalide"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { scrumTreeSchema } from "@/lib/scrum/schema";
import type { ScrumTree } from "@/lib/scrum/types";

export type ParseTreeJsonResult =
  | { ok: true; tree: ScrumTree }
  | { ok: false; error: string; issues?: string[] };

export function parseTreeJson(text: string): ParseTreeJsonResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "JSON invalide (syntaxe).";
    return { ok: false, error: `JSON invalide : ${message}` };
  }

  const result = scrumTreeSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "(racine)"} : ${issue.message}`,
    );
    return {
      ok: false,
      error: "JSON valide syntaxiquement mais ne respecte pas le schéma Scrum.",
      issues,
    };
  }

  return { ok: true, tree: result.data };
}

export function serializeTreeJson(tree: ScrumTree): string {
  return JSON.stringify(tree, null, 2);
}