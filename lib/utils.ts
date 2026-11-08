/*
path :           lib/utils.ts
tag :            ["utils", "cn", "shadcn", "auto-generated", "ne-pas-editer"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         true

role:            Helper transverse généré par shadcn/ui. Réexporte cn() depuis
                 le package "cn" (fusion clsx + tailwind-merge). Utilisé par
                 TOUS les composants UI et applicatifs pour composer des classes
                 Tailwind conditionnelles sans doublons.

flow:            import { cn } from "@/lib/utils" → cn(...classes) → string
                 de classes fusionnées (les conflits Tailwind sont résolus,
                 les dernières classes gagnent).

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne JAMAIS éditer ce fichier (régénéré par shadcn init/add).
  ✘ Ne PAS ajouter d'autres helpers ici (formatDate, slugify, etc.).
  ✘ Ne PAS remplacer cn par clsx ou classnames directement dans l'UI.

AUTORISÉ :
  ✔ Importer cn partout : import { cn } from "@/lib/utils".
  ✔ Passer cn à buttonVariants(), aux composants shadcn, etc.
  ✔ Créer un NOUVEAU fichier si vous avez besoin d'un autre helper :
      lib/format.ts, lib/string.ts, lib/date.ts, lib/validators/*.ts

PIÈGES :
  ⚠ cn attend des chaînes/objets/undefined/null — pas de nombres bruts.
  ⚠ Les classes conditionnelles s'écrivent cn("base", cond && "actif").
  ⚠ Ne pas mélanger cn() et template strings pour les mêmes classes.

CONVENTIONS PROJET :
  • Alias d'import : @/lib/utils (jamais de chemin relatif ../../).
  • Ordre des classes : layout → spacing → couleur → état (Tailwind).
  • Utiliser les tokens shadcn (bg-background, text-foreground, border-border)
    plutôt que des couleurs brutes (bg-white, text-black).

ecosystem:       Utils = [
                   "@/lib/utils.ts",
                 ]
relatedFiles:    ["@/components/ui/button.tsx",
                  "@/app/page.tsx"]
imports:         ["cn"]
exports:         ["cn"]
useBy:           ["@/app/page.tsx",
                  "@/components/ui/button.tsx",
                  "@/components/ui/card.tsx"]

userStories:     ["*en tant que développeur je veux un helper cn stable et non modifiable"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/

export { cn } from "cn";
