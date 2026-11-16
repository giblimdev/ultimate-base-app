/*
path :           app/(app)/profile/page.tsx
tag :            ["profile", "page", "placeholder"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page de profil utilisateur (placeholder). Affiche les
                 informations de session (nom, email, avatar) et un message
                 indiquant que l'édition complète arrive. Utilise
                 getSession() côté serveur.

flow :           ProfilePage() → getSession() → affiche les infos.

ecosystem :      Profil = [
                   "@/app/(app)/profile/page.tsx",
                 ]
relatedFiles :   ["@/lib/auth/session.ts"]
imports :        ["@/lib/auth/session", "@/components/ui/card"]
exports :        ["default ProfilePage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux voir mes informations de profil"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p><span className="text-muted-foreground">Nom :</span> {session.user.name}</p>
          <p><span className="text-muted-foreground">Email :</span> {session.user.email}</p>
          <p><span className="text-muted-foreground">Rôle plateforme :</span> {session.user.platformRole}</p>
        </CardContent>
      </Card>
    </main>
  );
}