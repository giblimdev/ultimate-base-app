/*
path :           lib/validations/auth.ts
tag :            ["auth", "validation", "zod", "password"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Schémas Zod partagés pour login et register. Le schéma
                 register impose : email valide, mot de passe ≥ 8 caractères
                 avec majuscule, minuscule, chiffre et caractère spécial,
                 confirmation identique (refine + path). Le schéma login est
                 plus permissif (on ne valide pas la force d'un mot de passe
                 existant, seulement sa présence). Exporte aussi passwordSchema
                 pour la validation dynamique côté formulaire.

flow :           registerSchema.safeParse(data) → succès ou erreurs typées.
                 loginSchema.safeParse(data) → idem.
                 passwordSchema.safeParse(value) → utilisé par la liste de
                 règles dynamiques dans le formulaire register.

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]
imports :        ["zod"]
exports :        ["passwordSchema", "registerSchema", "loginSchema", "RegisterInput", "LoginInput"]
useBy :          ["@/app/(public)/auth/login/page.tsx", "@/app/(public)/auth/register/page.tsx"]

userStories :    ["*en tant qu'utilisateur je veux un mot de passe robuste",
                  "*en tant qu'utilisateur je veux être averti si mes mots de passe ne correspondent pas"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Au moins 8 caractères.")
  .regex(/[a-z]/, "Au moins une minuscule.")
  .regex(/[A-Z]/, "Au moins une majuscule.")
  .regex(/[0-9]/, "Au moins un chiffre.")
  .regex(/[^a-zA-Z0-9]/, "Au moins un caractère spécial.");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
    email: z.string().email("Adresse email invalide."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;