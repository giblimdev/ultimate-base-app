/*
path :           app/dev/page.tsx
tag :            ["dev", "guide", "git", "github", "prisma", "shadcn", "commandes", "ui"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page de référence développeur. Centralise 51 commandes Git,
                 14 commandes GitHub (gh CLI), 13 commandes Prisma 7 et 15
                 composants shadcn/ui avec rôles et exemples copiables.
                 Interface responsive avec recherche globale accent-insensitive,
                 navigation par ancres, compteurs dynamiques et feedback de copie.
                 Page 100% client.

flow:            DevPage() → recherche globale → catégories Git/GitHub/Prisma
                 et catalogue shadcn/ui filtrés → CopyRow → presse-papiers
                 → feedback toast + état copié. Navigation rapide par ancres.

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne PAS utiliser asChild (Radix) — buttonVariants sur <Link>.
  ✘ Ne PAS importer Github depuis lucide-react (supprimé v1) — GithubIcon.
  ✘ Ne PAS rendre cette page côté serveur (clipboard + state + motion).
  ✘ Ne PAS supprimer de commande Git existante sans raison (liste validée).

AUTORISÉ :
  ✔ Ajouter une commande dans GIT_COMMANDS, GITHUB_COMMANDS, PRISMA_COMMANDS.
  ✔ Ajouter un composant dans SHADCN_COMPONENTS.
  ✔ Ajouter une catégorie dans CATEGORIES (nouveau tableau + Section).
  ✔ Réutiliser CopyRow pour toute commande copiable.

PIÈGES :
  ⚠ navigator.clipboard → "use client" obligatoire.
  ⚠ Le filtre normalise NFD : ne pas retirer .normalize("NFD").
  ⚠ Certaines commandes Git sont destructives (reset --hard, clean -fd,
     push --force) — les descriptions doivent l'indiquer clairement.

CONVENTIONS PROJET :
  • Tokens shadcn (bg-card, text-muted-foreground, border-border).
  • Mobile first (grid-cols-1 md:grid-cols-2, flex-col sm:flex-row).
  • En-tête Genesis obligatoire.

ecosystem:       DevGuide = [
                   "@/app/dev/page.tsx",
                   "@/components/icons/github-icon.tsx",
                   "@/components/ui/badge.tsx",
                   "@/components/ui/button.tsx",
                   "@/components/ui/card.tsx",
                   "@/components/ui/input.tsx",
                   "@/components/ui/separator.tsx",
                   "@/lib/utils.ts",
                 ]
relatedFiles:    ["@/app/page.tsx",
                  "@/app/business/page.tsx",
                  "@/components/icons/github-icon.tsx",
                  "@/components/ui/card.tsx",
                  "@/lib/utils.ts"]
imports:         ["react", "next/link", "motion/react", "@/components/ui/card",
                  "@/components/ui/badge", "@/components/ui/separator",
                  "@/components/ui/input", "@/components/ui/button",
                  "@/components/icons/github-icon", "@/lib/utils", "sonner",
                  "lucide-react"]
exports:         ["default DevPage"]
useBy:           []

userStories:     ["*en tant que développeur je veux TOUTES les commandes Git, GitHub et Prisma copiables"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, MotionConfig, type Variants } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { GithubIcon } from "@/components/icons/github-icon";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  GitBranch,
  Database,
  Component,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  Search,
  Sparkles,
  Layers,
  MousePointerClick,
  CircleDot,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  ToggleLeft,
  Table2,
  Menu,
  MessageSquare,
  Info,
  Calendar,
  Play,
  AlertTriangle,
  ListFilter,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
type Command = {
  label: string;
  description: string;
  code: string;
  danger?: boolean;
};

type ShadcnComponent = {
  name: string;
  role: string;
  example: string;
  icon: React.ReactNode;
};

type Category = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  accent: string;
  commands: Command[];
};

/* ─────────────────────────────────────────────
   Variants Framer Motion
   ───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────
   Données : Git (51 commandes)
   ───────────────────────────────────────────── */
const GIT_COMMANDS: Command[] = [
  // Configuration
  {
    label: "Configurer nom",
    description: "Définit le nom d'auteur global.",
    code: 'git config --global user.name "Votre Nom"',
  },
  {
    label: "Configurer email",
    description: "Définit l'email d'auteur global.",
    code: 'git config --global user.email "vous@exemple.com"',
  },
  {
    label: "Voir la config",
    description: "Affiche toute la configuration Git.",
    code: "git config --list",
  },
  {
    label: "Alias",
    description: "Crée un raccourci (ex: git st).",
    code: "git config --global alias.st status",
  },

  // Dépôt
  {
    label: "Initialiser un dépôt",
    description: "Crée un dépôt Git local.",
    code: "git init",
  },
  {
    label: "Cloner un dépôt",
    description: "Clone un dépôt distant en local.",
    code: "git clone https://github.com/user/repo.git",
  },
  {
    label: "Cloner une branche",
    description: "Clone une branche spécifique.",
    code: "git clone -b main https://github.com/user/repo.git",
  },

  // Staging
  {
    label: "Voir l'état",
    description: "Fichiers modifiés, indexés, non suivis.",
    code: "git status",
  },
  {
    label: "Indexer tout",
    description: "Ajoute toutes les modifications à l'index.",
    code: "git add .",
  },
  {
    label: "Indexer un fichier",
    description: "Ajoute un seul fichier à l'index.",
    code: "git add chemin/du/fichier",
  },
  {
    label: "Indexer interactif",
    description: "Choisit les hunks à indexer.",
    code: "git add -p",
  },
  {
    label: "Retirer de l'index",
    description: "Retire un fichier de l'index sans perdre les modifs.",
    code: "git restore --staged chemin/du/fichier",
  },

  // Commit
  {
    label: "Commit",
    description: "Enregistre les changements indexés.",
    code: 'git commit -m "feat: description"',
  },
  {
    label: "Commit + index",
    description: "Indexe et commit les fichiers suivis en une fois.",
    code: 'git commit -am "fix: correction"',
  },
  {
    label: "Amender le dernier commit",
    description: "Modifie le message ou ajoute des fichiers au dernier commit.",
    code: "git commit --amend",
  },

  // Branches
  {
    label: "Lister les branches",
    description: "Affiche les branches locales.",
    code: "git branch",
  },
  {
    label: "Lister toutes les branches",
    description: "Affiche les branches locales et distantes.",
    code: "git branch -a",
  },
  {
    label: "Créer une branche",
    description: "Crée une branche et bascule dessus.",
    code: "git checkout -b feat/ma-fonctionnalite",
  },
  {
    label: "Changer de branche",
    description: "Bascule sur une branche existante.",
    code: "git checkout main",
  },
  {
    label: "Fusionner",
    description: "Fusionne une branche dans la courante.",
    code: "git merge feat/ma-fonctionnalite",
  },
  {
    label: "Supprimer une branche",
    description: "Supprime une branche locale fusionnée.",
    code: "git branch -d feat/ma-fonctionnalite",
  },
  {
    label: "Supprimer une branche (force)",
    description: "Supprime une branche non fusionnée.",
    code: "git branch -D feat/ma-fonctionnalite",
    danger: true,
  },

  // Remote
  {
    label: "Voir les remotes",
    description: "Liste les dépôts distants configurés.",
    code: "git remote -v",
  },
  {
    label: "Ajouter un remote",
    description: "Ajoute un dépôt distant nommé origin.",
    code: "git remote add origin https://github.com/user/repo.git",
  },
  {
    label: "Changer l'URL du remote",
    description: "Modifie l'URL du remote existant.",
    code: "git remote set-url origin https://github.com/user/repo.git",
  },
  {
    label: "Pousser",
    description: "Envoie les commits locaux vers le remote.",
    code: "git push origin main",
  },
  {
    label: "Pousser une nouvelle branche",
    description: "Pousse et lie la branche au remote.",
    code: "git push -u origin feat/ma-branche",
  },
  {
    label: "Pousser en force",
    description: "Écrase le remote (DESTRUCTIF — à éviter sur main).",
    code: "git push --force-with-lease origin feat/ma-branche",
    danger: true,
  },
  {
    label: "Tirer",
    description: "Récupère et fusionne les changements distants.",
    code: "git pull origin main",
  },
  {
    label: "Récupérer sans fusionner",
    description: "Récupère les commits distants sans les fusionner.",
    code: "git fetch origin",
  },

  // Historique
  {
    label: "Historique",
    description: "Historique compact graphique.",
    code: "git log --oneline --graph --all",
  },
  {
    label: "Historique détaillé",
    description: "Historique avec dates et auteurs.",
    code: 'git log --pretty=format:"%h %ad %an %s" --date=short',
  },
  {
    label: "Voir le diff",
    description: "Affiche les différences non indexées.",
    code: "git diff",
  },
  {
    label: "Voir le diff indexé",
    description: "Affiche les différences indexées.",
    code: "git diff --staged",
  },
  {
    label: "Qui a écrit cette ligne",
    description: "Affiche l'auteur de chaque ligne d'un fichier.",
    code: "git blame chemin/du/fichier",
  },

  // Annulation
  {
    label: "Annuler les modifs d'un fichier",
    description: "Restaure la version du dernier commit.",
    code: "git restore chemin/du/fichier",
  },
  {
    label: "Annuler le dernier commit (garder les modifs)",
    description: "Défait le commit, garde les changements en staging.",
    code: "git reset --soft HEAD~1",
  },
  {
    label: "Annuler le dernier commit (unstaged)",
    description: "Défait le commit, garde les changements non indexés.",
    code: "git reset HEAD~1",
  },
  {
    label: "Annuler le dernier commit (DESTRUCTIF)",
    description: "Défait le commit et supprime les changements.",
    code: "git reset --hard HEAD~1",
    danger: true,
  },
  {
    label: "Annuler un commit public",
    description: "Crée un commit inverse (sûr pour l'historique public).",
    code: "git revert <commit-hash>",
  },

  // Stash
  {
    label: "Mettre de côté",
    description: "Stocke les modifications non commitées.",
    code: "git stash",
  },
  {
    label: "Lister les stash",
    description: "Affiche les stash sauvegardés.",
    code: "git stash list",
  },
  {
    label: "Restaurer le stash",
    description: "Récupère les modifications mises de côté.",
    code: "git stash pop",
  },
  {
    label: "Supprimer le stash",
    description: "Supprime le dernier stash.",
    code: "git stash drop",
  },

  // Tags
  {
    label: "Créer un tag",
    description: "Crée un tag léger sur le commit courant.",
    code: "git tag v1.0.0",
  },
  {
    label: "Créer un tag annoté",
    description: "Crée un tag annoté avec message.",
    code: 'git tag -a v1.0.0 -m "Version 1.0.0"',
  },
  {
    label: "Pousser un tag",
    description: "Envoie un tag vers le remote.",
    code: "git push origin v1.0.0",
  },
  {
    label: "Lister les tags",
    description: "Affiche tous les tags.",
    code: "git tag",
  },

  // Nettoyage
  {
    label: "Lister les fichiers ignorés",
    description: "Affiche les fichiers suivis par .gitignore.",
    code: "git clean -nd",
  },
  {
    label: "Nettoyer (DESTRUCTIF)",
    description: "Supprime les fichiers non suivis.",
    code: "git clean -fd",
    danger: true,
  },
  {
    label: "Vérifier l'intégrité",
    description: "Vérifie la cohérence du dépôt.",
    code: "git fsck",
  },
];

/* ─────────────────────────────────────────────
   Données : GitHub (gh CLI — 14 commandes)
   ───────────────────────────────────────────── */
const GITHUB_COMMANDS: Command[] = [
  {
    label: "Authentification",
    description: "Connecte le CLI GitHub (OAuth navigateur).",
    code: "gh auth login",
  },
  {
    label: "Vérifier l'auth",
    description: "Affiche le compte connecté et les scopes.",
    code: "gh auth status",
  },
  {
    label: "Créer un dépôt",
    description: "Crée un repo et configure le remote origin.",
    code: "gh repo create mon-projet --private --source=. --remote=origin --push",
  },
  {
    label: "Cloner un dépôt",
    description: "Clone un repo GitHub en local.",
    code: "gh repo clone utilisateur/mon-projet",
  },
  {
    label: "Voir le dépôt",
    description: "Ouvre le repo courant dans le navigateur.",
    code: "gh repo view --web",
  },
  {
    label: "Créer une Pull Request",
    description: "Ouvre une PR interactive depuis la branche courante.",
    code: "gh pr create --fill",
  },
  {
    label: "Lister les PR",
    description: "Affiche les PR ouvertes du dépôt.",
    code: "gh pr list",
  },
  {
    label: "Voir une PR",
    description: "Affiche le détail d'une PR.",
    code: "gh pr view 42",
  },
  {
    label: "Merger une PR",
    description: "Fusionne une PR (squash par défaut).",
    code: "gh pr merge 42 --squash",
  },
  {
    label: "Créer une issue",
    description: "Ouvre une issue interactive.",
    code: 'gh issue create --title "Bug: ..." --body "Description"',
  },
  {
    label: "Lister les issues",
    description: "Affiche les issues ouvertes.",
    code: "gh issue list",
  },
  {
    label: "Créer une release",
    description: "Publie une release avec tag et notes.",
    code: 'gh release create v1.0.0 --title "v1.0.0" --notes "Première version"',
  },
  {
    label: "Lister les workflows",
    description: "Affiche les workflows CI/CD.",
    code: "gh workflow list",
  },
  {
    label: "Voir les runs CI",
    description: "Affiche l'état des runs CI.",
    code: "gh run list",
  },
];

/* ─────────────────────────────────────────────
   Données : Prisma 7 (13 commandes)
   ───────────────────────────────────────────── */
const PRISMA_COMMANDS: Command[] = [
  {
    label: "Initialiser Prisma",
    description: "Crée prisma/schema.prisma et .env.",
    code: "npx prisma init",
  },
  {
    label: "Générer le client",
    description: "Génère Prisma Client depuis le schéma.",
    code: "npx prisma generate",
  },
  {
    label: "Créer une migration",
    description: "Crée et applique une migration nommée (dev).",
    code: "npx prisma migrate dev --name init",
  },
  {
    label: "Appliquer en prod",
    description: "Applique les migrations en attente.",
    code: "npx prisma migrate deploy",
  },
  {
    label: "Statut des migrations",
    description: "Affiche l'état des migrations.",
    code: "npx prisma migrate status",
  },
  {
    label: "Résoudre une migration",
    description: "Marque une migration comme appliquée ou rollback.",
    code: "npx prisma migrate resolve --applied 20240101000000_init",
  },
  {
    label: "Ouvrir Studio",
    description: "Interface web pour explorer les données.",
    code: "npx prisma studio",
  },
  {
    label: "Seeder la base",
    description: "Exécute prisma/seed.ts.",
    code: "npx prisma db seed",
  },
  {
    label: "Réinitialiser",
    description: "Supprime, recrée et re-migre (dev uniquement).",
    code: "npx prisma migrate reset",
    danger: true,
  },
  {
    label: "Pousser sans migration",
    description: "Synchronise le schéma directement (prototypage).",
    code: "npx prisma db push",
  },
  {
    label: "Formater le schéma",
    description: "Formate prisma/schema.prisma.",
    code: "npx prisma format",
  },
  {
    label: "Valider le schéma",
    description: "Vérifie la validité sans toucher la base.",
    code: "npx prisma validate",
  },
  {
    label: "Puller le schéma depuis la DB",
    description: "Introspecte la base existante.",
    code: "npx prisma db pull",
  },
];

/* ─────────────────────────────────────────────
   Données : shadcn/ui (15 composants)
   ───────────────────────────────────────────── */
const SHADCN_COMPONENTS: ShadcnComponent[] = [
  {
    name: "Button",
    role: "Action cliquable. Variants : default, outline, ghost, destructive, secondary, link.",
    example: `import { Button } from "@/components/ui/button";

<Button variant="default">Enregistrer</Button>
<Button variant="outline">Annuler</Button>
<Button variant="destructive">Supprimer</Button>`,
    icon: <MousePointerClick className="h-4 w-4" />,
  },
  {
    name: "Card",
    role: "Conteneur de contenu structuré (header, title, description, content, footer).",
    example: `import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>`,
    icon: <Layers className="h-4 w-4" />,
  },
  {
    name: "Badge",
    role: "Étiquette compacte. Variants : default, secondary, outline, destructive.",
    example: `import { Badge } from "@/components/ui/badge";

<Badge>Nouveau</Badge>
<Badge variant="secondary">Brouillon</Badge>
<Badge variant="outline">Archivé</Badge>`,
    icon: <CircleDot className="h-4 w-4" />,
  },
  {
    name: "Input",
    role: "Champ de saisie texte (à combiner avec Label).",
    example: `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="vous@exemple.com" />`,
    icon: <AlignLeft className="h-4 w-4" />,
  },
  {
    name: "Select",
    role: "Menu déroulant à choix unique.",
    example: `import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

<Select>
  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>`,
    icon: <ChevronDown className="h-4 w-4" />,
  },
  {
    name: "Checkbox",
    role: "Case à cocher (booléen ou sélection multiple).",
    example: `import { Checkbox } from "@/components/ui/checkbox";

<Checkbox id="terms" />
<label htmlFor="terms">J'accepte les conditions</label>`,
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    name: "Switch",
    role: "Interrupteur on/off.",
    example: `import { Switch } from "@/components/ui/switch";

<Switch id="dark" />
<label htmlFor="dark">Mode sombre</label>`,
    icon: <ToggleLeft className="h-4 w-4" />,
  },
  {
    name: "Table",
    role: "Tableau de données structuré.",
    example: `import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow><TableHead>Nom</TableHead><TableHead>Statut</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    <TableRow><TableCell>Projet A</TableCell><TableCell>Actif</TableCell></TableRow>
  </TableBody>
</Table>`,
    icon: <Table2 className="h-4 w-4" />,
  },
  {
    name: "Tabs",
    role: "Navigation par onglets.",
    example: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Onglet A</TabsTrigger>
    <TabsTrigger value="b">Onglet B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Contenu A</TabsContent>
  <TabsContent value="b">Contenu B</TabsContent>
</Tabs>`,
    icon: <Menu className="h-4 w-4" />,
  },
  {
    name: "Dialog",
    role: "Modale accessible (focus trap, escape).",
    example: `import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger>Ouvrir</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirmer</DialogTitle>
      <DialogDescription>Action irréversible.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    name: "Tooltip",
    role: "Info-bulle au survol (TooltipProvider déjà dans layout.tsx).",
    example: `import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger>Survol</TooltipTrigger>
  <TooltipContent>Info-bulle</TooltipContent>
</Tooltip>`,
    icon: <Info className="h-4 w-4" />,
  },
  {
    name: "Calendar",
    role: "Sélecteur de date (react-day-picker).",
    example: `import { Calendar } from "@/components/ui/calendar";

<Calendar mode="single" selected={date} onSelect={setDate} />`,
    icon: <Calendar className="h-4 w-4" />,
  },
  {
    name: "Progress",
    role: "Barre de progression (0-100).",
    example: `import { Progress } from "@/components/ui/progress";

<Progress value={65} className="h-2" />`,
    icon: <Play className="h-4 w-4" />,
  },
  {
    name: "Separator",
    role: "Ligne de séparation horizontale ou verticale.",
    example: `import { Separator } from "@/components/ui/separator";

<Separator />
<Separator orientation="vertical" />`,
    icon: <Layers className="h-4 w-4" />,
  },
  {
    name: "Alert",
    role: "Message d'alerte contextuel. Variants : default, destructive.",
    example: `import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert>
  <AlertTitle>Attention</AlertTitle>
  <AlertDescription>Vérifiez vos données.</AlertDescription>
</Alert>`,
    icon: <AlertTriangle className="h-4 w-4" />,
  },
];

/* ─────────────────────────────────────────────
   Catégories
   ───────────────────────────────────────────── */
const CATEGORIES: Category[] = [
  {
    id: "git",
    title: "Git",
    subtitle: `${GIT_COMMANDS.length} commandes : config, staging, commit, branches, remote, annulation, stash, tags.`,
    icon: <GitBranch className="h-5 w-5" />,
    gradient: "from-orange-500 to-rose-500",
    accent: "text-orange-600 dark:text-orange-400",
    commands: GIT_COMMANDS,
  },
  {
    id: "github",
    title: "GitHub (gh CLI)",
    subtitle: `${GITHUB_COMMANDS.length} commandes : auth, repo, PR, issues, releases, CI.`,
    icon: <GithubIcon size={20} />,
    gradient: "from-zinc-700 to-zinc-900",
    accent: "text-zinc-700 dark:text-zinc-300",
    commands: GITHUB_COMMANDS,
  },
  {
    id: "prisma",
    title: "Prisma 7",
    subtitle: `${PRISMA_COMMANDS.length} commandes : migrations, client, seed, introspection.`,
    icon: <Database className="h-5 w-5" />,
    gradient: "from-blue-500 to-cyan-500",
    accent: "text-blue-600 dark:text-blue-400",
    commands: PRISMA_COMMANDS,
  },
];

/* ─────────────────────────────────────────────
   Utilitaires de recherche
   ───────────────────────────────────────────── */
function normalizeSearch(value: string): string {
  return value
    .toLocaleLowerCase("fr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* ─────────────────────────────────────────────
   Sous-composant : ligne copiable
   ───────────────────────────────────────────── */
type CopyRowProps = {
  label: string;
  description?: string;
  code: string;
  multiline?: boolean;
  accent?: string;
  danger?: boolean;
};

function CopyRow({
  label,
  description,
  code,
  multiline = false,
  accent,
  danger = false,
}: CopyRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copié dans le presse-papiers");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error(
        "Impossible de copier. Vérifiez les permissions du navigateur.",
      );
    }
  };

  return (
    <div
      className={cn(
        "group flex min-w-0 items-start gap-3 rounded-xl border p-3 transition-all duration-200",
        danger
          ? "border-rose-500/30 bg-rose-500/[0.04] hover:border-rose-500/50 hover:bg-rose-500/[0.07]"
          : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-sm font-semibold leading-5",
                danger
                  ? "text-rose-700 dark:text-rose-400"
                  : (accent ?? "text-foreground"),
              )}
            >
              {label}
            </span>
            {danger && (
              <Badge
                variant="outline"
                className="h-5 gap-1 border-rose-500/30 px-1.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400"
              >
                <AlertTriangle className="h-3 w-3" />
                Risque
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <pre
          className={cn(
            "max-w-full overflow-x-auto rounded-lg border border-white/5 bg-zinc-950 px-3 py-2.5 font-mono text-[11px] leading-5 text-zinc-100 shadow-inner sm:text-xs",
            multiline ? "whitespace-pre" : "whitespace-nowrap",
          )}
        >
          <code>{code}</code>
        </pre>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? `Copié : ${label}` : `Copier : ${label}`}
        title={copied ? "Copié" : "Copier dans le presse-papiers"}
        className={cn(
          "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          copied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
        )}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section : commandes par catégorie
   ───────────────────────────────────────────── */
type CommandSectionProps = {
  category: Category;
  query: string;
};

function CommandSection({ category, query }: CommandSectionProps) {
  const filtered = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return category.commands;

    return category.commands.filter((command) => {
      const searchableContent = normalizeSearch(
        `${command.label} ${command.description} ${command.code}`,
      );
      return searchableContent.includes(normalizedQuery);
    });
  }, [category.commands, query]);

  if (filtered.length === 0) return null;

  return (
    <motion.section
      id={category.id}
      variants={itemVariants}
      className="scroll-mt-24 flex flex-col gap-4"
      aria-labelledby={`${category.id}-heading`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
              category.gradient,
            )}
          >
            {category.icon}
          </span>
          <div className="min-w-0">
            <h2
              id={`${category.id}-heading`}
              className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              {category.title}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">
              {category.subtitle}
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {filtered.length} / {category.commands.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-2">
        {filtered.map((command) => (
          <CopyRow
            key={`${category.id}-${command.label}`}
            label={command.label}
            description={command.description}
            code={command.code}
            accent={category.accent}
            danger={command.danger}
          />
        ))}
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────
   Section : composants shadcn/ui
   ───────────────────────────────────────────── */
function ShadcnSection({ query }: { query: string }) {
  const filteredComponents = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return SHADCN_COMPONENTS;

    return SHADCN_COMPONENTS.filter((component) =>
      normalizeSearch(
        `${component.name} ${component.role} ${component.example}`,
      ).includes(normalizedQuery),
    );
  }, [query]);

  if (filteredComponents.length === 0) return null;

  return (
    <motion.section
      id="shadcn"
      variants={itemVariants}
      className="scroll-mt-24 flex flex-col gap-5"
      aria-labelledby="shadcn-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <Component className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="shadcn-heading"
              className="text-lg font-bold tracking-tight text-foreground sm:text-xl"
            >
              Composants shadcn/ui
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:text-sm">
              Rôle, import et exemple d&apos;utilisation prêt à copier.
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0 tabular-nums">
          {filteredComponents.length} / {SHADCN_COMPONENTS.length}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredComponents.map((component) => (
          <Card
            key={component.name}
            className="group flex min-w-0 flex-col overflow-hidden border-border/70 bg-card transition-all duration-200 hover:border-violet-500/30 hover:shadow-md"
          >
            <CardHeader className="gap-3 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 transition-colors group-hover:bg-violet-500/15 dark:text-violet-400">
                  {component.icon}
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-base">{component.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Composant shadcn/ui
                  </p>
                </div>
              </div>
              <CardDescription className="text-sm leading-6">
                {component.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <CopyRow
                label={`Exemple — ${component.name}`}
                code={component.example}
                multiline
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function DevPage() {
  const [query, setQuery] = React.useState("");

  const totalCommands =
    GIT_COMMANDS.length + GITHUB_COMMANDS.length + PRISMA_COMMANDS.length;

  const filteredCommandCount = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return totalCommands;

    return CATEGORIES.reduce((total, category) => {
      return (
        total +
        category.commands.filter((command) =>
          normalizeSearch(
            `${command.label} ${command.description} ${command.code}`,
          ).includes(normalizedQuery),
        ).length
      );
    }, 0);
  }, [query, totalCommands]);

  const filteredComponentCount = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);
    if (!normalizedQuery) return SHADCN_COMPONENTS.length;

    return SHADCN_COMPONENTS.filter((component) =>
      normalizeSearch(
        `${component.name} ${component.role} ${component.example}`,
      ).includes(normalizedQuery),
    ).length;
  }, [query]);

  const hasResults = filteredCommandCount > 0 || filteredComponentCount > 0;

  const navigationItems = [
    ...CATEGORIES.map((category) => ({
      id: category.id,
      label: category.title,
      count: category.commands.length,
    })),
    { id: "shadcn", label: "shadcn/ui", count: SHADCN_COMPONENTS.length },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-background">
        {/* Décor d'arrière-plan */}
        <div
          className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute -top-40 left-[-8rem] h-[28rem] w-[28rem] rounded-full bg-emerald-400/[0.09] blur-3xl dark:bg-emerald-500/[0.07]" />
          <div className="absolute right-[-10rem] top-[28rem] h-[30rem] w-[30rem] rounded-full bg-blue-400/[0.08] blur-3xl dark:bg-blue-500/[0.06]" />
          <div className="absolute bottom-20 left-1/3 h-[24rem] w-[24rem] rounded-full bg-violet-400/[0.07] blur-3xl dark:bg-violet-500/[0.05]" />
        </div>

        <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          {/* En-tête */}
          <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Ultimate Base App</span>
                <span aria-hidden="true">/</span>
                <span>Developer Toolkit</span>
              </div>
              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-500/25 bg-emerald-500/[0.06] px-2.5 py-1 text-emerald-700 dark:text-emerald-400"
              >
                <Terminal className="h-3.5 w-3.5" />
                Référence développeur
              </Badge>
            </motion.div>

            <motion.div variants={itemVariants} className="max-w-3xl space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Commandes{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                  & composants
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Une référence centralisée pour les commandes Git, GitHub et
                Prisma, ainsi que les composants shadcn/ui utilisés dans vos
                projets. Recherchez, consultez et copiez directement les
                exemples dont vous avez besoin.
              </p>
            </motion.div>

            {/* Indicateurs */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              <Card className="border-border/70 bg-card/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <GitBranch className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums">
                      {GIT_COMMANDS.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Commandes Git
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Database className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums">
                      {GITHUB_COMMANDS.length + PRISMA_COMMANDS.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      GitHub & Prisma
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <Component className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold tabular-nums">
                      {SHADCN_COMPONENTS.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Composants shadcn/ui
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recherche et navigation */}
            <motion.div
              variants={itemVariants}
              className="sticky top-3 z-20 flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/90 p-3 shadow-lg shadow-black/[0.03] backdrop-blur-xl sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher une commande, un composant, un exemple…"
                    className="h-11 border-border/70 bg-card pl-9 pr-10 text-sm shadow-none focus-visible:ring-2"
                    aria-label="Rechercher dans les commandes et composants"
                    autoComplete="off"
                  />
                  {query.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Effacer la recherche"
                      title="Effacer la recherche"
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="sr-only">Effacer</span>
                      <span aria-hidden="true">×</span>
                    </button>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ListFilter className="h-4 w-4" />
                    <span className="tabular-nums">
                      {filteredCommandCount + filteredComponentCount} résultat
                      {filteredCommandCount + filteredComponentCount > 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href="/"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-9 gap-1.5",
                      )}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Guide global</span>
                      <span className="sm:hidden">Accueil</span>
                    </Link>
                    <Link
                      href="/business"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-9 gap-1.5",
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Business</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Accès rapide
                </span>
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                    <span className="text-[10px] tabular-nums text-muted-foreground/70">
                      {item.count}
                    </span>
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.header>

          {/* Résultats des commandes */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-9"
          >
            {CATEGORIES.map((category) => {
              const normalizedQuery = normalizeSearch(query);
              const categoryHasResults =
                !normalizedQuery ||
                category.commands.some((command) =>
                  normalizeSearch(
                    `${command.label} ${command.description} ${command.code}`,
                  ).includes(normalizedQuery),
                );

              if (!categoryHasResults) return null;

              return (
                <React.Fragment key={category.id}>
                  <CommandSection category={category} query={query} />
                  <Separator />
                </React.Fragment>
              );
            })}

            <ShadcnSection query={query} />

            {!hasResults && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-5 py-16 text-center"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Search className="h-5 w-5" />
                </span>
                <h2 className="text-base font-semibold">
                  Aucun résultat trouvé
                </h2>
                <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
                  Aucun résultat ne correspond à « {query} ». Essayez un autre
                  terme ou effacez votre recherche.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4",
                  )}
                >
                  Effacer la recherche
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Rappels Base UI */}
          <motion.section
            variants={itemVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="scroll-mt-24"
            aria-labelledby="base-ui-heading"
          >
            <Card className="overflow-hidden border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] via-card to-orange-500/[0.05] shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle id="base-ui-heading" className="text-base">
                      Rappels Base UI
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Points de vigilance pour les composants shadcn/ui basés
                      sur Base UI.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
                <div className="rounded-xl border border-amber-500/15 bg-background/60 p-4">
                  <p className="font-semibold text-foreground">
                    Ne pas utiliser{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      asChild
                    </code>
                  </p>
                  <p className="mt-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      asChild
                    </code>{" "}
                    n&apos;existe pas sur Base UI. Pour un lien stylé comme un
                    bouton, utilisez{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      buttonVariants
                    </code>{" "}
                    sur un{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      &lt;Link&gt;
                    </code>
                    .
                  </p>
                </div>
                <div className="rounded-xl border border-amber-500/15 bg-background/60 p-4">
                  <p className="font-semibold text-foreground">
                    Utilisation de{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      render
                    </code>
                  </p>
                  <p className="mt-1">
                    Si vous utilisez{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      render=&#123;&lt;Link /&gt;&#125;
                    </code>
                    , ajoutez{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      nativeButton=&#123;false&#125;
                    </code>{" "}
                    pour éviter l&apos;avertissement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Pied de page */}
          <footer className="flex flex-col gap-2 border-t border-border/60 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Ultimate Base App · Référence développeur</p>
            <p className="tabular-nums">
              {totalCommands} commandes · {SHADCN_COMPONENTS.length} composants
              shadcn/ui
            </p>
          </footer>
        </main>
      </div>
    </MotionConfig>
  );
}
