// Admin API: Unpublish an engine
// POST /api/admin/unpublish

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

interface UnpublishRequest {
  engineId: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Check authentication
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  // Check admin status
  const user = await env.DB.prepare(`
    SELECT is_admin FROM profiles WHERE id = ?
  `).bind(session.userId).first();

  if (!user?.is_admin) {
    return errorResponse('Admin access required', 403);
  }

  try {
    const body = await request.json() as UnpublishRequest;

    if (!body.engineId) {
      return errorResponse('Engine ID is required', 400);
    }

    // Check if engine exists and is public
    const engine = await env.DB.prepare(`
      SELECT id, visibility, definition FROM engines WHERE id = ?
    `).bind(body.engineId).first();

    if (!engine) {
      return errorResponse('Engine not found', 404);
    }

    if (engine.visibility !== 'public') {
      return errorResponse('Engine is not published', 400);
    }

    const now = new Date().toISOString();

    // Unpublish the engine (set to private and record timestamp)
    await env.DB.prepare(`
      UPDATE engines
      SET visibility = 'private',
          unpublished_at = ?
      WHERE id = ?
    `).bind(now, body.engineId).run();

    // Return updated engine
    return json({
      id: engine.id,
      visibility: 'private',
      unpublishedAt: now,
      definition: JSON.parse(engine.definition as string),
    });
  } catch (error) {
    console.error('Unpublish error:', error);
    return errorResponse('Failed to unpublish engine', 500);
  }
};
