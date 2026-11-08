/*
path :           app/page.tsx
tag :            ["guide-dev", "dashboard", "roadmap", "socle", "motion"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page d'accueil / guide de développement animée. Affiche la feuille
                 de route complète du projet Ultimate Base App : les 4 modules
                 (A. App socle, B. Scrum, C. Genesis, D. Business App), leurs
                 fonctionnalités, l'ordre de développement en 10 étapes, et les
                 informations techniques. Utilise Framer Motion (package "motion")
                 pour les animations d'entrée, de survol et de progression.
                 Les liens de navigation utilisent buttonVariants sur <Link>
                 (pas de render/nativeButton Base UI).

flow:            Home() → MotionConfig (reducedMotion) → header animé →
                 carte de progression globale (barre animée) → grille des 4 modules
                 (cards animées au scroll) → timeline des 10 étapes (stagger) →
                 grille infos techniques → ferme MotionConfig.

ecosystem:       GuideDev = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/app/page.tsx",
                   "@/components/ui/badge.tsx",
                   "@/components/ui/button.tsx",
                   "@/components/ui/card.tsx",
                   "@/components/ui/progress.tsx",
                   "@/lib/utils.ts",
                 ]
relatedFiles:    ["@/app/layout.tsx",
                  "@/components/ui/card.tsx",
                  "@/components/ui/badge.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/progress.tsx",
                  "@/lib/utils.ts"]
imports:         ["next/link", "motion/react", "@/components/ui/card",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/progress", "@/lib/utils", "lucide-react"]
exports:         ["default Home"]
useBy:           []

userStories:     ["*en tant que développeur je veux une page qui me guide dans le développement du projet"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

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
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Layers,
  ListChecks,
  Wrench,
  Briefcase,
  ArrowRight,
  Database,
  ShieldCheck,
  Building2,
  Globe,
  Palette,
  Users,
  UserCog,
  Settings,
  Lightbulb,
  Target,
  Package,
  BookOpen,
  Calendar,
  CheckSquare,
  Map,
  FileText,
  Kanban,
  FolderOpen,
  FilePlus2,
  Copy,
  ScanLine,
  GitBranch,
  Rocket,
  Terminal,
  FileCode2,
  Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types locaux
   ───────────────────────────────────────────── */
type ModuleItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Module = {
  id: string;
  code: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
  ring: string;
  iconColor: string;
  items: ModuleItem[];
};

type Step = {
  n: number;
  title: string;
  description: string;
  details: string[];
  href?: string;
  progress: number;
};

/* ─────────────────────────────────────────────
   Variants Framer Motion
   ───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardHover = {
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" as const },
};

/* ─────────────────────────────────────────────
   Données : les 4 modules
   ───────────────────────────────────────────── */
const MODULES: Module[] = [
  {
    id: "app",
    code: "A",
    title: "App — Socle applicatif",
    description:
      "Fonctionnalités communes à toutes les applications créées à partir du socle.",
    href: "/app",
    gradient: "from-blue-500 to-cyan-500",
    ring: "ring-blue-200 dark:ring-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400",
    items: [
      {
        title: "Internationalisation",
        description: "Sélection de langue et préférences utilisateur.",
        icon: <Globe className="h-4 w-4" />,
      },
      {
        title: "Navigation utilisateur",
        description: "Menu, profil, paramètres personnels.",
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: "Gestion des thèmes",
        description: "Système, clair, sombre, thèmes personnalisés.",
        icon: <Palette className="h-4 w-4" />,
      },
      {
        title: "Authentification (Better Auth)",
        description:
          "Sessions, connexion, inscription, récupération. Seul Better Auth touche la DB.",
        icon: <ShieldCheck className="h-4 w-4" />,
      },
      {
        title: "Gestion multi-tenant",
        description:
          "Résolution (sous-domaine, chemin, session), membres, invitations, isolation tenantId.",
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        title: "RBAC à trois niveaux",
        description:
          "Rôles plateforme, rôles tenant, rôles application (appRole via /app/admin).",
        icon: <UserCog className="h-4 w-4" />,
      },
      {
        title: "Profil utilisateur",
        description: "Infos personnelles, avatar, préférences.",
        icon: <Settings className="h-4 w-4" />,
      },
      {
        title: "Config Maker",
        description:
          "Theme Creator, Platform Role Manager, Permission Manager, Language Manager, Tenant Manager.",
        icon: <Wrench className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "scrum",
    code: "B",
    title: "Scrum — Outils de conception",
    description: "Chaîne structurée de l'idée à la tâche exploitable, en JSON.",
    href: "/scrum",
    gradient: "from-violet-500 to-fuchsia-500",
    ring: "ring-violet-200 dark:ring-violet-900",
    iconColor: "text-violet-600 dark:text-violet-400",
    items: [
      {
        title: "Items (CRUD)",
        description:
          "Ideas, Personas, Features, Epics, User Stories, Sprints, Tasks, Roadmap, Documentation.",
        icon: <ListChecks className="h-4 w-4" />,
      },
      {
        title: "Epic Manager",
        description: "Orchestration et vue d'ensemble des epics (DnD).",
        icon: <Layers className="h-4 w-4" />,
      },
      {
        title: "User Story Manager",
        description: "Orchestration des user stories (DnD).",
        icon: <Kanban className="h-4 w-4" />,
      },
      {
        title: "Sprint Manager",
        description: "Orchestration des sprints (DnD).",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        title: "Roadmap",
        description: "Vue roadmap du projet.",
        icon: <Map className="h-4 w-4" />,
      },
      {
        title: "Documentation",
        description: "Documentation projet.",
        icon: <BookOpen className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "genesis",
    code: "C",
    title: "Genesis — Outils de développement",
    description: "Assistance au développement et contrôle qualité.",
    href: "/genesis",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    items: [
      {
        title: "File Selector",
        description: "Lire/écrire à la racine (dossier sélectionnable).",
        icon: <FolderOpen className="h-4 w-4" />,
      },
      {
        title: "File Creator / CRUD",
        description: "Création et CRUD de fichiers.",
        icon: <FilePlus2 className="h-4 w-4" />,
      },
      {
        title: "Prompt Assist",
        description: "Créer, sélectionner et copier des prompts JSON.",
        icon: <Copy className="h-4 w-4" />,
      },
      {
        title: "Header Checker",
        description: "Vérification des en-têtes de fichiers.",
        icon: <ScanLine className="h-4 w-4" />,
      },
      {
        title: "TypeScript Checker",
        description: "Exécution npx tsc --noEmit et parsing des erreurs.",
        icon: <FileCode2 className="h-4 w-4" />,
      },
      {
        title: "CI/CD Manager",
        description: "Aide et gestion CI/CD.",
        icon: <Rocket className="h-4 w-4" />,
      },
      {
        title: "Git Manager",
        description: "Opérations Git (status, add, commit, push).",
        icon: <GitBranch className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "business",
    code: "D",
    title: "Business App — Espace métier",
    description: "Tout ce qui est spécifique au produit final.",
    href: "/business",
    gradient: "from-orange-500 to-rose-500",
    ring: "ring-orange-200 dark:ring-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400",
    items: [
      {
        title: "Pages métier",
        description: "Pages spécifiques au produit final.",
        icon: <Briefcase className="h-4 w-4" />,
      },
      {
        title: "Composants spécifiques",
        description: "Composants métier isolés du socle.",
        icon: <Package className="h-4 w-4" />,
      },
      {
        title: "Modèles & services",
        description: "Bibliothèques, fonctions, modèles de données métier.",
        icon: <Database className="h-4 w-4" />,
      },
      {
        title: "Définition métier du tenant",
        description: "Restaurant, école, agence… données et réglages propres.",
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        title: "/business — configuration",
        description:
          "Nettoyage démo, réinit DB, init données métier, Git, env, mise en production.",
        icon: <Settings className="h-4 w-4" />,
      },
      {
        title: "/business/admin",
        description:
          "Rôles et permissions propres à l'application (indépendants des rôles plateforme).",
        icon: <UserCog className="h-4 w-4" />,
      },
    ],
  },
];

/* ─────────────────────────────────────────────
   Données : ordre de développement
   ───────────────────────────────────────────── */
const STEPS: Step[] = [
  {
    n: 1,
    title: "Environnement & validation",
    description:
      "Configurer les variables d'environnement et la validation Zod.",
    details: [
      "Créer .env.example puis .env (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY).",
      "Créer lib/env.ts avec @t3-oss/env-nextjs (ou Zod) pour valider les variables.",
      "Vérifier que npx tsc --noEmit passe.",
    ],
    href: "/lib/env.ts",
    progress: 0,
  },
  {
    n: 2,
    title: "Base de données & Better Auth",
    description:
      "Schéma Prisma, adaptateur Prisma 7, config Better Auth, route API.",
    details: [
      "Installer @better-auth/prisma-adapter.",
      "Configurer prisma/schema.prisma (User, Session, Account, Verification).",
      "Créer prisma.config.ts avec l'adaptateur @prisma/adapter-pg.",
      "Créer lib/db.ts (PrismaClient + adaptateur) — importé UNIQUEMENT par auth.ts.",
      "Créer modules/auth/auth.ts, auth-client.ts, session.ts.",
      "Créer app/api/auth/[...all]/route.ts.",
    ],
    href: "/modules/auth/auth.ts",
    progress: 0,
  },
  {
    n: 3,
    title: "Résolution du tenant",
    description:
      "Middleware, résolution sous-domaine/chemin/session, isolation tenantId.",
    details: [
      "Créer middleware.ts à la racine du projet.",
      "Créer modules/tenant/resolver.ts, context.tsx, membership.ts, isolation.ts, single-mode.ts.",
      "Injecter tenantId dans toutes les requêtes métier.",
    ],
    href: "/modules/tenant/resolver.ts",
    progress: 0,
  },
  {
    n: 4,
    title: "RBAC à trois niveaux",
    description:
      "Rôles plateforme, rôles tenant, rôles application + gardes serveur.",
    details: [
      "Créer modules/rbac/platform-role.ts, tenant-role.ts, app-role.ts.",
      "Créer permissions.ts et guards.ts (requireRole, can).",
      "Créer hooks/use-permissions.ts pour la vérification côté client.",
    ],
    href: "/modules/rbac/guards.ts",
    progress: 0,
  },
  {
    n: 5,
    title: "Thème & internationalisation",
    description:
      "Providers next-themes et next-intl branchés dans le layout racine.",
    details: [
      "Créer modules/theme/provider.tsx, themes.ts, theme-creator.tsx.",
      "Créer modules/i18n/config.ts, provider.tsx, loader.ts.",
      "Configurer next.config.ts avec createNextIntlPlugin().",
      "Créer i18n/request.ts.",
      "Brancher ThemeProvider + NextIntlClientProvider dans app/layout.tsx.",
      "Créer components/layout/theme-switcher.tsx et language-switcher.tsx.",
    ],
    href: "/modules/i18n/provider.tsx",
    progress: 0,
  },
  {
    n: 6,
    title: "Layout (app) & profil",
    description: "Navigation utilisateur, profil, paramètres personnels.",
    details: [
      "Créer app/(app)/layout.tsx avec nav, sidebar, profil.",
      "Créer app/(app)/dashboard/page.tsx, profile/page.tsx, settings/page.tsx.",
      "Créer components/layout/app-nav.tsx et sidebar.tsx.",
      "Créer modules/profile/service.ts et schema.ts.",
    ],
    href: "/app/(app)/layout.tsx",
    progress: 0,
  },
  {
    n: 7,
    title: "Config Maker (/app/admin)",
    description: "Les 6 outils d'administration intégrés au socle.",
    details: [
      "Créer app/(app)/admin/layout.tsx (garde rôle plateforme).",
      "Créer les pages : themes, platform-roles, permissions, languages, tenants.",
      "Brancher chaque page sur son module (theme, rbac, i18n, tenant).",
    ],
    href: "/app/(app)/admin/page.tsx",
    progress: 0,
  },
  {
    n: 8,
    title: "Scrum — items & managers",
    description: "CRUD des 9 types d'items + 3 managers DnD + avancement.",
    details: [
      "Créer modules/scrum/types.ts, schema.ts, service.ts.",
      "Créer modules/scrum/managers/epic-manager.ts, story-manager.ts, sprint-manager.ts.",
      "Créer modules/scrum/progress.ts.",
      "Créer app/(scrum)/layout.tsx et les pages items.",
      "Créer app/(scrum)/*/manager/page.tsx pour les 3 managers (DnD).",
      "Créer components/scrum/kanban-board.tsx, item-card.tsx, progress-bar.tsx.",
      "Brancher les pages d'entrée dans lib/data/nav.ts.",
    ],
    href: "/app/(scrum)/page.tsx",
    progress: 0,
  },
  {
    n: 9,
    title: "Genesis — outils dev",
    description:
      "File Selector, File Creator, Prompt Assist, Header Checker, TS Checker, CI/CD, Git.",
    details: [
      "Créer modules/genesis/fs.ts, file-crud.ts, prompts.ts, header-checker.ts, ts-checker.ts, git.ts, cicd.ts.",
      "Créer app/(genesis)/layout.tsx et les pages.",
      "Créer components/genesis/file-selector.tsx, file-creator.tsx, prompt-editor.tsx.",
      "Créer app/api/genesis/files/route.ts et git/route.ts.",
    ],
    href: "/app/(genesis)/page.tsx",
    progress: 0,
  },
  {
    n: 10,
    title: "Business App",
    description:
      "Espace métier isolé : pages, composants, modèles, admin, /business config.",
    details: [
      "Créer app/business/layout.tsx, page.tsx.",
      "Créer modules/business/config.ts, models.ts, admin.ts, services/.",
      "Créer app/business/admin/ (rôles app) et app/business/config/page.tsx.",
      "Définir le tenant métier (restaurant, école, agence…).",
    ],
    href: "/app/business/page.tsx",
    progress: 0,
  },
];

/* ─────────────────────────────────────────────
   Composant
   ───────────────────────────────────────────── */
export default function Home() {
  const totalSteps = STEPS.length;
  const doneSteps = STEPS.filter((s) => s.progress === 100).length;
  const globalProgress = Math.round((doneSteps / totalSteps) * 100);

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
        {/* Décor de fond : blobs colorés + grille */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,theme(colors.zinc.200/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.200/30)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] dark:bg-[linear-gradient(to_right,theme(colors.zinc.800/30)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.zinc.800/30)_1px,transparent_1px)]" />
        </div>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* ── Header ─────────────────────────────── */}
          <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="w-fit gap-1.5 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-emerald-500/10 text-foreground ring-1 ring-border"
              >
                <Sparkles className="h-3 w-3 text-violet-500" />
                Guide de développement · Ultimate Base App
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
            >
              Feuille de route{" "}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                du projet
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-base leading-7 text-muted-foreground"
            >
              Plateforme de développement applicatif réutilisable : un socle
              technique prêt à l&apos;emploi, un environnement de conception
              (Scrum), une boîte à outils de développement et de qualité
              (Genesis), et un espace métier isolé du socle (Business App).
            </motion.p>
          </motion.header>

          {/* ── Progression globale ────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                    <Target className="h-4 w-4" />
                  </span>
                  Avancement global
                </CardTitle>
                <CardDescription>
                  {doneSteps} / {totalSteps} étapes terminées
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  style={{ originX: 0 }}
                >
                  <Progress value={globalProgress} className="h-3" />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground">
                  {globalProgress}% du projet
                </span>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Les 4 modules ──────────────────────── */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Les 4 modules
              </h2>
              <p className="text-sm text-muted-foreground">
                Chaque module est indépendant et peut être activé/désactivé sans
                casser les autres.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {MODULES.map((mod) => (
                <motion.div key={mod.id} variants={itemVariants}>
                  <motion.div whileHover={cardHover} className="h-full">
                    <Card
                      className={`group relative h-full overflow-hidden border-border/60 bg-card/70 backdrop-blur-sm transition-shadow hover:shadow-xl hover:ring-2 ${mod.ring}`}
                    >
                      <div
                        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.gradient}`}
                      />
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${mod.gradient} text-sm font-bold text-white shadow-md`}
                          >
                            {mod.code}
                          </span>
                          <CardTitle className="text-base">
                            {mod.title}
                          </CardTitle>
                        </div>
                        <CardDescription>{mod.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4">
                        <ul className="flex flex-col gap-2.5">
                          {mod.items.map((item) => (
                            <li
                              key={item.title}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              <span
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted ${mod.iconColor}`}
                              >
                                {item.icon}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {item.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {item.description}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={mod.href}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "mt-auto w-fit transition-colors group-hover:border-foreground/30",
                          )}
                        >
                          Ouvrir le module
                          <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── Ordre de développement ─────────────── */}
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Ordre de développement
              </h2>
              <p className="text-sm text-muted-foreground">
                10 étapes dans l&apos;ordre recommandé pour éviter les blocages.
              </p>
            </div>

            <motion.ol
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="relative flex flex-col gap-4 before:absolute before:top-0 before:bottom-0 before:left-[19px] before:w-px before:bg-border sm:before:left-[23px]"
            >
              {STEPS.map((step) => (
                <motion.li
                  key={step.n}
                  variants={itemVariants}
                  className="relative"
                >
                  <Card className="ml-12 border-border/60 bg-card/70 backdrop-blur-sm transition-shadow hover:shadow-md sm:ml-14">
                    <div className="absolute top-5 -left-12 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-sm font-semibold text-background shadow-md ring-4 ring-background sm:-left-14">
                      {step.n}
                    </div>
                    <CardHeader>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex flex-col">
                          <CardTitle className="text-base">
                            {step.title}
                          </CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                        {step.href && (
                          <Link
                            href={step.href}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "sm" }),
                              "w-fit shrink-0",
                            )}
                          >
                            Cible
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <ul className="flex flex-col gap-1.5">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${step.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {step.progress}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </motion.ol>
          </section>

          {/* ── Infos techniques ───────────────────── */}
          <section className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Informations techniques
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              <motion.div variants={itemVariants}>
                <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        <Database className="h-4 w-4" />
                      </span>
                      Base de données
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>
                      Seul{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        modules/auth/auth.ts
                      </code>{" "}
                      importe{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        lib/db.ts
                      </code>
                      .
                    </p>
                    <p>
                      Prisma 7 exige un adaptateur :{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        @prisma/adapter-pg
                      </code>{" "}
                      +{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        pg
                      </code>
                      .
                    </p>
                    <p>
                      Better Auth nécessite{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        @better-auth/prisma-adapter
                      </code>
                      .
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        <Terminal className="h-4 w-4" />
                      </span>
                      Vérifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        npx tsc --noEmit
                      </code>{" "}
                      avant chaque commit.
                    </p>
                    <p>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        npm run dev
                      </code>{" "}
                      pour tester en local.
                    </p>
                    <p>
                      En-tête Genesis obligatoire sur chaque script (path, tag,
                      role, flow, ecosystem, imports, exports, useBy).
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                        <Lightbulb className="h-4 w-4" />
                      </span>
                      Règles Genesis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>Script complet, aucun placeholder.</p>
                    <p>Réutiliser l&apos;existant avant de créer.</p>
                    <p>Chemins complets dans l&apos;en-tête.</p>
                    <p>Props typées pour chaque composant.</p>
                    <p>Pas de logique métier dans l&apos;UI.</p>
                    <p>Mobile first, responsive, accessibilité.</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="h-full border-border/60 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                        <FileText className="h-4 w-4" />
                      </span>
                      Philosophie
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2 text-sm">
                    {[
                      "Réutilisabilité",
                      "Modularité",
                      "Standardisation",
                      "Séparation des responsabilités",
                      "Sécurité",
                      "Automatisation",
                      "Évolutivité",
                    ].map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 ring-1 ring-border"
                      >
                        {p}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </section>
        </main>
      </div>
    </MotionConfig>
  );
}
