/*
path :           app/genesis/lib/script-integrity.ts
tag :            ["genesis", "create-files", "integrity", "helper", "validation"]
projectId:       <ultimate-genesis>
type:            helper
generic:         true

role:            Vérifie l'intégrité syntaxique légère d'un script Genesis
                 collé (en-tête fermé, chaînes fermées, commentaires fermés,
                 accolades/parenthèses/crochets équilibrés, fin de fichier non
                 suspendue). Ne compile pas le TS, ne valide pas la sémantique.
                 Sert à détecter un script tronqué avant de proposer une
                 nouvelle zone dans Create Files.

flow:            checkScriptIntegrity(content) → scan caractère par
                 caractère avec état (en chaîne simple/double/template, en
                 commentaire ligne/bloc) → compteurs {} () [] → collecte des
                 raisons (ligne + description) → { ok, reasons }.

ecosystem:       Genesis = [
                   "@/app/genesis/actions/createFile.ts",
                   "@/app/genesis/actions/exclusions.ts",
                   "@/app/genesis/actions/readFiles.ts",
                   "@/app/genesis/components/FileTypeSelect.tsx",
                   "@/app/genesis/components/RootFsPicker.tsx",
                   "@/app/genesis/create-files/CreateFileForm.tsx",
                   "@/app/genesis/create-files/page.tsx",
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
relatedFiles:    ["@/app/genesis/create-files/CreateFileForm.tsx"]
imports:         []
exports:         ["checkScriptIntegrity", "ScriptIntegrityResult"]
useBy:           ["@/app/genesis/create-files/CreateFileForm.tsx"]

userStories:     ["*en tant que développeur je veux détecter un script tronqué avant de créer un fichier"]
status:          planned
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/

export type ScriptIntegrityResult = {
  ok: boolean;
  reasons: string[];
};

type State =
  | "code"
  | "line-comment"
  | "block-comment"
  | "string-single"
  | "string-double"
  | "string-template";

export function checkScriptIntegrity(content: string): ScriptIntegrityResult {
  const reasons: string[] = [];

  if (!content.trim()) {
    return { ok: false, reasons: ["Script vide."] };
  }

  let state: State = "code";
  let line = 1;
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;

  const openBraces: number[] = [];
  const openParens: number[] = [];
  const openBrackets: number[] = [];
  const openStrings: { line: number; quote: string }[] = [];
  let blockCommentStart = -1;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === "\n") line++;

    if (state === "line-comment") {
      if (ch === "\n") state = "code";
      continue;
    }

    if (state === "block-comment") {
      if (ch === "*" && next === "/") {
        state = "code";
        i++;
        blockCommentStart = -1;
      }
      continue;
    }

    if (state === "string-single") {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "'") {
        state = "code";
        openStrings.pop();
      }
      continue;
    }

    if (state === "string-double") {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === '"') {
        state = "code";
        openStrings.pop();
      }
      continue;
    }

    if (state === "string-template") {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "`") {
        state = "code";
        openStrings.pop();
      }
      continue;
    }

    if (ch === "/" && next === "/") {
      state = "line-comment";
      i++;
      continue;
    }

    if (ch === "/" && next === "*") {
      state = "block-comment";
      blockCommentStart = line;
      i++;
      continue;
    }

    if (ch === "'") {
      state = "string-single";
      openStrings.push({ line, quote: "'" });
      continue;
    }

    if (ch === '"') {
      state = "string-double";
      openStrings.push({ line, quote: '"' });
      continue;
    }

    if (ch === "`") {
      state = "string-template";
      openStrings.push({ line, quote: "`" });
      continue;
    }

    if (ch === "{") {
      braceDepth++;
      openBraces.push(line);
      continue;
    }
    if (ch === "}") {
      braceDepth--;
      openBraces.pop();
      if (braceDepth < 0) {
        reasons.push(`Accolade fermante '}' en trop ligne ${line}.`);
        braceDepth = 0;
      }
      continue;
    }

    if (ch === "(") {
      parenDepth++;
      openParens.push(line);
      continue;
    }
    if (ch === ")") {
      parenDepth--;
      openParens.pop();
      if (parenDepth < 0) {
        reasons.push(`Parenthèse fermante ')' en trop ligne ${line}.`);
        parenDepth = 0;
      }
      continue;
    }

    if (ch === "[") {
      bracketDepth++;
      openBrackets.push(line);
      continue;
    }
    if (ch === "]") {
      bracketDepth--;
      openBrackets.pop();
      if (bracketDepth < 0) {
        reasons.push(`Crochet fermant ']' en trop ligne ${line}.`);
        bracketDepth = 0;
      }
      continue;
    }
  }

  if (state === "block-comment") {
    reasons.push(
      `Commentaire bloc non fermé (ouvert ligne ${blockCommentStart}).`,
    );
  }

  if (state !== "code" && openStrings.length > 0) {
    const s = openStrings[openStrings.length - 1];
    reasons.push(`Chaîne ${s.quote} non fermée (ouverte ligne ${s.line}).`);
  }

  if (braceDepth > 0) {
    reasons.push(
      `Accolade '{' non fermée (ouverte ligne ${openBraces[openBraces.length - 1]}).`,
    );
  }
  if (parenDepth > 0) {
    reasons.push(
      `Parenthèse '(' non fermée (ouverte ligne ${openParens[openParens.length - 1]}).`,
    );
  }
  if (bracketDepth > 0) {
    reasons.push(
      `Crochet '[' non fermé (ouvert ligne ${openBrackets[openBrackets.length - 1]}).`,
    );
  }

  const trimmed = content.trimEnd();
  const lastChar = trimmed[trimmed.length - 1];
  const suspendedEndings = [
    "+",
    "=",
    ",",
    "(",
    "{",
    "[",
    ":",
    ".",
    "&",
    "|",
    "-",
    "*",
    "/",
  ];
  if (lastChar && suspendedEndings.includes(lastChar)) {
    reasons.push(
      `Fin de fichier suspendue (dernier caractère '${lastChar}') : script possiblement tronqué.`,
    );
  }

  return { ok: reasons.length === 0, reasons };
}
