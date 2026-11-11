/*
path :           modules/rbac/platform-role.ts
tag :            ["rbac", "platform-role", "config", "constants", "generic"]
projectId:       <UltimateBaseApp>
type:            config
generic:         true

role:            Source de vérité unique des rôles plateforme (niveau
                 global, au-dessus des tenants). Définit les 3 rôles
                 statiques (SUPER_ADMIN, SUPPORT, USER), leur label, leur
                 description, leur niveau hiérarchique et les helpers
                 purs de comparaison (hasPlatformRole, isSuperAdmin).
                 Aucune dépendance React ni Better Auth : importable
                 côté serveur et client. Consommé par le guard, la
                 sidebar, le PlatformRoleManager et les Server Actions.

flow:            PLATFORM_ROLES (const) → PLATFORM_ROLE_META (label,
                 description, rank) → hasPlatformRole(current, required)
                 compare les rangs → isSuperAdmin(current) raccourci.

ecosystem:       Rbac = [
                   "@/modules/rbac/platform-role.ts",
                   "@/modules/rbac/platform-role-schema.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/data/nav.ts",
                   "@/components/layout/AppSidebar.tsx",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role-schema.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx",
                  "@/data/nav.ts"]
imports:         []
exports:         ["PLATFORM_ROLES", "PlatformRole",
                  "PLATFORM_ROLE_META", "PlatformRoleMeta",
                  "hasPlatformRole", "isSuperAdmin", "DEFAULT_PLATFORM_ROLE"]
useBy:           ["@/app/superadmin/components/PlatformRoleManager.tsx",
                  "@/app/superadmin/page.tsx",
                  "@/data/nav.ts",
                  "@/components/layout/AppSidebar.tsx"]

userStories:     ["*en tant que développeur je veux une source unique pour les rôles plateforme",
                  "*en tant qu'utilisateur je veux comprendre la hiérarchie des rôles plateforme"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
export const PLATFORM_ROLES = [
  "SUPER_ADMIN",
  "SUPPORT",
  "USER",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const DEFAULT_PLATFORM_ROLE: PlatformRole = "USER";

export type PlatformRoleMeta = {
  label: string;
  description: string;
  rank: number;
};

export const PLATFORM_ROLE_META: Record<PlatformRole, PlatformRoleMeta> = {
  SUPER_ADMIN: {
    label: "Super administrateur",
    description:
      "Accès total à la plateforme : gestion des rôles plateforme, des utilisateurs, des tenants et de la configuration globale.",
    rank: 100,
  },
  SUPPORT: {
    label: "Support",
    description:
      "Accès en lecture aux utilisateurs et tenants, sans pouvoir modifier les rôles plateforme ni la configuration globale.",
    rank: 50,
  },
  USER: {
    label: "Utilisateur",
    description:
      "Rôle par défaut. Accès aux modules applicatifs selon les rôles tenant et application.",
    rank: 10,
  },
};

export function hasPlatformRole(
  current: PlatformRole | null | undefined,
  required: PlatformRole,
): boolean {
  if (!current) return false;
  return PLATFORM_ROLE_META[current].rank >= PLATFORM_ROLE_META[required].rank;
}

export function isSuperAdmin(
  current: PlatformRole | null | undefined,
): boolean {
  return current === "SUPER_ADMIN";
}