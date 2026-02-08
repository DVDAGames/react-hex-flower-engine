import type { EngineDefinition } from '@/types/engine';
import { STORAGE_KEYS } from '@/constants';

/**
 * Type-safe localStorage wrapper
 */
export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};

/**
 * Engine-specific storage key generator
 */
export function makeEngineKey(engineId: string): string {
  return `${STORAGE_KEYS.ENGINE_STATE}__${engineId}`;
}

/**
 * Engine state stored per-engine
 */
export interface StoredEngineState {
  activeHex: number;
  lastUpdated: number;
}

/**
 * Preferences stored locally
 */
export interface StoredPreferences {
  showAnnotations: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
}

/**
 * Cached engine for offline use
 */
export interface CachedEngine {
  engine: EngineDefinition;
  source: 'builtin' | 'owned' | 'shared' | 'public';
  cachedAt: number;
}

/**
 * Get the current engine ID
 */
export function getCurrentEngineId(): string | null {
  return storage.get<string>(STORAGE_KEYS.CURRENT_ENGINE);
}

/**
 * Set the current engine ID
 */
export function setCurrentEngineId(id: string): void {
  storage.set(STORAGE_KEYS.CURRENT_ENGINE, id);
}

/**
 * Get the state for a specific engine
 */
export function getEngineState(engineId: string): StoredEngineState | null {
  return storage.get<StoredEngineState>(makeEngineKey(engineId));
}

/**
 * Set the state for a specific engine
 */
export function setEngineState(engineId: string, state: StoredEngineState): void {
  storage.set(makeEngineKey(engineId), state);
}

/**
 * Get user preferences
 */
export function getPreferences(): StoredPreferences {
  return storage.get<StoredPreferences>(STORAGE_KEYS.PREFERENCES) ?? {
    showAnnotations: true,
    colorScheme: 'auto',
  };
}

/**
 * Set user preferences
 */
export function setPreferences(preferences: Partial<StoredPreferences>): void {
  const current = getPreferences();
  storage.set(STORAGE_KEYS.PREFERENCES, { ...current, ...preferences });
}

/**
 * Get cached engines for offline use
 */
export function getCachedEngines(): Record<string, CachedEngine> {
  return storage.get<Record<string, CachedEngine>>(STORAGE_KEYS.CACHED_ENGINES) ?? {};
}

/**
 * Cache an engine for offline use
 */
export function cacheEngine(
  id: string, 
  engine: EngineDefinition, 
  source: CachedEngine['source']
): void {
  const cached = getCachedEngines();
  cached[id] = {
    engine,
    source,
    cachedAt: Date.now(),
  };
  storage.set(STORAGE_KEYS.CACHED_ENGINES, cached);
}
