/*
path :           app/(app)/scrum/page.tsx
tag :            ["scrum", "page", "presentation", "crud", "dnd",
                  "responsive", "design-system", "navigation"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page d'entrée / de présentation du module Scrum. Page
                 statique (Server Component) : hero, cartes des capacités
                 CRUD (Project, Features, Persona, Epic, User Stories,
                 Task, Sprint), section Drag & Drop (tasks→US, US→epics,
                 US→sprints), section persistance (modèle Scrum →
                 saveScrums JsonB + formulaires + champs JSON éditables),
                 et exemples de cartes résumé de projet via
                 ProjectSummaryCard. Aucune logique métier, aucun fetch :
                 les exemples de projet sont des données mock typées
                 ProjectSummary, destinées à illustrer le rendu en
                 attendant les CRUD branchés sur la DB. Mobile first,
                 responsive, accessible (landmarks, aria, contrastes).
                 Les CTA pointent vers les futures pages d'entrée
                 (/scrum/sprints, /scrum/us, /scrum/epics) déclarées en
                 "planned" dans data/nav.json ; les CTA vers ces routes
                 sont désactivés tant que les pages n'existent pas.
                 Les boutons-liens utilisent la prop `render` de Base UI
                 avec `nativeButton={false}` car le rendu cible est un
                 <a> (Link), pas un <button> natif.

flow:            /scrum → rendu hero → grille capacités CRUD (map sur
                 une const locale) → section DnD (3 flux) → section
                 persistance → grille d'exemples ProjectSummaryCard
                 (mock) → CTA vers managers (disabled si planned). Aucun
                 appel réseau, aucun état.

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/components/scrum/ProjectSummaryCard.tsx",
                  "@/data/nav.ts",
                  "@/data/nav.json"]
imports:         ["next/link", "lucide-react",
                  "@/components/scrum/ProjectSummaryCard",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/card", "@/components/ui/separator"]
exports:         ["default"]
useBy:           []

userStories:     ["*en tant qu'utilisateur je veux découvrir le module Scrum et ses capacités",
                  "*en tant qu'utilisateur je veux accéder aux managers Sprints, US et Epics",
                  "*en tant que développeur je veux une page d'entrée claire avant d'implémenter les CRUD",
                  "*en tant qu'utilisateur je veux comprendre que les projets sont persistés en DB via saveScrums"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarRange,
  ClipboardList,
  GitBranch,
  Layers,
  ListTodo,
  Save,
  Target,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ProjectSummaryCard,
  type ProjectSummary,
} from "@/components/scrum/ProjectSummaryCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type CrudCapability = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
};

const CRUD_CAPABILITIES: CrudCapability[] = [
  {
    id: "project",
    label: "Projet",
    description:
      "Créer, éditer et archiver un projet Scrum. Un projet = une ligne Scrum dont le champ saveScrums JsonB contient tout l'arbre.",
    icon: Briefcase,
    accent: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "features",
    label: "Features",
    description:
      "Découper le périmètre fonctionnel en features rattachées au projet.",
    icon: Layers,
    accent: "text-violet-600 dark:text-violet-400",
  },
  {
    id: "persona",
    label: "Personas",
    description:
      "Décrire les utilisateurs cibles pour ancrer les user stories dans des besoins réels.",
    icon: UserRound,
    accent: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "epic",
    label: "Epics",
    description:
      "Regrouper les user stories en epics cohérents, avec priorité et statut.",
    icon: Target,
    accent: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "userStories",
    label: "User Stories",
    description:
      "Rédiger les US (en tant que… je veux… afin de…), les estimer et les rattacher à un epic.",
    icon: ListTodo,
    accent: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "task",
    label: "Tasks",
    description:
      "Décomposer chaque US en tâches concrètes, assignables et suivies.",
    icon: ClipboardList,
    accent: "text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "sprint",
    label: "Sprints",
    description:
      "Planifier des itérations, y affecter des US et suivre l'avancement.",
    icon: CalendarRange,
    accent: "text-amber-600 dark:text-amber-400",
  },
];

type DndFlow = {
  id: string;
  title: string;
  description: string;
  from: string;
  to: string;
  icon: LucideIcon;
};

const DND_FLOWS: DndFlow[] = [
  {
    id: "tasks-to-us",
    title: "Tasks → User Stories",
    description:
      "Glisser une tâche sur une US pour l'y rattacher ou réordonner les tâches d'une US.",
    from: "Task",
    to: "User Story",
    icon: ClipboardList,
  },
  {
    id: "us-to-epics",
    title: "US → Epics",
    description:
      "Glisser une user story sur un epic pour la rattacher ou changer son epic de référence.",
    from: "User Story",
    to: "Epic",
    icon: Target,
  },
  {
    id: "us-to-sprints",
    title: "US → Sprints",
    description:
      "Glisser une user story sur un sprint pour la planifier dans l'itération.",
    from: "User Story",
    to: "Sprint",
    icon: CalendarRange,
  },
];

const MOCK_PROJECTS: ProjectSummary[] = [
  {
    id: "demo-1",
    name: "Refonte espace client",
    key: "CLI",
    description:
      "Moderniser le parcours client : onboarding, tableau de bord et support.",
    status: "ACTIVE",
    methodology: "SCRUM",
    visibility: "INTERNAL",
    progressPercent: 42,
    counts: {
      features: 6,
      personas: 3,
      epics: 5,
      userStories: 28,
      tasks: 64,
      sprints: 4,
    },
    startDate: "2026-01-15",
    targetDate: "2026-06-30",
    updatedAt: "2026-03-02",
  },
  {
    id: "demo-2",
    name: "Marketplace B2B",
    key: "MKT",
    description:
      "Plateforme de mise en relation entre fournisseurs et acheteurs professionnels.",
    status: "PLANNING",
    methodology: "SCRUMBAN",
    visibility: "PRIVATE",
    progressPercent: 12,
    counts: {
      features: 4,
      personas: 2,
      epics: 3,
      userStories: 11,
      tasks: 18,
      sprints: 1,
    },
    startDate: "2026-04-01",
    targetDate: "2026-12-15",
    updatedAt: "2026-03-10",
  },
  {
    id: "demo-3",
    name: "Hacienda — suivi des cultures",
    key: "HAC",
    description:
      "Suivi des plantes, récoltes et soins pour l'hacienda familiale.",
    status: "ON_HOLD",
    methodology: "KANBAN",
    visibility: "INTERNAL",
    progressPercent: 67,
    counts: {
      features: 3,
      personas: 1,
      epics: 2,
      userStories: 9,
      tasks: 22,
      sprints: 2,
    },
    startDate: "2025-09-01",
    targetDate: "2026-05-31",
    updatedAt: "2026-02-20",
  },
];

type ManagerLink = {
  id: string;
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  ready: boolean;
};

const MANAGER_LINKS: ManagerLink[] = [
  {
    id: "sprints",
    label: "Sprint Manager",
    href: "/scrum/sprints",
    description: "Planifier et suivre les itérations.",
    icon: CalendarRange,
    ready: false,
  },
  {
    id: "us",
    label: "US Manager",
    href: "/scrum/us",
    description: "Gérer les user stories et leurs tâches.",
    icon: ListTodo,
    ready: false,
  },
  {
    id: "epics",
    label: "Epic Manager",
    href: "/scrum/epics",
    description: "Organiser les epics et rattacher les US.",
    icon: Target,
    ready: false,
  },
];

export default function ScrumPresentationPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* HERO */}
      <section
        aria-labelledby="scrum-hero-title"
        className="flex flex-col gap-4"
      >
        <Badge variant="secondary" className="w-fit">
          Module Scrum · Conception
        </Badge>
        <h1
          id="scrum-hero-title"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Pilotez vos projets, de la feature à la tâche
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Un espace unique pour décrire vos projets, vos personas, vos epics,
          vos user stories, vos tâches et vos sprints. Persistez chaque projet
          en base via le champ <code className="font-mono">saveScrums</code>{" "}
          (JSONB) et organisez vos éléments par glisser-déposer.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button nativeButton={false} render={<Link href="#capacites" />}>
            Découvrir les capacités
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="#exemples" />}
          >
            Voir des exemples de projets
          </Button>
        </div>
      </section>

      <Separator />

      {/* CAPACITÉS CRUD */}
      <section
        aria-labelledby="scrum-capacites"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="scrum-capacites"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            CRUD par entité
          </h2>
          <p className="text-sm text-muted-foreground">
            Chaque entité dispose de ses formulaires et de ses champs JSON
            éditables (copier/coller pour ajouter ou modifier des items en
            masse).
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CRUD_CAPABILITIES.map((capability) => {
            const Icon = capability.icon;
            return (
              <Card key={capability.id} className="h-full">
                <CardHeader className="gap-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`size-4 ${capability.accent}`}
                      aria-hidden
                    />
                    <CardTitle className="text-sm">
                      {capability.label}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {capability.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* DRAG & DROP */}
      <section aria-labelledby="scrum-dnd" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="scrum-dnd"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Organisation par glisser-déposer
          </h2>
          <p className="text-sm text-muted-foreground">
            Trois flux DnD (dnd-kit) pour rattacher et ordonner vos éléments
            sans formulaire.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {DND_FLOWS.map((flow) => {
            const Icon = flow.icon;
            return (
              <Card key={flow.id} className="h-full">
                <CardHeader className="gap-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <CardTitle className="text-sm">{flow.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <CardDescription className="text-xs leading-relaxed">
                    {flow.description}
                  </CardDescription>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                    <span className="rounded-md bg-muted/50 px-1.5 py-0.5">
                      {flow.from}
                    </span>
                    <ArrowRight className="size-3" aria-hidden />
                    <span className="rounded-md bg-muted/50 px-1.5 py-0.5">
                      {flow.to}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* PERSISTANCE */}
      <section
        aria-labelledby="scrum-persistance"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <h2
            id="scrum-persistance"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Persistance en base
          </h2>
          <p className="text-sm text-muted-foreground">
            Chaque projet est une ligne du modèle{" "}
            <code className="font-mono">Scrum</code>. L&apos;arbre complet
            (features, personas, epics, US, tasks, sprints) est stocké dans le
            champ <code className="font-mono">saveScrums</code> (JSONB).
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="gap-1">
              <div className="flex items-center gap-2">
                <Save
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
                <CardTitle className="text-sm">
                  Formulaires + JSON éditable
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                Chaque étape CRUD propose un formulaire classique et un champ
                JSON éditable (copier/coller) pour ajouter ou modifier des items
                en masse, sans ressaisie.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="gap-1">
              <div className="flex items-center gap-2">
                <GitBranch
                  className="size-4 text-violet-600 dark:text-violet-400"
                  aria-hidden
                />
                <CardTitle className="text-sm">
                  Isolation par workspace
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                Le modèle <code className="font-mono">Scrum</code> porte un{" "}
                <code className="font-mono">workspaceId</code> : les projets
                sont isolés par espace de travail et filtrés côté serveur.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* EXEMPLES */}
      <section aria-labelledby="scrum-exemples" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="scrum-exemples"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Exemples de projets
          </h2>
          <p className="text-sm text-muted-foreground">
            Aperçu du rendu de la carte résumé. Les données réelles seront
            fournies par les CRUD branchés sur la DB.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_PROJECTS.map((project) => (
            <ProjectSummaryCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <Separator />

      {/* CTA MANAGERS */}
      <section aria-labelledby="scrum-managers" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="scrum-managers"
            className="text-xl font-semibold tracking-tight sm:text-2xl"
          >
            Managers à venir
          </h2>
          <p className="text-sm text-muted-foreground">
            Les pages dédiées seront activées au fur et à mesure de
            l&apos;implémentation des CRUD et du DnD.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {MANAGER_LINKS.map((manager) => {
            const Icon = manager.icon;
            return (
              <Card key={manager.id} className="h-full">
                <CardHeader className="gap-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden
                    />
                    <CardTitle className="text-sm">{manager.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <CardDescription className="text-xs leading-relaxed">
                    {manager.description}
                  </CardDescription>
                  {manager.ready ? (
                    <Button
                      nativeButton={false}
                      size="sm"
                      variant="outline"
                      render={<Link href={manager.href} />}
                    >
                      Ouvrir
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Bientôt disponible
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
