// Admin API: Emergency cascade delete of engine and all forks
// DELETE /api/admin/cascade-delete

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

interface CascadeDeleteRequest {
  engineId: string;
  confirmation: string; // Engine name for confirmation
}

export const onRequestDelete: PagesFunction<Env> = async (context) => {
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
    const body = await request.json() as CascadeDeleteRequest;

    if (!body.engineId || !body.confirmation) {
      return errorResponse('Engine ID and confirmation are required', 400);
    }

    // Get the engine and verify confirmation
    const engine = await env.DB.prepare(`
      SELECT id, definition FROM engines WHERE id = ?
    `).bind(body.engineId).first();

    if (!engine) {
      return errorResponse('Engine not found', 404);
    }

    const definition = JSON.parse(engine.definition as string);
    const engineName = definition.name;

    // Verify confirmation matches engine name
    if (body.confirmation !== engineName) {
      return errorResponse('Confirmation does not match engine name', 400);
    }

    // Get all forks of this engine
    const forks = await env.DB.prepare(`
      SELECT id FROM engines WHERE forked_from = ?
    `).bind(body.engineId).all();

    const forkIds = forks.results.map(f => f.id as string);

    // Delete all forks first (CASCADE will handle related tables)
    if (forkIds.length > 0) {
      const placeholders = forkIds.map(() => '?').join(',');
      await env.DB.prepare(`
        DELETE FROM engines WHERE id IN (${placeholders})
      `).bind(...forkIds).run();
    }

    // Delete the original engine (CASCADE will handle related tables)
    await env.DB.prepare(`
      DELETE FROM engines WHERE id = ?
    `).bind(body.engineId).run();

    const deletedCount = forkIds.length + 1;

    console.log(`[ADMIN] Cascade deleted engine ${engineName} (${body.engineId}) and ${forkIds.length} forks by admin ${session.userId}`);

    return json({
      success: true,
      deletedCount,
      engineId: body.engineId,
      engineName,
      forksDeleted: forkIds.length,
    });
  } catch (error) {
    console.error('Cascade delete error:', error);
    return errorResponse('Failed to cascade delete engine', 500);
  }
};
