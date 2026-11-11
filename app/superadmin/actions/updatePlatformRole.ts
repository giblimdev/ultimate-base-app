/*
path :           app/superadmin/actions/updatePlatformRole.ts
tag :            ["superadmin", "rbac", "platform-role", "action", "server"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Action de mise à jour du rôle plateforme d'un
                 utilisateur. Valide l'entrée via Zod, appelle le service
                 updateUserPlatformRole (qui applique le guard "au moins
                 un SUPER_ADMIN reste"), retourne un résultat typé.
                 Aucun guard d'authentification pour l'instant : la
                 vérification "caller est SUPER_ADMIN" sera ajoutée ici
                 quand Better Auth sera installé (TODO marqué).

flow:            updatePlatformRoleAction(rawInput) → safeParse Zod →
                 si invalide, retourne { ok: false, error } →
                 updateUserPlatformRole(parsed.data) → retourne le
                 résultat typé.

ecosystem:       Superadmin = [
                   "@/app/superadmin/actions/updatePlatformRole.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/modules/rbac/platform-role-service.ts",
                   "@/modules/rbac/platform-role-schema.ts",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role-service.ts",
                  "@/modules/rbac/platform-role-schema.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]
imports:         ["@/modules/rbac/platform-role-schema",
                  "@/modules/rbac/platform-role-service"]
exports:         ["updatePlatformRoleAction"]
useBy:           ["@/app/superadmin/components/PlatformRoleManager.tsx"]

userStories:     ["*en tant que super admin je veux modifier le rôle plateforme d'un utilisateur"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { updateUserPlatformRoleSchema } from "@/modules/rbac/platform-role-schema";
import {
  updateUserPlatformRole,
  type UpdatePlatformRoleResult,
} from "@/modules/rbac/platform-role-service";

/**
 * TODO BETTER AUTH :
 * Ajouter en tête de fonction :
 *
 *   const session = await getSession();
 *   if (!session || session.user.platformRole !== "SUPER_ADMIN") {
 *     return { ok: false, error: "Accès refusé." };
 *   }
 *
 * Ne pas oublier non plus le guard dans app/superadmin/layout.tsx.
 */
export async function updatePlatformRoleAction(
  rawInput: unknown,
): Promise<UpdatePlatformRoleResult> {
  const parsed = updateUserPlatformRoleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Entrée invalide.",
    };
  }

  return updateUserPlatformRole(parsed.data);
}