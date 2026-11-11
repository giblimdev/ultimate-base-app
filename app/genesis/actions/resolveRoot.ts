/*
path :           app/genesis/actions/resolveRoot.ts
tag :            ["genesis", "fs", "root", "action", "server"]
projectId:       <ultimate-genesis>
type:            action
generic:         false

role:            Server Action qui retourne la racine effective utilisée
                 par les outils Genesis (root ?? PROJECT_ROOT). Permet à
                 l'UI d'afficher la racine réellement ciblée sans exposer
                 PROJECT_ROOT côté client. Retourne aussi un booléen
                 isValid indiquant si le chemin fourni existe et est un
                 dossier lisible.

flow:            resolveRootAction(root?) → getEffectiveRoot(root) →
                 fs.stat pour vérifier existence + dossier → retour
                 { ok: true, effectiveRoot, exists, isDirectory }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/resolveRoot.ts",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                 ]
relatedFiles:    ["@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/components/RootFsPicker.tsx"]
imports:         ["node:fs", "@/app/genesis/lib/fs-utils"]
exports:         ["resolveRootAction", "ResolveRootResult"]
useBy:           ["@/app/genesis/components/RootFsPicker.tsx"]

userStories:     ["*en tant qu'utilisateur je veux voir la racine réellement utilisée par les outils Genesis",
                  "*en tant qu'utilisateur je veux savoir si le chemin saisi est valide"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { promises as fs } from "node:fs";
import { getEffectiveRoot } from "@/app/genesis/lib/fs-utils";

export type ResolveRootResult =
  | {
      ok: true;
      effectiveRoot: string;
      exists: boolean;
      isDirectory: boolean;
    }
  | { ok: false; error: string };

export async function resolveRootAction(
  root?: string,
): Promise<ResolveRootResult> {
  try {
    const effectiveRoot = getEffectiveRoot(root);
    let exists = false;
    let isDirectory = false;
    try {
      const stat = await fs.stat(effectiveRoot);
      exists = true;
      isDirectory = stat.isDirectory();
    } catch {
      exists = false;
    }
    return { ok: true, effectiveRoot, exists, isDirectory };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erreur inconnue.",
    };
  }
}