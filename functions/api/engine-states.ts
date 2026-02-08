// Engine States API: Sync engine states across devices
// GET /api/engine-states - Get user's engine states
// POST /api/engine-states - Save/upsert engine state

import type { Env } from '../types';
import { getAuthUser, generateId, json, errorResponse } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }

  const { searchParams } = new URL(request.url);
  const engineId = searchParams.get('engineId');
  
  if (engineId) {
    const state = await env.DB.prepare(`
      SELECT engine_id, active_hex, pinned_version, synced_at
      FROM engine_states
      WHERE user_id = ? AND engine_id = ?
    `).bind(session.userId, engineId).first();

    if (!state) {
      return errorResponse('Engine state not found', 404);
    }

    return json({
      engineId: state.engine_id,
      activeHex: state.active_hex,
      pinnedVersion: state.pinned_version,
      syncedAt: state.synced_at,
    });
  } else {
    const states = await env.DB.prepare(`
      SELECT engine_id, active_hex, pinned_version, synced_at
      FROM engine_states
      WHERE user_id = ?
    `).bind(session.userId).all();
    
    return json(states.results.map(s => ({
      engineId: s.engine_id,
      activeHex: s.active_hex,
      pinnedVersion: s.pinned_version,
      syncedAt: s.synced_at,
    })));
  }
};

interface SaveStateRequest {
  engineId: string;
  activeHex: number;
  pinnedVersion?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  try {
    const body = await request.json() as SaveStateRequest;
    
    if (!body.engineId || body.activeHex === undefined) {
      return errorResponse('Engine ID and active hex are required', 400);
    }
    
    const now = new Date().toISOString();
    
    // Upsert: try to update, then insert if no rows affected
    const existing = await env.DB.prepare(`
      SELECT id FROM engine_states WHERE user_id = ? AND engine_id = ?
    `).bind(session.userId, body.engineId).first();

    if (existing) {
      await env.DB.prepare(`
        UPDATE engine_states 
        SET active_hex = ?, pinned_version = ?, synced_at = ?
        WHERE user_id = ? AND engine_id = ?
      `).bind(
        body.activeHex,
        body.pinnedVersion || null,
        now,
        session.userId,
        body.engineId
      ).run();
    } else {
      const insert = await env.DB.prepare(`
        INSERT INTO engine_states (id, user_id, engine_id, active_hex, pinned_version, synced_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        generateId(),
        session.userId,
        body.engineId,
        body.activeHex,
        body.pinnedVersion || null,
        now
      ).run();
    }
    
    return json({
      engineId: body.engineId,
      activeHex: body.activeHex,
      pinnedVersion: body.pinnedVersion || null,
      syncedAt: now,
    });
  } catch (error) {
    return errorResponse('Failed to save engine state', 500);
  }
};
