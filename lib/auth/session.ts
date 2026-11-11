/*
path :           lib/auth/session.ts
tag :            ["auth", "session", "stub", "better-auth", "generic"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Point d'entrée UNIQUE pour la session utilisateur. Tant
                 que Better Auth n'est pas installé, expose un stub qui
                 retourne un utilisateur factice avec le rôle SUPER_ADMIN
                 (pour permettre de tester /superadmin immédiatement).
                 Une fois Better Auth installé, il suffit de remplacer
                 le corps de getSession() par auth.api.getSession() —
                 aucun autre fichier à modifier. Le helper
                 getCurrentPlatformRole() encapsule la lecture du rôle
                 pour que la sidebar et le manager n'aient jamais à
                 connaître le fournisseur d'auth.

flow:            getSession() → TODO BETTER AUTH : retourne un stub
                 { user: { id, email, name, platformRole } }.
                 getCurrentPlatformRole() → getSession() → retourne
                 session?.user.platformRole ?? DEFAULT_PLATFORM_ROLE.

ecosystem:       Auth = [
                   "@/lib/auth/session.ts",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role.ts",
                  "@/app/superadmin/page.tsx",
                  "@/app/superadmin/components/PlatformRoleManager.tsx",
                  "@/app/layout.tsx"]
imports:         ["@/modules/rbac/platform-role"]
exports:         ["getSession", "getCurrentPlatformRole",
                  "SessionUser", "Session"]
useBy:           ["@/app/layout.tsx",
                  "@/app/superadmin/page.tsx",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]

userStories:     ["*en tant que développeur je veux brancher Better Auth sans réécrire toute l'app",
                  "*en tant que développeur je veux tester /superadmin avant l'installation de Better Auth"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import {
  DEFAULT_PLATFORM_ROLE,
  type PlatformRole,
} from "@/modules/rbac/platform-role";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  platformRole: PlatformRole;
};

export type Session = {
  user: SessionUser;
} | null;

/**
 * TODO BETTER AUTH :
 * Remplacer le corps de cette fonction par :
 *
 *   import { auth } from "@/modules/auth/auth";
 *   export async function getSession(): Promise<Session> {
 *     const session = await auth.api.getSession({ headers: await headers() });
 *     if (!session) return null;
 *     return {
 *       user: {
 *         id: session.user.id,
 *         email: session.user.email,
 *         name: session.user.name,
 *         platformRole:
 *           (session.user.platformRole as PlatformRole | undefined) ??
 *           DEFAULT_PLATFORM_ROLE,
 *       },
 *     };
 *   }
 *
 * Aucun autre fichier du projet n'a besoin d'être modifié : tout passe
 * par getSession() et getCurrentPlatformRole().
 */
export async function getSession(): Promise<Session> {
  // ─── STUB — À SUPPRIMER APRÈS INSTALLATION DE BETTER AUTH ───
  return {
    user: {
      id: "stub-super-admin",
      email: "superadmin@local.dev",
      name: "Super Admin (stub)",
      platformRole: "SUPER_ADMIN",
    },
  };
}

export async function getCurrentPlatformRole(): Promise<PlatformRole> {
  const session = await getSession();
  return session?.user.platformRole ?? DEFAULT_PLATFORM_ROLE;
}