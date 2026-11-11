/*
path :           modules/rbac/platform-role-service.ts
tag :            ["rbac", "platform-role", "service", "stub", "server"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         false

role:            Service de lecture/écriture des rôles plateforme. Tant
                 que Prisma n'a pas de modèle User avec platformRole,
                 expose un store EN MÉMOIRE (Map) pré-rempli avec
                 quelques utilisateurs de démonstration, pour que
                 PlatformRoleManager soit testable immédiatement. Une
                 fois Prisma prêt, remplacer les 3 fonctions par des
                 appels prisma.user.findMany / update. Le contrat
                 (types ListPlatformUsersResult, UpdatePlatformRoleResult)
                 ne change pas : le composant client n'a rien à modifier.

flow:            listPlatformUsers({ search, page, pageSize }) → filtre
                 le store → retourne { users, total, page, pageSize }.
                 updateUserPlatformRole({ userId, platformRole }) →
                 vérifie qu'au moins un SUPER_ADMIN reste → met à jour
                 le store → retourne { ok: true, user }.

ecosystem:       Rbac = [
                   "@/modules/rbac/platform-role.ts",
                   "@/modules/rbac/platform-role-schema.ts",
                   "@/modules/rbac/platform-role-service.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role.ts",
                  "@/modules/rbac/platform-role-schema.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]
imports:         ["@/modules/rbac/platform-role",
                  "@/modules/rbac/platform-role-schema"]
exports:         ["PlatformUser", "ListPlatformUsersResult",
                  "listPlatformUsers",
                  "updateUserPlatformRole",
                  "UpdatePlatformRoleResult"]
useBy:           ["@/app/superadmin/components/PlatformRoleManager.tsx"]

userStories:     ["*en tant que super admin je veux lister et modifier les rôles plateforme des utilisateurs",
                  "*en tant que super admin je ne veux pas pouvoir supprimer le dernier SUPER_ADMIN"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import {
  DEFAULT_PLATFORM_ROLE,
  type PlatformRole,
} from "@/modules/rbac/platform-role";
import type {
  ListPlatformUsersInput,
  UpdateUserPlatformRoleInput,
} from "@/modules/rbac/platform-role-schema";

export type PlatformUser = {
  id: string;
  email: string;
  name: string;
  platformRole: PlatformRole;
  createdAt: string;
};

export type ListPlatformUsersResult = {
  users: PlatformUser[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdatePlatformRoleResult =
  | { ok: true; user: PlatformUser }
  | { ok: false; error: string };

/**
 * STORE EN MÉMOIRE — À SUPPRIMER quand Prisma est prêt.
 * Remplacer par prisma.user.findMany / prisma.user.update.
 */
const usersStore = new Map<string, PlatformUser>([
  [
    "u1",
    {
      id: "u1",
      email: "superadmin@local.dev",
      name: "Super Admin (stub)",
      platformRole: "SUPER_ADMIN",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  [
    "u2",
    {
      id: "u2",
      email: "support@local.dev",
      name: "Support (stub)",
      platformRole: "SUPPORT",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ],
  [
    "u3",
    {
      id: "u3",
      email: "user@local.dev",
      name: "Utilisateur (stub)",
      platformRole: DEFAULT_PLATFORM_ROLE,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
  ],
]);

export async function listPlatformUsers(
  input: ListPlatformUsersInput,
): Promise<ListPlatformUsersResult> {
  const search = input.search.toLowerCase();
  const all = Array.from(usersStore.values()).filter((u) => {
    if (!search) return true;
    return (
      u.email.toLowerCase().includes(search) ||
      u.name.toLowerCase().includes(search)
    );
  });

  all.sort((a, b) => a.email.localeCompare(b.email));

  const total = all.length;
  const start = (input.page - 1) * input.pageSize;
  const users = all.slice(start, start + input.pageSize);

  return {
    users,
    total,
    page: input.page,
    pageSize: input.pageSize,
  };
}

export async function updateUserPlatformRole(
  input: UpdateUserPlatformRoleInput,
): Promise<UpdatePlatformRoleResult> {
  const target = usersStore.get(input.userId);
  if (!target) {
    return { ok: false, error: "Utilisateur introuvable." };
  }

  // Guard : ne jamais retirer le dernier SUPER_ADMIN.
  if (target.platformRole === "SUPER_ADMIN" && input.platformRole !== "SUPER_ADMIN") {
    const superAdminCount = Array.from(usersStore.values()).filter(
      (u) => u.platformRole === "SUPER_ADMIN",
    ).length;
    if (superAdminCount <= 1) {
      return {
        ok: false,
        error:
          "Impossible de retirer le dernier SUPER_ADMIN. Promouvoir un autre utilisateur d'abord.",
      };
    }
  }

  const updated: PlatformUser = { ...target, platformRole: input.platformRole };
  usersStore.set(input.userId, updated);
  return { ok: true, user: updated };
}