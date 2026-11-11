/*
path :           app/superadmin/components/PlatformRoleManager.tsx
tag :            ["superadmin", "rbac", "platform-role", "manager",
                  "component", "client", "ux"]
projectId:       <UltimateBaseApp>
type:            component
generic:         false

role:            Outil client de gestion des rôles plateforme. Affiche la
                 liste paginée des utilisateurs, permet de filtrer par
                 recherche, et de changer le rôle plateforme via un Select
                 par ligne. Utilise les Server Actions listPlatformUsersAction
                 et updatePlatformRoleAction. Feedback toast (sonner) à
                 chaque changement. États : chargement initial, vide,
                 erreur, pending par ligne. Composant client justifié par
                 les appels Server Actions et l'état local.

flow:            PlatformRoleManager() → useEffect → listPlatformUsersAction
                 ({ search, page, pageSize }) → state users → input search
                 debounce 300ms → refetch → Select par ligne → onChange →
                 updatePlatformRoleAction({ userId, platformRole }) →
                 toast.success / toast.error → si ok, mise à jour locale
                 du user.

ecosystem:       Superadmin = [
                   "@/app/superadmin/actions/listPlatformUsers.ts",
                   "@/app/superadmin/actions/updatePlatformRole.ts",
                   "@/app/superadmin/components/PlatformRoleManager.tsx",
                   "@/app/superadmin/page.tsx",
                   "@/modules/rbac/platform-role.ts",
                   "@/modules/rbac/platform-role-service.ts",
                 ]
relatedFiles:    ["@/app/superadmin/actions/listPlatformUsers.ts",
                  "@/app/superadmin/actions/updatePlatformRole.ts",
                  "@/modules/rbac/platform-role.ts"]
imports:         ["react", "sonner", "lucide-react",
                  "@/app/superadmin/actions/listPlatformUsers",
                  "@/app/superadmin/actions/updatePlatformRole",
                  "@/modules/rbac/platform-role",
                  "@/modules/rbac/platform-role-service",
                  "@/components/ui/button",
                  "@/components/ui/badge",
                  "@/components/ui/card",
                  "@/components/ui/input",
                  "@/components/ui/select"]
exports:         ["PlatformRoleManager"]
useBy:           ["@/app/superadmin/page.tsx"]

userStories:     ["*en tant que super admin je veux voir tous les utilisateurs et leur rôle plateforme",
                  "*en tant que super admin je veux changer le rôle plateforme d'un utilisateur",
                  "*en tant que super admin je veux filtrer les utilisateurs par email ou nom"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, UserCog } from "lucide-react";
import { listPlatformUsersAction } from "@/app/superadmin/actions/listPlatformUsers";
import { updatePlatformRoleAction } from "@/app/superadmin/actions/updatePlatformRole";
import {
  PLATFORM_ROLE_META,
  PLATFORM_ROLES,
  type PlatformRole,
} from "@/modules/rbac/platform-role";
import type { PlatformUser } from "@/modules/rbac/platform-role-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE = 20;

export function PlatformRoleManager() {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [users, setUsers] = React.useState<PlatformUser[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    listPlatformUsersAction({
      search: debouncedSearch,
      page: 1,
      pageSize: PAGE_SIZE,
    })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.users);
        setTotal(res.total);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Impossible de charger les utilisateurs.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  async function onRoleChange(user: PlatformUser, nextRole: PlatformRole) {
    if (nextRole === user.platformRole) return;
    setPendingId(user.id);
    const res = await updatePlatformRoleAction({
      userId: user.id,
      platformRole: nextRole,
    });
    setPendingId(null);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === res.user.id ? res.user : u)),
    );
    toast.success(
      `${res.user.email} → ${PLATFORM_ROLE_META[res.user.platformRole].label}`,
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <UserCog className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">Rôles plateforme</CardTitle>
              <CardDescription className="text-sm">
                {total} utilisateur{total > 1 ? "s" : ""} — gérez le rôle
                global au-dessus des tenants.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="size-3" aria-hidden="true" />
            SUPER_ADMIN requis
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par email ou nom…"
            className="pl-8"
            aria-label="Rechercher un utilisateur"
            autoComplete="off"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Chargement…
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-10 text-center">
            <p className="text-sm font-medium">Aucun utilisateur</p>
            <p className="text-xs text-muted-foreground">
              Aucun utilisateur ne correspond à « {debouncedSearch} ».
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {users.map((user) => {
              const isPending = pendingId === user.id;
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {user.name}
                    </span>
                    <span className="truncate font-mono text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 sm:shrink-0">
                    <Select
                      value={user.platformRole}
                      onValueChange={(value) =>
                        onRoleChange(user, value as PlatformRole)
                      }
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {PLATFORM_ROLE_META[role].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isPending && (
                      <Loader2
                        className="size-4 animate-spin text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && total > users.length && (
          <p className="text-center text-xs text-muted-foreground">
            {users.length} sur {total} affichés — affiner la recherche.
          </p>
        )}
      </CardContent>
    </Card>
  );
}