/*
path :           app/(public)/legal/privacy/page.tsx
tag :            ["legal", "privacy", "rgpd", "gdpr", "public", "page",
                  "route-group"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page publique de la Politique de Confidentialité
                 (RGPD). Accessible SANS authentification, conformément
                 à l'obligation légale (la politique doit être
                 consultable avant inscription). Hérite du layout
                 (public) : PublicHeader + PublicFooter, PAS de
                 sidebar, PAS de guard session. Contenu de démonstration
                 avec placeholders explicites ("À rédiger par un
                 juriste / DPO") : la structure est prête, le texte
                 définitif doit être rédigé par un professionnel.
                 Rendue côté serveur (Server Component pur), aucun
                 état, aucun appel DB.

flow :           PrivacyPage() → <article> → lien retour → header
                 (titre + version + date) → encart "À rédiger" →
                 sections statiques (Responsable, Données collectées,
                 Finalités, Base légale, Durées, Destinataires,
                 Transferts, Droits, Cookies, Contact DPO) → lien
                 vers /legal/terms.

ecosystem :      Legal = [
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                   "@/app/(public)/legal/terms/page.tsx",
                   "@/app/(public)/legal/privacy/page.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/PublicHeader.tsx",
                 ]
relatedFiles :   ["@/app/(public)/layout.tsx",
                  "@/app/(public)/legal/terms/page.tsx",
                  "@/components/layout/PublicFooter.tsx"]
imports :        ["react", "next/link", "lucide-react",
                  "@/components/ui/badge", "@/components/ui/card",
                  "@/components/ui/separator"]
exports :        ["default PrivacyPage", "metadata"]
useBy :          []

userStories :    ["*en tant que visiteur je veux lire la politique de confidentialité sans compte",
                  "*en tant que personne concernée je veux exercer mes droits RGPD",
                  "*en tant que juriste je veux un document structuré à remplir"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✘false
*/
import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Politique de confidentialité — Ultimate Base App",
  description:
    "Politique de confidentialité et traitement des données personnelles (RGPD) d'Ultimate Base App. Document public accessible sans inscription.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit gap-1.5">
          <Lock className="size-3" aria-hidden="true" />
          Document légal · RGPD
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-muted-foreground">
          Version 0.1 · En vigueur au 1ᵉʳ janvier 2026 · Dernière mise à jour :
          à définir
        </p>
      </header>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle
              className="size-4 text-amber-600"
              aria-hidden="true"
            />
            Contenu à rédiger par un juriste / DPO
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Cette page contient la <strong>structure</strong> de la politique
          de confidentialité, pas le texte définitif. Le RGPD impose des
          mentions précises (base légale, durées, destinataires, transferts).
          Faites rédiger le texte par un juriste ou un DPO avant mise en
          production. Un registre des traitements (article 30 RGPD) doit
          aussi être tenu en interne — ce n'est pas une page publique.
        </CardContent>
      </Card>

      <Separator />

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          1. Responsable du traitement
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Identité et coordonnées du responsable de
          traitement (la société éditrice), coordonnées du DPO si désigné,
          représentant dans l'UE si applicable.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          2. Données personnelles collectées
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Liste exhaustive des données collectées :
          email, nom, avatar, adresse IP, user-agent, logs de connexion,
          préférences, données métier saisies. Pour chaque donnée :
          caractère obligatoire ou facultatif, source (utilisateur,
          cookies, logs).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          3. Finalités du traitement
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Pourquoi chaque donnée est collectée :
          authentification, gestion de compte, facturation, support,
          analytics, sécurité, obligations légales. Une finalité = une
          base légale.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          4. Base légale
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Pour chaque finalité : exécution du contrat,
          consentement, intérêt légitime, obligation légale. Article 6 du
          RGPD.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          5. Durées de conservation
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Durée par catégorie : sessions (30 jours),
          logs (90 jours), comptes (jusqu'à suppression + 30 jours de
          grâce), facturation (10 ans, obligation légale), cookies
          (variable selon le type).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          6. Destinataires et sous-traitants
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Liste des sous-traitants : hébergeur (Vercel
          ou autre), envoi d'emails (Resend), paiement (Stripe), analytics
          (si applicable). Pour chacun : nom, rôle, pays, garanties
          (clauses contractuelles types, décision d'adéquation).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          7. Transferts hors UE
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Si des sous-traitants sont hors UE (Vercel
          US, Resend US…), mentionner les clauses contractuelles types
          (CCT) et/ou les mesures supplémentaires (chiffrement, etc.).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          8. Vos droits
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Droits d'accès, de rectification,
          d'effacement, de portabilité, d'opposition, de limitation, et
          droit de retirer le consentement. Modalités d'exercice : email,
          formulaire. Délai de réponse : 1 mois. Recours possible auprès de
          la CNIL.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">9. Cookies</h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Liste des cookies utilisés (nom, finalité,
          durée, caractère obligatoire ou soumis à consentement). Bannière
          cookies gérée séparément (composant, pas une page).
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight">
          10. Contact
        </h2>
        <p className="text-sm leading-7 text-muted-foreground">
          <em>[À rédiger]</em> Pour exercer vos droits ou poser une question
          sur vos données :{" "}
          <a
            href="mailto:privacy@ultimatebase.app"
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
          >
            <Mail className="size-3.5" aria-hidden="true" />
            privacy@ultimatebase.app
          </a>
          . Coordonnées du DPO si désigné.
        </p>
      </section>

      <Separator />

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
          Une fois le texte rédigé par un juriste / DPO : remplacez les{" "}
          <em>[À rédiger]</em> par le contenu définitif, supprimez l'encart
          ambre en haut, mettez à jour la date de dernière mise à jour, et
          tenez à jour le registre des traitements (article 30 RGPD) en
          interne. Voir aussi les{" "}
          <Link
            href="/legal/terms"
            className="underline underline-offset-4 hover:text-foreground"
          >
            CGU
          </Link>
          .
        </CardContent>
      </Card>
    </article>
  );
}