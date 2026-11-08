/*
path :           lib/highlighter.tsx
tag :            ["highlighter", "shiki", "code-block", "shadcn", "auto-generated", "ne-pas-editer"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Helper transverse généré automatiquement par shadcn/ui. Fournit
                 la coloration syntaxique des blocs de code et du code inline via
                 Shiki (createHighlighterCore + moteur JavaScript regex). Charge
                 les langages à la demande (bash, css, diff, html, javascript,
                 json, jsx, markdown, python, sql, tsx, typescript, yaml) et
                 supporte les alias (js, md, py, sh, shell, ts, yml, zsh).
                 Deux thèmes : github-light et github-dark (via defaultColor: false
                 et classes text-(--shiki-light) dark:text-(--shiki-dark)).

flow:            highlightCode(code, language) → loadHighlighter(language) →
                 getLanguage(language) résout le nom/alias → getHighlighter()
                 initialise Shiki (singleton) → loadLanguage() à la demande →
                 highlight(code, state) tokenise via codeToTokens → retourne
                 { lines: ReactNode[][], state: GrammarState }.
                 Cas ANSI : tokenisation ligne par ligne (pas de state).

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne JAMAIS éditer ce fichier (régénéré par shadcn init/add).
  ✘ Ne PAS ajouter un langage directement dans le const `languages`.
  ✘ Ne PAS modifier les alias ni le singleton `highlighter`.
  ✘ Ne PAS importer ce fichier depuis un composant serveur sans "await" :
     highlightCode() et loadHighlighter() sont asynchrones.
  ✘ Ne PAS rendre `lines` dans un Server Component (contient des ReactNode
     avec styles inline — préférer un Client Component).

AUTORISÉ :
  ✔ Appeler highlightCode(code, language) depuis un composant client
     ou une Server Action, puis passer `lines` à <CodeBlock />.
  ✔ Appeler loadHighlighter(language) pour obtenir un highlighter
     réutilisable avec state (streaming, ANSI).
  ✔ Ajouter un langage NON SUPPORTÉ en créant un NOUVEAU fichier :
      lib/highlighter-extended.ts qui appelle loadHighlighter et
      fournit sa propre table de langages.
  ✔ Utiliser les alias existants (js, ts, tsx, py, sh, yml…) plutôt que
     les noms complets.

PIÈGES :
  ⚠ Retourne `null` si la langue n'est pas répertoriée — toujours vérifier
    avant de rendre `lines` (sinon crash silencieux).
  ⚠ `highlightCode` ne conserve PAS le grammar state entre appels — pour
    un streaming multi-lignes, utiliser loadHighlighter + state explicite.
  ⚠ Le mode ANSI tokenise ligne par ligne (pas de state) — les couleurs
    restent cohérentes même en streaming, mais pas de coloration par
    contexte multi-lignes.
  ⚠ Les thèmes sont fixes (github-light/github-dark) : ne pas passer un
    thème custom sans modifier le singleton.
  ⚠ shiki charge les grammaires en dynamic import — le premier appel par
    langage peut être lent (prévoir un fallback "loading").

CONVENTIONS PROJET :
  • Ne pas importer shiki directement ailleurs : passer par highlightCode
     ou use-highlighted-code.ts.
  • Les couleurs passent par les variables CSS --shiki-light/--shiki-dark
     (déjà gérées par globals.css en dark mode).
  • Alias d'import : @/lib/highlighter (jamais de chemin relatif).
  • Les langages supportés doivent être listés dans `tag` et dans `role`.

ecosystem:       Highlighter = [
                   "@/hooks/use-highlighted-code.ts",
                   "@/lib/highlighter.tsx",
                 ]
relatedFiles:    ["@/hooks/use-highlighted-code.ts",
                  "@/components/ui/code-block.tsx"]
imports:         ["react", "shiki/core", "shiki/engine/javascript",
                  "shiki/langs/shellscript.mjs", "shiki/langs/css.mjs",
                  "shiki/langs/diff.mjs", "shiki/langs/html.mjs",
                  "shiki/langs/javascript.mjs", "shiki/langs/json.mjs",
                  "shiki/langs/jsx.mjs", "shiki/langs/markdown.mjs",
                  "shiki/langs/python.mjs", "shiki/langs/sql.mjs",
                  "shiki/langs/tsx.mjs", "shiki/langs/typescript.mjs",
                  "shiki/langs/yaml.mjs", "shiki/themes/github-light.mjs",
                  "shiki/themes/github-dark.mjs"]
exports:         ["loadHighlighter", "highlightCode"]
useBy:           ["@/hooks/use-highlighted-code.ts"]

userStories:     ["*en tant que développeur je veux colorer le code affiché dans l'interface"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

import * as React from "react";
import {
  createHighlighterCore,
  type GrammarState,
  type HighlighterCore,
} from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Add the languages you need. Each one loads the first time it is used.
const languages = {
  bash: () => import("shiki/langs/shellscript.mjs"),
  css: () => import("shiki/langs/css.mjs"),
  diff: () => import("shiki/langs/diff.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  markdown: () => import("shiki/langs/markdown.mjs"),
  python: () => import("shiki/langs/python.mjs"),
  sql: () => import("shiki/langs/sql.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  yaml: () => import("shiki/langs/yaml.mjs"),
};

const aliases: Record<string, keyof typeof languages> = {
  js: "javascript",
  md: "markdown",
  py: "python",
  sh: "bash",
  shell: "bash",
  shellscript: "bash",
  ts: "typescript",
  yml: "yaml",
  zsh: "bash",
};

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ],
    langs: [],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });

  return highlighter;
}

function getLanguage(language: string) {
  const name = language.toLowerCase();

  if (name === "ansi") {
    return name;
  }

  if (name in languages) {
    return name as keyof typeof languages;
  }

  return aliases[name] ?? null;
}

// Loads a language and returns a highlighter for it, or null for a language
// that is not listed.
export async function loadHighlighter(language: string) {
  const lang = getLanguage(language);

  if (!lang) {
    return null;
  }

  const shiki = await getHighlighter();

  if (lang !== "ansi" && !shiki.getLoadedLanguages().includes(lang)) {
    await shiki.loadLanguage(languages[lang]);
  }

  return {
    // Returns one React node per line, and the grammar state after the last
    // line. Pass that state back to continue where the code left off.
    highlight(code: string, state?: GrammarState) {
      const tokenize = (text: string) =>
        shiki.codeToTokens(text, {
          lang,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
          grammarState: state,
        }).tokens;

      // ANSI has no grammar state, so each line is tokenized on its own and
      // gets the same colors whether it arrives in one piece or streams.
      const tokens =
        lang === "ansi"
          ? code.split("\n").flatMap((line) => tokenize(line))
          : tokenize(code);

      return {
        lines: tokens.map((line) =>
          line.map((token, index) => (
            <span
              key={index}
              style={token.htmlStyle as React.CSSProperties}
              className="text-(--shiki-light) dark:text-(--shiki-dark)"
            >
              {token.content}
            </span>
          )),
        ),
        state: shiki.getLastGrammarState(tokens),
      };
    },
  };
}

// Returns one React node per line, or null for a language that is not listed.
export async function highlightCode(code: string, language: string) {
  const highlighter = await loadHighlighter(language);

  return highlighter ? highlighter.highlight(code).lines : null;
}
