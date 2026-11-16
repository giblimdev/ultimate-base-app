/*
path :           lib/auth/auth.ts
tag :            ["auth", "better-auth", "server", "config"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Configuration serveur Better Auth. Active l'authentification
                 email/mot de passe et branche l'adaptateur Prisma sur l'instance
                 singleton de lib/db.ts. Utilisé par la route API et par le
                 helper de session. Aucun composant client ne l'importe.

flow :           betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }),
                 emailAndPassword: { enabled: true } }) → export auth.

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/lib/db.ts", "@/lib/auth/session.ts"]
imports :        ["better-auth", "better-auth/adapters/prisma", "@/lib/db"]
exports :        ["auth"]
useBy :          ["@/app/api/auth/[...all]/route.ts", "@/lib/auth/session.ts"]

userStories :    ["*en tant que développeur je veux activer l'authentification email/mot de passe"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});