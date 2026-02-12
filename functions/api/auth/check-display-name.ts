// Auth API: Check if display name is available
// GET /api/auth/check-display-name?name=<display_name>

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const url = new URL(request.url);
  const displayName = url.searchParams.get('name');

  if (!displayName) {
    return errorResponse('Display name is required', 400);
  }

  if (displayName.trim().length === 0) {
    return json({ available: false, message: 'Display name cannot be empty' });
  }

  if (displayName.length > 50) {
    return json({ available: false, message: 'Display name must be 50 characters or less' });
  }

  // Check if display name is already taken by another user (case-insensitive)
  const existingUser = await env.DB.prepare(`
    SELECT id, display_name
    FROM profiles
    WHERE display_name = ? COLLATE NOCASE
    AND id != ?
  `).bind(displayName.trim(), session.userId).first();

  if (existingUser) {
    return json({
      available: false,
      message: 'This display name is already taken'
    });
  }

  return json({
    available: true,
    message: 'Display name is available'
  });
};
