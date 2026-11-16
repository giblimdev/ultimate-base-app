/*
path :           app/(public)/auth/register/page.tsx
tag :            ["auth", "register", "page", "form", "zod", "ux",
                  "password", "avatar", "terms", "controlled-checkbox"]
projectId :      <UltimateBaseApp>
type :           page
generic :        false

role :           Page d'inscription pro. Contenu de la carte fourni par
                 auth/layout.tsx. Champs : avatar (upload + aperçu 80px +
                 retirer), nom, email, mot de passe (toggle œil), confirmation
                 (toggle œil), case à cocher CGU + Privacy OBLIGATOIRE via
                 z.boolean().refine((v) => v === true). acceptTerms est un
                 boolean (false par défaut), ce qui est compatible avec
                 react-hook-form et SubmitHandler<RegisterInput>. La Checkbox
                 Base UI est strictement contrôlée : checked={field.value === true}.
                 Règles mot de passe en grille 2 colonnes colorées.
                 Séparateur + lien « Déjà un compte ? Se connecter » en bas
                 de carte.

flow :           useForm<RegisterInput> → onSubmit → signUp.email →
                 si avatar : updateUser({ image }) → router.push("/home").

ecosystem :      Auth = [
                   "@/app/(public)/auth/layout.tsx",
                   "@/app/(public)/auth/register/page.tsx",
                   "@/lib/auth/auth-client.ts",
                   "@/lib/validations/auth.ts",
                 ]
relatedFiles :   ["@/app/(public)/auth/login/page.tsx",
                  "@/lib/validations/auth.ts",
                  "@/lib/auth/auth-client.ts"]
imports :        ["react", "next/link", "next/navigation", "react-hook-form",
                  "@hookform/resolvers/zod", "sonner", "lucide-react",
                  "@/lib/validations/auth", "@/lib/auth/auth-client",
                  "@/components/ui/button", "@/components/ui/input",
                  "@/components/ui/label", "@/components/ui/checkbox"]
exports :        ["default RegisterPage"]
useBy :          []

userStories :    ["*en tant qu'utilisateur je veux créer un compte avec un avatar",
                  "*en tant qu'utilisateur je veux accepter les CGU et la politique de confidentialité",
                  "*en tant qu'utilisateur je veux un mot de passe robuste validé en temps réel",
                  "*en tant qu'utilisateur je veux accéder facilement au lien de connexion"]
status :         wip
pathChecked :    ✔true
metaDataChecked : ✔true
scriptChecked :  ✔true
*/
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Upload, User, X } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const PASSWORD_RULES = [
  { key: "min", label: "8 caractères min.", test: (v: string) => v.length >= 8 },
  { key: "lower", label: "Une minuscule", test: (v: string) => /[a-z]/.test(v) },
  { key: "upper", label: "Une majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { key: "digit", label: "Un chiffre", test: (v: string) => /[0-9]/.test(v) },
  {
    key: "special",
    label: "Un caractère spécial",
    test: (v: string) => /[^a-zA-Z0-9]/.test(v),
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = form.watch("password") ?? "";
  const confirmValue = form.watch("confirmPassword") ?? "";
  const passwordsMatch =
    confirmValue.length > 0 && passwordValue === confirmValue;

  function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: RegisterInput) {
    setPending(true);
    const { error } = await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (error) {
      setPending(false);
      toast.error(error.message ?? "Inscription impossible.");
      return;
    }

    if (avatar) {
      await authClient.updateUser({ image: avatar });
    }

    setPending(false);
    toast.success("Compte créé. Bienvenue !");
    router.push("/home");
  }

  return (
    <div className="flex flex-col">
      {/* En-tête de carte avec bandeau coloré */}
      <div className="border-b border-border bg-gradient-to-r from-blue-500/5 via-violet-500/5 to-emerald-500/5 px-6 py-5 sm:px-8">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Créer un compte
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rejoignez Ultimate Base App en quelques secondes.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5 p-6 sm:p-8"
      >
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted ring-4 ring-primary/5">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt="Aperçu de l'avatar"
                className="size-full object-cover"
              />
            ) : (
              <User className="size-8 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
              id="avatar"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 size-3.5" aria-hidden="true" />
              {avatar ? "Changer" : "Ajouter un avatar"}
            </Button>
            {avatar && (
              <Button type="button" variant="ghost" size="sm" onClick={removeAvatar}>
                <X className="mr-1.5 size-3.5" aria-hidden="true" />
                Retirer
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">PNG/JPG, 2 Mo max.</p>
        </div>

        {/* Nom */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <ul className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(passwordValue);
              return (
                <li
                  key={rule.key}
                  className={
                    ok
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }
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

        {/* Confirmation */}
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
              aria-label={
                showConfirm
                  ? "Masquer la confirmation"
                  : "Afficher la confirmation"
              }
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {showConfirm ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
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

        {/* Acceptation CGU + Privacy (obligatoire, Checkbox contrôlée) */}
        <Controller
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 p-3">
                <Checkbox
                  id="acceptTerms"
                  checked={field.value === true}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-xs leading-relaxed font-normal text-muted-foreground"
                >
                  J&apos;accepte les{" "}
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    CGU
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/legal/privacy"
                    target="_blank"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
                  >
                    politique de confidentialité
                  </Link>
                  .
                </Label>
              </div>
              {form.formState.errors.acceptTerms && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.acceptTerms.message}
                </p>
              )}
            </div>
          )}
        />

        <Button
          type="submit"
          disabled={pending || !form.formState.isValid}
          className="mt-1 h-10 bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md hover:from-blue-700 hover:to-violet-700"
        >
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>

      {/* Séparateur + lien connexion */}
      <div className="border-t border-border bg-muted/30 px-6 py-4 text-center sm:px-8">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}