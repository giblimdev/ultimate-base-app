/*
path :           components/theme-provider.tsx
tag :            ["theme", "provider", "next-themes", "socle"]
projectId:       <UltimateBaseApp>
type:            component
generic:         true

role:            Wrapper client autour de NextThemesProvider (next-themes). Permet
                 de choisir le thème (système, clair, sombre, personnalisés) et
                 expose le contexte de thème à toute l'application. Composant
                 transverse réutilisable au-delà du module thème (generic: true).
                 "use client" justifié : next-themes utilise un contexte React
                 et un script inline côté client pour éviter le flash de thème.

flow:            ThemeProvider({ children, ...props }) → <NextThemesProvider {...props}>
                 → {children}. Les props (attribute, defaultTheme, enableSystem,
                 disableTransitionOnChange) sont transmises telles quelles depuis
                 app/layout.tsx.

ecosystem:       Theme = [
                   "@/components/theme-provider.tsx",
                   "@/components/ui/dropdown-menu.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/modules/theme/provider.tsx",
                   "@/modules/theme/theme-creator.tsx",
                   "@/modules/theme/themes.ts",
                 ]
relatedFiles:    ["@/app/layout.tsx",
                  "@/components/layout/theme-switcher.tsx",
                  "@/modules/theme/provider.tsx"]
imports:         ["react", "next-themes"]
exports:         ["ThemeProvider"]
useBy:           ["@/app/layout.tsx"]

userStories:     ["*en tant qu'utilisateur je veux choisir entre thème système, clair et sombre"]
status:          wip
pathChecked:     ✘false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
