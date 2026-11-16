/*
path :           components/layout/AppHeader.tsx
tag :            ["layout", "navigation", "header", "breadcrumb", "client",
                  "rbac", "user-menu"]
projectId :      <UltimateBaseApp>
type :           component
generic :        true

role :           Header global persistant affiché en haut de toutes les pages
                 authentifiées via app/(app)/layout.tsx. Contient le
                 déclencheur mobile de la sidebar, un fil d'Ariane contextuel
                 déduit du pathname, un lien vers /dev, et le UserMenu
                 (avatar + menu profil/thème/langue/déconnexion si connecté,
                 boutons login/register sinon). Masqué sur / (la landing a
                 son propre hero).

flow :           AppHeader({ platformRole }) → usePathname → si "/" → null
                 → sinon getNavItemByPath → MobileNavTrigger + breadcrumb +
                 lien /dev + <UserMenu />.

ecosystem :      Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/layout/UserMenu.tsx",
                   "@/data/nav.ts",
                 ]
relatedFiles :   ["@/data/nav.ts",
                  "@/components/layout/AppSidebar.tsx",
                  "@/components/layout/UserMenu.tsx",
                  "@/modules/rbac/platform-role.ts"]
imports :        ["next/link", "next/navigation", "lucide-react",
                  "@/data/nav", "@/lib/utils",
                  "@/modules/rbac/platform-role",
                  "@/components/layout/AppSidebar",
                  "@/components/layout/UserMenu",
                  "@/components/ui/breadcrumb",
                  "@/components/ui/button"]
exports :        ["AppHeader"]
useBy :          ["@/app/(app)/layout.tsx"]

userStories :    ["*en tant qu'utilisateur je veux toujours savoir où je suis dans l'application",
                  "*en tant qu'utilisateur mobile je veux accéder à la navigation depuis le header",
                  "*en tant qu'utilisateur je veux accéder à mon profil et me déconnecter depuis le header"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal } from "lucide-react";
import { getNavItemByPath } from "@/data/nav";
import type { PlatformRole } from "@/modules/rbac/platform-role";
import { cn } from "@/lib/utils";
import { MobileNavTrigger } from "@/components/layout/AppSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
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
          "hidden gap-1.5 sm:inline-flex",
        )}
      >
        <Terminal className="size-4" aria-hidden="true" />
        <span className="hidden md:inline">Référence</span>
      </Link>

      <UserMenu />
    </header>
  );
}