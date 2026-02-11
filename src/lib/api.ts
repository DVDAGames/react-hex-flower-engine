// API client for Cloudflare Workers backend

const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get stored auth token
 */
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

/**
 * Get stored refresh token
 */
function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/**
 * Store auth tokens
 */
export function setAuthTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear auth tokens
 */
export function clearAuthTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // If unauthorized, try to refresh token
      if (response.status === 401 && getRefreshToken()) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          return apiRequest<T>(endpoint, options);
        }
      }
      
      return { error: data.error || 'Request failed' };
    }
    
    return { data };
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error' };
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      clearAuthTokens();
      return false;
    }
    
    const data = await response.json();
    setAuthTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    clearAuthTokens();
    return false;
  }
}

// ============================================
// Auth API
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  defaultEngineId: string | null;
  defaultEditorEngineId?: string | null;
  createdAt: string;
  updatedAt: string;
  acceptTerms: boolean;
  hexNewsletterOptIn: boolean;
  dvdaNewsletterOptIn: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface VerifyResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Send magic link to email
 */
export async function sendMagicLink(email: string): Promise<ApiResponse<LoginResponse>> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ 
      email,
      // Send current origin so magic link points back to the right place (important for dev)
      redirectOrigin: window.location.origin,
    }),
  });
}

/**
 * Verify magic link token
 */
export async function verifyMagicLink(token: string): Promise<ApiResponse<VerifyResponse>> {
  const response = await apiRequest<VerifyResponse>(`/auth/verify?token=${token}`);
  
  if (response.data) {
    setAuthTokens(response.data.accessToken, response.data.refreshToken);
  }
  
  return response;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<ApiResponse<AuthUser>> {
  return apiRequest<AuthUser>('/auth/me');
}

/**
 * Update user profile
 */
export async function updateProfile(data: {
  displayName?: string;
  avatarIcon?: string | null;
  defaultEngineId?: string | null;
  defaultEditorEngineId?: string | null;
  acceptTerms?: boolean;
  hexNewsletterOptIn?: boolean;
  dvdaNewsletterOptIn?: boolean;
}): Promise<ApiResponse<AuthUser>> {
  console.log("Updating profile with data:", data);
  return apiRequest<AuthUser>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
  clearAuthTokens();
}

// ============================================
// Engines API
// ============================================

export interface Engine {
  id: string;
  ownerId: string;
  definition: unknown;
  version: string;
  visibility: 'private' | 'shared' | 'pending_review' | 'public';
  useCount: number;
  isSystemDefault?: boolean;
  forkCount?: number;
  forkedFrom?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user's engines
 */
export async function getMyEngines(includeSystem = false): Promise<ApiResponse<Engine[]>> {
  return apiRequest<Engine[]>('/engines?includeSystem=' + includeSystem);
}

/**
 * Get a specific engine
 */
export async function getEngine(id: string): Promise<ApiResponse<Engine>> {
  return apiRequest<Engine>(`/engines/${id}`);
}

/**
 * Create a new engine
 */
export async function createEngine(definition: unknown): Promise<ApiResponse<Engine>> {
  return apiRequest<Engine>('/engines', {
    method: 'POST',
    body: JSON.stringify({ definition }),
  });
}

/**
 * Update an engine
 */
export async function updateEngine(
  id: string,
  updates: { definition?: unknown; visibility?: string }
): Promise<ApiResponse<Engine>> {
  return apiRequest<Engine>(`/engines/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete an engine
 */
export async function deleteEngine(id: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/engines/${id}`, { method: 'DELETE' });
}

/**
 * Get public gallery engines
 */
export async function getGalleryEngines(): Promise<ApiResponse<Engine[]>> {
  return apiRequest<Engine[]>('/gallery');
}

/**
 * Fork (copy) an engine to your own collection
 */
export async function forkEngine(engineId: string): Promise<ApiResponse<Engine>> {
  return apiRequest<Engine>(`/engines/${engineId}/fork`, {
    method: 'POST',
  });
}

// ============================================
// Shared Links API
// ============================================

export interface SharedLink {
  id: string;
  engineId: string;
  token: string;
  engineVersion: string | null;
  activeHex: number | null;
  isActive: boolean;
  expiresAt: string | null;
  accessCount: number;
  createdAt: string;
}

/**
 * Create a share link for an engine
 */
export async function createShareLink(
  engineId: string,
  options?: { version?: string; activeHex?: number; expiresAt?: string }
): Promise<ApiResponse<SharedLink>> {
  return apiRequest<SharedLink>('/shared-links', {
    method: 'POST',
    body: JSON.stringify({ engineId, ...options }),
  });
}

/**
 * Get engine by share token
 */
export async function getSharedEngine(token: string): Promise<ApiResponse<{
  engine: Engine;
  activeHex: number | null;
}>> {
  return apiRequest<{ engine: Engine; activeHex: number | null }>(`/s/${token}`);
}

// ============================================
// Engine States API (for sync)
// ============================================

export interface EngineState {
  engineId: string;
  activeHex: number;
  pinnedVersion: string | null;
  syncedAt: string;
}

/**
 * Get user's engine states
 */
export async function getEngineStates(): Promise<ApiResponse<EngineState[]>> {
  return apiRequest<EngineState[]>('/engine-states');
}

export async function retrieveEngineState(engineId: string): Promise<ApiResponse<EngineState>> {
  return apiRequest<EngineState>(`/engine-states?engineId=${engineId}`);
}

/**
 * Save engine state
 */
export async function saveEngineState(
  engineId: string,
  activeHex: number,
  pinnedVersion?: string
): Promise<ApiResponse<EngineState>> {
  return apiRequest<EngineState>('/engine-states', {
    method: 'POST',
    body: JSON.stringify({ engineId, activeHex, pinnedVersion }),
  });
}

// ============================================
// Admin API
// ============================================

export interface PendingEngine extends Engine {
  submittedAt: string;
  user: {
    email: string;
    displayName: string | null;
  };
}

export interface ReviewedEngine extends PendingEngine {
  reviewedAt: string;
  rejectionReason: string | null;
  reviewer: {
    email: string;
    displayName: string | null;
  } | null;
}

/**
 * Get engines pending review (admin only)
 */
export async function getPendingEngines(): Promise<ApiResponse<{ engines: PendingEngine[] }>> {
  return apiRequest<{ engines: PendingEngine[] }>('/admin/pending');
}

/**
 * Get review history (admin only)
 */
export async function getReviewHistory(
  filter: 'all' | 'approved' | 'rejected' = 'all',
  limit = 50
): Promise<ApiResponse<{ engines: ReviewedEngine[] }>> {
  return apiRequest<{ engines: ReviewedEngine[] }>(`/admin/history?filter=${filter}&limit=${limit}`);
}

/**
 * Approve or reject an engine (admin only)
 */
export async function reviewEngine(
  engineId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<ApiResponse<{ success: boolean; message: string; visibility: string }>> {
  return apiRequest<{ success: boolean; message: string; visibility: string }>('/admin/review', {
    method: 'POST',
    body: JSON.stringify({ engineId, action, reason }),
  });
}

/**
 * Unpublish an engine (admin only)
 */
export async function unpublishEngine(engineId: string): Promise<ApiResponse<Engine>> {
  return apiRequest<Engine>('/admin/unpublish', {
    method: 'POST',
    body: JSON.stringify({ engineId }),
  });
}

/**
 * Emergency cascade delete of engine and all forks (admin only)
 */
export async function cascadeDeleteEngine(
  engineId: string,
  confirmation: string
): Promise<ApiResponse<{ success: boolean; deletedCount: number; engineName: string }>> {
  return apiRequest<{ success: boolean; deletedCount: number; engineName: string }>('/admin/cascade-delete', {
    method: 'DELETE',
    body: JSON.stringify({ engineId, confirmation }),
  });
}

// ============================================
// Engine State API (for tracking current hex position)
// ============================================

export interface EngineState {
  currentHexId: string | null;
  history: string[];
}

/**
 * Get the current state (hex position) for an engine
 */
export async function getEngineState(engineId: string): Promise<ApiResponse<EngineState>> {
  return apiRequest<EngineState>(`/engines/${engineId}/state`);
}

/**
 * Reset engine state to start
 */
export async function resetEngineState(engineId: string): Promise<ApiResponse<{ success: boolean }>> {
  return apiRequest<{ success: boolean }>(`/engines/${engineId}/state`, {
    method: 'DELETE',
  });
}

