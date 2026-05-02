import { Notification, NotificationType } from '@/types/notification';

export interface FetchNotificationsParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | 'All';
}

const MAX_LIMIT = 10;

export async function fetchNotifications(params: FetchNotificationsParams = {}): Promise<Notification[]> {
  const query = new URLSearchParams();
  const limit = Math.min(params.limit ?? MAX_LIMIT, MAX_LIMIT);
  query.set('limit', String(limit));
  if (params.page) query.set('page', String(params.page));
  if (params.notification_type && params.notification_type !== 'All') {
    query.set('notification_type', params.notification_type);
  }

  const res = await fetch(`/api/notifications?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
  const data = await res.json();
  return data.notifications as Notification[];
}

// Fetches multiple pages and merges for scoring (priority inbox)
export async function fetchAllNotifications(): Promise<Notification[]> {
  const results: Notification[] = [];
  for (let page = 1; page <= 5; page++) {
    const query = new URLSearchParams({ limit: '10', page: String(page) });
    const res = await fetch(`/api/notifications?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) break;
    const data = await res.json();
    const batch: Notification[] = data.notifications ?? [];
    results.push(...batch);
    if (batch.length < 10) break;
  }
  return results;
}

export async function sendLog(
  stack: string,
  level: string,
  pkg: string,
  message: string,
): Promise<void> {
  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // logging must never crash the app
  }
}
