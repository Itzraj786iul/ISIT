export type ParentChild = {
  id: string;
  name: string;
  email: string;
  addedAt: string;
};

export type ParentChildInsights = {
  child_name: string;
  avg_mastery: number;
  recent_activity: number;
  strong_topics: string[];
  weak_topics: string[];
  improvement_trend: 'up' | 'down' | 'steady';
  engagement_score: number;
  ai_summary: string;
  action_suggestions: string[];
  linked_account: boolean;
};

export async function fetchChildInsights(childId: string): Promise<ParentChildInsights | null> {
  try {
    const res = await fetch(
      `/api/parent/child-insights?childId=${encodeURIComponent(childId)}`,
      { credentials: 'include' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !json.data) return null;
    return json.data as ParentChildInsights;
  } catch {
    return null;
  }
}

export async function fetchChildren(): Promise<ParentChild[]> {
  try {
    const res = await fetch('/api/parent/children', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.children) ? data.children : [];
  } catch {
    return [];
  }
}

export async function addChild(child: { name: string; email: string }): Promise<ParentChild | null> {
  try {
    const res = await fetch('/api/parent/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child),
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.child ?? null;
  } catch {
    return null;
  }
}

export async function removeChild(childId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/parent/children?childId=${encodeURIComponent(childId)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
