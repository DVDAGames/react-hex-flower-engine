import { saveEngineState } from '@/lib/api';
import { storage } from '@/services/storage';
import { STORAGE_KEYS } from '@/constants';

export interface SyncQueueItem {
  id: string;
  type: 'state_update' | 'engine_create' | 'engine_update';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

/**
 * Check if the app is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Check if user is authenticated (has access token)
 */
function isAuthenticated(): boolean {
  return !!localStorage.getItem('accessToken');
}

/**
 * Get the sync queue
 */
export function getSyncQueue(): SyncQueueItem[] {
  return storage.get<SyncQueueItem[]>(STORAGE_KEYS.SYNC_QUEUE) ?? [];
}

/**
 * Add an item to the sync queue
 */
export function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  });
  storage.set(STORAGE_KEYS.SYNC_QUEUE, queue);
}

/**
 * Remove an item from the sync queue
 */
export function removeFromSyncQueue(id: string): void {
  const queue = getSyncQueue();
  const filtered = queue.filter((item) => item.id !== id);
  storage.set(STORAGE_KEYS.SYNC_QUEUE, filtered);
}

/**
 * Process the sync queue when back online
 */
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (!isOnline() || !isAuthenticated()) {
    return { success: 0, failed: 0 };
  }

  const queue = getSyncQueue();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      switch (item.type) {
        case 'state_update': {
          const payload = item.payload as { engineId: string; activeHex: number };
          const { error } = await saveEngineState(payload.engineId, payload.activeHex);
          if (error) throw new Error(error);
          break;
        }
        case 'engine_create':
        case 'engine_update':
          // TODO: Implement engine sync
          break;
      }
      removeFromSyncQueue(item.id);
      success++;
    } catch (error) {
      console.error('Sync failed for item:', item.id, error);
      // Increment retry count
      const currentQueue = getSyncQueue();
      const idx = currentQueue.findIndex((q) => q.id === item.id);
      if (idx !== -1) {
        currentQueue[idx].retryCount++;
        if (currentQueue[idx].retryCount >= 3) {
          // Remove after 3 failures
          currentQueue.splice(idx, 1);
        }
        storage.set(STORAGE_KEYS.SYNC_QUEUE, currentQueue);
      }
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Setup online/offline listeners
 */
export function setupSyncListeners(onStatusChange?: (online: boolean) => void): () => void {
  const handleOnline = async () => {
    onStatusChange?.(true);
    await processSyncQueue();
  };

  const handleOffline = () => {
    onStatusChange?.(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
