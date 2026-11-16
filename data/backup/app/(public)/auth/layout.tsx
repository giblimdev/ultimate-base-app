/*
path :           app/(public)/auth/layout.tsx
tag :            ["auth", "layout", "public", "centered", "card", "ux"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout dédié aux pages d'authentification (/auth/login,
                 /auth/register). Centre une carte sur fond dégradé subtil,
                 ajoute un en-tête de marque (logo + nom) et un pied de
                 page minimal (CGU / Confidentialité). Ne monte PAS le
                 PublicHeader ni le PublicFooter complets : ces pages
                 doivent rester focalisées sur le formulaire. Espace en
                 haut (pt-16 sm:pt-24) pour éviter l'effet « collé au
                 bord » signalé.

flow :           AuthLayout({ children }) → <div> min-h-screen → décor
                 (blobs) → <main> max-w-md → header marque → {children}
                 → footer liens légaux.

ecosystem :      Auth = [
                   "@/app/(public)/auth/layout.tsx",
                   "@/app/(public)/auth/login/page.tsx",
                   "@/app/(public)/auth/register/page.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/layout.tsx", "@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]
imports :        ["react", "next/link", "lucide-react"]
exports :        ["default AuthLayout"]
useBy :          ["@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]

userStories :    ["*en tant qu'utilisateur je veux une page d'inscription lisible, centrée et aérée",
                  "*en tant qu'utilisateur je veux retrouver les liens légaux depuis l'inscription"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Décor subtil */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 pt-16 pb-10 sm:pt-24">
        {/* Marque */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-accent/40"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-sm">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            Ultimate Base App
          </Link>
        </div>

        {/* Carte */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {/* Pied de page légal */}
        <p className="text-center text-xs text-muted-foreground">
          En continuant, vous acceptez les{" "}
          <Link
            href="/legal/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            CGU
          </Link>{" "}
          et la{" "}
          <Link
            href="/legal/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </main>
    </div>
  );
}