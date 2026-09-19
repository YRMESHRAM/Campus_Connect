// announcementStore.ts
// Shared localStorage utility for faculty-posted campus announcements.
// Faculty Dashboard writes; Student Dashboard reads and subscribes to updates.

export type AnnouncementType = 'info' | 'alert' | 'event' | 'assignment';

export interface Announcement {
  id: string;
  text: string;
  time: string;        // relative label, e.g. "Just now"
  dot: string;         // Tailwind bg-* color class
  timestamp: number;   // epoch ms — used to compute relative time
  author: string;      // faculty name
  type: AnnouncementType;
}

const STORAGE_KEY = 'campus_announcements';

// ─── Type → dot color mapping ────────────────────────────────────────────────
export const TYPE_DOT: Record<AnnouncementType, string> = {
  info:       'bg-blue-500',
  alert:      'bg-red-500',
  event:      'bg-purple-500',
  assignment: 'bg-orange-500',
};

export const TYPE_LABEL: Record<AnnouncementType, string> = {
  info:       'Info',
  alert:      'Alert',
  event:      'Event',
  assignment: 'Assignment',
};

// ─── Relative time formatter ──────────────────────────────────────────────────
export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 10)  return 'Just now';
  if (diffSec < 60)  return `${diffSec} sec ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)  return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)   return `${diffHr} hr ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}

// ─── Read ─────────────────────────────────────────────────────────────────────
export function getAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Announcement[] = JSON.parse(raw);
    // Refresh relative time labels on every read
    return parsed
      .map((a) => ({ ...a, time: formatRelativeTime(a.timestamp) }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

// ─── Write ────────────────────────────────────────────────────────────────────
export function addAnnouncement(
  text: string,
  type: AnnouncementType,
  author: string
): Announcement {
  const item: Announcement = {
    id:        `ann_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    text,
    type,
    dot:       TYPE_DOT[type],
    timestamp: Date.now(),
    time:      'Just now',
    author,
  };

  const current = getAnnouncements();
  // Keep a max of 30 announcements
  const updated = [item, ...current].slice(0, 30);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  // Manually dispatch storage event so same-tab listeners can react
  window.dispatchEvent(
    new StorageEvent('storage', {
      key:      STORAGE_KEY,
      newValue: JSON.stringify(updated),
    })
  );

  return item;
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export function deleteAnnouncement(id: string): void {
  const current = getAnnouncements();
  const updated = current.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  window.dispatchEvent(
    new StorageEvent('storage', {
      key:      STORAGE_KEY,
      newValue: JSON.stringify(updated),
    })
  );
}

// ─── Subscribe ────────────────────────────────────────────────────────────────
/** Calls `callback` whenever announcements change. Returns an unsubscribe fn. */
export function subscribeAnnouncements(callback: (items: Announcement[]) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback(getAnnouncements());
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
