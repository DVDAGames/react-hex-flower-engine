// Admin API: Get review history (approved/rejected engines)
// GET /api/admin/history

import type { Env } from '../../types';
import { getAuthUser, isAdminEmail, json, errorResponse } from '../../utils';

interface EngineRow {
  id: string;
  owner_id: string;
  definition: string;
  visibility: string;
  submitted_for_review_at: string;
  reviewed_at: string;
  reviewed_by: string;
  rejection_reason: string | null;
  use_count: number;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_display_name: string | null;
  reviewer_email: string | null;
  reviewer_display_name: string | null;
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

    // Get query params for filtering
    const url = new URL(request.url);
    const filter = url.searchParams.get('filter') || 'all'; // 'all', 'approved', 'rejected'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    // Build visibility filter
    let visibilityFilter = "e.visibility IN ('public', 'private')";
    if (filter === 'approved') {
      visibilityFilter = "e.visibility = 'public'";
    } else if (filter === 'rejected') {
      visibilityFilter = "e.visibility = 'private'";
    }

    // Get reviewed engines with user and reviewer info
    const result = await env.DB.prepare(`
      SELECT 
        e.id,
        e.owner_id,
        e.definition,
        e.visibility,
        e.submitted_for_review_at,
        e.reviewed_at,
        e.reviewed_by,
        e.rejection_reason,
        e.use_count,
        e.created_at,
        e.updated_at,
        p.email as user_email,
        p.display_name as user_display_name,
        r.email as reviewer_email,
        r.display_name as reviewer_display_name
      FROM engines e
      JOIN profiles p ON e.owner_id = p.id
      LEFT JOIN profiles r ON e.reviewed_by = r.id
      WHERE e.reviewed_at IS NOT NULL
        AND ${visibilityFilter}
      ORDER BY e.reviewed_at DESC
      LIMIT ?
    `).bind(limit).all();

    const engines = (result.results as unknown as EngineRow[]).map((row) => ({
      id: row.id,
      ownerId: row.owner_id,
      definition: JSON.parse(row.definition),
      visibility: row.visibility,
      submittedAt: row.submitted_for_review_at,
      reviewedAt: row.reviewed_at,
      rejectionReason: row.rejection_reason,
      useCount: row.use_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        email: row.user_email,
        displayName: row.user_display_name,
      },
      reviewer: row.reviewer_email ? {
        email: row.reviewer_email,
        displayName: row.reviewer_display_name,
      } : null,
    }));

    return json({ engines });
  } catch (error) {
    console.error('Admin history error:', error);
    return errorResponse('Failed to fetch review history', 500);
  }
};
