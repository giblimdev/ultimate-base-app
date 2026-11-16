/*
path :           app/(public)/auth/login/page.tsx
tag :            ["auth", "login", "page", "form", "zod", "ux", "password"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page de connexion pro. Contenu de la carte fourni par
                 auth/layout.tsx (carte centrée, en-tête de marque, footer
                 légal). En-tête de carte coloré (bandeau gradient), formulaire
                 email + mot de passe (masqué, toggle œil), bouton primary
                 gradient désactivé tant que le formulaire n'est pas valide,
                 séparateur + lien « Pas encore de compte ? Créer un compte »
                 en bas de carte. Appelle authClient.signIn.email puis
                 redirige vers /home. Aucun <main> ici : le layout s'en
                 charge.

flow :           useForm<LoginInput>({ resolver: zodResolver(loginSchema),
                 mode: "onChange" }) → onSubmit → signIn.email({ email,
                 password }) → succès : router.push("/home") → erreur :
                 toast.error.

ecosystem :      Auth = [
                   "@/app/(public)/auth/layout.tsx",
                   "@/app/(public)/auth/login/page.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/auth/register/page.tsx", "@/lib/validations/auth.ts", "@/lib/auth/auth-client.ts"]
imports :        ["react", "next/link", "next/navigation", "react-hook-form",
                  "@hookform/resolvers/zod", "sonner", "lucide-react",
                  "@/lib/validations/auth", "@/lib/auth/auth-client",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label"]
exports :        ["default LoginPage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux me connecter avec email et mot de passe",
                  "*en tant qu'utilisateur je veux afficher/masquer mon mot de passe",
                  "*en tant qu'utilisateur je veux accéder facilement au lien d'inscription"]
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
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setPending(true);
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });
    setPending(false);

    if (error) {
      toast.error(error.message ?? "Connexion impossible.");
      return;
    }

    toast.success("Connecté.");
    router.push("/home");
  }

  return (
    <div className="flex flex-col">
      {/* En-tête de carte avec bandeau coloré */}
      <div className="border-b border-border bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-emerald-500/5 px-6 py-5 sm:px-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Connexion
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Accédez à votre espace Ultimate Base App.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-6 sm:p-8"
      >
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-10"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Bouton primary gradient */}
        <Button
          type="submit"
          disabled={pending || !form.formState.isValid}
          className="mt-1 h-10 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md hover:from-blue-700 hover:to-violet-700"
        >
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      {/* Séparateur + lien inscription */}
      <div className="border-t border-border bg-muted/30 px-6 py-4 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}