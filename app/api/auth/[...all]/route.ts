/*
path :           app/api/auth/[...all]/route.ts
tag :            ["auth", "better-auth", "route", "api"]
projectId :      <UltimateBaseApp>
type :           route
generic :        false

role :           Handler HTTP unique pour toutes les routes Better Auth
                 (/api/auth/*). Délègue GET et POST à auth.handler via
                 toNextJsHandler. Aucune logique métier : uniquement le
                 pont entre Better Auth et Next.js App Router.

flow :           GET/POST → toNextJsHandler(auth.handler).

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/lib/auth/auth.ts"]
imports :        ["@/lib/auth/auth", "better-auth/next-js"]
exports :        ["GET", "POST"]
useBy :          []

userStories :    ["*en tant que développeur je veux exposer les endpoints Better Auth"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);