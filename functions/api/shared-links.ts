// Shared Links API: Create and manage share links
// GET /api/shared-links - Get user's share links
// POST /api/shared-links - Create a share link

import type { Env } from '../types';
import { getAuthUser, generateId, generateToken, json, errorResponse } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  const links = await env.DB.prepare(`
    SELECT id, engine_id, token, engine_version, active_hex, is_active, 
           expires_at, access_count, last_accessed_at, created_at
    FROM shared_links
    WHERE owner_id = ?
    ORDER BY created_at DESC
  `).bind(session.userId).all();
  
  return json(links.results.map(l => ({
    id: l.id,
    engineId: l.engine_id,
    token: l.token,
    engineVersion: l.engine_version,
    activeHex: l.active_hex,
    isActive: l.is_active === 1,
    expiresAt: l.expires_at,
    accessCount: l.access_count,
    lastAccessedAt: l.last_accessed_at,
    createdAt: l.created_at,
  })));
};

interface CreateShareLinkRequest {
  engineId: string;
  version?: string;
  activeHex?: number;
  expiresAt?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  try {
    const body = await request.json() as CreateShareLinkRequest;
    
    if (!body.engineId) {
      return errorResponse('Engine ID is required', 400);
    }
    
    // Verify engine ownership
    const engine = await env.DB.prepare(`
      SELECT owner_id FROM engines WHERE id = ?
    `).bind(body.engineId).first();
    
    if (!engine) {
      return errorResponse('Engine not found', 404);
    }
    
    if (engine.owner_id !== session.userId) {
      return errorResponse('Access denied', 403);
    }
    
    const id = generateId();
    const token = generateToken(8);
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO shared_links (id, engine_id, owner_id, token, engine_version, active_hex, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.engineId,
      session.userId,
      token,
      body.version || null,
      body.activeHex ?? null,
      body.expiresAt || null,
      now
    ).run();
    
    return json({
      id,
      engineId: body.engineId,
      token,
      engineVersion: body.version || null,
      activeHex: body.activeHex ?? null,
      isActive: true,
      expiresAt: body.expiresAt || null,
      accessCount: 0,
      lastAccessedAt: null,
      createdAt: now,
    }, 201);
  } catch (error) {
    return errorResponse('Failed to create share link', 500);
  }
};
