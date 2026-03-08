/** Client-side only. Store linked children for parent (MVP: localStorage; later replace with API). */
export const PARENT_CHILDREN_KEY = 'isit_parent_children';

export type ParentChild = {
  id: string;
  name: string;
  email: string;
  addedAt: string;
};

export function getStoredChildren(): ParentChild[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PARENT_CHILDREN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredChildren(children: ParentChild[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PARENT_CHILDREN_KEY, JSON.stringify(children));
}

export function addStoredChild(child: Omit<ParentChild, 'id' | 'addedAt'>): ParentChild {
  const children = getStoredChildren();
  const newChild: ParentChild = {
    ...child,
    id: `child_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    addedAt: new Date().toISOString(),
  };
  setStoredChildren([...children, newChild]);
  return newChild;
}

export function getStoredChildById(id: string): ParentChild | undefined {
  return getStoredChildren().find((c) => c.id === id);
}

export function removeStoredChild(id: string): void {
  setStoredChildren(getStoredChildren().filter((c) => c.id !== id));
}
