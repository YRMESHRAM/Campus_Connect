import { supabase } from '../supabaseClient';

export type AvailabilityStatus = 'auto' | 'available' | 'busy' | 'in-lecture' | 'meeting' | 'offline';

export interface FacultyMember {
  id: number | string;
  name: string;
  designation?: string;
  department?: string;
  cabin?: string;
  floor?: number;
  building?: string;
  subjects?: string[];
  email?: string;
  phone?: string;
  officeHours?: string;
  availability: string;
  photo?: string;
  isHOD?: boolean;
  experience?: string;
  qualification?: string;
  [key: string]: any;
}

const CHANNEL_NAME = 'campus_connect_faculty_status';

// ─── In-memory cache of Supabase faculty data ───
let _cachedFacultyData: any[] = [];
let _lastFetchTime = 0;

/**
 * Returns the cached Supabase faculty list (empty until first fetch completes)
 */
export function getCachedFacultyData(): any[] {
  return _cachedFacultyData;
}

/**
 * Fetches ALL faculty records from Supabase and caches them.
 * Returns the fresh data. Other devices see updates because
 * every device polls Supabase directly.
 */
export async function fetchFacultyFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('faculty_schedules')
      .select('*');

    if (!error && data && data.length > 0) {
      _cachedFacultyData = data;
      _lastFetchTime = Date.now();
      return data;
    }
  } catch (err) {
    // Supabase unreachable — keep existing cache
  }
  return _cachedFacultyData;
}

/**
 * Updates a faculty member's availability in Supabase (source of truth for cross-device).
 * Also fires local events for instant same-device/same-tab updates.
 */
export async function updateFacultyAvailability(
  name: string,
  newStatus: AvailabilityStatus
): Promise<void> {
  if (!name) return;

  // 1. Optimistically update local cache
  _cachedFacultyData = _cachedFacultyData.map((f) => {
    const fName = f['Faculty Name'] || f.name || '';
    if (fName === name) {
      return { ...f, availability: newStatus };
    }
    return f;
  });

  // 2. Broadcast to same tab + other tabs on same device
  const eventDetail = { name, status: newStatus };
  window.dispatchEvent(new CustomEvent('faculty-status-changed', { detail: eventDetail }));

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'FACULTY_STATUS_CHANGED', ...eventDetail });
      bc.close();
    } catch (_) { /* ignore */ }
  }

  // 3. Persist to Supabase (cross-device source of truth)
  try {
    let { data, error } = await supabase
      .from('faculty_schedules')
      .update({ availability: newStatus })
      .eq('Faculty Name', name)
      .select();

    if (error || !data || data.length === 0) {
      await supabase
        .from('faculty_schedules')
        .update({ availability: newStatus })
        .eq('name', name);
    }
  } catch (_) { /* ignore */ }
}

/**
 * Returns the availability for a given faculty name from the cached data.
 */
export function getFacultyAvailability(
  name: string,
  fallback: string = 'available'
): AvailabilityStatus {
  if (!name) return fallback as AvailabilityStatus;

  for (const f of _cachedFacultyData) {
    const fName = f['Faculty Name'] || f.name || '';
    if (fName === name && f.availability) {
      return f.availability as AvailabilityStatus;
    }
  }

  return fallback as AvailabilityStatus;
}

/**
 * Subscribes to real-time status change events.
 * - Same tab: CustomEvent
 * - Other tabs on same device: BroadcastChannel + storage
 *
 * For OTHER devices the consumer should use startPolling().
 */
export function subscribeFacultyStatusChanges(
  callback: (detail: { name: string; status: AvailabilityStatus }) => void
): () => void {
  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent<{ name: string; status: AvailabilityStatus }>;
    if (ce.detail) callback(ce.detail);
  };

  window.addEventListener('faculty-status-changed', handleCustomEvent);

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === 'FACULTY_STATUS_CHANGED') {
          callback({ name: event.data.name, status: event.data.status });
        }
      };
    } catch (_) { /* ignore */ }
  }

  return () => {
    window.removeEventListener('faculty-status-changed', handleCustomEvent);
    if (bc) bc.close();
  };
}

/**
 * Starts a polling interval that re-fetches from Supabase every `intervalMs`.
 * When new data arrives and any availability has changed, fires `onChange`.
 * Returns a cleanup function to stop polling.
 *
 * This is the mechanism that keeps OTHER DEVICES in sync.
 */
export function startPolling(
  onChange: (data: any[]) => void,
  intervalMs: number = 10000
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const oldData = [..._cachedFacultyData];
    const newData = await fetchFacultyFromSupabase();

    // Detect if any availability changed
    let changed = oldData.length !== newData.length;
    if (!changed) {
      for (let i = 0; i < newData.length; i++) {
        const oldItem = oldData.find(
          (o) =>
            (o.id && o.id === newData[i].id) ||
            (o['Faculty Name'] && o['Faculty Name'] === newData[i]['Faculty Name'])
        );
        if (!oldItem || oldItem.availability !== newData[i].availability) {
          changed = true;
          break;
        }
      }
    }

    if (changed) {
      onChange(newData);
    }
  };

  const id = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(id);
  };
}
