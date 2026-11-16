/*
path :           components/layout/PublicFooter.tsx
tag :            ["layout", "footer", "public", "legal"]
projectId :      <UltimateBaseApp>
type :           component
generic :        true

role :           Footer public minimal. Affiche le copyright, les liens
                 légaux (CGU, Confidentialité) et un lien GitHub. Server
                 Component pur (aucun état).

flow :           PublicFooter() → <footer> avec liens.

ecosystem :      Public = [
                   "@/components/layout/PublicHeader.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/UserMenu.tsx",
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                 ]
relatedFiles :   ["@/components/layout/PublicHeader.tsx"]
imports :        ["next/link"]
exports :        ["PublicFooter"]
useBy :          ["@/app/(public)/layout.tsx"]

userStories :    ["*en tant que visiteur je veux accéder aux liens légaux depuis le footer"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Ultimate Base App. Tous droits réservés.
        </p>
        <nav
          aria-label="Liens légaux"
          className="flex flex-wrap items-center gap-4"
        >
          <Link href="/legal/terms" className="hover:text-foreground">
            CGU
          </Link>
          <Link href="/legal/privacy" className="hover:text-foreground">
            Confidentialité
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </Link>
        </nav>
      </div>
    </footer>
  );
}
