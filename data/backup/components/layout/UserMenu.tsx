/*
path :           components/layout/UserMenu.tsx
tag :            ["layout", "navigation", "user-menu", "avatar", "theme",
                  "lang", "logout", "ux", "color"]
projectId :      <UltimateBaseApp>
type :           component
generic :        true

role :           Menu utilisateur global. Affiche deux états :
                 - non connecté : boutons « Se connecter » (ghost) et
                   « Créer un compte » (primary gradient).
                 - connecté : avatar (image si User.image, sinon initiales
                   colorées par hash du nom), nom + email, menu déroulant
                   avec Profil, Paramètres (sous-menu : thème + langue),
                   Déconnexion (rouge).
                 Le thème utilise next-themes (useTheme). La langue est
                 locale (useState) pour l'instant — à brancher sur le
                 cookie + User.preferredLocale quand l'i18n sera
                 implémentée. Déconnexion via authClient.signOut puis
                 router.push("/"). Composant client justifié par useSession,
                 useTheme et l'état du menu.

flow :           UserMenu() → useSession → si !session → boutons login/register
                 → sinon → DropdownMenu → Avatar (image ou initiales) →
                 items Profil, Paramètres (Theme sub + Lang sub), Déconnexion.

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
                  "@/components/ui/dropdown-menu", "@/components/ui/separator"]
exports :        ["UserMenu"]
useBy :          ["@/components/layout/AppHeader.tsx"]

userStories :    ["*en tant que visiteur je veux accéder à la connexion depuis le header",
                  "*en tant qu'utilisateur connecté je veux voir mon avatar et accéder à mon profil",
                  "*en tant qu'utilisateur je veux changer de thème et de langue depuis le menu",
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
  Globe,
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

/* Palette d'avatars : couleur stable par hash du nom. */
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

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

type ThemeOption = "system" | "light" | "dark";

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: React.ReactNode }[] = [
  { value: "system", label: "Système", icon: <Monitor className="size-4" /> },
  { value: "light", label: "Clair", icon: <Sun className="size-4" /> },
  { value: "dark", label: "Sombre", icon: <Moon className="size-4" /> },
];

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = React.useState<string>("fr");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    toast.success("Déconnecté.");
    router.push("/");
    router.refresh();
  }

  /* État de chargement : skeleton discret. */
  if (isPending || !mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-muted sm:block" />
        <div className="size-9 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  /* État non connecté. */
  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
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

  /* État connecté. */
  const user = session.user;
  const initials = getInitials(user.name, user.email);
  const gradient = getGradient(user.name ?? user.email);

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
            <AvatarImage src={user.image} alt={user.name ?? user.email} />
          ) : null}
          <AvatarFallback
            className={`bg-gradient-to-br ${gradient} text-xs font-semibold text-white`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">
          {user.name ?? user.email}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* Identité */}
        <DropdownMenuLabel className="flex items-center gap-3 py-2">
          <Avatar size="default" className="size-9">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? user.email} />
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
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Pages utilisateur */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User className="size-4" aria-hidden="true" />
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings className="size-4" aria-hidden="true" />
            Paramètres
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Paramètres : thème */}
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

        {/* Paramètres : langue */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Globe className="size-4" aria-hidden="true" />
            Langue
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  toast.success(`Langue : ${lang.label}`);
                }}
              >
                <span aria-hidden="true">{lang.flag}</span>
                <span className="flex-1">{lang.label}</span>
                {language === lang.code && (
                  <Check className="size-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Déconnexion */}
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}