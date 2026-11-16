/*
path :           app/layout.tsx
tag :            ["layout-racine", "fonts", "providers", "theme", "socle",
                  "toaster", "sonner", "next-themes"]
projectId :      <UltimateBaseApp>
type :           layout
generic :        false

role :           Layout racine de l'application. UNIQUE propriétaire de
                 <html> et <body>. Charge les polices Inter (UI) et
                 JetBrains Mono (code) via next/font/google, applique
                 les variables CSS sur <html>, et monte uniquement les
                 providers GLOBAUX transverses : ThemeProvider
                 (next-themes, dark mode fonctionnel dès le premier
                 rendu) et le Toaster Sonner (bas-droite, richColors,
                 closeButton, expand, 4 toasts visibles max).
                 Ce layout NE monte NI AppSidebar NI AppHeader : le
                 shell applicatif (sidebar + header + main) vit
                 EXCLUSIVEMENT dans app/(app)/layout.tsx, pour que les
                 pages publiques — landing sur /, CGU, politique de
                 confidentialité — restent sans navigation latérale.
                 SuppressHydrationWarning est requis pour next-themes
                 (injection du script de thème avant hydratation).
                 TooltipProvider n'est PAS monté ici : il est monté
                 par app/(app)/layout.tsx (le shell authentifié est
                 le seul à utiliser des tooltips Base UI).

flow :           RootLayout({ children }) → <html lang="fr"> (variables
                 de police, suppressHydrationWarning) → <body> →
                 ThemeProvider (attribute="class", defaultTheme="system",
                 enableSystem, disableTransitionOnChange) →
                 {children} + <Toaster position="bottom-right"
                 richColors closeButton expand visibleToasts={4} />.

ecosystem :      Socle = [
                   "@/app/globals.css",
                   "@/app/layout.tsx",
                   "@/app/(app)/layout.tsx",
                   "@/components/theme-provider.tsx",
                   "@/components/ui/tooltip.tsx",
                   "@/lib/auth/session.ts",
                 ]
relatedFiles :   ["@/app/globals.css",
                  "@/app/(app)/layout.tsx",
                  "@/components/theme-provider.tsx",
                  "@/components/layout/theme-switcher.tsx",
                  "@/components/ui/tooltip.tsx",
                  "@/lib/auth/session.ts"]
imports :        ["next", "next/font/google", "./globals.css",
                  "@/components/theme-provider", "sonner"]
exports :        ["metadata", "default RootLayout"]
useBy :          ["@/app/(public)/layout.tsx",
                  "@/app/(public)/page.tsx",
                  "@/app/(public)/legal/terms/page.tsx",
                  "@/app/(public)/legal/privacy/page.tsx",
                  "@/app/(app)/layout.tsx",
                  "@/app/(app)/home/page.tsx",
                  "@/app/business/page.tsx",
                  "@/app/dev/page.tsx",
                  "@/app/genesis/layout.tsx",
                  "@/app/superadmin/page.tsx",
                  "@/app/template.tsx"]

userStories :    ["*en tant que développeur je veux un layout racine qui monte uniquement les providers globaux sans imposer de shell",
                  "*en tant qu'utilisateur je veux le dark mode fonctionnel dès le premier rendu",
                  "*en tant qu'utilisateur je veux voir les toasts Sonner en bas à droite",
                  "*en tant que visiteur public je ne veux PAS voir la sidebar sur la landing"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
