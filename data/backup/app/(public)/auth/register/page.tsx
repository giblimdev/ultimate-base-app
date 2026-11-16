/*
path :           app/(public)/auth/register/page.tsx
tag :            ["auth", "register", "page", "form", "zod", "ux", "password"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page publique d'inscription. Formulaire contrôlé par
                 react-hook-form + zodResolver. Champs : nom, email,
                 mot de passe (masqué, toggle œil), confirmation (masquée,
                 toggle œil). Validation dynamique : la liste des règles
                 du mot de passe se met à jour à chaque frappe (coches
                 vertes / croix grises). Message vert/rouge sous la
                 confirmation. Bouton désactivé tant que le formulaire
                 n'est pas valide. Appelle authClient.signUp.email puis
                 redirige vers /home.

flow :           useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })
                 → onSubmit → signUp.email({ name, email, password })
                 → succès : router.push("/home") → erreur : toast.error.

ecosystem :      Auth = [
                   "@/app/(public)/auth/register/page.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/auth/login/page.tsx", "@/lib/validations/auth.ts", "@/lib/auth/auth-client.ts"]
imports :        ["react", "next/link", "next/navigation", "react-hook-form",
                  "@hookform/resolvers/zod", "sonner", "lucide-react",
                  "@/lib/validations/auth", "@/lib/auth/auth-client",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label"]
exports :        ["default RegisterPage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux créer un compte avec un mot de passe robuste",
                  "*en tant qu'utilisateur je veux voir mes erreurs de mot de passe en temps réel",
                  "*en tant qu'utilisateur je veux afficher/masquer mon mot de passe"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Eye, EyeOff, X } from "lucide-react";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSWORD_RULES = [
  { key: "min", label: "Au moins 8 caractères", test: (v: string) => v.length >= 8 },
  { key: "lower", label: "Une minuscule", test: (v: string) => /[a-z]/.test(v) },
  { key: "upper", label: "Une majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { key: "digit", label: "Un chiffre", test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "Un caractère spécial", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const passwordValue = form.watch("password") ?? "";
  const confirmValue = form.watch("confirmPassword") ?? "";
  const passwordsMatch =
    confirmValue.length > 0 && passwordValue === confirmValue;

  async function onSubmit(data: RegisterInput) {
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Inscription impossible.");
      return;
    }

    toast.success("Compte créé. Bienvenue !");
    router.push("/home");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:py-16">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Créer un compte</h1>
        <p className="text-sm text-muted-foreground">
          Rejoignez Ultimate Base App en quelques secondes.
        </p>
      </header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <ul className="mt-1 flex flex-col gap-0.5 text-xs">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(passwordValue);
              return (
                <li
                  key={rule.key}
                  className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {ok ? <Check className="size-3" /> : <X className="size-3" />}
                    {rule.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              className="pr-10"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? "Masquer la confirmation" : "Afficher la confirmation"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {confirmValue.length > 0 && (
            <p
              className={
                passwordsMatch
                  ? "text-xs text-emerald-600 dark:text-emerald-400"
                  : "text-xs text-destructive"
              }
            >
              {passwordsMatch
                ? "Les mots de passe correspondent."
                : "Les mots de passe ne correspondent pas."}
            </p>
          )}
        </div>

        <Button type="submit" disabled={pending || !form.formState.isValid} className="mt-2">
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link href="/auth/login" className="font-medium text-foreground underline underline-offset-4">
          Se connecter
        </Link>
      </p>
    </main>
  );
}