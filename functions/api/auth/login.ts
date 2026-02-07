// Auth API: Send magic link
// POST /api/auth/login

import type { Env } from '../../types';
import { generateId, generateToken, sendMagicLinkEmail, json, errorResponse } from '../../utils';

interface LoginRequest {
  email: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as LoginRequest;
    const email = body.email?.trim().toLowerCase();
    
    if (!email || !email.includes('@')) {
      return errorResponse('Valid email is required', 400);
    }
    
    // Generate magic link token
    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Store token in database
    await env.DB.prepare(`
      INSERT INTO auth_tokens (id, email, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(generateId(), email, token, expiresAt).run();
    
    // Send email
    const baseUrl = new URL(request.url).origin;
    const sent = await sendMagicLinkEmail(email, token, baseUrl, env);
    
    if (!sent) {
      return errorResponse('Failed to send email', 500);
    }
    
    return json({ success: true, message: 'Check your email for a sign-in link' });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed', 500);
  }
};
