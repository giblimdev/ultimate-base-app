/*
path :           lib/auth/session.ts
tag :            ["auth", "session", "server", "better-auth"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Point d'entrée unique pour lire la session côté serveur.
                 Remplace le stub précédent par auth.api.getSession().
                 Expose getSession() (session typée ou null) et
                 getCurrentPlatformRole() (rôle plateforme avec fallback).
                 Aucun composant ne doit importer auth directement pour
                 lire la session : tout passe par ce fichier.

flow :           getSession() → auth.api.getSession({ headers }) → Session | null.
                 getCurrentPlatformRole() → session?.user.platformRole ?? "USER".

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/lib/auth/auth.ts", "@/modules/rbac/platform-role.ts", "@/app/(app)/layout.tsx"]
imports :        ["next/headers", "@/lib/auth/auth", "@/modules/rbac/platform-role"]
exports :        ["getSession", "getCurrentPlatformRole", "Session", "SessionUser"]
useBy :          ["@/app/(app)/layout.tsx", "@/app/(app)/superadmin/page.tsx"]

userStories :    ["*en tant que développeur je veux lire la session réelle côté serveur",
                  "*en tant que développeur je veux brancher Better Auth sans réécrire l'app"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
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

export type Session = { user: SessionUser } | null;

export async function getSession(): Promise<Session> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      platformRole:
        ((session.user as { platformRole?: string }).platformRole as PlatformRole) ??
        DEFAULT_PLATFORM_ROLE,
    },
  };
}

export async function getCurrentPlatformRole(): Promise<PlatformRole> {
  const session = await getSession();
  return session?.user.platformRole ?? DEFAULT_PLATFORM_ROLE;
}