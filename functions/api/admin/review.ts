// Admin API: Review (approve/reject) an engine
// POST /api/admin/review

import type { Env } from '../../types';
import { getAuthUser, isAdminEmail, json, errorResponse } from '../../utils';

interface ReviewRequest {
  engineId: string;
  action: 'approve' | 'reject';
  reason?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    // Verify admin authentication
    const session = await getAuthUser(request, env);
    if (!session) {
      return errorResponse('Unauthorized', 401);
    }

    if (!isAdminEmail(session.email, env)) {
      return errorResponse('Forbidden - Admin access required', 403);
    }

    const body = await request.json() as ReviewRequest;
    const { engineId, action, reason } = body;

    if (!engineId || !action) {
      return errorResponse('engineId and action are required', 400);
    }

    if (action !== 'approve' && action !== 'reject') {
      return errorResponse('action must be "approve" or "reject"', 400);
    }

    // Get engine to verify it's pending
    const engine = await env.DB.prepare(`
      SELECT id, owner_id, visibility FROM engines WHERE id = ?
    `).bind(engineId).first() as { id: string; owner_id: string; visibility: string } | null;

    if (!engine) {
      return errorResponse('Engine not found', 404);
    }

    if (engine.visibility !== 'pending_review') {
      return errorResponse('Engine is not pending review', 400);
    }

    if (action === 'approve') {
      // Approve: set visibility to public
      await env.DB.prepare(`
        UPDATE engines 
        SET visibility = 'public', 
            reviewed_at = datetime('now'),
            reviewed_by = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(session.userId, engineId).run();

      return json({ 
        success: true, 
        message: 'Engine approved and published to The Garden',
        visibility: 'public'
      });
    } else {
      // Reject: set visibility back to private
      await env.DB.prepare(`
        UPDATE engines 
        SET visibility = 'private', 
            reviewed_at = datetime('now'),
            reviewed_by = ?,
            rejection_reason = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).bind(session.userId, reason || null, engineId).run();

      return json({ 
        success: true, 
        message: 'Engine rejected and returned to private',
        visibility: 'private'
      });
    }
  } catch (error) {
    console.error('Admin review error:', error);
    return errorResponse('Failed to review engine', 500);
  }
};
