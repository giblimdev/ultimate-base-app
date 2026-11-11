/*
path :           app/genesis/lib/tools.ts
tag :            ["genesis", "config", "tools", "registry", "navigation"]
projectId:       <ultimate-genesis>
type:            config
generic:         true

role:            Registre statique des outils Genesis. Source de vérité
                 unique pour la page hub /genesis et la navigation. Chaque
                 outil expose href, titre, catégorie, icône, rôle, mécanisme,
                 entrées/sorties, nature, dépendances ET un statut "ready"
                 | "planned". Les outils "planned" ne sont pas liés (évite
                 les 404). History est ajouté en "ready" car il fait partie
                 du flux Create Files (consulter/restaurer les backups).

flow:            GENESIS_TOOLS (const) → consommé par app/genesis/page.tsx
                 (filtré : carte cliquable si ready, carte désactivée si
                 planned) et par data/nav.ts (navigation).

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/history.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/history/HistoryView.tsx",
                   "@/app/genesis/history/page.tsx",
                   "@/app/genesis/lib/exclusions.ts",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/script-integrity.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                   "@/app/genesis/read-files/ReadFilesView.tsx",
                   "@/app/genesis/read-files/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/page.tsx", "@/data/nav.ts"]
imports:         ["lucide-react"]
exports:         ["GENESIS_TOOLS", "GenesisTool", "GenesisToolCategory",
                  "GenesisToolStatus", "GenesisToolProduces"]
useBy:           ["@/app/genesis/page.tsx"]

userStories:     ["*en tant que développeur je veux une source unique pour les outils Genesis",
                  "*en tant qu'utilisateur je veux consulter l'historique des backups",
                  "*en tant qu'utilisateur je ne veux pas tomber sur des 404 en cliquant sur un outil"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { LucideIcon } from "lucide-react";
import {
  FilePlus2,
  FileSearch,
  FilePenLine,
  History as HistoryIcon,
  ListChecks,
  MessageSquareCode,
  GitBranch,
  GitMerge,
} from "lucide-react";

export type GenesisToolCategory =
  | "Fichiers"
  | "Qualité"
  | "Assistance"
  | "CI/CD";

export type GenesisToolProduces =
  | "file"
  | "code"
  | "prompt"
  | "check"
  | "action";

export type GenesisToolStatus = "ready" | "planned";

export type GenesisTool = {
  href: string;
  title: string;
  description: string;
  category: GenesisToolCategory;
  icon: LucideIcon;
  status: GenesisToolStatus;
  role?: string;
  how?: string;
  input?: string[];
  output?: string[];
  produces?: GenesisToolProduces;
  dependsOn?: string[];
};

export const GENESIS_TOOLS: GenesisTool[] = [
  {
    href: "/genesis/create-files",
    title: "Create Files",
    description:
      "Créer un ou plusieurs fichiers à partir de scripts complets, au chemin déclaré dans leur en-tête, avec vérification d'intégrité et backup automatique.",
    category: "Fichiers",
    icon: FilePlus2,
    status: "ready",
    role: "Écrire sur disque un ou plusieurs scripts Genesis collés en une fois, sans ressaisie du chemin ni du type (lus dans l'en-tête). Un script tronqué n'ouvre pas de nouvelle zone sans forçage explicite. Tout fichier existant est sauvegardé dans data/backup/ avant écrasement.",
    how: "L'utilisateur colle un script par zone auto-générée. Une nouvelle zone apparaît uniquement si la dernière est complète (checkScriptIntegrity) ou forcée. Une Server Action parse chaque en-tête, écrit chaque fichier à son path, et copie l'ancien contenu dans data/backup/<chemin-relatif> avant écrasement.",
    input: [
      "Dossier racine (RootFsPicker)",
      "Un ou plusieurs scripts complets (en-tête + code)",
      "Forçage optionnel par zone incomplète",
    ],
    output: [
      "Fichiers écrits à leur path d'en-tête",
      "Backups dans data/backup/ pour les fichiers écrasés",
    ],
    produces: "file",
    dependsOn: [
      "@/app/genesis/lib/header-parser.ts",
      "@/app/genesis/lib/script-integrity.ts",
      "@/app/genesis/lib/fs-utils.ts",
      "@/app/genesis/components/RootFsPicker.tsx",
    ],
  },
  {
    href: "/genesis/read-files",
    title: "Read Files",
    description:
      "Parcourir, lire, sélectionner des fichiers, exporter un JSON (copie + sauvegarde dans data/app/) et gérer les exclusions.",
    category: "Fichiers",
    icon: FileSearch,
    status: "ready",
    role: "Inspecter le contenu des fichiers du projet, sélectionner des fichiers pour en exporter un JSON, et gérer la liste des dossiers/fichiers exclus de l'exposition.",
    how: "Arborescence filtrée par exclusions (data/app/exclusions.json) ; sélection multi-fichiers ; export JSON via exportSelectionAction ; panneau de gestion des exclusions avec ajout/suppression/reset.",
    input: [
      "Dossier racine (RootFsPicker)",
      "Fichiers cochés pour l'export",
      "Motifs d'exclusion (dossiers et fichiers)",
    ],
    output: [
      "Arborescence filtrée",
      "Contenu du fichier (lecture seule)",
      "JSON exporté (copié et sauvegardé)",
      "Liste d'exclusions persistée",
    ],
    produces: "check",
    dependsOn: [
      "@/app/genesis/actions/readFiles.ts",
      "@/app/genesis/actions/exclusions.ts",
      "@/app/genesis/lib/exclusions.ts",
      "@/app/genesis/lib/header-parser.ts",
      "@/app/genesis/components/RootFsPicker.tsx",
    ],
  },
  {
    href: "/genesis/history",
    title: "History",
    description:
      "Consulter, restaurer et supprimer les backups créés automatiquement avant chaque écrasement.",
    category: "Fichiers",
    icon: HistoryIcon,
    status: "ready",
    role: "Voir l'historique des créations et modifications de fichiers, restaurer un état antérieur, supprimer les backups obsolètes.",
    how: "Lecture de data/backup/ (walk récursif + hash sha256 tronqué + date + taille) ; restauration par copie vers le chemin d'origine (avec backup de l'état actuel) ; suppression définitive avec confirmation.",
    input: [
      "Dossier racine (RootFsPicker)",
      "Filtre texte sur le chemin",
    ],
    output: [
      "Liste des backups triés par date",
      "Fichier restauré à son chemin d'origine",
      "Backup supprimé",
    ],
    produces: "action",
    dependsOn: [
      "@/app/genesis/actions/history.ts",
      "@/app/genesis/lib/fs-utils.ts",
      "@/app/genesis/components/RootFsPicker.tsx",
    ],
  },
  {
    href: "/genesis/quality/header",
    title: "Header Checker",
    description:
      "Valider la conformité des en-têtes Genesis (path, imports, exports, useBy…).",
    category: "Qualité",
    icon: FilePenLine,
    status: "planned",
    role: "Garantir que la convention Contributing (en-tête complet, chemins complets, ecosystem synchronisé) est respectée sur tous les fichiers du projet.",
    how: "Scan récursif des fichiers ; parsing de l'en-tête ; vérification champ par champ. Rapport OK/erreurs, sans correction automatique.",
    input: ["Portée du scan (dossier ou fichier)"],
    output: [
      "Rapport de conformité",
      "Liste des fichiers en erreur avec la raison",
    ],
    produces: "check",
    dependsOn: [
      "@/app/genesis/lib/header-parser.ts",
      "@/app/genesis/lib/header-rules.ts",
    ],
  },
  {
    href: "/genesis/quality/typescript",
    title: "TypeScript Checker",
    description:
      "Lancer npx tsc --noEmit et afficher les erreurs de typage du projet.",
    category: "Qualité",
    icon: ListChecks,
    status: "planned",
    role: "Vérifier que le code TypeScript compile, sans attendre le build.",
    how: "Une Server Action exécute `npx tsc --noEmit` ; la sortie est parsée (fichier:ligne:col, code TSxxxx) ; les erreurs sont groupées par fichier.",
    input: ["(aucune — lancement global)"],
    output: [
      "Rapport d'erreurs TypeScript",
      "Liens vers les fichiers concernés",
    ],
    produces: "check",
    dependsOn: ["@/app/genesis/actions/runTypeScriptCheck.ts"],
  },
  {
    href: "/genesis/prompt-assist",
    title: "Prompt Assist",
    description:
      "Créer, sélectionner et copier des prompts JSON (templates par type de script).",
    category: "Assistance",
    icon: MessageSquareCode,
    status: "planned",
    role: "Préparer un prompt structuré (JSON) conforme au Contributing, à copier dans une IA pour générer un script complet.",
    how: "L'utilisateur choisit un template par type de script ; le prompt JSON est affiché et éditable ; il le copie dans son IA ; le script généré est ensuite validé par Header Checker et TypeScript Checker.",
    input: ["Type de script (template)", "Description du besoin"],
    output: ["Prompt JSON prêt à copier"],
    produces: "prompt",
    dependsOn: ["@/app/genesis/lib/prompt-templates.ts"],
  },
  {
    href: "/genesis/git",
    title: "Git Manager",
    description: "Opérations Git courantes : statut, diff, commit, branches.",
    category: "CI/CD",
    icon: GitBranch,
    status: "planned",
    role: "Automatiser le Git quotidien (statut, diff, commit, branches) sans quitter l'app.",
    how: "Une Server Action exécute des commandes git whitelistées ; le statut, le diff et le log sont affichés ; le commit est déclenché manuellement.",
    input: [
      "(statut/diff automatiques)",
      "Message de commit",
      "Fichiers à committer",
    ],
    output: ["Statut Git", "Diff", "Commit effectué", "Log"],
    produces: "action",
    dependsOn: [
      "@/app/genesis/actions/gitStatus.ts",
      "@/app/genesis/actions/gitCommit.ts",
    ],
  },
  {
    href: "/genesis/cicd",
    title: "CI/CD Manager",
    description:
      "Aide à la configuration des pipelines et à la mise en production.",
    category: "CI/CD",
    icon: GitMerge,
    status: "planned",
    role: "Préparer la configuration CI/CD et la mise en production (workflow, variables d'env, build local) sans déployer à la place de l'utilisateur.",
    how: "Affiche l'état de la config CI/CD existante ; propose des templates de pipeline ; vérifie les variables d'environnement requises ; lance éventuellement `npm run build` en local.",
    input: [
      "Stack cible (Next.js + DB + Better Auth)",
      "Confirmation de génération",
    ],
    output: [
      "Fichiers de workflow générés",
      "Rapport de vérification env",
      "Build local",
    ],
    produces: "action",
    dependsOn: ["@/app/genesis/lib/cicd-templates.ts"],
  },
];