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

/*
export const { GET, POST } = toNextJsHandler(auth.handler);
*/

/**
 * path :           app/api/auth/[...all]/route.ts
 * tag :            ["auth", "better-auth", "route", "api", "logging", "debug"]
 * projectId :      <UltimateBaseApp>
 * type :           route
 * generic :        false
 *
 * role :
 *   Handler HTTP unique pour toutes les routes Better Auth.
 *   Instrumentation temporaire des requêtes pour diagnostiquer
 *   les problèmes d'authentification en environnement Vercel.
 *
 * flow :
 *   GET/POST → Logging → Better Auth → Logging réponse.
 *
 * security :
 *   - Aucun secret journalisé.
 *   - Aucun cookie journalisé.
 *   - Aucun token journalisé.
 *   - Aucun body de requête journalisé.
 *   - Aucun paramètre sensible journalisé.
 *
 * ecosystem :      Auth = [
 *   "@/app/api/auth/[...all]/route.ts",
 *   "@/lib/auth/auth.ts",
 *   "@/lib/auth/auth-client.ts",
 *   "@/lib/auth/session.ts",
 *   "@/lib/db.ts",
 * ]
 *
 * exports :        ["GET", "POST"]
 * status :         debug
 */

//import { auth } from "@/lib/auth/auth";
//import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";

// -----------------------------------------------------------------------------
// Better Auth handlers
// -----------------------------------------------------------------------------

const handlers = toNextJsHandler(auth.handler);

// -----------------------------------------------------------------------------
// Diagnostic serveur
// -----------------------------------------------------------------------------

type AuthMethod = "GET" | "POST";

async function handleAuthRequest(
  request: NextRequest,
  method: AuthMethod,
): Promise<Response> {
  const startedAt = Date.now();
  const pathname = request.nextUrl.pathname;

  console.info("[AUTH] Request received", {
    method,
    pathname,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasBetterAuthSecret: Boolean(process.env.BETTER_AUTH_SECRET),
    hasBetterAuthUrl: Boolean(process.env.BETTER_AUTH_URL),
  });

  try {
    const handler = method === "GET" ? handlers.GET : handlers.POST;

    const response = await handler(request);

    console.info("[AUTH] Request completed", {
      method,
      pathname,
      status: response.status,
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error: unknown) {
    console.error("[AUTH] Request failed", {
      method,
      pathname,
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : "UnknownError",
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

// -----------------------------------------------------------------------------
// HTTP exports
// -----------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<Response> {
  return handleAuthRequest(request, "GET");
}

export async function POST(request: NextRequest): Promise<Response> {
  return handleAuthRequest(request, "POST");
}
