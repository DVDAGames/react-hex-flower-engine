// Cloudflare Pages Functions type definitions

/// <reference types="@cloudflare/workers-types" />

export interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
  JWT_SECRET: string;
  ADMIN_EMAILS: string;
  EMAIL_FROM?: string;
  ENVIRONMENT?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  acceptTerms: boolean;
  hexNewsletterOptIn: boolean;
}

export interface Session {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

// Re-export for convenience
export type { PagesFunction, D1Database } from '@cloudflare/workers-types';
