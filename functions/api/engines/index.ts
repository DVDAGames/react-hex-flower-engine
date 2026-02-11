// Engines API: List user's engines and create new engine
// GET /api/engines - List user's engines
// POST /api/engines - Create new engine

import type { Env } from '../../types';
import { getAuthUser, generateId, json, errorResponse } from '../../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const session = await getAuthUser(request, env);

  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  const url = new URL(request.url);
  const includeSystem = url.searchParams.get('includeSystem') === 'true';

  console.log(`Fetching engines for user ${session.userId}, includeSystem=${includeSystem}`); // Debug log

  const engines = await env.DB.prepare(`
    SELECT id, owner_id, definition, version, visibility, use_count, 
           forked_from, created_at, updated_at, published_at, is_system_default
    FROM engines
    WHERE owner_id = ?${includeSystem ? " OR is_system_default = 1" : ""}
    ORDER BY updated_at DESC
  `).bind(session.userId).all();

  const mappedResults = engines.results.map(e => ({
    id: e.id,
    ownerId: e.owner_id,
    definition: JSON.parse(e.definition as string),
    version: e.version,
    visibility: e.visibility,
    isSystemDefault: e.is_system_default === 1,
    useCount: e.use_count,
    forkedFrom: e.forked_from,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    publishedAt: e.published_at,
  }));

  if (includeSystem) {
    // Move system engines to the start of the list
    mappedResults.sort((a, b) => {
      if (a.isSystemDefault && !b.isSystemDefault) return -1;
      if (!a.isSystemDefault && b.isSystemDefault) return 1;
      return 0;
    });
  }

  return json(mappedResults);
};

interface CreateEngineRequest {
  definition: unknown;
  forkedFrom?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  try {
    const body = await request.json() as CreateEngineRequest;
    
    if (!body.definition) {
      return errorResponse('Engine definition is required', 400);
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    await env.DB.prepare(`
      INSERT INTO engines (id, owner_id, definition, version, visibility, forked_from, created_at, updated_at)
      VALUES (?, ?, ?, '1.0.0', 'private', ?, ?, ?)
    `).bind(
      id,
      session.userId,
      JSON.stringify(body.definition),
      body.forkedFrom || null,
      now,
      now
    ).run();
    
    return json({
      id,
      ownerId: session.userId,
      definition: body.definition,
      version: '1.0.0',
      visibility: 'private',
      useCount: 0,
      forkedFrom: body.forkedFrom || null,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    }, 201);
  } catch (error) {
    return errorResponse('Failed to create engine', 500);
  }
};
