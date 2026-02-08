// Shared Engine API: Get engine by share token
// GET /api/s/[token]

import type { Env } from '../../types';
import { json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const token = params.token as string;
  
  // Find share link
  const link = await env.DB.prepare(`
    SELECT sl.id, sl.engine_id, sl.engine_version, sl.active_hex, sl.is_active, sl.expires_at,
           e.definition, e.version
    FROM shared_links sl
    JOIN engines e ON e.id = sl.engine_id
    WHERE sl.token = ?
  `).bind(token).first();
  
  if (!link) {
    return errorResponse('Share link not found', 404);
  }
  
  if (link.is_active !== 1) {
    return errorResponse('Share link is inactive', 410);
  }
  
  if (link.expires_at && new Date(link.expires_at as string) < new Date()) {
    return errorResponse('Share link has expired', 410);
  }
  
  // Update access stats
  await env.DB.prepare(`
    UPDATE shared_links 
    SET access_count = access_count + 1, last_accessed_at = datetime('now')
    WHERE id = ?
  `).bind(link.id).run();
  
  return json({
    engine: {
      definition: JSON.parse(link.definition as string),
      version: link.engine_version || link.version,
    },
    activeHex: link.active_hex,
  });
};
