/*
path :           app/(app)/user/profile/loading.tsx
tag :            ["profile", "loading", "suspense", "skeleton"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Fallback de chargement pour la page profil. Next.js
                 l'utilise automatiquement pour envelopper le segment
                 dans un <Suspense> lorsque cacheComponents est activé.
                 Évite l'erreur « uncached data during prerendering »
                 causée par getSession() (lecture de cookies).

flow :           Affiché pendant que ProfilePage() résout getSession().

ecosystem :      Profil = [
                   "@/app/(app)/user/profile/page.tsx",
                   "@/app/(app)/user/profile/loading.tsx",
                 ]
relatedFiles :   ["@/app/(app)/user/profile/page.tsx"]
imports :        []
exports :        ["default ProfileLoading"]
useBy :          ["@/app/(app)/user/profile/page.tsx"]

userStories :    ["*en tant qu'utilisateur je veux voir un état de chargement pendant la résolution de mon profil"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
      <Card>
        <CardHeader>
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </main>
  );
}