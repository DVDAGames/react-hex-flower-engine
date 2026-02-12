import { Env } from "../../types";
import { getAuthUser, isAdminEmail, json, errorResponse } from "../../utils";

interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  accept_terms: boolean;
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

    // Get all users
    const users = await env.DB.prepare(`
      SELECT 
        id,
        email,
        avatar_url,
        display_name,
        is_admin,
        created_at,
        updated_at,
        accept_terms
      FROM profiles
      ORDER BY created_at DESC
    `).all();

    return json({
      users: users.results.map(
        (
          {
            id, 
            email,
            avatar_url: avatarUrl,
            display_name: displayName,
            is_admin: isAdmin,
            created_at: createdAt,
            accept_terms: acceptTerms 
          }) => ({
            id,
            email,
            avatarUrl,
            displayName,
            isAdmin,
            createdAt,
            acceptTerms
          })
      ) 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return errorResponse('Internal Server Error', 500);
  }
}