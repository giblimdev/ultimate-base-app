/*
path :           app/(public)/layout.tsx
tag :            ["layout", "public", "route-group", "header", "footer"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout du route group public. Monte PublicHeader (logo +
                 nav + UserMenu) et PublicFooter autour du contenu. Aucun
                 guard de session : les pages publiques (landing, CGU,
                 privacy) sont accessibles à tous. Le UserMenu gère
                 lui-même les deux états (connecté / non connecté).

flow :           PublicLayout({ children }) → <div> min-h-screen flex-col
                 → <PublicHeader /> → <main flex-1>{children}</main> →
                 <PublicFooter />.

ecosystem :      Public = [
                   "@/components/layout/PublicHeader.tsx",
                   "@/components/layout/PublicFooter.tsx",
                   "@/components/layout/UserMenu.tsx",
                   "@/app/(public)/layout.tsx",
                   "@/app/(public)/page.tsx",
                 ]
relatedFiles :   ["@/components/layout/PublicHeader.tsx",
                  "@/components/layout/PublicFooter.tsx"]
imports :        ["react", "@/components/layout/PublicHeader",
                  "@/components/layout/PublicFooter"]
exports :        ["default PublicLayout"]
useBy :          ["@/app/(public)/page.tsx",
                  "@/app/(public)/legal/terms/page.tsx",
                  "@/app/(public)/legal/privacy/page.tsx"]

userStories :    ["*en tant que visiteur je veux voir le header et le footer sur toutes les pages publiques"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import * as React from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <PublicFooter />
    </div>
  );
}