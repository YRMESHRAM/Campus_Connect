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

const STORAGE_KEY = 'faculty_availabilities';
const CHANNEL_NAME = 'campus_connect_faculty_status';

// ─── In-memory cache of Supabase faculty data ───
let _cachedFacultyData: any[] = [];

/**
 * Normalizes a faculty name for flexible matching across components
 * e.g., "Dr. Rajesh Sharma" -> "rajesh sharma", "Dr. Rajesh Kumar Sharma" -> "rajesh sharma"
 */
export function normalizeFacultyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, '')
    .replace(/\b(kumar|singh)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to retrieve stored availability mapping from localStorage
 */
function getStoredAvailabilities(): Record<string, AvailabilityStatus> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

const CREDENTIALS_KEY = 'faculty_credentials_map';

export interface FacultyCredentials {
  password?: string;
  email?: string;
  cabin?: string;
  department?: string;
  designation?: string;
  qualification?: string;
  officeHours?: string;
}

/**
 * Retrieves saved credentials override for a faculty member from localStorage.
 */
export function getFacultyCredentials(name: string): FacultyCredentials {
  if (!name) return {};
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const norm = normalizeFacultyName(name);
    return map[name] || (norm ? map[norm] : {}) || {};
  } catch (e) {
    return {};
  }
}

/**
 * Updates stored credentials override for a faculty member in localStorage.
 */
export function updateFacultyCredentials(name: string, updates: FacultyCredentials): void {
  if (!name) return;
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const norm = normalizeFacultyName(name);

    const existing = map[name] || (norm ? map[norm] : {}) || {};
    const updated = { ...existing, ...updates };

    map[name] = updated;
    if (norm) map[norm] = updated;

    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving faculty credentials:', e);
  }
}

/**
 * Verifies password for a faculty member against localStorage override, Supabase data, or default 'Pass@123'.
 */
export function verifyFacultyPassword(name: string, passwordInput: string, supabaseDataPassword?: string): boolean {
  const creds = getFacultyCredentials(name);
  if (creds.password) {
    return creds.password === passwordInput;
  }
  if (supabaseDataPassword) {
    return supabaseDataPassword === passwordInput;
  }
  return passwordInput === 'Pass@123';
}

/**
 * Returns the cached Supabase faculty list
 */
export function getCachedFacultyData(): any[] {
  return _cachedFacultyData;
}

/**
 * Fetches ALL faculty records from Supabase and caches them.
 */
export async function fetchFacultyFromSupabase(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('faculty_schedules')
      .select('*');

    if (!error && data && data.length > 0) {
      _cachedFacultyData = data;

      // Merge local availability overrides into cached Supabase data
      const localMap = getStoredAvailabilities();
      _cachedFacultyData = data.map((f) => {
        const fName = f['Faculty Name'] || f.name || '';
        const norm = normalizeFacultyName(fName);
        if (localMap[fName]) {
          return { ...f, availability: localMap[fName] };
        } else if (norm && localMap[norm]) {
          return { ...f, availability: localMap[norm] };
        }
        return f;
      });

      return _cachedFacultyData;
    }
  } catch (err) {
    // Supabase unreachable — keep existing cache
  }
  return _cachedFacultyData;
}

/**
 * Updates a faculty member's availability across localStorage, in-memory cache, and Supabase.
 */
export async function updateFacultyAvailability(
  name: string,
  newStatus: AvailabilityStatus
): Promise<void> {
  if (!name) return;

  // 1. Save to localStorage immediately for local persistence & fallback
  const map = getStoredAvailabilities();
  const norm = normalizeFacultyName(name);
  map[name] = newStatus;
  if (norm) map[norm] = newStatus;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving faculty availability to localStorage:', e);
  }

  // 2. Optimistically update local in-memory cache
  _cachedFacultyData = _cachedFacultyData.map((f) => {
    const fName = f['Faculty Name'] || f.name || '';
    const fNorm = normalizeFacultyName(fName);
    if (fName === name || (norm && fNorm === norm)) {
      return { ...f, availability: newStatus };
    }
    return f;
  });

  // 3. Broadcast to same tab + other tabs on same device
  const eventDetail = { name, status: newStatus };
  window.dispatchEvent(new CustomEvent('faculty-status-changed', { detail: eventDetail }));

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'FACULTY_STATUS_CHANGED', ...eventDetail });
      bc.close();
    } catch (_) { /* ignore */ }
  }

  // 4. Persist to Supabase (cross-device source of truth)
  try {
    let { data, error } = await supabase
      .from('faculty_schedules')
      .update({ availability: newStatus })
      .eq('Faculty Name', name)
      .select();

    if (error || !data || data.length === 0) {
      // Try matching by normalized name or fallback 'name' column
      const { data: allData } = await supabase.from('faculty_schedules').select('*');
      if (allData && allData.length > 0) {
        const match = allData.find((f: any) => {
          const fName = f['Faculty Name'] || f.name || '';
          return fName === name || (norm && normalizeFacultyName(fName) === norm);
        });

        if (match) {
          await supabase
            .from('faculty_schedules')
            .update({ availability: newStatus })
            .eq('id', match.id);
        }
      }
    }
  } catch (_) { /* ignore */ }
}

/**
 * Returns the current availability for a given faculty name.
 * Checks localStorage first, then in-memory cache, then fallback.
 */
export function getFacultyAvailability(
  name: string,
  fallback: string = 'available'
): AvailabilityStatus {
  if (!name) return fallback as AvailabilityStatus;

  // 1. Check localStorage first
  const map = getStoredAvailabilities();
  if (map[name]) return map[name];
  const norm = normalizeFacultyName(name);
  if (norm && map[norm]) return map[norm];

  // 2. Check in-memory cached Supabase data
  for (const f of _cachedFacultyData) {
    const fName = f['Faculty Name'] || f.name || '';
    const fNorm = normalizeFacultyName(fName);
    if ((fName === name || (norm && fNorm === norm)) && f.availability) {
      return f.availability as AvailabilityStatus;
    }
  }

  return (fallback || 'available') as AvailabilityStatus;
}

/**
 * Subscribes to real-time status change events.
 */
export function subscribeFacultyStatusChanges(
  callback: (detail: { name: string; status: AvailabilityStatus }) => void
): () => void {
  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent<{ name: string; status: AvailabilityStatus }>;
    if (ce.detail) callback(ce.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback({ name: '', status: 'available' });
    }
  };

  window.addEventListener('faculty-status-changed', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

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
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) bc.close();
  };
}

/**
 * Starts a polling interval that re-fetches from Supabase every `intervalMs`.
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
