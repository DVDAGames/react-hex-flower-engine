// Engines API: Get, update, delete single engine
// GET /api/engines/[id]
// PATCH /api/engines/[id]
// DELETE /api/engines/[id]

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const engineId = params.id as string;
  
  const session = await getAuthUser(request, env);
  
  // Get engine
  const engine = await env.DB.prepare(`
    SELECT id, owner_id, definition, version, visibility, use_count, 
           forked_from, created_at, updated_at, published_at
    FROM engines
    WHERE id = ?
  `).bind(engineId).first();
  
  if (!engine) {
    return errorResponse('Engine not found', 404);
  }
  
  // Check access
  const isOwner = session?.userId === engine.owner_id;
  const isPublic = engine.visibility === 'public';
  
  if (!isOwner && !isPublic) {
    return errorResponse('Access denied', 403);
  }
  
  return json({
    id: engine.id,
    ownerId: engine.owner_id,
    definition: JSON.parse(engine.definition as string),
    version: engine.version,
    visibility: engine.visibility,
    useCount: engine.use_count,
    forkedFrom: engine.forked_from,
    createdAt: engine.created_at,
    updatedAt: engine.updated_at,
    publishedAt: engine.published_at,
  });
};

interface UpdateEngineRequest {
  definition?: unknown;
  visibility?: 'private' | 'shared' | 'pending_review';
  version?: string;
}

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const engineId = params.id as string;
  
  const session = await getAuthUser(request, env);

  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  // Check ownership
  const engine = await env.DB.prepare(`
    SELECT id, owner_id, visibility, is_system_default FROM engines WHERE id = ?
  `).bind(engineId).first();
  
  if (!engine) {
    return errorResponse('Engine not found', 404);
  }

  if (engine.owner_id !== session.userId && (!session.isAdmin && !engine.is_system_default)) {
    return errorResponse('Access denied', 403);
  }
  
  try {
    const body = await request.json() as UpdateEngineRequest;
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (body.definition !== undefined) {
      updates.push('definition = ?');
      values.push(JSON.stringify(body.definition));
    }
    
    if (body.visibility !== undefined) {
      // Can't directly set to 'public', must go through review
      if (body.visibility === 'pending_review' && engine.visibility !== 'pending_review') {
        updates.push('visibility = ?');
        updates.push('submitted_for_review_at = datetime("now")');
        values.push('pending_review');
      } else if (body.visibility !== 'pending_review') {
        updates.push('visibility = ?');
        values.push(body.visibility);
      }
    }
    
    if (body.version !== undefined) {
      updates.push('version = ?');
      values.push(body.version);
    }
    
    if (updates.length === 0) {
      return errorResponse('No valid updates provided', 400);
    }
    
    updates.push('updated_at = datetime("now")');
    values.push(engineId);
    
    await env.DB.prepare(`
      UPDATE engines SET ${updates.join(', ')} WHERE id = ?
    `).bind(...values).run();
    
    // Return updated engine
    const updated = await env.DB.prepare(`
      SELECT id, owner_id, definition, version, visibility, use_count, 
             forked_from, created_at, updated_at, published_at
      FROM engines WHERE id = ?
    `).bind(engineId).first();
    
    return json({
      id: updated!.id,
      ownerId: updated!.owner_id,
      definition: JSON.parse(updated!.definition as string),
      version: updated!.version,
      visibility: updated!.visibility,
      useCount: updated!.use_count,
      forkedFrom: updated!.forked_from,
      createdAt: updated!.created_at,
      updatedAt: updated!.updated_at,
      publishedAt: updated!.published_at,
    });
  } catch (error) {
    return errorResponse('Failed to update engine', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const engineId = params.id as string;

  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  // Check ownership and system status
  const engine = await env.DB.prepare(`
    SELECT owner_id, is_system_default FROM engines WHERE id = ?
  `).bind(engineId).first();

  if (!engine) {
    return errorResponse('Engine not found', 404);
  }

  if (engine.owner_id !== session.userId) {
    return errorResponse('Access denied', 403);
  }

  // Prevent deletion of system engines by regular users
  // (Admins can edit system engines but deletion requires cascade delete endpoint)
  if (engine.is_system_default) {
    return errorResponse('System engines cannot be deleted. Contact an administrator if this engine needs to be removed.', 403);
  }

  // Delete the engine
  // Note: Database has ON DELETE SET NULL for forked_from, so forks are preserved
  // Cascading deletes: engine_versions, shared_links, engine_states
  await env.DB.prepare('DELETE FROM engines WHERE id = ?').bind(engineId).run();

  return json({ success: true });
};
