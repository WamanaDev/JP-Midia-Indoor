// src/utils/supabase/auth-errors.ts
import { AuthError } from "@supabase/supabase-js";

export type AuthLocale = "pt" | "en" | "fr";

const AUTH_ERROR_MESSAGES: Record<
  string,
  { pt: string; en: string; fr: string }
> = {
  // ---------- GENÉRICOS ----------
  "Auth session missing": {
    pt: "Sessão inválida ou expirada. Solicite novamente.",
    en: "Invalid or expired session. Please try again.",
    fr: "Session invalide ou expirée. Veuillez réessayer.",
  },

  "Token has expired or is invalid": {
    pt: "O link é inválido ou expirou.",
    en: "The link is invalid or has expired.",
    fr: "Le lien est invalide ou a expiré.",
  },

  "Invalid login credentials": {
    pt: "E-mail ou senha inválidos.",
    en: "Invalid email or password.",
    fr: "E-mail ou mot de passe incorrect.",
  },

  "User not found": {
    pt: "Usuário não encontrado.",
    en: "User not found.",
    fr: "Utilisateur introuvable.",
  },

  // ---------- PASSWORD ----------
  "Password should be at least 6 characters": {
    pt: "A senha deve ter no mínimo 6 caracteres.",
    en: "Password must be at least 6 characters long.",
    fr: "Le mot de passe doit contenir au moins 6 caractères.",
  },

  "New password should be different from the old password": {
    pt: "A nova senha deve ser diferente da senha atual.",
    en: "New password must be different from the old one.",
    fr: "Le nouveau mot de passe doit être différent de l’ancien.",
  },

  // ---------- SIGN UP ----------
  "User already registered": {
    pt: "Este e-mail já está cadastrado.",
    en: "This email is already registered.",
    fr: "Cet e-mail est déjà enregistré.",
  },

  "Signup disabled": {
    pt: "O cadastro está desativado no momento.",
    en: "Sign up is currently disabled.",
    fr: "L’inscription est actuellement désactivée.",
  },

  // ---------- EMAIL ----------
  "Email not confirmed": {
    pt: "Confirme seu e-mail antes de continuar.",
    en: "Please confirm your email before continuing.",
    fr: "Veuillez confirmer votre e-mail avant de continuer.",
  },

  "Email rate limit exceeded": {
    pt: "Muitas tentativas. Aguarde antes de tentar novamente.",
    en: "Too many requests. Please wait and try again.",
    fr: "Trop de tentatives. Veuillez patienter.",
  },

  // ---------- OAUTH ----------
  "OAuth provider error": {
    pt: "Erro ao autenticar com o provedor externo.",
    en: "Error authenticating with external provider.",
    fr: "Erreur lors de l’authentification avec le fournisseur externe.",
  },

  // ---------- DEFAULT ----------
  DEFAULT: {
    pt: "Ocorreu um erro inesperado. Tente novamente.",
    en: "An unexpected error occurred. Please try again.",
    fr: "Une erreur inattendue est survenue. Veuillez réessayer.",
  },
};

export function translateAuthError(
  error: AuthError | null,
  locale: AuthLocale = "pt"
): string {
  if (!error) return "";

  const message =
    AUTH_ERROR_MESSAGES[error.message] || AUTH_ERROR_MESSAGES.DEFAULT;

  return message[locale];
}
