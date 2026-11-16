/*
path :           app/(app)/layout.tsx
tag :            ["layout", "app", "authentifie", "shell", "sidebar",
                  "header", "route-group", "rbac", "suspense"]
projectId:       <UltimateBaseApp>
type:            layout
generic:         false

role:            Layout du route group authentifié. SEUL propriétaire de
                 AppSidebar et AppHeader dans tout le projet. Monte le
                 shell applicatif : AppSidebar (filtrée par rôle
                 plateforme), AppHeader (breadcrumb + actions), <main>
                 pour le contenu. C'est ICI que vivent les guards de
                 session (aujourd'hui stub, demain Better Auth → redirect
                 /login si absent). Les composants qui lisent l'URL
                 (AppSidebar via usePathname, AppHeader via usePathname)
                 sont enveloppés dans <Suspense> pour satisfaire la
                 validation "instant navigation" de Next 16 activée par
                 cacheComponents: true. Sans cette frontière, le segment
                 cible ne peut pas être prérendu statiquement et l'erreur
                 "Could not validate 'instant'" apparaît. Les fallbacks
                 reproduisent la largeur/hauteur du shell pour éviter le
                 layout shift.

flow:            AppLayout async → getCurrentPlatformRole() → platformRole
                 → <div flex min-h-screen> → <Suspense fallback> →
                 <AppSidebar platformRole /> → <div flex-1> →
                 <Suspense fallback> → <AppHeader platformRole /> →
                 <main>{children}</main>.

ecosystem:       Socle = [
                   "@/app/(app)/layout.tsx",
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/lib/auth/session.ts",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles:    ["@/app/layout.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/components/layout/AppSidebar.tsx",
                  "@/lib/auth/session.ts"]
imports:         ["react", "next/navigation",
                  "@/components/layout/AppHeader",
                  "@/components/layout/AppSidebar",
                  "@/lib/auth/session"]
exports:         ["default AppLayout"]
useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant qu'utilisateur connecté je veux une navigation persistante filtrée par rôle",
                  "*en tant que développeur je veux que les guards de session vivent dans un seul endroit",
                  "*en tant que développeur je veux que la navigation instantanée fonctionne avec cacheComponents"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✘false
*/
import * as React from "react";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getCurrentPlatformRole } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard de session : aujourd'hui le stub retourne toujours SUPER_ADMIN.
  // Demain, avec Better Auth :
  //   const session = await getSession();
  //   if (!session) redirect("/login");
  const platformRole = await getCurrentPlatformRole();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="hidden lg:block lg:w-64" />}>
        <AppSidebar platformRole={platformRole} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-14 border-b border-border" />}>
          <AppHeader platformRole={platformRole} />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
