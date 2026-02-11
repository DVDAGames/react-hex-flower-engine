// Gallery API: Get public engines
// GET /api/gallery

import type { Env } from '../types';
import { json } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  const engines = await env.DB.prepare(`
    SELECT e.id, e.owner_id, e.definition, e.version, e.visibility, e.use_count,
           e.created_at, e.updated_at, e.published_at,
           e.is_system_default, e.fork_count, e.forked_from,
           p.display_name as owner_name, p.avatar_url as owner_icon
    FROM engines e
    JOIN profiles p ON p.id = e.owner_id
    WHERE e.visibility = 'public'
    ORDER BY e.is_system_default DESC, e.use_count DESC, e.published_at DESC
    LIMIT 100
  `).all();

  return json(engines.results.map(e => ({
    id: e.id,
    ownerId: e.owner_id,
    ownerName: e.is_system_default ? 'Project Hex' : e.owner_name,
    ownerIcon: e.owner_icon,
    definition: JSON.parse(e.definition as string),
    version: e.version,
    visibility: e.visibility,
    useCount: e.use_count,
    isSystemDefault: Boolean(e.is_system_default),
    forkCount: e.fork_count || 0,
    forkedFrom: e.forked_from,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    publishedAt: e.published_at,
  })));
};
