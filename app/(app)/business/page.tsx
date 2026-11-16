/*
path :           app/business/page.tsx
tag :            ["business", "onboarding", "scrum", "genesis", "github", "env", "config"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page d'accueil de l'espace métier (/business). Sert de point
                 d'entrée et de guide pour tout développeur qui arrive sur le
                 projet. Explique en cinq parties :
                 1) Scrum : outils de conception (items, managers, DnD, roadmap)
                 2) Genesis : outils de développement (files, prompts, checks, git)
                 3) Le dossier /business : ce qu'on y met (métier) et ce qu'on
                    n'y met pas (socle réutilisable)
                 4) GitHub : remote, branches, PR, protection
                 5) .env : variables, validation, environnements
                 Plus un encart final de rappels. Chaque bloc de code est copiable.
                 Page client (clipboard + motion).

flow:            BusinessPage() → Header → Section Scrum → Section Genesis →
                 Section /business (règles, arborescence, isolation, liens admin
                 et config) → Section GitHub → Section .env → Encart rappels.

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne PAS utiliser asChild (Radix) — buttonVariants sur <Link> uniquement.
  ✘ Ne PAS importer Github depuis lucide-react (supprimé en v1) — utiliser
     GithubIcon depuis @/components/icons/github-icon.
  ✘ Ne PAS mettre de logique métier produit dans cette page (elle est
     pédagogique, pas fonctionnelle).
  ✘ Ne PAS hardcoder de secrets dans les exemples .env (placeholders only).

AUTORISÉ :
  ✔ Ajouter une sous-section explicative (Card) dans l'une des 5 parties.
  ✔ Ajouter une commande copiable via <CopyBlock /> (git, gh, prisma, pnpm).
  ✔ Ajouter un lien vers /dev (référence commandes) et / (guide global).
  ✔ Modifier les exemples .env si une nouvelle variable est ajoutée au socle.

PIÈGES :
  ⚠ navigator.clipboard nécessite "use client" (déjà présent).
  ⚠ Ne pas mélanger explication métier et exemple de code métier réel —
     les exemples doivent rester génériques (restaurant/école/agence).
  ⚠ Les chemins dans l'arborescence /business doivent rester exacts.

CONVENTIONS PROJET :
  • Tokens shadcn uniquement (bg-card, text-muted-foreground, border-border).
  • Mobile first (grid-cols-1 md:grid-cols-2, text-sm sm:text-base).
  • En-tête Genesis obligatoire pour toute nouvelle page business.

ecosystem:       Business = [
                   "@/app/business/page.tsx",
                   "@/components/icons/github-icon.tsx",
                   "@/components/ui/badge.tsx",
                   "@/components/ui/button.tsx",
                   "@/components/ui/card.tsx",
                   "@/components/ui/separator.tsx",
                   "@/lib/utils.ts",
                 ]
relatedFiles:    ["@/app/dev/page.tsx",
                  "@/app/page.tsx",
                  "@/components/icons/github-icon.tsx",
                  "@/components/ui/card.tsx",
                  "@/lib/utils.ts"]
imports:         ["react", "next/link", "motion/react", "@/components/ui/card",
                  "@/components/ui/badge", "@/components/ui/separator",
                  "@/components/ui/button", "@/components/icons/github-icon",
                  "@/lib/utils", "sonner", "lucide-react"]
exports:         ["default BusinessPage"]
useBy:           []

userStories:     ["*en tant que développeur je veux comprendre Scrum, Genesis, le dossier business, GitHub et le .env avant de coder"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, MotionConfig, type Variants } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Briefcase,
  ListChecks,
  Wrench,
  GitBranch,
  KeyRound,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  Layers,
  Kanban,
  Calendar,
  Map,
  FolderOpen,
  FilePlus2,
  ScanLine,
  FileCode2,
  Rocket,
  ShieldCheck,
  Building2,
  Package,
  Database,
  Settings,
  Lock,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
type CopyBlockProps = {
  label: string;
  code: string;
  multiline?: boolean;
};

type InfoItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

/* ─────────────────────────────────────────────
   Variants Framer Motion
   ───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────
   Sous-composant : bloc copiable
   ───────────────────────────────────────────── */
function CopyBlock({ label, code, multiline }: CopyBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <pre
          className={cn(
            "overflow-x-auto rounded-lg border border-border/60 bg-muted/50 p-3 pr-12 font-mono text-xs text-foreground",
            multiline ? "whitespace-pre" : "whitespace-nowrap",
          )}
        >
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Copié" : "Copier"}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sous-composant : carte info
   ───────────────────────────────────────────── */
function InfoCard({ icon, title, description }: InfoItem) {
  return (
    <Card className="h-full border-border/60 bg-card/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
            {icon}
          </span>
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Sous-composant : section
   ───────────────────────────────────────────── */
type SectionProps = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
};

function Section({
  id,
  title,
  subtitle,
  icon,
  gradient,
  children,
}: SectionProps) {
  return (
    <section id={id} className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
          {icon}
        </span>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function BusinessPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
        {/* Décor */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/10" />
          <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-rose-400/20 blur-3xl dark:bg-rose-500/10" />
          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />
        </div>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* ── Header ─────────────────────────── */}
          <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="w-fit gap-1.5 bg-gradient-to-r from-orange-500/10 to-rose-500/10 ring-1 ring-border"
              >
                <Briefcase className="h-3 w-3 text-orange-500" />
                Espace métier · Business App
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Comprendre{" "}
              <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">
                Business App
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-base leading-7 text-muted-foreground"
            >
              Tout ce qui est spécifique au produit final vit dans{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                /business
              </code>
              . Cette page explique comment utiliser Scrum et Genesis, ce que
              contient le dossier métier, et comment configurer GitHub et le{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                .env
              </code>
              .
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2"
            >
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Guide global
              </Link>
              <Link
                href="/dev"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                )}
              >
                <FileCode2 className="mr-1 h-4 w-4" />
                Référence commandes
              </Link>
            </motion.div>
          </motion.header>

          {/* ── 1. Scrum ───────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                id="scrum"
                title="Scrum — Concevoir avant de coder"
                subtitle="Chaîne structurée de l'idée à la tâche exploitable."
                icon={<ListChecks className="h-5 w-5" />}
                gradient="from-violet-500 to-fuchsia-500"
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  Scrum sert à{" "}
                  <strong>
                    décrire le produit avant de l&apos;implémenter
                  </strong>
                  . On part d&apos;une idée, on la raffine en persona, feature,
                  epic, user story, puis en tâches concrètes réparties dans des
                  sprints. Tout est stocké en JSON, versionnable, et manipulable
                  via les trois managers en glisser-déposer.
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard
                    icon={<Sparkles className="h-4 w-4" />}
                    title="Items (CRUD)"
                    description="Ideas, Personas, Features, Epics, User Stories, Sprints, Tasks, Roadmap, Documentation."
                  />
                  <InfoCard
                    icon={<Layers className="h-4 w-4" />}
                    title="Epic Manager"
                    description="Orchestration des epics, priorisation, vue d'ensemble (DnD)."
                  />
                  <InfoCard
                    icon={<Kanban className="h-4 w-4" />}
                    title="User Story Manager"
                    description="Répartition des user stories dans les sprints (DnD)."
                  />
                  <InfoCard
                    icon={<Calendar className="h-4 w-4" />}
                    title="Sprint Manager"
                    description="Planification des sprints, capacité, avancement."
                  />
                  <InfoCard
                    icon={<Map className="h-4 w-4" />}
                    title="Roadmap"
                    description="Vue long terme : ce qui est fait, ce qui vient, ce qui est repoussé."
                  />
                  <InfoCard
                    icon={<Briefcase className="h-4 w-4" />}
                    title="Documentation"
                    description="Documentation vivante du projet, liée aux items Scrum."
                  />
                </div>

                <Card className="border-violet-200/60 bg-violet-50/40 dark:border-violet-900/60 dark:bg-violet-950/20">
                  <CardContent className="flex flex-col gap-2 pt-6 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Comment l&apos;utiliser
                    </p>
                    <ol className="flex list-decimal flex-col gap-1 pl-5">
                      <li>
                        Créer une idée (Ideas) et la qualifier (Personas,
                        Features).
                      </li>
                      <li>Découper en epics, puis en user stories.</li>
                      <li>
                        Répartir les stories dans un sprint (Sprint Manager).
                      </li>
                      <li>Découper chaque story en tâches (Tasks).</li>
                      <li>
                        Suivre l&apos;avancement global et ajuster la roadmap.
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── 2. Genesis ─────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                id="genesis"
                title="Genesis — Développer et contrôler la qualité"
                subtitle="Assistance au développement, CRUD fichiers, vérifications et Git."
                icon={<Wrench className="h-5 w-5" />}
                gradient="from-emerald-500 to-teal-500"
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  Genesis est la <strong>boîte à outils du développeur</strong>.
                  Elle lit et écrit à la racine du projet (ou dans un dossier
                  sélectionné), gère les fichiers, génère des prompts JSON,
                  vérifie les en-têtes, lance TypeScript, et pilote Git et la
                  CI/CD. C&apos;est l&apos;outil qu&apos;on ouvre au quotidien.
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard
                    icon={<FolderOpen className="h-4 w-4" />}
                    title="File Selector"
                    description="Lire/écrire à la racine (dossier par défaut ou sélectionné)."
                  />
                  <InfoCard
                    icon={<FilePlus2 className="h-4 w-4" />}
                    title="File Creator / CRUD"
                    description="Créer, lire, modifier, supprimer des fichiers."
                  />
                  <InfoCard
                    icon={<Copy className="h-4 w-4" />}
                    title="Prompt Assist"
                    description="Créer, sélectionner et copier des prompts JSON."
                  />
                  <InfoCard
                    icon={<ScanLine className="h-4 w-4" />}
                    title="Header Checker"
                    description="Vérifie que chaque script a son en-tête Genesis complet."
                  />
                  <InfoCard
                    icon={<FileCode2 className="h-4 w-4" />}
                    title="TypeScript Checker"
                    description="Exécute npx tsc --noEmit et parse les erreurs."
                  />
                  <InfoCard
                    icon={<GitBranch className="h-4 w-4" />}
                    title="Git Manager"
                    description="status, add, commit, push depuis l'interface."
                  />
                  <InfoCard
                    icon={<Rocket className="h-4 w-4" />}
                    title="CI/CD Manager"
                    description="Aide à la configuration et au suivi des pipelines."
                  />
                </div>

                <Card className="border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                  <CardContent className="flex flex-col gap-2 pt-6 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Règle d&apos;or Genesis
                    </p>
                    <p>
                      Tout script produit dans le projet porte un en-tête{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs"></code>{" "}
                      complet (path, tag, projectId, type, role, flow,
                      ecosystem, imports, exports, useBy, userStories, status,
                      checked). Le Header Checker vérifie cette règle avant
                      commit.
                    </p>
                  </CardContent>
                </Card>
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── 3. Dossier /business ───────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                id="business"
                title="Le dossier /business — ce qui est métier"
                subtitle="Tout ce qui est spécifique au produit final, isolé du socle."
                icon={<Building2 className="h-5 w-5" />}
                gradient="from-orange-500 to-rose-500"
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  Le dossier{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    /business
                  </code>{" "}
                  contient <strong>uniquement</strong> ce qui est propre au
                  produit final : pages métier, composants spécifiques, modèles
                  de données métier, services, définition du tenant (restaurant,
                  école, agence…), et les interfaces d&apos;administration
                  métier. Il ne dépend d&apos;aucun composant du socle au-delà
                  des primitives UI.
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InfoCard
                    icon={<Briefcase className="h-4 w-4" />}
                    title="Pages métier"
                    description="Les écrans propres au produit (dashboard, formulaires, listes)."
                  />
                  <InfoCard
                    icon={<Package className="h-4 w-4" />}
                    title="Composants spécifiques"
                    description="Composants métier réutilisables dans le produit, pas dans le socle."
                  />
                  <InfoCard
                    icon={<Database className="h-4 w-4" />}
                    title="Modèles & services"
                    description="Schémas, requêtes, services métier, bibliothèques propres."
                  />
                  <InfoCard
                    icon={<Building2 className="h-4 w-4" />}
                    title="Définition du tenant"
                    description="Type de tenant, données, réglages propres au métier."
                  />
                  <InfoCard
                    icon={<Settings className="h-4 w-4" />}
                    title="/business — configuration"
                    description="Nettoyage démo, réinit DB, init données métier, Git, env, prod."
                  />
                  <InfoCard
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="/business/admin"
                    description="Rôles et permissions propres à l'application (appRole)."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/business/admin"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Administration métier
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <Link
                    href="/business/config"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Configuration
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Card className="border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-600" />À mettre
                        dans /business
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <p>• Pages et composants du produit final</p>
                      <p>• Modèles et services métier</p>
                      <p>• Définition du tenant (restaurant, école, agence…)</p>
                      <p>• Rôles et permissions propres à l&apos;application</p>
                      <p>• Données de démonstration et seed métier</p>
                    </CardContent>
                  </Card>

                  <Card className="border-rose-200/60 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4 text-rose-600" />À ne PAS
                        mettre dans /business
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <p>• Auth, RBAC, tenant, i18n, thème (→ socle)</p>
                      <p>• Composants UI réutilisables (→ components/ui)</p>
                      <p>• Outils Scrum et Genesis (→ modules dédiés)</p>
                      <p>• Helpers transverses (→ lib/)</p>
                      <p>
                        • Logique métier dans les composants de présentation
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <CopyBlock
                  label="Arborescence cible"
                  multiline
                  code={`app/
  business/
    layout.tsx          # layout métier (nav produit)
    page.tsx            # cette page (onboarding)
    admin/              # rôles & permissions app
    config/page.tsx     # nettoyage démo, reset DB, Git, env, prod
    <pages métier>/     # dashboard, formulaires, listes…
modules/
  business/
    config.ts           # définition métier du tenant
    models.ts           # modèles de données métier
    admin.ts            # logique admin métier
    services/           # services métier
components/
  business/             # composants spécifiques au produit`}
                />
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── 4. GitHub ──────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                id="github"
                title="Configurer GitHub"
                subtitle="Remote, branches, Pull Requests et protection."
                icon={<GithubIcon size={20} />}
                gradient="from-zinc-700 to-zinc-900"
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  Le dépôt distant est la source de vérité. On initialise Git en
                  local, on crée le repo GitHub, on connecte le remote, puis on
                  travaille par branches avec Pull Requests. La branche{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    main
                  </code>{" "}
                  doit être protégée.
                </p>

                <div className="flex flex-col gap-3">
                  <CopyBlock
                    label="1. Initialiser Git en local"
                    code={`git init
git add .
git commit -m "chore: initial commit"`}
                    multiline
                  />
                  <CopyBlock
                    label="2. Créer le repo distant et connecter le remote"
                    code={`gh auth login
gh repo create ultimate-base-app --private --source=. --remote=origin --push`}
                    multiline
                  />
                  <CopyBlock
                    label="3. Vérifier le remote"
                    code="git remote -v"
                  />
                  <CopyBlock
                    label="4. Workflow par branche + Pull Request"
                    code={`git checkout -b feat/ma-fonctionnalite
# … coder …
git add .
git commit -m "feat: ma fonctionnalité"
git push -u origin feat/ma-fonctionnalite
gh pr create --fill`}
                    multiline
                  />
                  <CopyBlock
                    label="5. Protéger main (via l'UI GitHub)"
                    code={`Settings → Branches → Add branch protection rule
Branch name pattern: main
✔ Require a pull request before merging
✔ Require status checks to pass (CI)
✔ Require linear history`}
                    multiline
                  />
                </div>

                <Card className="border-zinc-300/60 bg-zinc-50/60 dark:border-zinc-800/60 dark:bg-zinc-950/30">
                  <CardContent className="flex flex-col gap-2 pt-6 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Conventions de branches
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        main
                      </code>{" "}
                      → production ·{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        feat/*
                      </code>{" "}
                      → fonctionnalité ·{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        fix/*
                      </code>{" "}
                      → correction ·{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        chore/*
                      </code>{" "}
                      → maintenance. Messages de commit en{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        type: description
                      </code>{" "}
                      (feat, fix, chore, docs, refactor, test).
                    </p>
                  </CardContent>
                </Card>
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── 5. .env ────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                id="env"
                title="Configurer le .env"
                subtitle="Variables d'environnement, validation et environnements."
                icon={<KeyRound className="h-5 w-5" />}
                gradient="from-blue-500 to-cyan-500"
              >
                <p className="text-sm leading-6 text-muted-foreground">
                  Le{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    .env
                  </code>{" "}
                  n&apos;est jamais commité. On versionne uniquement{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    .env.example
                  </code>{" "}
                  avec des placeholders. Les variables sont validées au
                  démarrage par{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    lib/env.ts
                  </code>{" "}
                  (Zod / @t3-oss/env-nextjs) : si une variable manque, le build
                  échoue immédiatement.
                </p>

                <CopyBlock
                  label=".env.example (à versionner)"
                  multiline
                  code={`# ── Base de données (Prisma 7 + PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/ultimate_base?schema=public"

# ── Better Auth
BETTER_AUTH_SECRET="changer-moi-en-32-caracteres-minimum"
BETTER_AUTH_URL="http://localhost:3000"

# ── Resend (emails d'authentification)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# ── Multi-tenant
NEXT_PUBLIC_TENANT_MODE="single"   # single | multi
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── i18n
NEXT_PUBLIC_DEFAULT_LOCALE="fr"`}
                />

                <CopyBlock
                  label="Créer votre .env local"
                  code="cp .env.example .env"
                />

                <CopyBlock
                  label="Validation (lib/env.ts)"
                  multiline
                  code={`import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    RESEND_API_KEY: z.string().startsWith("re_"),
  },
  client: {
    NEXT_PUBLIC_TENANT_MODE: z.enum(["single", "multi"]),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_TENANT_MODE: process.env.NEXT_PUBLIC_TENANT_MODE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});`}
                />

                <Card className="border-amber-300/60 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Règles .env
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>
                      • Ne jamais commiter le .env (présent dans .gitignore).
                    </p>
                    <p>• Utiliser des secrets différents par environnement.</p>
                    <p>
                      • Sur Vercel : Settings → Environment Variables
                      (Production, Preview, Development).
                    </p>
                    <p>
                      • Toute nouvelle variable doit être ajoutée à .env.example
                      ET à lib/env.ts.
                    </p>
                  </CardContent>
                </Card>
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── Encart final ───────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Card className="border-orange-300/60 bg-gradient-to-br from-orange-50/60 to-rose-50/60 dark:border-orange-900/60 dark:from-orange-950/20 dark:to-rose-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-orange-600" />
                    Règles à retenir
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>
                    • <strong>Scrum</strong> : concevoir avant de coder (idée →
                    tâche).
                  </p>
                  <p>
                    • <strong>Genesis</strong> : outiller le développement
                    (fichiers, checks, Git).
                  </p>
                  <p>
                    • <strong>/business</strong> : uniquement le métier du
                    produit final.
                  </p>
                  <p>
                    • <strong>GitHub</strong> : main protégée, branches
                    feat/fix/chore, PR obligatoire.
                  </p>
                  <p>
                    • <strong>.env</strong> : jamais commité, validé par
                    lib/env.ts, documenté dans .env.example.
                  </p>
                  <p>
                    • <strong>Base UI</strong> : pas de asChild, utiliser
                    buttonVariants sur &lt;Link&gt;.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
