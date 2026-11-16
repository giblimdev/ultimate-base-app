/*
path :           lib/validations/auth.ts
tag :            ["auth", "validation", "zod", "password", "terms"]
projectId :      <UltimateBaseApp>
type :           helper
generic :        true

role :           Schémas Zod partagés login/register. Le schéma register
                 impose : nom ≥ 2, email valide, mot de passe robuste,
                 confirmation identique, ET acceptation explicite des
                 CGU + politique de confidentialité. acceptTerms est un
                 boolean contraint à true par refine (et non un
                 z.literal(true)), ce qui permet à react-hook-form
                 d'utiliser false comme valeur initiale sans erreur de
                 typage, tout en bloquant la soumission tant que la case
                 n'est pas cochée. Login reste permissif (présence email
                 + mot de passe).

flow :           registerSchema.safeParse(data) → succès ou erreurs typées.
                 loginSchema.safeParse(data) → idem.
                 passwordSchema.safeParse(value) → utilisé par la liste
                 de règles dynamiques dans le formulaire register.

ecosystem :      Auth = [
                   "@/app/api/auth/[...all]/route.ts",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/auth/auth.ts",
                   "@/lib/auth/session.ts",
                   "@/lib/db.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/auth/login/page.tsx",
                  "@/app/(public)/auth/register/page.tsx"]
imports :        ["zod"]
exports :        ["passwordSchema", "registerSchema", "loginSchema",
                  "RegisterInput", "LoginInput"]
useBy :          ["@/app/(public)/auth/login/page.tsx",
                  "@/app/(public)/auth/register/page.tsx"]

userStories :    ["*en tant qu'utilisateur je veux un mot de passe robuste",
                  "*en tant qu'utilisateur je veux accepter les CGU et la politique de confidentialité avant de créer un compte"]
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
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        "Vous devez accepter les CGU et la politique de confidentialité.",
    }),
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