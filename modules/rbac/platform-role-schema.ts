/*
path :           modules/rbac/platform-role-schema.ts
tag :            ["rbac", "platform-role", "validation", "zod", "generic"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Schémas Zod pour la gestion des rôles plateforme.
                 Valide les entrées du PlatformRoleManager (changement
                 de rôle d'un utilisateur) et expose les types inférés
                 réutilisables par les Server Actions et le composant.
                 Aucune dépendance Better Auth : le schéma est agnostique
                 du fournisseur d'authentification.

flow:            updateUserPlatformRoleSchema → valide { userId,
                 platformRole } → safeParse dans l'action → retourne
                 les données typées ou les erreurs formatées.

ecosystem:       Rbac = [
                   "@/modules/rbac/platform-role.ts",
                   "@/modules/rbac/platform-role-schema.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/data/nav.ts",
                   "@/components/layout/AppSidebar.tsx",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]
imports:         ["zod", "@/modules/rbac/platform-role"]
exports:         ["updateUserPlatformRoleSchema",
                  "UpdateUserPlatformRoleInput",
                  "listPlatformUsersSchema",
                  "ListPlatformUsersInput"]
useBy:           ["@/app/superadmin/components/PlatformRoleManager.tsx"]

userStories:     ["*en tant que développeur je veux valider les entrées de gestion des rôles plateforme"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { z } from "zod";
import { PLATFORM_ROLES } from "@/modules/rbac/platform-role";

export const updateUserPlatformRoleSchema = z.object({
  userId: z.string().min(1, "L'identifiant utilisateur est requis."),
  platformRole: z.enum(PLATFORM_ROLES, {
    message: "Rôle plateforme invalide.",
  }),
});

export type UpdateUserPlatformRoleInput = z.infer<
  typeof updateUserPlatformRoleSchema
>;

export const listPlatformUsersSchema = z.object({
  search: z.string().trim().max(120).optional().default(""),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
});

export type ListPlatformUsersInput = z.infer<typeof listPlatformUsersSchema>;