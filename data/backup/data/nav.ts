/*
path :           data/nav.ts
tag :            ["nav", "config", "navigation", "source-of-truth"]
projectId:       <UltimateBaseApp>
type:            config
generic:         true

role:            Source de vérité unique de la navigation globale de
                 l'application. Décrit les 4 modules (A. App, B. Scrum,
                 C. Genesis, D. Business) et leurs entrées de premier niveau.
                 Consommé par AppSidebar, AppHeader et le command palette.
                 Aucune dépendance React : données pures, importables côté
                 serveur et client sans effet de bord.

flow:            NAV_MODULES (const) → filtré par statut "ready" dans
                 AppSidebar → rendu en SidebarMenu. getNavItemByPath(pathname)
                 → recherche récursive de l'item actif → utilisé par
                 AppHeader pour le titre contextuel.

ecosystem:       Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/layout/CommandPalette.tsx",
                   "@/components/layout/PageHeader.tsx",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/app/layout.tsx"]
imports:         ["lucide-react"]
exports:         ["NAV_MODULES", "NavModule", "NavItem", "getNavItemByPath"]
useBy:           ["@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/components/layout/CommandPalette.tsx"]

userStories:     ["*en tant que développeur je veux une navigation centralisée et cohérente",
                  "*en tant qu'utilisateur je veux accéder à tous les modules depuis n'importe quelle page"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  FileCode2,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";

export type NavStatus = "ready" | "planned";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  status: NavStatus;
  description?: string;
};

export type NavModule = {
  id: string;
  code: string;
  label: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  items: NavItem[];
};

export const NAV_MODULES: NavModule[] = [
  {
    id: "home",
    code: "·",
    label: "Accueil",
    href: "/",
    icon: LayoutDashboard,
    accent: "text-blue-600 dark:text-blue-400",
    items: [],
  },
  {
    id: "app",
    code: "A",
    label: "App · Socle",
    href: "/app",
    icon: ShieldCheck,
    accent: "text-blue-600 dark:text-blue-400",
    items: [
      {
        label: "Vue d'ensemble",
        href: "/app",
        icon: ShieldCheck,
        status: "planned",
      },
      {
        label: "Administration",
        href: "/app/admin",
        icon: Settings,
        status: "planned",
      },
    ],
  },
  {
    id: "scrum",
    code: "B",
    label: "Scrum · Conception",
    href: "/scrum",
    icon: ListChecks,
    accent: "text-violet-600 dark:text-violet-400",
    items: [
      {
        label: "Items",
        href: "/scrum/items",
        icon: ListChecks,
        status: "planned",
      },
      {
        label: "Epic Manager",
        href: "/scrum/epics",
        icon: ListChecks,
        status: "planned",
      },
      {
        label: "Sprint Manager",
        href: "/scrum/sprints",
        icon: ListChecks,
        status: "planned",
      },
    ],
  },
  {
    id: "genesis",
    code: "C",
    label: "Genesis · Développement",
    href: "/genesis",
    icon: Wrench,
    accent: "text-emerald-600 dark:text-emerald-400",
    items: [
      {
        label: "Hub",
        href: "/genesis",
        icon: Wrench,
        status: "ready",
      },
      {
        label: "Create Files",
        href: "/genesis/create-files",
        icon: FileCode2,
        status: "ready",
      },
      {
        label: "Read Files",
        href: "/genesis/read-files",
        icon: FileCode2,
        status: "ready",
      },
      {
        label: "Header Checker",
        href: "/genesis/quality/header",
        icon: ListChecks,
        status: "planned",
      },
      {
        label: "TypeScript Checker",
        href: "/genesis/quality/typescript",
        icon: Terminal,
        status: "planned",
      },
      {
        label: "Git Manager",
        href: "/genesis/git",
        icon: GitBranch,
        status: "planned",
      },
    ],
  },
  {
    id: "business",
    code: "D",
    label: "Business · Métier",
    href: "/business",
    icon: Briefcase,
    accent: "text-orange-600 dark:text-orange-400",
    items: [
      {
        label: "Onboarding",
        href: "/business",
        icon: Briefcase,
        status: "ready",
      },
      {
        label: "Administration",
        href: "/business/admin",
        icon: Building2,
        status: "planned",
      },
      {
        label: "Configuration",
        href: "/business/config",
        icon: Settings,
        status: "planned",
      },
    ],
  },
  {
    id: "dev",
    code: "·",
    label: "Référence dev",
    href: "/dev",
    icon: Terminal,
    accent: "text-zinc-600 dark:text-zinc-400",
    items: [],
  },
];

export function getNavItemByPath(pathname: string): {
  module: NavModule;
  item: NavItem | null;
} | null {
  for (const module of NAV_MODULES) {
    if (pathname === module.href) {
      return { module, item: null };
    }
    for (const item of module.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return { module, item };
      }
    }
  }
  return null;
}