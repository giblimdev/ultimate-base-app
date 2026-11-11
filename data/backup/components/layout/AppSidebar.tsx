/*
path :           components/layout/AppSidebar.tsx
tag :            ["layout", "navigation", "sidebar", "responsive", "client"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Sidebar de navigation globale, persistante sur desktop et
                 accessible via Sheet sur mobile. Liste les modules de
                 NAV_MODULES avec leurs entrées de premier niveau. Met en
                 évidence le module actif via usePathname. Masque les items
                 "planned" derrière un badge discret. Accessible (nav landmark,
                 aria-current, focus visible). Composant client justifié par
                 usePathname et l'état du Sheet mobile.

flow:            AppSidebar() → usePathname → getNavItemByPath(pathname) →
                 rendu desktop (<aside>) + mobile (<Sheet>) → mapping
                 NAV_MODULES → pour chaque module, un groupe avec ses items
                 → SidebarMenuButton actif si pathname match → badge
                 "planned" si status === "planned".

ecosystem:       Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/layout/CommandPalette.tsx",
                   "@/components/layout/PageHeader.tsx",
                   "@/data/nav.ts",
                 ]
relatedFiles:    ["@/data/nav.ts",
                  "@/components/layout/AppHeader.tsx",
                  "@/app/layout.tsx"]
imports:         ["next/link", "next/navigation",
                  "@/data/nav", "@/lib/utils",
                  "@/components/ui/badge", "@/components/ui/button",
                  "@/components/ui/scroll-area", "@/components/ui/separator",
                  "@/components/ui/sheet"]
exports:         ["AppSidebar", "MobileNavTrigger"]
useBy:           ["@/app/layout.tsx", "@/components/layout/AppHeader.tsx"]

userStories:     ["*en tant qu'utilisateur je veux accéder à tous les modules depuis n'importe quelle page",
                  "*en tant qu'utilisateur mobile je veux une navigation accessible sans encombrer l'écran"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NAV_MODULES, getNavItemByPath } from "@/data/nav";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navigation principale"
      className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card/50"
    >
      <SidebarContent pathname={pathname} />
    </aside>
  );
}

export function MobileNavTrigger() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Ouvrir la navigation"
            className="lg:hidden"
          />
        }
      >
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Accéder aux modules de l&apos;application
          </SheetDescription>
        </SheetHeader>
        <SidebarContent pathname={pathname} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  const active = getNavItemByPath(pathname);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
            UB
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Ultimate Base
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav aria-label="Modules" className="flex flex-col gap-1 p-2">
          {NAV_MODULES.map((module) => {
            const ModuleIcon = module.icon;
            const moduleActive = active?.module.id === module.id;
            const hasItems = module.items.length > 0;

            return (
              <div key={module.id} className="flex flex-col gap-0.5">
                <Link
                  href={module.href}
                  aria-current={moduleActive && !active?.item ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    moduleActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  )}
                >
                  <ModuleIcon
                    className={cn("size-4 shrink-0", module.accent)}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{module.label}</span>
                  {module.code !== "·" && (
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {module.code}
                    </span>
                  )}
                </Link>

                {hasItems && (
                  <ul className="ml-4 flex flex-col gap-0.5 border-l border-border pl-2">
                    {module.items.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = isActive(pathname, item.href);
                      const planned = item.status === "planned";

                      return (
                        <li key={item.href}>
                          <Link
                            href={planned ? "#" : item.href}
                            aria-current={itemActive ? "page" : undefined}
                            aria-disabled={planned || undefined}
                            onClick={
                              planned
                                ? (e) => {
                                    e.preventDefault();
                                  }
                                : undefined
                            }
                            className={cn(
                              "flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              itemActive
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                              planned && "cursor-not-allowed opacity-50",
                            )}
                          >
                            <ItemIcon
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="flex-1 truncate">{item.label}</span>
                            {planned && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[9px] uppercase tracking-wide"
                              >
                                bientôt
                              </Badge>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
        <Separator className="my-2" />
        <div className="px-4 pb-4 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Ultimate Base App</span>
          </p>
          <p>Plateforme de développement applicatif réutilisable.</p>
        </div>
      </ScrollArea>
    </div>
  );
}