// Auth API: Get current user
// GET /api/auth/me

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  // Get user profile
  const user = await env.DB.prepare(`
    SELECT id, email, display_name, avatar_url, is_admin, default_engine_id, default_editor_engine_id, created_at, updated_at, accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in
    FROM profiles
    WHERE id = ?
  `).bind(session.userId).first();

  if (!user) {
    return errorResponse('User not found', 404);
  }

  console.log("Fetched user profile:", user);

  return json({
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
  });
};
