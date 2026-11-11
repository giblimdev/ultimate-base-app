/*
path :           data/nav.ts
tag :            ["nav", "config", "navigation", "source-of-truth", "rbac", "history"]
projectId:       <UltimateBaseApp>
type:            config
generic:         true

role:            Source de vérité unique de la navigation globale de
                 l'application. Décrit les modules (Accueil, App, Scrum,
                 Genesis, Business, Dev, Superadmin) et leurs entrées.
                 Chaque module peut porter un requiresPlatformRole
                 optionnel : s'il est présent, le module n'est visible
                 que si l'utilisateur a ce rôle plateforme (ou supérieur).
                 Le filtrage est appliqué côté client par AppSidebar ;
                 la sécurité réelle sera ajoutée côté serveur via
                 layout.tsx quand Better Auth sera installé. Genesis
                 expose Create Files, Read Files et History en "ready"
                 (les autres outils restent "planned" jusqu'à
                 implémentation).

flow:            NAV_MODULES (const) → filtré par filterNavForRole(role)
                 dans AppSidebar → rendu. getNavItemByPath(pathname) →
                 recherche récursive de l'item actif.

ecosystem:       Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/data/nav.ts",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles:    ["@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/modules/rbac/platform-role.ts"]
imports:         ["lucide-react", "@/modules/rbac/platform-role"]
exports:         ["NAV_MODULES", "NavModule", "NavItem",
                  "NavStatus", "getNavItemByPath", "filterNavForRole"]
useBy:           ["@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx"]

userStories:     ["*en tant que développeur je veux une navigation centralisée et cohérente",
                  "*en tant qu'utilisateur je veux accéder à tous les modules depuis n'importe quelle page",
                  "*en tant qu'utilisateur je ne veux pas voir les modules auxquels je n'ai pas accès",
                  "*en tant qu'utilisateur je veux accéder à l'historique des fichiers depuis la navigation"]
status:          wip
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
  History as HistoryIcon,
  LayoutDashboard,
  ListChecks,
  Settings,
  ShieldCheck,
  Terminal,
  Wrench,
} from "lucide-react";
import {
  hasPlatformRole,
  type PlatformRole,
} from "@/modules/rbac/platform-role";

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
  requiresPlatformRole?: PlatformRole;
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
        label: "History",
        href: "/genesis/history",
        icon: HistoryIcon,
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
  {
    id: "superadmin",
    code: "S",
    label: "Superadmin · Plateforme",
    href: "/superadmin",
    icon: ShieldCheck,
    accent: "text-rose-600 dark:text-rose-400",
    requiresPlatformRole: "SUPER_ADMIN",
    items: [
      {
        label: "Rôles plateforme",
        href: "/superadmin",
        icon: ShieldCheck,
        status: "ready",
      },
    ],
  },
];

export function getNavItemByPath(pathname: string): {
  module: NavModule;
  item: NavItem | null;
} | null {
  for (const navModule of NAV_MODULES) {
    if (pathname === navModule.href) {
      return { module: navModule, item: null };
    }
    for (const item of navModule.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return { module: navModule, item };
      }
    }
  }
  return null;
}

export function filterNavForRole(
  modules: NavModule[],
  role: PlatformRole | null | undefined,
): NavModule[] {
  return modules.filter((navModule) => {
    if (!navModule.requiresPlatformRole) return true;
    return hasPlatformRole(role, navModule.requiresPlatformRole);
  });
}