// Auth API: Logout
// POST /api/auth/logout

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    // Already logged out
    return json({ success: true });
  }
  
  // Delete all sessions for this user (optional: could just delete the current one)
  await env.DB.prepare(`
    DELETE FROM sessions WHERE user_id = ?
  `).bind(session.userId).run();
  
  return json({ success: true });
};
