/*
path :           lib/scrum/import-export.ts
tag :            ["scrum", "import", "export", "json", "tree", "helper"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Helpers d'import/export de l'arbre Scrum complet. Permet
                 de copier/coller un projet entier (projet + features +
                 personas + epics + user stories + tasks + sprints) au
                 format JSON, de le valider via scrumTreeSchema, et de le
                 réinjecter côté serveur. Complète json-io.ts qui gère le
                 parse/serialize bas niveau.

flow:            exportProjectJson(tree) → serializeTreeJson(tree) (alias
                 lisible). importProjectJson(text) → JSON.parse →
                 scrumTreeSchema.safeParse → { ok, tree } ou { ok, error,
                 issues }.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/actions/epic.ts",
                   // ... (ecosystem Scrum canonique complet)
                 ]
relatedFiles:    ["@/lib/scrum/json-io.ts",
                  "@/lib/scrum/schema.ts",
                  "@/lib/scrum/types.ts"]
imports:         ["@/lib/scrum/json-io", "@/lib/scrum/schema",
                  "@/lib/scrum/types"]
exports:         ["exportProjectJson", "importProjectJson",
                  "ImportProjectJsonResult"]
useBy:           ["@/app/(app)/scrum/projects/import/page.tsx"]

userStories:     ["*en tant qu'utilisateur je veux copier un projet entier en JSON",
                  "*en tant qu'utilisateur je veux importer un projet complet depuis un JSON"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import { parseTreeJson, serializeTreeJson } from "@/lib/scrum/json-io";
import type { ScrumTree } from "@/lib/scrum/types";

export function exportProjectJson(tree: ScrumTree): string {
  return serializeTreeJson(tree);
}

export type ImportProjectJsonResult =
  | { ok: true; tree: ScrumTree }
  | { ok: false; error: string; issues?: string[] };

export function importProjectJson(text: string): ImportProjectJsonResult {
  return parseTreeJson(text);
}