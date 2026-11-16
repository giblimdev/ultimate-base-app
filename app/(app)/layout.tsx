/*
path :           app/(app)/layout.tsx
tag :            ["layout", "app", "authentifie", "shell", "sidebar",
                  "header", "route-group", "rbac", "suspense",
                  "prerender", "cache-components"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout du route group authentifié. SEUL propriétaire de
                 AppSidebar et AppHeader dans tout le projet. Monte le shell
                 applicatif : AppSidebar (filtrée par rôle plateforme),
                 AppHeader (breadcrumb + actions), <main> pour le contenu.
                 C'est ICI que vivent les guards de session (redirect
                 /auth/login si absent). IMPORTANT : le layout lui-même
                 n'est PAS async et n'await AUCUNE donnée. La lecture de
                 session (headers() → uncached) est poussée dans des
                 composants enfants (SidebarWithRole, HeaderWithRole),
                 chacun enveloppé dans son propre <Suspense>. Sans cette
                 frontière, Next.js 16 avec cacheComponents: true refuse
                 de prérendre le segment et log « Next.js encountered
                 uncached data during prerendering ». Les fallbacks
                 reproduisent la largeur/hauteur du shell pour éviter le
                 layout shift.

flow :           AppLayout({ children }) → <div flex min-h-screen> →
                 <Suspense fallback> → <SidebarWithRole /> (async, lit la
                 session) → <div flex-1> → <Suspense fallback> →
                 <HeaderWithRole /> (async, lit la session) → <main>
                 {children}</main>.

ecosystem :      Socle = [
                   "@/app/(app)/layout.tsx",
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/lib/auth/session.ts",
                   "@/modules/rbac/platform-role.ts",
                 ]
relatedFiles :   ["@/app/layout.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/components/layout/AppSidebar.tsx",
                  "@/lib/auth/session.ts"]
imports :        ["react", "@/components/layout/AppHeader",
                  "@/components/layout/AppSidebar", "@/lib/auth/session"]
exports :        ["default AppLayout"]
useBy :          ["@/app/layout.tsx"]

userStories :    ["*en tant qu'utilisateur connecté je veux une navigation persistante filtrée par rôle",
                  "*en tant que développeur je veux que les guards de session vivent dans un seul endroit",
                  "*en tant que développeur je veux que la navigation instantanée fonctionne avec cacheComponents"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import * as React from "react";
import { Suspense } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { getCurrentPlatformRole } from "@/lib/auth/session";

async function SidebarWithRole() {
  const platformRole = await getCurrentPlatformRole();
  return <AppSidebar platformRole={platformRole} />;
}

async function HeaderWithRole() {
  const platformRole = await getCurrentPlatformRole();
  return <AppHeader platformRole={platformRole} />;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense fallback={<div className="hidden lg:block lg:w-64" />}>
        <SidebarWithRole />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<div className="h-14 border-b border-border" />}>
          <HeaderWithRole />
        </Suspense>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}