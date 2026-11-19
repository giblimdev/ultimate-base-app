/*
path :           lib/scrum/access.ts
tag :            ["scrum", "access", "guard", "stub", "rbac", "workspace",
                  "auth"]
projectId:       <UltimateBaseApp>
type:            helper
generic:         false

role:            Point d'entrée unique pour les contrôles d'accès du
                 module Scrum. Aujourd'hui : accès libre (pas de guard),
                 car les pages Scrum ne sont pas encore protégées. Ce
                 fichier existe pour centraliser le futur branchement
                 RBAC/workspace sans toucher aux actions ni aux queries.
                 Quand lib/auth/auth.ts et les guards workspace seront
                 prêts, remplacer requireScrumAccess par un appel à
                 getSession + vérification Membership, et requireScrumOwner
                 par un contrôle authorId/workspaceId. Le contrat
                 (Promise<ScrumAccessContext>) ne change pas : les
                 appelants n'auront rien à modifier.

flow:            requireScrumAccess() → retourne { userId: null,
                 workspaceId: null, isAuthenticated: false } en mode
                 accès libre. requireScrumOwner(scrumId) → retourne le
                 même contexte sans vérification. Les deux fonctions
                 sont async pour rester compatibles avec la future
                 version (session async).

ecosystem:       Scrum = [
                   "@/app/(app)/scrum/page.tsx",
                   "@/components/scrum/ProjectSummaryCard.tsx",
                   "@/data/nav.json",
                   "@/data/nav.ts",
                   "@/lib/scrum/access.ts",
                 ]
relatedFiles:    ["@/lib/auth/auth.ts",
                  "@/modules/workspace/guards.ts",
                  "@/lib/scrum/queries.ts"]
imports:         []
exports:         ["ScrumAccessContext", "requireScrumAccess",
                  "requireScrumOwner"]
useBy:           ["@/app/(app)/scrum/actions/project.ts",
                  "@/app/(app)/scrum/actions/feature.ts",
                  "@/app/(app)/scrum/actions/persona.ts",
                  "@/app/(app)/scrum/actions/epic.ts",
                  "@/app/(app)/scrum/actions/us.ts",
                  "@/app/(app)/scrum/actions/task.ts",
                  "@/app/(app)/scrum/actions/sprint.ts",
                  "@/app/(app)/scrum/actions/dnd.ts"]

userStories:     ["*en tant que développeur je veux centraliser les guards Scrum pour les brancher plus tard",
                  "*en tant qu'utilisateur je veux utiliser Scrum librement tant que l'auth n'est pas branchée"]
status:          wip
pathChecked:     ✔true
metaDataChecked: ✔true
scriptChecked:   ✔true
*/
export type ScrumAccessContext = {
  userId: string | null;
  workspaceId: string | null;
  isAuthenticated: boolean;
};

const FREE_ACCESS: ScrumAccessContext = {
  userId: null,
  workspaceId: null,
  isAuthenticated: false,
};

export async function requireScrumAccess(): Promise<ScrumAccessContext> {
  // TODO: brancher getSession() de lib/auth/auth.ts + vérification
  // Membership workspace quand le RBAC sera prêt. En attendant :
  // accès libre.
  return FREE_ACCESS;
}

export async function requireScrumOwner(
  _scrumId: string,
): Promise<ScrumAccessContext> {
  // TODO: vérifier que l'utilisateur courant est authorId de la ligne
  // Scrum ou membre du workspace propriétaire. En attendant : accès
  // libre.
  return FREE_ACCESS;
}