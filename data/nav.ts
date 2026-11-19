/*
path :           data/nav.ts
tag :            ["nav", "config", "navigation", "source-of-truth", "rbac",
                  "history", "schema"]
projectId:       <UltimateBaseApp>
type:            config
generic:         true

role:            Source de vérité unique de la navigation globale de
                 l'application. Les données sont externalisées dans
                 data/nav.json (éditable sans toucher au code TS). Ce
                 module importe le JSON, mappe les noms d'icônes vers les
                 composants lucide-react, valide les types NavModule /
                 NavItem, et expose NAV_MODULES ainsi que les helpers
                 getNavItemByPath et filterNavForRole. Chaque module peut
                 porter un requiresPlatformRole optionnel : s'il est
                 présent, le module n'est visible que si l'utilisateur a
                 ce rôle plateforme (ou supérieur). Le filtrage est
                 appliqué côté client par AppSidebar ; la sécurité réelle
                 sera ajoutée côté serveur via layout.tsx quand Better
                 Auth sera installé. Le module Scrum expose désormais
                 Vue d'ensemble, Projets, Sprints, User Stories et Epics
                 (d'où l'ajout de FolderKanban au registre ICONS).

flow:            data/nav.json → import navJson → map icons via ICONS →
                 NAV_MODULES (NavModule[]) → filterNavForRole(role) dans
                 AppSidebar → rendu. getNavItemByPath(pathname) →
                 recherche récursive de l'item actif.

ecosystem:       Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/data/nav.ts",
                   "@/data/nav.json",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles:    ["@/data/nav.json",
                  "@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/modules/rbac/platform-role.ts"]
imports:         ["lucide-react", "@/modules/rbac/platform-role",
                  "./nav.json"]
exports:         ["NAV_MODULES", "NavModule", "NavItem",
                  "NavStatus", "getNavItemByPath", "filterNavForRole"]
useBy:           ["@/components/layout/AppSidebar.tsx",
                  "@/components/layout/AppHeader.tsx"]

userStories:     ["*en tant que développeur je veux une navigation centralisée et cohérente",
                  "*en tant qu'utilisateur je veux accéder à tous les modules depuis n'importe quelle page",
                  "*en tant qu'utilisateur je ne veux pas voir les modules auxquels je n'ai pas accès",
                  "*en tant qu'utilisateur je veux accéder à l'historique des fichiers depuis la navigation",
                  "*en tant que développeur je veux accéder au schéma Prisma depuis la navigation",
                  "*en tant que développeur je veux pouvoir éditer la navigation dans un JSON sans toucher au code"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CalendarRange,
  Database,
  FileCode2,
  FolderKanban,
  GitBranch,
  History as HistoryIcon,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  Settings,
  ShieldCheck,
  Target,
  Terminal,
  Wrench,
} from "lucide-react";
import {
  hasPlatformRole,
  type PlatformRole,
} from "@/modules/rbac/platform-role";
import navJson from "./nav.json";

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

const ICONS = {
  Briefcase,
  Building2,
  CalendarRange,
  Database,
  FileCode2,
  FolderKanban,
  GitBranch,
  History: HistoryIcon,
  LayoutDashboard,
  ListChecks,
  ListTodo,
  Settings,
  ShieldCheck,
  Target,
  Terminal,
  Wrench,
} satisfies Record<string, LucideIcon>;

type IconName = keyof typeof ICONS;

type RawNavItem = {
  label: string;
  href: string;
  icon: IconName;
  status: NavStatus;
  description?: string;
};

type RawNavModule = {
  id: string;
  code: string;
  label: string;
  href: string;
  icon: IconName;
  accent: string;
  requiresPlatformRole?: PlatformRole;
  items: RawNavItem[];
};

function resolveIcon(name: string): LucideIcon {
  const icon = ICONS[name as IconName];
  if (!icon) {
    throw new Error(
      `[nav] Icône inconnue "${name}" dans data/nav.json. ` +
        `Ajoutez-la au registre ICONS dans data/nav.ts.`,
    );
  }
  return icon;
}

export const NAV_MODULES: NavModule[] = (navJson as RawNavModule[]).map(
  (module) => ({
    ...module,
    icon: resolveIcon(module.icon),
    items: module.items.map((item) => ({
      ...item,
      icon: resolveIcon(item.icon),
    })),
  }),
);

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
