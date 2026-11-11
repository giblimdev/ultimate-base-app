/*
path :           app/genesis/lib/header-templates.ts
tag :            ["genesis", "header", "templates", "helper"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Génère l'en-tête Genesis pré-rempli selon le type de script
                 (layout | page | component | action | route | helper | store |
                 config | page d'entrée) et le chemin cible. Produit aussi le
                 squelette de code minimal correspondant au type et le chemin
                 par défaut suggéré pour ce type (buildDefaultPath).

flow:            buildHeader({ type, path, projectId }) → template de l'en-tête
                 → remplacement de path/type/projectId → retourne la chaîne.
                 buildSkeleton(type) → squelette TS/TSX minimal selon le type.
                 buildDefaultPath(type) → chemin suggéré pour ce type.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/lib/fs-utils.ts",
                  "@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         []
exports:         ["ScriptType", "SCRIPT_TYPES", "buildHeader", "buildSkeleton", "buildDefaultPath", "buildFileContent"]
useBy:           ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux un en-tête Genesis pré-rempli à la création d'un fichier"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export type ScriptType =
  | "layout"
  | "page"
  | "component"
  | "action"
  | "route"
  | "helper"
  | "store"
  | "config"
  | "page d'entrée";

export const SCRIPT_TYPES: ScriptType[] = [
  "layout",
  "page",
  "component",
  "action",
  "route",
  "helper",
  "store",
  "config",
  "page d'entrée",
];

const HEADER_TEMPLATE = `/*
path :           {path}
tag :            []
projectId:       {projectId}
type:            {type}
generic:         false

role:            
flow:            
ecosystem:       {type} = [
                   "{path}",
                 ]
relatedFiles:    []
imports:         []
exports:         []
useBy:           []

userStories:     []
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
`;

export function buildHeader(params: {
  type: ScriptType;
  path: string;
  projectId: string;
}): string {
  return HEADER_TEMPLATE.replaceAll("{path}", params.path)
    .replaceAll("{type}", params.type)
    .replaceAll("{projectId}", params.projectId);
}

export function buildSkeleton(type: ScriptType): string {
  switch (type) {
    case "page":
      return `export default function Page() {\n  return <main />;\n}\n`;
    case "layout":
      return `type LayoutProps = {\n  children: React.ReactNode;\n};\n\nexport default function Layout({ children }: LayoutProps) {\n  return <>{children}</>;\n}\n`;
    case "component":
      return `type ComponentProps = {\n  // props\n};\n\nexport function Component({}: ComponentProps) {\n  return null;\n}\n`;
    case "action":
      return `"use server";\n\nexport async function action() {\n  // implémentation\n}\n`;
    case "route":
      return `import { NextResponse } from "next/server";\n\nexport async function GET() {\n  return NextResponse.json({ ok: true });\n}\n`;
    case "helper":
      return `export function helper() {\n  // implémentation\n}\n`;
    case "store":
      return `type State = {};\n\nexport const useStore = () => ({} as State);\n`;
    case "config":
      return `export const CONFIG = {};\n`;
    case "page d'entrée":
      return `export default function Page() {\n  return <main />;\n}\n`;
  }
}

export function buildDefaultPath(type: ScriptType): string {
  switch (type) {
    case "page":
      return "app/nouvelle-page/page.tsx";
    case "page d'entrée":
      return "app/nouvelle-page/page.tsx";
    case "layout":
      return "app/nouveau-layout/layout.tsx";
    case "component":
      return "components/NouveauComposant.tsx";
    case "action":
      return "app/actions/nouvelleAction.ts";
    case "route":
      return "app/api/nouvelle-route/route.ts";
    case "helper":
      return "lib/helpers/nouveauHelper.ts";
    case "store":
      return "lib/stores/nouveauStore.ts";
    case "config":
      return "lib/config/nouvelleConfig.ts";
  }
}

export function buildFileContent(params: {
  type: ScriptType;
  path: string;
  projectId: string;
}): string {
  return `${buildHeader(params)}\n${buildSkeleton(params.type)}`;
}
