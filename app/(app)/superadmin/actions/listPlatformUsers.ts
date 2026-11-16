/*
path :           app/superadmin/actions/listPlatformUsers.ts
tag :            ["superadmin", "rbac", "platform-role", "action", "server"]
projectId:       <UltimateBaseApp>
type:            action
generic:         false

role:            Server Action de lecture des utilisateurs avec leur rôle
                 plateforme. Valide l'entrée via Zod, appelle le service
                 listPlatformUsers, retourne la page demandée. Prête à
                 recevoir le guard SUPER_ADMIN quand Better Auth sera
                 installé (TODO marqué).

flow:            listPlatformUsersAction(rawInput) → safeParse Zod →
                 listPlatformUsers(parsed.data) → retourne le résultat.

ecosystem:       Superadmin = [
                   "@/app/superadmin/actions/listPlatformUsers.ts",
                   "@/app/superadmin/actions/updatePlatformRole.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/modules/rbac/platform-role-service.ts",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role-service.ts",
                  "@/modules/rbac/platform-role-schema.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]
imports:         ["@/modules/rbac/platform-role-schema",
                  "@/modules/rbac/platform-role-service"]
exports:         ["listPlatformUsersAction"]
useBy:           ["@/app/superadmin/components/PlatformRoleManager.tsx"]

userStories:     ["*en tant que super admin je veux lister les utilisateurs et leur rôle plateforme"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use server";

import { listPlatformUsersSchema } from "@/modules/rbac/platform-role-schema";
import {
  listPlatformUsers,
  type ListPlatformUsersResult,
} from "@/modules/rbac/platform-role-service";

/**
 * TODO BETTER AUTH :
 * Ajouter en tête de fonction :
 *
 *   const session = await getSession();
 *   if (!session || session.user.platformRole !== "SUPER_ADMIN") {
 *     return { users: [], total: 0, page: 1, pageSize: 20 };
 *   }
 */
export async function listPlatformUsersAction(
  rawInput: unknown,
): Promise<ListPlatformUsersResult> {
  const parsed = listPlatformUsersSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { users: [], total: 0, page: 1, pageSize: 20 };
  }
  return listPlatformUsers(parsed.data);
}