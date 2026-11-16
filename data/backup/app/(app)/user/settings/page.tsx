/*
path :           app/(app)/settings/page.tsx
tag :            ["settings", "page", "placeholder"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page de paramètres utilisateur (placeholder). Indique
                 que les paramètres complets (thème, langue, préférences)
                 sont accessibles via le menu utilisateur en attendant.
                 Les réglages réels (User.preferredLocale, préférences)
                 seront ajoutés après l'implémentation de l'i18n.

flow :           SettingsPage() → rendu statique.

ecosystem :      Settings = [
                   "@/app/(app)/settings/page.tsx",
                 ]
relatedFiles :   []
imports :        ["@/components/ui/card"]
exports :        ["default SettingsPage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux accéder aux paramètres"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Préférences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Le thème et la langue se règlent depuis le menu utilisateur (avatar,
          en haut à droite). Les paramètres avancés arrivent bientôt.
        </CardContent>
      </Card>
    </main>
  );
}