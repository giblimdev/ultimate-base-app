/*
path :           app/layout.tsx
tag :            ["layout-racine", "fonts", "providers", "socle"]
projectId:       <UltimateBaseApp>
type:            layout
generic:         false

role:            Layout racine de l'application. Charge les polices Inter (UI) et
                 JetBrains Mono (code) via next/font/google, applique les variables
                 CSS sur <html>, monte les providers globaux (TooltipProvider) et
                 le Toaster Sonner (bas-droite, richColors). SuppressHydrationWarning
                 est requis pour next-themes (injection de script avant hydratation).

flow:            RootLayout({ children }) → <html> (lang fr, variables de police,
                 suppressHydrationWarning) → <body> → TooltipProvider →
                 {children} + <Toaster position="bottom-right" richColors />.

ecosystem:       Socle = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/app/page.tsx",
                   "@/components/ui/tooltip.tsx",
                 ]
relatedFiles:    ["@/app/globals.css",
                  "@/app/page.tsx",
                  "@/components/ui/tooltip.tsx"]
imports:         ["next", "next/font/google", "./globals.css",
                  "@/components/ui/tooltip", "sonner"]
exports:         ["metadata", "default RootLayout"]
useBy:           ["@/app/page.tsx"]

userStories:     ["*en tant que développeur je veux un layout racine avec polices modernes et providers globaux"]
status:          wip
pathChecked:     ✔false
metaDataChecked: ✘false
scriptChecked:   ✘false
*/
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
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
