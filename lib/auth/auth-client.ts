/*
path :           lib/auth/auth-client.ts
tag :            ["auth", "better-auth", "client"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Client Better Auth côté navigateur. Expose authClient ainsi
                 que les hooks et méthodes signIn, signUp, signOut, useSession.
                 Utilisé par les pages login et register. Aucune logique
                 serveur : uniquement le SDK client.

flow :           createAuthClient({ baseURL }) → export authClient et méthodes.

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/lib/auth/auth.ts", "@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]
imports :        ["better-auth/react"]
exports :        ["authClient", "useSession", "signIn", "signUp", "signOut"]
useBy :          ["@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]

userStories :    ["*en tant qu'utilisateur je veux me connecter et m'inscrire depuis le navigateur"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { useSession, signIn, signUp, signOut } = authClient;