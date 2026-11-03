import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Confession, ConfessionReply } from '../types';
import { OFFICIAL_WELCOME_CONFESSION, INITIAL_CONFESSIONS } from '../data/sampleConfessions';

const CONFESSIONS_COLLECTION = 'confessions';
const LOCAL_STORAGE_CONFESSIONS_KEY = 'roblox_rp_hub_local_confessions_v3';
const LIKED_CONFESSIONS_PREFIX = 'roblox_rp_liked_confession_';
const PURGE_FLAG_KEY = 'roblox_rp_purged_3_old_posts_v2';
export const LAST_VIEWED_CONFESSIONS_KEY = 'roblox_rp_last_viewed_confessions_ts';

// Retrieve cached local confessions
function getLocalCachedConfessions(): Confession[] {
  if (typeof window === 'undefined') return INITIAL_CONFESSIONS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CONFESSIONS_KEY);
    if (!raw) return INITIAL_CONFESSIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONFESSIONS;
  } catch {
    return INITIAL_CONFESSIONS;
  }
}

// Save to local cache
function saveLocalCachedConfessions(list: Confession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CONFESSIONS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * Check if the current device/user has liked this confession
 */
export function hasUserLikedConfession(confessionId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`${LIKED_CONFESSIONS_PREFIX}${confessionId}`) === 'true';
}

/**
 * Mark all confessions as read/viewed
 */
export function markConfessionsAsViewed(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAST_VIEWED_CONFESSIONS_KEY, String(Date.now()));
  window.dispatchEvent(new CustomEvent('roblox_rp_confessions_viewed'));
}

/**
 * Purge old 3 posts once and ensure official welcome post exists
 */
let hasRunPurge = false;
async function purgeOldPostsAndEnsureWelcome(snapshotDocs: Array<{ id: string; data: () => any }>) {
  if (hasRunPurge) return;
  hasRunPurge = true;

  try {
    const purgeDone = localStorage.getItem(PURGE_FLAG_KEY) === 'true';
    if (!purgeDone) {
      // Delete any existing posts that are not the new official welcome post
      for (const docItem of snapshotDocs) {
        if (docItem.id !== OFFICIAL_WELCOME_CONFESSION.id) {
          try {
            await deleteDoc(doc(db, CONFESSIONS_COLLECTION, docItem.id));
          } catch {
            // ignore
          }
        }
      }
      localStorage.setItem(PURGE_FLAG_KEY, 'true');
    }

    // Ensure the official welcome post exists in Firestore
    const welcomeRef = doc(db, CONFESSIONS_COLLECTION, OFFICIAL_WELCOME_CONFESSION.id);
    const snap = await getDoc(welcomeRef);
    if (!snap.exists()) {
      await setDoc(welcomeRef, OFFICIAL_WELCOME_CONFESSION);
    }
  } catch (err) {
    console.warn('[Confessions] Purge/seed welcome check:', err);
  }
}

/**
 * Subscribe to real-time confessions feed
 */
export function subscribeConfessions(
  callback: (confessions: Confession[]) => void
): () => void {
  // Start with cached
  const initialData = getLocalCachedConfessions();
  callback(initialData);

  try {
    const confessionsRef = collection(db, CONFESSIONS_COLLECTION);
    const q = query(confessionsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // Trigger one-time purge of the 3 old posts & ensure welcome post exists
        purgeOldPostsAndEnsureWelcome(snapshot.docs).catch(() => {});

        if (snapshot.empty) {
          // If Firestore is empty, seed official welcome post
          try {
            const welcomeRef = doc(db, CONFESSIONS_COLLECTION, OFFICIAL_WELCOME_CONFESSION.id);
            await setDoc(welcomeRef, OFFICIAL_WELCOME_CONFESSION);
          } catch {
            // ignore
          }
          callback(INITIAL_CONFESSIONS);
          return;
        }

        const items: Confession[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            authorName: data.authorName || 'Ẩn danh',
            authorAvatar: data.authorAvatar || '',
            characterId: data.characterId || 'all',
            characterName: data.characterName || 'Chung',
            characterAvatar: data.characterAvatar || '',
            category: data.category || 'feeling',
            content: data.content || '',
            imageUrl: data.imageUrl || '',
            createdAt: data.createdAt || Date.now(),
            likesCount: typeof data.likesCount === 'number' ? Math.max(0, data.likesCount) : 0,
            repliesCount: typeof data.repliesCount === 'number' ? Math.max(0, data.repliesCount) : 0,
            pinned: Boolean(data.pinned),
            isAdmin: Boolean(data.isAdmin),
          });
        }

        // Sort: Pinned first, then by createdAt desc
        items.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.createdAt - a.createdAt;
        });

        saveLocalCachedConfessions(items);
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, CONFESSIONS_COLLECTION);
        callback(getLocalCachedConfessions());
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('[Confessions] Falling back to local offline cache:', error);
    callback(getLocalCachedConfessions());
    return () => {};
  }
}

/**
 * Subscribe to new incoming confessions to display notification badge on paper plane button
 */
export function subscribeHasNewConfessions(
  callback: (hasNew: boolean) => void
): () => void {
  try {
    const confessionsRef = collection(db, CONFESSIONS_COLLECTION);
    const q = query(confessionsRef, orderBy('createdAt', 'desc'));

    const checkNew = (snapshotDocs: Array<{ id: string; data: () => any }>) => {
      if (typeof window === 'undefined') return;
      const lastViewedRaw = localStorage.getItem(LAST_VIEWED_CONFESSIONS_KEY);
      const lastViewed = lastViewedRaw ? parseInt(lastViewedRaw, 10) : 0;

      // Find any incoming confession (not the welcome post) created after lastViewed
      const hasUnread = snapshotDocs.some((d) => {
        if (d.id === OFFICIAL_WELCOME_CONFESSION.id) return false;
        const data = d.data();
        const created = data.createdAt || 0;
        return created > lastViewed;
      });

      callback(hasUnread);
    };

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        checkNew(snapshot.docs);
      },
      () => {
        callback(false);
      }
    );

    const handleStorageChange = () => {
      // Recheck when user navigates to confessions tab
      callback(false);
    };

    window.addEventListener('roblox_rp_confessions_viewed', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('roblox_rp_confessions_viewed', handleStorageChange);
    };
  } catch {
    callback(false);
    return () => {};
  }
}

/**
 * Create a new Confession (Tâm thư)
 */
export async function createConfession(
  data: Omit<Confession, 'id' | 'createdAt' | 'likesCount' | 'repliesCount'>
): Promise<string> {
  const newConfessionId = `confession-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    ...data,
    id: newConfessionId,
    createdAt: Date.now(),
    likesCount: 0,
    repliesCount: 0,
    pinned: Boolean(data.pinned),
    isAdmin: Boolean(data.isAdmin),
  };

  try {
    const docRef = doc(db, CONFESSIONS_COLLECTION, newConfessionId);
    await setDoc(docRef, payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${CONFESSIONS_COLLECTION}/${newConfessionId}`);
    // Save to local cache as backup
    const current = getLocalCachedConfessions();
    saveLocalCachedConfessions([payload, ...current]);
  }

  return newConfessionId;
}

/**
 * Toggle Like for a confession
 */
export async function toggleLikeConfession(
  confessionId: string,
  currentCount: number
): Promise<{ liked: boolean; newCount: number }> {
  const hasLiked = hasUserLikedConfession(confessionId);
  const nextLiked = !hasLiked;
  const delta = nextLiked ? 1 : -1;
  const newCount = Math.max(0, currentCount + delta);

  if (typeof window !== 'undefined') {
    if (nextLiked) {
      localStorage.setItem(`${LIKED_CONFESSIONS_PREFIX}${confessionId}`, 'true');
    } else {
      localStorage.removeItem(`${LIKED_CONFESSIONS_PREFIX}${confessionId}`);
    }
  }

  try {
    const docRef = doc(db, CONFESSIONS_COLLECTION, confessionId);
    await updateDoc(docRef, {
      likesCount: increment(delta),
    });
  } catch (err) {
    console.warn('[Confessions] Update like local only:', err);
  }

  return { liked: nextLiked, newCount };
}

/**
 * Fetch replies of a confession in real-time
 */
export function subscribeConfessionReplies(
  confessionId: string,
  callback: (replies: ConfessionReply[]) => void
): () => void {
  try {
    const repliesRef = collection(db, CONFESSIONS_COLLECTION, confessionId, 'replies');
    const q = query(repliesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ConfessionReply[] = [];
        snapshot.forEach((snap) => {
          const data = snap.data();
          items.push({
            id: snap.id,
            authorName: data.authorName || 'Ẩn danh',
            authorAvatar: data.authorAvatar || '',
            content: data.content || '',
            createdAt: data.createdAt || Date.now(),
            likesCount: data.likesCount || 0,
            isAdmin: Boolean(data.isAdmin),
          });
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `${CONFESSIONS_COLLECTION}/${confessionId}/replies`);
        callback([]);
      }
    );

    return unsubscribe;
  } catch {
    callback([]);
    return () => {};
  }
}

/**
 * Add a reply to a confession
 */
export async function addReplyToConfession(
  confessionId: string,
  replyData: {
    authorName: string;
    authorAvatar?: string;
    content: string;
    isAdmin?: boolean;
  }
): Promise<string> {
  const newReplyId = `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const replyPayload: ConfessionReply = {
    id: newReplyId,
    authorName: replyData.authorName.trim() || 'Ẩn danh',
    authorAvatar: replyData.authorAvatar || '',
    content: replyData.content.trim(),
    createdAt: Date.now(),
    likesCount: 0,
    isAdmin: Boolean(replyData.isAdmin),
  };

  try {
    const replyRef = doc(db, CONFESSIONS_COLLECTION, confessionId, 'replies', newReplyId);
    await setDoc(replyRef, replyPayload);

    // Increment repliesCount on parent
    const parentRef = doc(db, CONFESSIONS_COLLECTION, confessionId);
    await updateDoc(parentRef, {
      repliesCount: increment(1),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${CONFESSIONS_COLLECTION}/${confessionId}/replies/${newReplyId}`);
  }

  return newReplyId;
}

/**
 * Toggle pin status of a confession (Admin only)
 */
export async function togglePinConfession(
  confessionId: string,
  currentPinned: boolean
): Promise<void> {
  try {
    const docRef = doc(db, CONFESSIONS_COLLECTION, confessionId);
    await updateDoc(docRef, {
      pinned: !currentPinned,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${CONFESSIONS_COLLECTION}/${confessionId}`);
  }
}

/**
 * Delete a confession (Admin only)
 */
export async function deleteConfession(confessionId: string): Promise<void> {
  try {
    const docRef = doc(db, CONFESSIONS_COLLECTION, confessionId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CONFESSIONS_COLLECTION}/${confessionId}`);
  }
}
