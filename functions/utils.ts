// Utility functions for Cloudflare Functions

import type { Env, Session, User } from './types';

/**
 * Generate a random ID (UUID v4 compatible)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a short random token (for share links)
 */
export function generateToken(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Create a JWT token
 */
export async function createJWT(payload: Session, secret: string, expiresIn = '7d'): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Parse expiration
  const expMs = parseExpiration(expiresIn);
  payload.exp = Math.floor((Date.now() + expMs) / 1000);
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${headerB64}.${payloadB64}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '');
  
  return `${data}.${signatureB64}`;
}

/**
 * Verify a JWT token
 */
export async function verifyJWT(token: string, secret: string): Promise<Session | null> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    
    const encoder = new TextEncoder();
    const data = `${headerB64}.${payloadB64}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    // Decode signature
    const signature = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
    if (!valid) return null;
    
    // Decode payload
    const payload = JSON.parse(atob(payloadB64)) as Session;
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Parse expiration string to milliseconds
 */
function parseExpiration(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

/**
 * Get user from Authorization header
 */
export async function getAuthUser(request: Request, env: Env): Promise<Session | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  return verifyJWT(token, env.JWT_SECRET);
}

/**
 * Check if email is admin
 */
export function isAdminEmail(email: string, env: Env): boolean {
  const adminEmails = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Send magic link email via Resend
 */
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  baseUrl: string,
  env: Env
): Promise<boolean> {
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;
  
  // Use configured sender email, or fall back to Resend's test sender for development
  const fromEmail = env.EMAIL_FROM || 'Hex Flower Engine <onboarding@resend.dev>';
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        reply_to: 'noreply@hex.dvdagames.com',
        subject: 'Sign in to Hex Flower Engine',
        html: `
          <h2>Sign in to Hex Flower Engine</h2>
          <p>Click the link below to sign in. This link expires in 15 minutes.</p>
          <p><a href="${magicLink}">Sign in to Hex Flower Engine</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${magicLink}</p>
          <p>If you didn't request this email, you can safely ignore it.</p>
        `,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', response.status, errorData);
    }
    
    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * JSON response helper
 */
export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status = 400): Response {
  return json({ error: message }, status);
}
