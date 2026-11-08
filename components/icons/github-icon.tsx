/*
path :           components/icons/github-icon.tsx
tag :            ["icon", "github", "brand", "svg", "lucide-remplacement"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Icône GitHub locale (SVG inline). Remplace l'icône Github
                 supprimée de lucide-react v1 (les brand icons ont été retirées).
                 API compatible avec les icônes Lucide : accepte size, className,
                 et tous les attributs SVG standards. Utiliser ce composant
                 partout où Github était importé depuis lucide-react.

flow:            GithubIcon({ size = 24, className, ...props }) → <svg> 24x24
                 avec le path officiel GitHub (Simple Icons, CC0) → rendu avec
                 fill="currentColor" (hérite de la couleur du texte).

--- GUIDE IA — LIRE AVANT TOUTE MODIFICATION ---

INTERDIT :
  ✘ Ne PAS réimporter Github depuis lucide-react (n'existe plus en v1).
  ✘ Ne PAS remplacer ce composant par une dépendance lourde
     (@lobehub/icons, @icons-pack/react-simple-icons) pour une seule icône.
  ✘ Ne PAS modifier le path SVG (c'est le logo officiel GitHub).

AUTORISÉ :
  ✔ Remplacer import { Github } from "lucide-react" par
     import { GithubIcon } from "@/components/icons/github-icon".
  ✔ Utiliser <GithubIcon size={18} className="text-muted-foreground" />.
  ✔ Créer d'autres icônes de marques dans components/icons/*.tsx
     (Gitlab, Discord, etc.) sur le même modèle.

PIÈGES :
  ⚠ size est mappé sur width ET height (pas sur un attribut DOM `size`).
  ⚠ fill="currentColor" : la couleur vient du texte environnant
     (text-foreground, text-muted-foreground, etc.).
  ⚠ aria-hidden="true" par défaut : si l'icône porte un sens (lien seul),
     ajouter un aria-label sur le parent.

CONVENTIONS PROJET :
  • Icônes de marques → components/icons/*.tsx (pas lucide-react).
  • Icônes UI standard → lucide-react (ArrowRight, Check, etc.).
  • Toujours typer les props avec React.SVGProps<SVGSVGElement>.

ecosystem:       Icons = [
                   "@/components/icons/github-icon.tsx",
                 ]
relatedFiles:    ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx"]
imports:         ["react"]
exports:         ["GithubIcon"]
useBy:           ["@/app/business/page.tsx",
                  "@/app/dev/page.tsx"]

userStories:     ["*en tant que développeur je veux une icône GitHub stable malgré la suppression lucide v1"]
status:          done
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
import * as React from "react";

type GithubIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function GithubIcon({
  size = 24,
  className,
  ...props
}: GithubIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.7-1.27-1.7-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.94 10.94 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16v3.21c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}
