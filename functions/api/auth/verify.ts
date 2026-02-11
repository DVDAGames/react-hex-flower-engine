// Auth API: Verify magic link token
// GET /api/auth/verify?token=xxx

import type { Env, User } from '../../types';
import { generateId, generateToken, createJWT, isAdminEmail, json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return errorResponse('Token is required', 400);
    }
    
    // Find and validate token
    const authToken = await env.DB.prepare(`
      SELECT id, email, expires_at, used_at
      FROM auth_tokens
      WHERE token = ?
    `).bind(token).first<{ id: string; email: string; expires_at: string; used_at: string | null }>();
    
    if (!authToken) {
      return errorResponse('Invalid token', 400);
    }
    
    if (authToken.used_at) {
      return errorResponse('Token already used', 400);
    }
    
    if (new Date(authToken.expires_at) < new Date()) {
      return errorResponse('Token expired', 400);
    }
    
    // Mark token as used
    await env.DB.prepare(`
      UPDATE auth_tokens SET used_at = datetime('now') WHERE id = ?
    `).bind(authToken.id).run();
    
    // Find or create user
    let user = await env.DB.prepare(`
      SELECT id, email, display_name, avatar_url, is_admin, created_at, updated_at, default_engine_id, default_editor_engine_id, accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in
      FROM profiles
      WHERE email = ?
    `).bind(authToken.email).first<{
      id: string;
      email: string;
      display_name: string | null;
      avatar_url: string | null;
      is_admin: number;
      created_at: string;
      updated_at: string;
      default_engine_id: string | null;
      default_editor_engine_id: string | null;
      accept_terms: number;
      hex_newsletter_opt_in: number;
      dvda_newsletter_opt_in: number;
    }>();
    
    const isAdmin = isAdminEmail(authToken.email, env);
    
    if (!user) {
      // Create new user
      const userId = generateId();
      const displayName = authToken.email.split('@')[0];
      
      await env.DB.prepare(`
        INSERT INTO profiles (id, email, display_name, is_admin)
        VALUES (?, ?, ?, ?)
      `).bind(userId, authToken.email, displayName, isAdmin ? 1 : 0).run();
      
      user = {
        id: userId,
        email: authToken.email,
        display_name: displayName,
        avatar_url: null,
        is_admin: isAdmin ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        default_engine_id: null,
        default_editor_engine_id: null,
        accept_terms: 0,
        hex_newsletter_opt_in: 0,
        dvda_newsletter_opt_in: 0,
      };
    } else if (isAdmin && !user.is_admin) {
      // Update admin status if needed
      await env.DB.prepare(`
        UPDATE profiles SET is_admin = 1, updated_at = datetime('now') WHERE id = ?
      `).bind(user.id).run();
      user.is_admin = 1;
    }
    
    // Create session
    const refreshToken = generateToken(32);
    const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    
    await env.DB.prepare(`
      INSERT INTO sessions (id, user_id, refresh_token, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(generateId(), user.id, refreshToken, sessionExpires).run();
    
    // Create JWT access token
    const accessToken = await createJWT(
      {
        userId: user.id,
        email: user.email,
        isAdmin: user.is_admin === 1,
        exp: 0, // Will be set by createJWT
      },
      env.JWT_SECRET,
      '1h'
    );
    
    return json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin === 1,
        defaultEngineId: user.default_engine_id,
        defaultEditorEngineId: user.default_editor_engine_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        acceptTerms: user.accept_terms,
        hexNewsletterOptIn: user.hex_newsletter_opt_in,
        dvdaNewsletterOptIn: user.dvda_newsletter_opt_in,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return errorResponse('Verification failed', 500);
  }
};
