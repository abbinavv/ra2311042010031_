import { Notification, ScoredNotification, NotificationType } from '@/types/notification';

const TYPE_WEIGHTS: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function scoreNotification(n: Notification, nowMs: number): ScoredNotification {
  const weight = TYPE_WEIGHTS[n.Type] ?? 0;
  const timestampMs = new Date(n.Timestamp).getTime();
  const secondsAgo = Math.max(0, (nowMs - timestampMs) / 1000);
  const score = weight * (1 / (secondsAgo + 1));
  return { ...n, score, rank: 0 };
}

export function getTopN(notifications: Notification[], topN: number): ScoredNotification[] {
  const now = Date.now();
  return notifications
    .map(n => scoreNotification(n, now))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((n, i) => ({ ...n, rank: i + 1 }));
}
