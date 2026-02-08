// Gallery API: Get public engines
// GET /api/gallery

import type { Env } from '../types';
import { json } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  const engines = await env.DB.prepare(`
    SELECT e.id, e.owner_id, e.definition, e.version, e.visibility, e.use_count,
           e.created_at, e.updated_at, e.published_at,
           p.display_name as owner_name
    FROM engines e
    JOIN profiles p ON p.id = e.owner_id
    WHERE e.visibility = 'public'
    ORDER BY e.use_count DESC, e.published_at DESC
    LIMIT 100
  `).all();
  
  return json(engines.results.map(e => ({
    id: e.id,
    ownerId: e.owner_id,
    ownerName: e.owner_name,
    definition: JSON.parse(e.definition as string),
    version: e.version,
    visibility: e.visibility,
    useCount: e.use_count,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    publishedAt: e.published_at,
  })));
};
