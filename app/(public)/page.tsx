/*
path :           app/(public)/page.tsx
tag :            ["landing", "public", "home", "hero", "route-group",
                  "marketing", "cta", "root"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Landing page publique servie sur /. C'est la première
                 chose que voit un visiteur non connecté. Affiche un
                 hero (titre, sous-titre, deux CTA : Connexion et Voir
                 la feuille de route), les 4 modules du projet en cartes
                 compactes, un bandeau de confiance (liens CGU et
                 Confidentialité), et un CTA final. Layout (public) :
                 PublicHeader + PublicFooter, PAS de sidebar, PAS de
                 guard session. Server Component pur (aucun état, aucun
                 usePathname). Les liens "Connexion" mènent à /login
                 tant que Better Auth n'est pas branché.

flow :           PublicHomePage() → <main> max-w-6xl → hero (badge
                 + h1 + p + 2 boutons) → grille 4 modules (Cards
                 compactes avec lien "Explorer") → bandeau confiance
                 (CGU + Confidentialité) → CTA final.

ecosystem :      Legal = [
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                   "@/app/(public)/legal/terms/page.tsx",
                   "@/app/(public)/legal/privacy/page.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/PublicHeader.tsx",
                 ]
relatedFiles :   ["@/app/(public)/layout.tsx",
                  "@/app/(app)/home/page.tsx",
                  "@/components/layout/PublicHeader.tsx",
                  "@/components/layout/PublicFooter.tsx"]
imports :        ["react", "next/link", "lucide-react",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/card", "@/lib/utils"]
exports :        ["default PublicHomePage"]
useBy :          []

userStories :    ["*en tant que visiteur je veux comprendre ce qu'est Ultimate Base App en 10 secondes",
                  "*en tant que visiteur je veux accéder aux CGU et à la politique de confidentialité depuis la landing",
                  "*en tant que visiteur je veux un bouton clair pour me connecter",
                  "*en tant que visiteur non connecté je ne veux PAS être redirigé vers /home"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✘false
*/
import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Layers,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    code: "A",
    title: "App — Socle",
    description:
      "Auth Better Auth, Workspace multi-tenant, rôles plateforme, thème, i18n.",
    href: "/",
    gradient: "from-blue-500 to-cyan-500",
    icon: <ShieldCheck className="size-5" />,
  },
  {
    code: "B",
    title: "Scrum — Conception",
    description:
      "Items CRUD, Epic/Story/Sprint Managers, roadmap, documentation.",
    href: "/",
    gradient: "from-violet-500 to-fuchsia-500",
    icon: <ListChecks className="size-5" />,
  },
  {
    code: "C",
    title: "Genesis — Développement",
    description:
      "Create Files, Read Files, History, Header Checker, TS Checker, Git.",
    href: "/genesis",
    gradient: "from-emerald-500 to-teal-500",
    icon: <Wrench className="size-5" />,
  },
  {
    code: "D",
    title: "Business — Métier",
    description:
      "Pages métier, composants spécifiques, admin, configuration, déploiement.",
    href: "/business",
    gradient: "from-orange-500 to-rose-500",
    icon: <Briefcase className="size-5" />,
  },
] as const;

export default function PublicHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      {/* ── Hero ─────────────────────────────── */}
      <section className="flex flex-col items-center gap-6 text-center">
        <Badge
          variant="outline"
          className="gap-1.5 border-border bg-card text-muted-foreground"
        >
          <Sparkles className="size-3 text-violet-500" aria-hidden="true" />
          Plateforme de développement applicatif réutilisable
        </Badge>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Construisez votre{" "}
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
            produit métier
          </span>{" "}
          sans réinventer le socle
        </h1>

        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Ultimate Base App combine un socle technique prêt à l&apos;emploi
          (Auth, Workspace, RBAC, thème, i18n), un environnement de conception
          (Scrum), une boîte à outils de développement (Genesis) et un espace
          métier isolé (Business App). Vous vous concentrez sur votre métier.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href="/auth/login"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 gap-2 px-5",
            )}
          >
            Commencer
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 gap-2 px-5",
            )}
          >
            <Layers className="size-4" aria-hidden="true" />
            Voir la feuille de route
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
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
      </section>

      {/* ── Les 4 modules ────────────────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            4 modules, un seul socle
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Chaque module est indépendant et peut être activé/désactivé sans
            casser les autres.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((mod) => (
            <li key={mod.code}>
              <Card className="group h-full border-border/70 bg-card transition-shadow hover:shadow-md">
                <CardHeader className="gap-3">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                      mod.gradient,
                    )}
                    aria-hidden="true"
                  >
                    {mod.icon}
                  </span>
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm">
                      {mod.code}. {mod.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-5">
                      {mod.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Link
                    href={mod.href}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Explorer
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Bandeau de confiance ─────────────── */}
      <section className="rounded-2xl border border-border bg-card/60 px-4 py-6 sm:px-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-foreground">
              Vos données restent les vôtres
            </h2>
            <p className="max-w-xl text-xs leading-5 text-muted-foreground">
              Politique de confidentialité claire, export de vos données à la
              demande, suppression de compte en un clic (RGPD).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/legal/privacy"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-9 gap-1.5",
              )}
            >
              Confidentialité
            </Link>
            <Link
              href="/legal/terms"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-9",
              )}
            >
              CGU
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────── */}
      <section className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Prêt à démarrer ?
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre espace, ou explorez la feuille de
          route du projet.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 gap-2 px-5",
            )}
          >
            Se connecter
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/home"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 gap-2 px-5",
            )}
          >
            Feuille de route
          </Link>
        </div>
      </section>
    </main>
  );
}
