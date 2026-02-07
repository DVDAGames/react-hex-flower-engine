// Auth API: Refresh access token
// POST /api/auth/refresh

import type { Env } from '../../types';
import { generateId, generateToken, createJWT, json, errorResponse } from '../../utils';

interface RefreshRequest {
  refreshToken: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as RefreshRequest;
    const { refreshToken } = body;
    
    if (!refreshToken) {
      return errorResponse('Refresh token required', 400);
    }
    
    // Find session
    const session = await env.DB.prepare(`
      SELECT s.id, s.user_id, s.expires_at, p.email, p.is_admin
      FROM sessions s
      JOIN profiles p ON p.id = s.user_id
      WHERE s.refresh_token = ?
    `).bind(refreshToken).first<{
      id: string;
      user_id: string;
      expires_at: string;
      email: string;
      is_admin: number;
    }>();
    
    if (!session) {
      return errorResponse('Invalid refresh token', 401);
    }
    
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(session.id).run();
      return errorResponse('Refresh token expired', 401);
    }
    
    // Generate new tokens
    const newRefreshToken = generateToken(32);
    const newSessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Update session
    await env.DB.prepare(`
      UPDATE sessions 
      SET refresh_token = ?, expires_at = ?, last_used_at = datetime('now')
      WHERE id = ?
    `).bind(newRefreshToken, newSessionExpires, session.id).run();
    
    // Create new access token
    const accessToken = await createJWT(
      {
        userId: session.user_id,
        email: session.email,
        isAdmin: session.is_admin === 1,
        exp: 0,
      },
      env.JWT_SECRET,
      '1h'
    );
    
    return json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return errorResponse('Token refresh failed', 500);
  }
};
