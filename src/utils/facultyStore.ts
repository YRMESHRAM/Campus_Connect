import facultyJson from '../data/faculty.json';
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

/**
 * Normalizes a faculty name for flexible matching across components
 * e.g., "Dr. Rajesh Sharma" -> "rajesh sharma", "Dr. Rajesh Kumar Sharma" -> "rajesh sharma"
 */
export function normalizeFacultyName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s+/i, '')
    .replace(/\b(kumar|singh)\b/gi, '') // handle common middle name variations gracefully
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
    console.error('Error reading faculty availabilities from localStorage:', e);
    return {};
  }
}

/**
 * Gets current availability status for a faculty member
 */
export function getFacultyAvailability(name: string, fallback: string = 'available'): AvailabilityStatus {
  if (!name) return fallback as AvailabilityStatus;
  const map = getStoredAvailabilities();
  
  // Try exact match first
  if (map[name]) return map[name];
  
  // Try normalized match
  const norm = normalizeFacultyName(name);
  for (const key of Object.keys(map)) {
    if (key === norm || normalizeFacultyName(key) === norm) {
      return map[key];
    }
  }

  return (fallback || 'available') as AvailabilityStatus;
}

/**
 * Updates availability status for a faculty member across local state & Supabase (background)
 */
export function updateFacultyAvailability(name: string, newStatus: AvailabilityStatus): void {
  if (!name) return;

  const map = getStoredAvailabilities();
  const norm = normalizeFacultyName(name);

  map[name] = newStatus;
  if (norm) map[norm] = newStatus;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving faculty availability to localStorage:', e);
  }

  // Broadcast event locally in same tab
  const eventDetail = { name, status: newStatus };
  window.dispatchEvent(new CustomEvent('faculty-status-changed', { detail: eventDetail }));

  // Broadcast channel for multi-tab support
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'FACULTY_STATUS_CHANGED', ...eventDetail });
      bc.close();
    } catch (e) {
      // Ignore broadcast errors
    }
  }

  // Attempt Supabase update in background (non-blocking)
  (async () => {
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
    } catch (err) {
      // Ignore Supabase connection failures
    }
  })();
}

/**
 * Subscribes to real-time status change events (same-tab and cross-tab)
 */
export function subscribeFacultyStatusChanges(
  callback: (detail: { name: string; status: AvailabilityStatus }) => void
): () => void {
  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<{ name: string; status: AvailabilityStatus }>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback({ name: '', status: 'available' }); // Trigger re-render/refetch
    }
  };

  window.addEventListener('faculty-status-changed', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'FACULTY_STATUS_CHANGED') {
          callback({ name: event.data.name, status: event.data.status });
        }
      };
    } catch (e) {
      // Ignore
    }
  }

  return () => {
    window.removeEventListener('faculty-status-changed', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) {
      bc.close();
    }
  };
}

/**
 * Gets all faculty members combined from default json & local override statuses
 */
export function getAllFacultyList(baseData?: any[]): FacultyMember[] {
  const list: any[] = (baseData && baseData.length > 0) ? baseData : (facultyJson as any[]);
  return list.map((f) => {
    const name = f["Faculty Name"] || f.name || '';
    const storedStatus = getFacultyAvailability(name, f.availability || 'available');
    return {
      ...f,
      availability: storedStatus,
    };
  });
}
