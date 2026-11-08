/*
path :           app/dev/page.tsx
tag :            ["dev", "guide", "git", "github", "prisma", "shadcn", "commandes"]
projectId:       <UltimateBaseApp>
type:            page
generic:         false

role:            Page de référence développeur. Centralise les commandes Git, GitHub
                 et Prisma, ainsi qu'un catalogue des composants shadcn/ui avec leur
                 rôle et un exemple de code copiable. Chaque commande et chaque
                 exemple dispose d'une icône Lucide de copie (Check si copié) qui
                 utilise navigator.clipboard + toast de confirmation.
                 Page 100% client (clipboard + état de copie + animations).

flow:            DevPage() → state copiedId → sections :
                 1) Git (init, status, add, commit, push, pull, branch, merge)
                 2) GitHub (gh auth, repo, PR, issues, release)
                 3) Prisma (init, generate, migrate, studio, seed, reset)
                 4) shadcn/ui (catalogue : role + exemple de code par composant)
                 Chaque item → <CopyRow code={...} label={...} /> → clic icône →
                 navigator.clipboard.writeText → setCopiedId(id) → toast.success
                 → reset après 2s.

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne PAS utiliser <Button asChild> (API Radix) — utiliser buttonVariants
     sur <Link> ou nativeButton={false} si render est utilisé (Base UI).
  ✘ Ne PAS hardcoder les couleurs (bg-blue-500) — utiliser les tokens shadcn
     (bg-primary, text-foreground, border-border).
  ✘ Ne PAS copier du code dans les exemples qui utilise asChild/render sans
     préciser la règle Base UI.
  ✘ Ne PAS rendre cette page côté serveur : clipboard + état requièrent
     "use client".

AUTORISÉ :
  ✔ Ajouter une commande dans les tableaux GIT_COMMANDS, GITHUB_COMMANDS,
     PRISMA_COMMANDS (respecter la forme { label, description, code }).
  ✔ Ajouter un composant shadcn dans SHADCN_COMPONENTS (forme { name, role,
     example, icon }).
  ✔ Réutiliser <CopyRow /> pour toute nouvelle commande copiable.
  ✔ Utiliser les icônes Lucide existantes (GitBranch, Github, Database,
     Component, Copy, Check, etc.).

PIÈGES :
  ⚠ navigator.clipboard n'existe pas en SSR → garder "use client" et
     vérifier typeof navigator !== "undefined" avant usage.
  ⚠ Le composant <Progress> shadcn (Radix) peut nécessiter "use client" —
     déjà couvert par cette page.
  ⚠ Ne pas utiliser <Badge> avec asChild — passer le contenu en children.
  ⚠ Les commandes Prisma 7 exigent prisma.config.ts + adaptateur — l'indiquer
     dans la description, pas dans le code (le code reste la commande CLI).

CONVENTIONS PROJET :
  • Alias d'import : @/components/ui/*, @/lib/utils, lucide-react.
  • Tokens shadcn uniquement (bg-card, text-muted-foreground, ring-border).
  • Mobile first : grilles grid-cols-1 md:grid-cols-2.
  • En-tête Genesis obligatoire sur toute nouvelle page ajoutée ici.

ecosystem:       DevGuide = [
                   "@/app/dev/page.tsx",
                   "@/components/ui/badge.tsx",
                   "@/components/ui/button.tsx",
                   "@/components/ui/card.tsx",
                   "@/components/ui/separator.tsx",
                   "@/lib/utils.ts",
                 ]
relatedFiles:    ["@/app/page.tsx",
                  "@/components/ui/card.tsx",
                  "@/components/ui/badge.tsx",
                  "@/components/ui/button.tsx",
                  "@/lib/utils.ts"]
imports:         ["react", "next/link", "motion/react", "@/components/ui/card",
                  "@/components/ui/badge", "@/components/ui/separator",
                  "@/lib/utils", "sonner", "lucide-react"]
exports:         ["default DevPage"]
useBy:           []

userStories:     ["*en tant que développeur je veux une page de référence avec les commandes Git, GitHub, Prisma et les composants shadcn copiables"]
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
import { buttonVariants } from "@/components/ui/button";
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
  Rocket,
  FolderGit2,
  GitPullRequest,
  Tag,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Play,
  Trash2,
  FileCode2,
  Boxes,
  MousePointerClick,
  CircleDot,
  Layers,
  Menu,
  MessageSquare,
  Calendar,
  Table2,
  ToggleLeft,
  AlignLeft,
  ChevronDown,
  CheckSquare,
  Info,
  AlertTriangle,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */
type Command = {
  label: string;
  description: string;
  code: string;
};

type ShadcnComponent = {
  name: string;
  role: string;
  example: string;
  icon: React.ReactNode;
};

/* ─────────────────────────────────────────────
   Variants Framer Motion
   ───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─────────────────────────────────────────────
   Données : Git
   ───────────────────────────────────────────── */
const GIT_COMMANDS: Command[] = [
  {
    label: "Initialiser un dépôt",
    description: "Crée un dépôt Git local dans le dossier courant.",
    code: "git init",
  },
  {
    label: "Voir l'état",
    description: "Affiche les fichiers modifiés, indexés et non suivis.",
    code: "git status",
  },
  {
    label: "Indexer tous les changements",
    description: "Ajoute toutes les modifications à l'index (staging).",
    code: "git add .",
  },
  {
    label: "Commit",
    description: "Enregistre les changements indexés avec un message.",
    code: 'git commit -m "feat: description du changement"',
  },
  {
    label: "Pousser vers le remote",
    description: "Envoie les commits locaux vers la branche distante.",
    code: "git push origin main",
  },
  {
    label: "Tirer les changements",
    description: "Récupère et fusionne les changements distants.",
    code: "git pull origin main",
  },
  {
    label: "Créer une branche",
    description: "Crée une nouvelle branche et bascule dessus.",
    code: "git checkout -b feat/ma-fonctionnalite",
  },
  {
    label: "Fusionner une branche",
    description: "Fusionne la branche courante dans main.",
    code: "git checkout main && git merge feat/ma-fonctionnalite",
  },
  {
    label: "Voir l'historique",
    description: "Affiche l'historique compact des commits.",
    code: "git log --oneline --graph --all",
  },
  {
    label: "Annuler un fichier indexé",
    description: "Retire un fichier de l'index sans perdre les modifications.",
    code: "git restore --staged chemin/du/fichier",
  },
];

/* ─────────────────────────────────────────────
   Données : GitHub (gh CLI)
   ───────────────────────────────────────────── */
const GITHUB_COMMANDS: Command[] = [
  {
    label: "Authentification",
    description: "Connecte le CLI GitHub à votre compte (OAuth navigateur).",
    code: "gh auth login",
  },
  {
    label: "Vérifier l'authentification",
    description: "Affiche le compte connecté et les scopes.",
    code: "gh auth status",
  },
  {
    label: "Créer un dépôt distant",
    description: "Crée un repo GitHub et configure le remote origin.",
    code: "gh repo create mon-projet --public --source=. --remote=origin --push",
  },
  {
    label: "Cloner un dépôt",
    description: "Clone un repo GitHub en local.",
    code: "gh repo clone utilisateur/mon-projet",
  },
  {
    label: "Créer une Pull Request",
    description: "Ouvre une PR interactive depuis la branche courante.",
    code: "gh pr create --fill",
  },
  {
    label: "Lister les Pull Requests",
    description: "Affiche les PR ouvertes du dépôt courant.",
    code: "gh pr list",
  },
  {
    label: "Créer une issue",
    description: "Ouvre une issue interactive.",
    code: 'gh issue create --title "Bug: ..." --body "Description"',
  },
  {
    label: "Créer une release",
    description: "Publie une release avec tag et notes.",
    code: 'gh release create v1.0.0 --title "v1.0.0" --notes "Première version"',
  },
];

/* ─────────────────────────────────────────────
   Données : Prisma 7
   ───────────────────────────────────────────── */
const PRISMA_COMMANDS: Command[] = [
  {
    label: "Initialiser Prisma",
    description: "Crée prisma/schema.prisma et .env (DATABASE_URL).",
    code: "npx prisma init",
  },
  {
    label: "Générer le client",
    description: "Génère Prisma Client depuis le schéma (après chaque modif).",
    code: "npx prisma generate",
  },
  {
    label: "Créer une migration",
    description: "Crée et applique une migration nommée en dev.",
    code: "npx prisma migrate dev --name init",
  },
  {
    label: "Appliquer en production",
    description: "Applique les migrations en attente (sans reset).",
    code: "npx prisma migrate deploy",
  },
  {
    label: "Ouvrir Prisma Studio",
    description: "Interface web pour explorer et éditer les données.",
    code: "npx prisma studio",
  },
  {
    label: "Seeder la base",
    description: "Exécute le script de seed (prisma/seed.ts).",
    code: "npx prisma db seed",
  },
  {
    label: "Réinitialiser la base",
    description: "Supprime, recrée et re-migre la base (dev uniquement).",
    code: "npx prisma migrate reset",
  },
  {
    label: "Pousser le schéma sans migration",
    description: "Synchronise le schéma directement (prototypage rapide).",
    code: "npx prisma db push",
  },
  {
    label: "Formater le schéma",
    description: "Formate prisma/schema.prisma selon les conventions.",
    code: "npx prisma format",
  },
  {
    label: "Valider le schéma",
    description: "Vérifie la validité du schéma sans toucher la base.",
    code: "npx prisma validate",
  },
];

/* ─────────────────────────────────────────────
   Données : shadcn/ui
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
    role: "Conteneur de contenu structuré : header, title, description, content, footer.",
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
    role: "Étiquette compacte pour statut, catégorie ou tag. Variants : default, secondary, outline, destructive.",
    example: `import { Badge } from "@/components/ui/badge";

<Badge>Nouveau</Badge>
<Badge variant="secondary">Brouillon</Badge>
<Badge variant="outline">Archivé</Badge>`,
    icon: <CircleDot className="h-4 w-4" />,
  },
  {
    name: "Input",
    role: "Champ de saisie texte simple (à combiner avec Label).",
    example: `import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="vous@exemple.com" />`,
    icon: <AlignLeft className="h-4 w-4" />,
  },
  {
    name: "Select",
    role: "Menu déroulant à choix unique (Radix Select).",
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
    role: "Case à cocher pour booléen ou sélection multiple.",
    example: `import { Checkbox } from "@/components/ui/checkbox";

<Checkbox id="terms" />
<label htmlFor="terms">J'accepte les conditions</label>`,
    icon: <CheckSquare className="h-4 w-4" />,
  },
  {
    name: "Switch",
    role: "Interrupteur on/off pour préférence binaire.",
    example: `import { Switch } from "@/components/ui/switch";

<Switch id="dark" />
<label htmlFor="dark">Mode sombre</label>`,
    icon: <ToggleLeft className="h-4 w-4" />,
  },
  {
    name: "Table",
    role: "Tableau de données structuré (header, body, row, cell).",
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
    role: "Navigation par onglets pour organiser du contenu.",
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
    role: "Info-bulle au survol (déjà enveloppée par TooltipProvider dans layout.tsx).",
    example: `import {
  Tooltip, TooltipTrigger, TooltipContent,
} from "@/components/ui/tooltip";

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
   Sous-composant : ligne copiable
   ───────────────────────────────────────────── */
type CopyRowProps = {
  id: string;
  label: string;
  description?: string;
  code: string;
  multiline?: boolean;
};

function CopyRow({ id, label, description, code, multiline }: CopyRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description && (
            <span className="hidden text-xs text-muted-foreground sm:inline">
              — {description}
            </span>
          )}
        </div>
        <pre
          className={cn(
            "overflow-x-auto rounded-md bg-muted/60 px-3 py-2 font-mono text-xs text-foreground",
            multiline ? "whitespace-pre" : "whitespace-nowrap",
          )}
        >
          <code>{code}</code>
        </pre>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copié" : "Copier"}
        className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sous-composant : section
   ───────────────────────────────────────────── */
type SectionProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  children: React.ReactNode;
};

function Section({
  title,
  description,
  icon,
  gradient,
  children,
}: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-md`}
        >
          {icon}
        </span>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
   ───────────────────────────────────────────── */
export default function DevPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-1 flex-col overflow-hidden bg-background">
        {/* Décor de fond */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
          <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/10" />
        </div>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* ── Header ─────────────────────────── */}
          <motion.header
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="secondary" className="w-fit gap-1.5">
                <Terminal className="h-3 w-3 text-emerald-500" />
                Référence développeur
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Commandes & composants
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-base leading-7 text-muted-foreground"
            >
              Toutes les commandes Git, GitHub et Prisma du projet, ainsi que le
              catalogue des composants shadcn/ui avec leur rôle et un exemple
              copiable. Cliquez sur l&apos;icône pour copier.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-fit",
                )}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Retour au guide
              </Link>
            </motion.div>
          </motion.header>

          {/* ── Git ────────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                title="Git"
                description="Commandes essentielles du quotidien."
                icon={<GitBranch className="h-5 w-5" />}
                gradient="from-orange-500 to-rose-500"
              >
                {GIT_COMMANDS.map((cmd) => (
                  <CopyRow
                    key={cmd.label}
                    id={`git-${cmd.label}`}
                    label={cmd.label}
                    description={cmd.description}
                    code={cmd.code}
                  />
                ))}
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          <Separator />

          {/* ── Prisma ─────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                title="Prisma 7"
                description="Migrations, génération du client, seed et exploration."
                icon={<Database className="h-5 w-5" />}
                gradient="from-blue-500 to-cyan-500"
              >
                {PRISMA_COMMANDS.map((cmd) => (
                  <CopyRow
                    key={cmd.label}
                    id={`prisma-${cmd.label}`}
                    label={cmd.label}
                    description={cmd.description}
                    code={cmd.code}
                  />
                ))}
              </Section>
            </motion.div>
          </motion.div>

          <Separator />

          {/* ── shadcn/ui ──────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Section
                title="Composants shadcn/ui"
                description="Rôle de chaque composant et exemple de code copiable."
                icon={<Component className="h-5 w-5" />}
                gradient="from-violet-500 to-fuchsia-500"
              >
                {SHADCN_COMPONENTS.map((comp) => (
                  <Card key={comp.name} className="border-border/60 bg-card/60">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-violet-600 dark:text-violet-400">
                          {comp.icon}
                        </span>
                        <CardTitle className="text-base">{comp.name}</CardTitle>
                      </div>
                      <CardDescription>{comp.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <CopyRow
                        id={`shadcn-${comp.name}`}
                        label="Exemple"
                        code={comp.example}
                        multiline
                      />
                    </CardContent>
                  </Card>
                ))}
              </Section>
            </motion.div>
          </motion.div>

          {/* ── Rappels ────────────────────────── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={itemVariants}>
              <Card className="border-amber-300/60 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Rappels Base UI
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>
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
                  <p>
                    Si vous utilisez{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      render=&#123;&lt;Link /&gt;&#125;
                    </code>
                    , ajoutez{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      nativeButton=&#123;false&#125;
                    </code>{" "}
                    pour éviter l&apos;avertissement Base UI.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
