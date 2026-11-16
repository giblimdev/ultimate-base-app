/*
path :           lib/auth/auth.ts
tag :            ["auth", "better-auth", "server", "config", "baseurl"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Configuration serveur Better Auth. Active l'authentification
                 email/mot de passe, branche l'adaptateur Prisma sur le
                 singleton lib/db.ts, et fixe baseURL explicitement depuis
                 BETTER_AUTH_URL pour éviter l'avertissement « Base URL is
                 not set » et garantir que les callbacks/redirects pointent
                 vers la bonne origine.

flow :           betterAuth({ baseURL, database: prismaAdapter(prisma, {
                 provider: "postgresql" }), emailAndPassword: { enabled: true } })
                 → export auth.

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

userStories :    ["*en tant que développeur je veux activer l'authentification email/mot de passe",
                  "*en tant que développeur je veux une baseURL explicite pour les callbacks"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});