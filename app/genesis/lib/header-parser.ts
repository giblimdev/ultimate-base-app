/*
path :           app/genesis/lib/header-parser.ts
tag :            ["genesis", "header", "parser", "helper", "multi"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Parse un ou plusieurs scripts Genesis complets (en-tête 
                 + code) et en extrait les champs de classification : path,
                 type, projectId, generic, status. Supporte le multi-fichiers
                 via le délimiteur "// ===GENESIS-FILE===" en début de ligne
                 (un bloc = un script). Utilisé par Create Files pour écrire
                 chaque fichier au chemin DÉCLARÉ DANS SON EN-TÊTE.

flow:            parseGenesisHeader(content) → extrait le bloc  →
                 regex par champ → validation → { ok, header }.
                 splitScripts(content) → découpe sur le délimiteur →
                 parseGenesisScripts(content) → parse chaque bloc →
                 { ok, scripts } | { ok: false, error }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
                   "@/app/genesis/lib/fs-utils.ts",
                   "@/app/genesis/lib/header-parser.ts",
                   "@/app/genesis/lib/header-templates.ts",
                   "@/app/genesis/lib/tools.ts",
                   "@/app/genesis/page.tsx",
                 ]
relatedFiles:    ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         ["@/app/genesis/lib/header-templates"]
exports:         ["parseGenesisHeader", "parseGenesisScripts", "splitScripts", "ParsedHeader", "ParsedScript", "ParseHeaderResult", "ParseScriptsResult", "FILE_DELIMITER"]
useBy:           ["@/app/genesis/actions/createFile.ts",
                  "@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux que le chemin et le type soient lus dans l'en-tête, pas ressaisis",
                  "*en tant que développeur je veux coller plusieurs scripts séparés par un délimiteur"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import {
  SCRIPT_TYPES,
  type ScriptType,
} from "@/app/genesis/lib/header-templates";

export const FILE_DELIMITER = "// ===GENESIS-FILE===";

export type ParsedHeader = {
  path: string;
  type: ScriptType;
  projectId: string;
  generic: boolean;
  status: string;
};

export type ParsedScript = {
  index: number;
  content: string;
  header: ParsedHeader;
};

export type ParseHeaderResult =
  | { ok: true; header: ParsedHeader }
  | { ok: false; error: string };

export type ParseScriptsResult =
  | { ok: true; scripts: ParsedScript[] }
  | { ok: false; error: string };

const HEADER_BLOCK_RE = /^\s*\/\*([\s\S]*?)\*\//;

function extractField(block: string, field: string): string | null {
  const re = new RegExp(`^\\s*${field}\\s*:\\s*(.+)$`, "m");
  const match = block.match(re);
  return match ? match[1].trim() : null;
}

export function parseGenesisHeader(content: string): ParseHeaderResult {
  const blockMatch = content.match(HEADER_BLOCK_RE);
  if (!blockMatch) {
    return { ok: false, error: "Aucun en-tête Genesis /* ... */ détecté." };
  }
  const block = blockMatch[1];

  const path = extractField(block, "path");
  const type = extractField(block, "type");
  const projectId = extractField(block, "projectId");
  const generic = extractField(block, "generic");
  const status = extractField(block, "status");

  if (!path)
    return { ok: false, error: "Champ 'path' manquant dans l'en-tête." };
  if (!type)
    return { ok: false, error: "Champ 'type' manquant dans l'en-tête." };
  if (!projectId)
    return { ok: false, error: "Champ 'projectId' manquant dans l'en-tête." };

  if (!SCRIPT_TYPES.includes(type as ScriptType)) {
    return {
      ok: false,
      error: `Type invalide dans l'en-tête : '${type}'. Valeurs autorisées : ${SCRIPT_TYPES.join(", ")}.`,
    };
  }

  return {
    ok: true,
    header: {
      path,
      type: type as ScriptType,
      projectId,
      generic: generic === "true",
      status: status ?? "planned",
    },
  };
}

export function splitScripts(content: string): string[] {
  const lines = content.split(/\r?\n/);
  const blocks: string[][] = [[]];
  for (const line of lines) {
    if (line.trim() === FILE_DELIMITER) {
      blocks.push([]);
    } else {
      blocks[blocks.length - 1].push(line);
    }
  }
  return blocks.map((b) => b.join("\n").trim()).filter((b) => b.length > 0);
}

export function parseGenesisScripts(content: string): ParseScriptsResult {
  const blocks = splitScripts(content);
  if (blocks.length === 0) {
    return { ok: false, error: "Aucun script détecté." };
  }
  const scripts: ParsedScript[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const parsed = parseGenesisHeader(blocks[i]);
    if (!parsed.ok) {
      return {
        ok: false,
        error: `Script #${i + 1} : ${parsed.error}`,
      };
    }
    scripts.push({ index: i, content: blocks[i], header: parsed.header });
  }
  return { ok: true, scripts };
}
