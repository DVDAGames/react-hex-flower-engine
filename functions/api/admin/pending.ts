// Admin API: Get pending engines for review
// GET /api/admin/pending

import type { Env } from '../../types';
import { getAuthUser, isAdminEmail, json, errorResponse } from '../../utils';

interface EngineRow {
  id: string;
  owner_id: string;
  definition: string;
  visibility: string;
  submitted_at: string;
  use_count: number;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_display_name: string | null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
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

    // Get all pending engines with user info
    const result = await env.DB.prepare(`
      SELECT 
        e.id,
        e.owner_id,
        e.definition,
        e.visibility,
        e.submitted_for_review_at as submitted_at,
        e.use_count,
        e.created_at,
        e.updated_at,
        p.email as user_email,
        p.display_name as user_display_name
      FROM engines e
      JOIN profiles p ON e.owner_id = p.id
      WHERE e.visibility = 'pending_review'
      ORDER BY e.submitted_for_review_at ASC
    `).all();

    const engines = (result.results as unknown as EngineRow[]).map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      definition: JSON.parse(row.definition),
      visibility: row.visibility,
      submittedAt: row.submitted_at,
      useCount: row.use_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        email: row.user_email,
        displayName: row.user_display_name,
      },
    }));

    return json({ engines });
  } catch (error) {
    console.error('Admin pending error:', error);
    return errorResponse('Failed to fetch pending engines', 500);
  }
};
