// Fork Engine API: Create a copy of an existing engine
// POST /api/engines/:id/fork

import type { Env } from '../../../types';
import { getAuthUser, generateId, json, errorResponse } from '../../../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const sourceEngineId = params.id as string;

  try {
    // Fetch source engine
    const sourceEngine = await env.DB.prepare(`
      SELECT id, owner_id, definition, version, visibility, is_system_default
      FROM engines
      WHERE id = ?
    `).bind(sourceEngineId).first();

    if (!sourceEngine) {
      return errorResponse('Engine not found', 404);
    }

    // Check access permissions
    const isOwner = session.userId === sourceEngine.owner_id;
    const isPublic = sourceEngine.visibility === 'public';

    if (!isOwner && !isPublic) {
      return errorResponse('Access denied', 403);
    }

    // Check if user already has a fork of this engine
    const existingFork = await env.DB.prepare(`
      SELECT id FROM engines
      WHERE owner_id = ? AND forked_from = ?
    `).bind(session.userId, sourceEngineId).first();

    if (existingFork) {
      return errorResponse('You already have a copy of this engine', 400);
    }

    // Create the fork
    const forkId = generateId();
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO engines (id, owner_id, definition, version, visibility, forked_from, created_at, updated_at)
      VALUES (?, ?, ?, '1.0.0', 'private', ?, ?, ?)
    `).bind(
      forkId,
      session.userId,
      sourceEngine.definition, // Copy the definition as-is
      sourceEngineId,
      now,
      now
    ).run();

    // Increment fork count on source engine
    await env.DB.prepare(`
      UPDATE engines
      SET fork_count = COALESCE(fork_count, 0) + 1
      WHERE id = ?
    `).bind(sourceEngineId).run();

    // Return the new fork
    return json({
      id: forkId,
      ownerId: session.userId,
      definition: JSON.parse(sourceEngine.definition as string),
      version: '1.0.0',
      visibility: 'private',
      useCount: 0,
      forkedFrom: sourceEngineId,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    }, 201);
  } catch (error) {
    console.error('Fork engine error:', error);
    return errorResponse('Failed to fork engine', 500);
  }
};
