/*
path :           app/(public)/legal/terms/page.tsx
tag :            ["legal", "terms", "cgu", "public", "page", "rgpd",
                  "route-group"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page publique des Conditions Générales d'Utilisation
                 (CGU). Accessible SANS authentification, conformément
                 à l'obligation légale (les CGU doivent être
                 consultables avant inscription). Hérite du layout
                 (public) : PublicHeader + PublicFooter, PAS de
                 sidebar, PAS de guard session. Contenu de démonstration
                 avec placeholders explicites ("À rédiger par un
                 juriste") : la structure est prête, le texte définitif
                 doit être rédigé par un professionnel du droit. Rendue
                 côté serveur (Server Component pur), aucun état,
                 aucun appel DB.

flow :           TermsPage() → <article> → lien retour → header
                 (titre + version + date) → encart "À rédiger" →
                 sections statiques (Éditeur, Objet, Compte,
                 Responsabilité, PI, Données, Droit applicable,
                 Modification) → encart final "Après rédaction".

ecosystem :      Legal = [
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                   "@/app/(public)/legal/terms/page.tsx",
                   "@/app/(public)/legal/privacy/page.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/PublicHeader.tsx",
                 ]
relatedFiles :   ["@/app/(public)/layout.tsx",
                  "@/app/(public)/legal/privacy/page.tsx",
                  "@/components/layout/PublicFooter.tsx"]
imports :        ["react", "next/link", "lucide-react",
                  "@/components/ui/badge", "@/components/ui/card",
                  "@/components/ui/separator"]
exports :        ["default TermsPage", "metadata"]
useBy :          []

userStories :    ["*en tant que visiteur je veux lire les CGU avant de m'inscrire",
                  "*en tant que juriste je veux un document structuré à remplir",
                  "*en tant que développeur je veux une page publique sans guard de session"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✘false
*/
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Conditions Générales d'Utilisation — Ultimate Base App",
  description:
    "Conditions Générales d'Utilisation d'Ultimate Base App. Document public accessible sans inscription.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      {/* Retour */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à l&apos;accueil
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit gap-1.5">
          <FileText className="size-3" aria-hidden="true" />
          Document légal
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-sm text-muted-foreground">
          Version 0.1 · En vigueur au 1ᵉʳ janvier 2026 · Dernière mise à jour :
          à définir
        </p>
      </header>

      {/* Encart à rédiger */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle
              className="size-4 text-amber-600"
              aria-hidden="true"
            />
            Contenu à rédiger par un juriste
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Cette page contient la <strong>structure</strong> des CGU, pas le
          texte définitif. Les sections ci-dessous sont des placeholders
          volontairement explicites. Avant toute mise en production avec des
          utilisateurs réels, faites rédiger le texte par un avocat ou un
          juriste spécialisé en droit du numérique (coût typique : 500 à 1500
          €). N'utilisez pas de générateur de CGU gratuit : les clauses de
          responsabilité et de propriété intellectuelle sont souvent inadaptées.
        </CardContent>
      </Card>

      <Separator />

      {/* Sections */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">1. Éditeur</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Raison sociale, forme juridique, capital social,
          SIRET, RCS, adresse du siège social, numéro de TVA intracommunautaire,
          directeur de la publication, contact.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          2. Objet du service
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Description du service Ultimate Base App,
          fonctionnalités principales, conditions d'accès, disponibilité cible
          (SLA si applicable), modalités de facturation si payant.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          3. Compte utilisateur
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Conditions de création de compte, exactitude des
          informations, confidentialité du mot de passe, responsabilité de
          l'utilisateur sur les activités de son compte, résiliation.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          4. Responsabilités
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Limitation de responsabilité de l'éditeur,
          disponibilité du service, sauvegardes, force majeure, obligations de
          l'utilisateur (usage conforme, pas d'usage illicite, pas de tentative
          d'intrusion).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          5. Propriété intellectuelle
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Qui possède quoi : le code et
          l&apos;infrastructure restent la propriété de l&apos;éditeur ; les
          données saisies par l'utilisateur restent sa propriété ; licence
          d&apos;utilisation accordée à l&apos;utilisateur.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          6. Données personnelles
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Renvoi vers la{" "}
          <Link
            href="/legal/privacy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            politique de confidentialité
          </Link>{" "}
          pour le détail des traitements, des durées de conservation et des
          droits RGPD.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          7. Droit applicable et juridiction
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Droit applicable (droit français), juridiction
          compétente, clause de médiation ou d'arbitrage si applicable,
          modalités de résolution amiable des litiges.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          8. Modification des CGU
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Modalités de modification des CGU, information
          préalable des utilisateurs, date d&apos;entrée en vigueur, droit de
          refus et résiliation en cas de modification substantielle.
        </p>
      </section>

      <Separator />

      {/* Encart final */}
      <Card className="border-emerald-500/25 bg-emerald-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <ShieldCheck
              className="size-4 text-emerald-600"
              aria-hidden="true"
            />
            Après rédaction
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Une fois le texte rédigé par un juriste : remplacez les{" "}
          <em>[À rédiger]</em> par le contenu définitif, supprimez l&apos;encart
          ambre en haut, mettez à jour la date de dernière mise à jour, et
          ajoutez une case à cocher « J&apos;accepte les CGU » à
          l&apos;inscription avec horodatage en base (table{" "}
          <code>UserConsent</code>).
        </CardContent>
      </Card>
    </article>
  );
}
