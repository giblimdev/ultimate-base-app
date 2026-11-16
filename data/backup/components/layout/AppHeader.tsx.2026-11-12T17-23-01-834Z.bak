/*
path :           components/layout/AppHeader.tsx
tag :            ["layout", "navigation", "header", "breadcrumb", "client",
                  "rbac"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Header global persistant affiché en haut de toutes les pages
                 via app/layout.tsx. Contient le déclencheur mobile de la
                 sidebar (qui reçoit platformRole pour filtrer), un fil
                 d'Ariane contextuel déduit du pathname, et un lien vers
                 /dev. Masqué sur / (la page d'accueil a son propre hero).
                 Composant client justifié par usePathname.

flow:            AppHeader({ platformRole }) → usePathname → si "/" → null
                 → sinon getNavItemByPath → MobileNavTrigger (avec
                 platformRole) + breadcrumb + lien /dev.

ecosystem:       Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/data/nav.ts",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles:    ["@/data/nav.ts",
                  "@/components/layout/AppSidebar.tsx",
                  "@/app/layout.tsx",
                  "@/modules/rbac/platform-role.ts"]
imports:         ["next/link", "next/navigation", "lucide-react",
                  "@/data/nav", "@/lib/utils",
                  "@/modules/rbac/platform-role",
                  "@/components/layout/AppSidebar",
                  "@/components/ui/breadcrumb",
                  "@/components/ui/button"]
exports:         ["AppHeader"]
useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant qu'utilisateur je veux toujours savoir où je suis dans l'application",
                  "*en tant qu'utilisateur mobile je veux accéder à la navigation depuis le header"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal } from "lucide-react";
import { getNavItemByPath } from "@/data/nav";
import type { PlatformRole } from "@/modules/rbac/platform-role";
import { cn } from "@/lib/utils";
import { MobileNavTrigger } from "@/components/layout/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";

type AppHeaderProps = {
  platformRole: PlatformRole;
};

export function AppHeader({ platformRole }: AppHeaderProps) {
  const pathname = usePathname();
  const active = getNavItemByPath(pathname);

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-4 lg:px-6">
      <MobileNavTrigger platformRole={platformRole} />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>
              Accueil
            </BreadcrumbLink>
          </BreadcrumbItem>
          {active && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {active.item ? (
                  <BreadcrumbLink render={<Link href={active.module.href} />}>
                    {active.module.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{active.module.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {active.item && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="truncate">
                      {active.item.label}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <Link
        href="/dev"
        aria-label="Référence développeur"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1.5",
        )}
      >
        <Terminal className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">Référence</span>
      </Link>
    </header>
  );
}