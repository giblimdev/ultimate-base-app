/*
path :           app/(public)/auth/layout.tsx
tag :            ["auth", "layout", "public", "centered", "card", "ux", "color"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout dédié aux pages d'authentification. Carte centrée
                 sur fond dégradé coloré (bleu → violet → émeraude), en-tête
                 de marque avec logo gradient, footer légal. Espace en haut
                 (pt-16 sm:pt-24) et en bas (pb-10). Le footer inclut un
                 lien « Déjà un compte / Créer un compte » géré par la page
                 elle-même via un slot visuel en bas de carte (séparateur).

flow :           AuthLayout({ children }) → décor → <main> max-w-md →
                 header marque → <div> carte (children) → footer légal.

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

userStories :    ["*en tant qu'utilisateur je veux une page d'authentification lisible, centrée, colorée et professionnelle"]
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
      {/* Décor coloré */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute top-1/3 -right-40 h-[28rem] w-[28rem] rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute -bottom-40 left-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.zinc.200/20)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.200/20)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:bg-[linear-gradient(to_right,theme(colors.zinc.800/20)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.800/20)_1px,transparent_1px)]" />
      </div>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 pt-16 pb-10 sm:pt-24">
        {/* Marque */}
        <div className="flex flex-col items-center gap-3 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:bg-accent/40"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 text-white shadow-md">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            Ultimate Base App
          </Link>
          <p className="max-w-xs text-xs text-muted-foreground">
            Plateforme de développement applicatif réutilisable.
          </p>
        </div>

        {/* Carte */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg ring-1 ring-foreground/5">
          {children}
        </div>

        {/* Footer légal */}
        <p className="text-center text-xs text-muted-foreground">
          En continuant, vous acceptez les{" "}
          <Link
            href="/legal/terms"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            CGU
          </Link>{" "}
          et la{" "}
          <Link
            href="/legal/privacy"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </main>
    </div>
  );
}