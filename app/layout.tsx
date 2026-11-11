/*
path :           app/layout.tsx
tag :            ["layout-racine", "fonts", "providers", "socle", "shell",
                  "navigation", "rbac"]
projectId:       <UltimateBaseApp>
type:            layout
generic:         false

role:            Layout racine de l'application. Charge les polices Inter et
                 JetBrains Mono, applique les variables CSS, monte les
                 providers (TooltipProvider, Toaster Sonner). Lit le rôle
                 plateforme via getCurrentPlatformRole() (stub en attendant
                 Better Auth) et le passe à AppSidebar et AppHeader pour
                 filtrer la navigation. Monte le shell : sidebar (desktop)
                 + header sticky (toutes les pages sauf /) + contenu.
                 SuppressHydrationWarning requis pour next-themes.

flow:            RootLayout async → getCurrentPlatformRole() →
                 platformRole → <html> → <body> → TooltipProvider →
                 <AppSidebar platformRole /> + <div flex-1> →
                 <AppHeader platformRole /> → <main>{children}</main> →
                 <Toaster />.

ecosystem:       Socle = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/app/page.tsx",
                   "@/components/layout/AppHeader.tsx",
                   "@/components/layout/AppSidebar.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/lib/auth/session.ts",
                 ]
relatedFiles:    ["@/app/globals.css",
                  "@/app/page.tsx",
                  "@/components/layout/AppHeader.tsx",
                  "@/components/layout/AppSidebar.tsx",
                  "@/lib/auth/session.ts"]
imports:         ["next", "next/font/google", "./globals.css",
                  "@/components/layout/AppHeader",
                  "@/components/layout/AppSidebar",
                  "@/components/ui/tooltip",
                  "@/lib/auth/session", "sonner"]
exports:         ["metadata", "default RootLayout"]
useBy:           []

userStories:     ["*en tant que développeur je veux un layout racine avec navigation persistante et filtrée par rôle",
                  "*en tant qu'utilisateur je veux accéder à tous les modules autorisés sans revenir à l'accueil"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentPlatformRole } from "@/lib/auth/session";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultimate Base App",
  description: "Plateforme de développement applicatif réutilisable",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const platformRole = await getCurrentPlatformRole();

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-background text-foreground">
        <TooltipProvider>
          <AppSidebar platformRole={platformRole} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader platformRole={platformRole} />
            <main className="flex flex-1 flex-col">{children}</main>
          </div>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            expand
            visibleToasts={4}
            toastOptions={{
              duration: 4000,
              classNames: {
                toast: "rounded-xl shadow-lg border",
                title: "font-semibold",
                description: "text-sm opacity-90",
                actionButton: "font-medium",
                cancelButton: "font-medium",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}