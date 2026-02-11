// Auth API: Update user profile
// PATCH /api/auth/profile

import MailerLite from '@mailerlite/mailerlite-nodejs';

import type { Env } from '../../types';
import { getAuthUser, json, errorResponse } from '../../utils';

export async function subscribeToNewsletter(email: string, newsletterId: string, isSubscribed: boolean = false, env): Promise<void> {
  const mailerlite = new MailerLite({ api_key: env.MAILER_LITE_TOKEN });
  
  try {
    await mailerlite.subscribers.createOrUpdate
    ({
      email: email,
      groups: [newsletterId],
      status: isSubscribed ? 'active' : 'unsubscribed',
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    throw error;
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const session = await getAuthUser(request, env);
  if (!session) {
    return errorResponse('Unauthorized', 401);
  }
  
  let body: { displayName?: string; avatarIcon?: string | null; defaultEngineId?: string | null; acceptTerms?: boolean; hexNewsletterOptIn?: boolean; dvdaNewsletterOptIn?: boolean };

  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }
  
  const { displayName, avatarIcon, defaultEngineId, acceptTerms, hexNewsletterOptIn, dvdaNewsletterOptIn } = body;

  const existingUser = await env.DB.prepare(`
    SELECT id, email, display_name, avatar_url, is_admin, default_engine_id, accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in
    FROM profiles
    WHERE id = ?
  `).bind(session.userId).first();
  
  if (!existingUser) {
    return errorResponse('User not found', 404);
  }

  if (!existingUser.accept_terms && acceptTerms !== true) {
    return errorResponse('You must accept the terms to use the service', 400);
  }

  // Validate display name if provided
  if (displayName !== undefined) {
    if (typeof displayName !== 'string') {
      return errorResponse('Display name must be a string', 400);
    }
    if (displayName.length > 50) {
      return errorResponse('Display name must be 50 characters or less', 400);
    }
  }
  
  // Validate avatar icon - now accepts any string (Lucide icon name)
  if (avatarIcon !== undefined && avatarIcon !== null) {
    if (typeof avatarIcon !== 'string') {
      return errorResponse('Avatar icon must be a string', 400);
    }
    if (avatarIcon.length > 100) {
      return errorResponse('Avatar icon name too long', 400);
    }
  }
  
  // Validate default engine if provided
  if (defaultEngineId !== undefined && defaultEngineId !== null) {
    // Check that the engine exists and belongs to the user
    const engine = await env.DB.prepare(`
      SELECT id FROM engines WHERE id = ? AND owner_id = ?
    `).bind(defaultEngineId, session.userId).first();
    
    if (!engine) {
      return errorResponse('Engine not found or not owned by user', 400);
    }
  }
  
  // Build update query
  const updates: string[] = [];
  const values: (string | null)[] = [];
  
  if (displayName !== undefined) {
    updates.push('display_name = ?');
    values.push(displayName.trim() || null);
  }
  
  if (avatarIcon !== undefined) {
    updates.push('avatar_url = ?');
    values.push(avatarIcon);
  }
  
  if (defaultEngineId !== undefined) {
    updates.push('default_engine_id = ?');
    values.push(defaultEngineId);
  }
 
  if (acceptTerms !== undefined) {
    updates.push('accept_terms = ?');
    values.push(acceptTerms ? '1' : '0');
  }

  if (hexNewsletterOptIn !== undefined) {
    updates.push('hex_newsletter_opt_in = ?');
    values.push(!!hexNewsletterOptIn ? '1' : '0');
  }

  if (dvdaNewsletterOptIn !== undefined) {
    updates.push('dvda_newsletter_opt_in = ?');
    values.push(!!dvdaNewsletterOptIn ? '1' : '0');
  }

  if (updates.length === 0) {
    return errorResponse('No fields to update', 400);
  }
  
  updates.push('updated_at = datetime(\'now\')');
  values.push(session.userId);
  
  await env.DB.prepare(`
    UPDATE profiles
    SET ${updates.join(', ')}
    WHERE id = ?
  `).bind(...values).run();
  
  // Return updated user
  const user = await env.DB.prepare(`
    SELECT id, email, display_name, avatar_url, is_admin, default_engine_id, accept_terms, hex_newsletter_opt_in, dvda_newsletter_opt_in
    FROM profiles
    WHERE id = ?
  `).bind(session.userId).first();
  
  if (!user) {
    return errorResponse('User not found', 404);
  }

  if (!!existingUser.hex_newsletter_opt_in !== !!hexNewsletterOptIn) {
    try {
      await subscribeToNewsletter(user?.email || "", env.HEX_NEWSLETTER_ID || "", hexNewsletterOptIn ? 1 : 0, env);
    } catch (error) {
      console.error("Failed to update Hex newsletter subscription:", error);
    }
  }

  if (!!existingUser.dvda_newsletter_opt_in !== !!dvdaNewsletterOptIn) {
    try {
      await subscribeToNewsletter(user?.email || "", env.DVDA_NEWSLETTER_ID || "", dvdaNewsletterOptIn ? 1 : 0, env);
    } catch (error) {
      console.error("Failed to update DVDA newsletter subscription:", error);
    }
  }

  if (!existingUser.accept_terms && acceptTerms !== true) {
    return errorResponse('You must accept the terms to use the service', 400);
  }
  
  return json({
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    isAdmin: user.is_admin === 1,
    defaultEngineId: user.default_engine_id,
    acceptTerms: user.accept_terms === 1,
    hexNewsletterOptIn: user.hex_newsletter_opt_in === 1,
    dvdaNewsletterOptIn: user.dvda_newsletter_opt_in === 1,
  });
};
