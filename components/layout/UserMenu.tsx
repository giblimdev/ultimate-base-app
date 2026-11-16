/*
path :           components/layout/UserMenu.tsx
tag :            ["layout", "navigation", "user-menu", "avatar", "theme",
                  "logout", "ux", "color", "session", "base-ui",
                  "react-compiler", "sync-external-store"]
projectId :      <UltimateBaseApp>
type :           component
generic :        true

role :           Menu utilisateur global du header. Deux états :
                 - non connecté : bouton ghost « Se connecter » (masqué
                   sur mobile) + bouton gradient « Créer un compte ».
                 - connecté : avatar (image User.image si présente, sinon
                   initiales sur gradient stable par hash du nom), nom
                   tronqué, chevron. Menu déroulant : identité (div avatar
                   + nom + email, PAS un DropdownMenuLabel car Base UI
                   exige un Menu.Group parent pour GroupLabel), Mon profil
                   (/user/profile), Paramètres (/user/settings), sous-menu
                   Thème (Système / Clair / Sombre), Déconnexion.
                 La langue vit dans /user/settings, pas ici.
                 Composant client justifié par useSession, useTheme et
                 l'état du menu. Compatible React Compiler : AUCUN setState
                 synchrone dans useEffect. L'état « monté côté client »
                 est lu via useSyncExternalStore (useIsClient), qui
                 retourne false côté serveur et true après hydratation,
                 sans cascading render et sans mismatch. La déconnexion
                 appelle authClient.signOut puis redirige vers /.

flow :           UserMenu() → useSession + useTheme + useIsClient →
                 si isPending ou !isClient → skeleton
                 si !session?.user → boutons login/register
                 sinon → DropdownMenu → div identité → items Profil,
                 Paramètres, Thème (sub), Déconnexion.

ecosystem :      Navigation = [
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/layout/UserMenu.tsx",
                   "@/data/nav.ts",
                 ]
relatedFiles :   ["@/components/layout/AppHeader.tsx",
                  "@/lib/auth/auth-client.ts",
                  "@/modules/rbac/platform-role.ts"]
imports :        ["react", "next/link", "next/navigation", "next-themes",
                  "sonner", "lucide-react", "@/lib/auth/auth-client",
                  "@/components/ui/button", "@/components/ui/avatar",
                  "@/components/ui/dropdown-menu"]
exports :        ["UserMenu"]
useBy :          ["@/components/layout/AppHeader.tsx"]

userStories :    ["*en tant que visiteur je veux accéder à la connexion depuis le header",
                  "*en tant qu'utilisateur connecté je veux voir mon avatar et accéder à mon profil",
                  "*en tant qu'utilisateur je veux changer de thème depuis le menu",
                  "*en tant qu'utilisateur je veux me déconnecter en un clic"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────────────────────────────────────
   Helpers hors composant (React Compiler safe)
   ───────────────────────────────────────────── */

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-fuchsia-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-rose-500",
  "from-amber-500 to-yellow-500",
  "from-pink-500 to-purple-500",
  "from-sky-500 to-indigo-500",
  "from-lime-500 to-green-500",
] as const;

function getInitials(name: string | null | undefined, email: string): string {
  const base = (name ?? "").trim();
  if (base) {
    const parts = base.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/**
 * Détecte si on est côté client, SANS setState dans useEffect.
 * useSyncExternalStore retourne false côté serveur et au premier
 * rendu client (getServerSnapshot), puis true après hydratation
 * (getSnapshot). C'est le pattern officiel React pour éviter à la
 * fois le mismatch d'hydratation et l'erreur React Compiler
 * « Calling setState synchronously within an effect ».
 */
function useIsClient(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type ThemeOption = "system" | "light" | "dark";

const THEME_OPTIONS: {
  value: ThemeOption;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "system",
    label: "Système",
    icon: <Monitor className="size-4" aria-hidden="true" />,
  },
  {
    value: "light",
    label: "Clair",
    icon: <Sun className="size-4" aria-hidden="true" />,
  },
  {
    value: "dark",
    label: "Sombre",
    icon: <Moon className="size-4" aria-hidden="true" />,
  },
];

/* ─────────────────────────────────────────────
   Composant
   ───────────────────────────────────────────── */

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Déconnecté.");
    router.push("/");
    router.refresh();
  }

  /* Chargement session ou premier rendu serveur. */
  if (isPending || !isClient) {
    return (
      <div className="flex items-center gap-2" aria-hidden="true">
        <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-muted sm:block" />
        <div className="size-9 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  /* Non connecté. */
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login" className="hidden sm:inline-flex">
          <Button variant="ghost" size="sm">
            Se connecter
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm hover:from-blue-700 hover:to-violet-700"
          >
            Créer un compte
          </Button>
        </Link>
      </div>
    );
  }

  /* Connecté. */
  const user = session.user;
  const displayName = user.name ?? user.email;
  const initials = getInitials(user.name, user.email);
  const gradient = getGradient(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-10 gap-2 rounded-full pr-2 pl-1 hover:bg-accent/50"
            aria-label="Menu utilisateur"
          />
        }
      >
        <Avatar size="sm" className="size-8">
          {user.image ? (
            <AvatarImage src={user.image} alt={displayName} />
          ) : null}
          <AvatarFallback
            className={`bg-gradient-to-br ${gradient} text-xs font-semibold text-white`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Identité — div simple, PAS DropdownMenuLabel (Base UI exige un Group) */}
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar size="default" className="size-9">
            {user.image ? (
              <AvatarImage src={user.image} alt={displayName} />
            ) : null}
            <AvatarFallback
              className={`bg-gradient-to-br ${gradient} text-xs font-semibold text-white`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">
              {user.name ?? "Utilisateur"}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/user/profile" />}>
            <User className="size-4" aria-hidden="true" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/user/settings" />}>
            <Settings className="size-4" aria-hidden="true" />
            Paramètres
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="size-4" aria-hidden="true" />
            Thème
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEME_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setTheme(option.value)}
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
                {theme === option.value && (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
