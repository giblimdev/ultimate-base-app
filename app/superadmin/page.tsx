/*
path :           app/superadmin/page.tsx
tag :            ["superadmin", "rbac", "platform-role", "page", "dashboard"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page unique de l'espace superadmin. Affiche un header de
                 présentation, un rappel des 3 rôles plateforme (avec leur
                 description et leur rang), puis monte le
                 PlatformRoleManager (liste + édition). Pas de guard serveur
                 pour l'instant (TODO Better Auth) : accessible via
                 /superadmin en attendant. Une fois Better Auth installé,
                 ajouter requirePlatformRole("SUPER_ADMIN") en tête de
                 composant et un layout.tsx dédié.

flow:            Server Component → header → grille des 3 rôles →
                 <PlatformRoleManager />.

ecosystem:       Superadmin = [
                   "@/app/superadmin/actions/listPlatformUsers.ts",
                   "@/app/superadmin/actions/updatePlatformRole.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/modules/rbac/platform-role.ts",
                   "@/modules/rbac/platform-role-service.ts",
                 ]
relatedFiles:    ["@/modules/rbac/platform-role.ts",
                  "@/app/superadmin/components/PlatformRoleManager.tsx"]
imports:         ["lucide-react",
                  "@/modules/rbac/platform-role",
                  "@/app/superadmin/components/PlatformRoleManager",
                  "@/components/ui/badge",
                  "@/components/ui/card",
                  "@/lib/utils"]
exports:         ["default (SuperadminPage)"]
useBy:           []

userStories:     ["*en tant que super admin je veux un point d'entrée unique pour gérer les rôles plateforme",
                  "*en tant que super admin je veux comprendre la hiérarchie des rôles"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import { ShieldCheck, UserCog, Users } from "lucide-react";
import {
  PLATFORM_ROLES,
  PLATFORM_ROLE_META,
  type PlatformRole,
} from "@/modules/rbac/platform-role";
import { PlatformRoleManager } from "@/app/superadmin/components/PlatformRoleManager";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ROLE_STYLES: Record<PlatformRole, string> = {
  SUPER_ADMIN: "bg-primary/10 text-primary",
  SUPPORT: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  USER: "bg-muted text-muted-foreground",
};

const ROLE_ICONS: Record<PlatformRole, typeof ShieldCheck> = {
  SUPER_ADMIN: ShieldCheck,
  SUPPORT: Users,
  USER: UserCog,
};

export default function SuperadminPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit gap-1.5">
          <ShieldCheck className="size-3" aria-hidden="true" />
          Superadmin
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Rôles plateforme
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Le rôle plateforme est global, au-dessus des tenants et des
          applications. Il contrôle la visibilité des espaces d&apos;administration
          et les actions sensibles sur la plateforme.
        </p>
      </header>

      <section
        aria-labelledby="roles-hierarchy"
        className="flex flex-col gap-3"
      >
        <h2
          id="roles-hierarchy"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Hiérarchie
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PLATFORM_ROLES.map((role) => {
            const meta = PLATFORM_ROLE_META[role];
            const Icon = ROLE_ICONS[role];
            return (
              <Card key={role} className="h-full">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg",
                        ROLE_STYLES[role],
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <CardTitle className="text-sm">{meta.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <p className="text-xs leading-5 text-muted-foreground">
                    {meta.description}
                  </p>
                  <span className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
                    rang {meta.rank}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <PlatformRoleManager />
    </main>
  );
}