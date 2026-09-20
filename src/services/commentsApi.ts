// Real-Time Public Comment/Review System for Character Hub
import { collection, onSnapshot, addDoc, doc, setDoc, getDoc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getDeviceFingerprint } from '../utils/fingerprint';

export interface CharacterComment {
  id: string;
  characterId: string;
  userName: string;
  commentText: string;
  createdAt: number;
}

const RATE_LIMIT_KEY = 'roblox_rp_last_comment_time';
const RATE_LIMIT_MS = 5000; // 5 seconds

// Get seconds remaining until next post allowed
export function getCommentRateLimitRemaining(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return 0;
    const lastTime = parseInt(raw, 10);
    if (isNaN(lastTime)) return 0;
    const diff = Date.now() - lastTime;
    if (diff < RATE_LIMIT_MS) {
      return Math.ceil((RATE_LIMIT_MS - diff) / 1000);
    }
    return 0;
  } catch {
    return 0;
  }
}

// Mark client post timestamp
export function recordCommentPostTime(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // Ignore
  }
}

/**
 * 1. Real-time subscription to comments of a specific character
 * Uses onSnapshot with 300ms debounce to prevent main-thread UI blocking
 */
export function subscribeToCharacterComments(
  characterId: string,
  onUpdate: (comments: CharacterComment[]) => void
): () => void {
  try {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const itemsRef = collection(db, 'rp_comments', characterId, 'items');
    
    const unsubscribe = onSnapshot(
      itemsRef,
      (snapshot) => {
        const list: CharacterComment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const uName = (data.userName || '').toLowerCase().trim();
          const cText = (data.commentText || '').toLowerCase();

          // Delete and filter out spoiler comment from "em iu" or spoiler text
          if (
            uName === 'em iu' ||
            uName.includes('em iu') ||
            uName.includes('em_iu') ||
            uName.includes('emiu') ||
            (characterId === 'char-15-thien' && (uName.includes('em') && (cText.includes('pass') || cText.includes('mật khẩu') || cText.includes('spoil'))))
          ) {
            // Delete asynchronously from Firestore
            deleteDoc(doc(db, 'rp_comments', characterId, 'items', docSnap.id)).catch(() => {});
            return;
          }

          list.push({
            id: docSnap.id,
            characterId: data.characterId || characterId,
            userName: data.userName || 'Vô danh',
            commentText: data.commentText || '',
            createdAt: data.createdAt || Date.now(),
          });
        });
        // Sort newest first
        list.sort((a, b) => b.createdAt - a.createdAt);

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onUpdate(list);
        }, 300);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `rp_comments/${characterId}/items`);
      }
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  } catch (err) {
    console.warn('[CommentsAPI] Firestore onSnapshot warning:', err);
    return () => {};
  }
}

/**
 * 2. Real-time subscription to all character comment counts
 * Reads /rp_comment_counts with 300ms debounce batching
 */
export function subscribeToAllCommentCounts(
  onCountsUpdate: (counts: Record<string, number>) => void
): () => void {
  try {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingCounts: Record<string, number> = {};
    const countsRef = collection(db, 'rp_comment_counts');

    const unsubscribe = onSnapshot(
      countsRef,
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.count === 'number') {
            pendingCounts[docSnap.id] = data.count;
          }
        });

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onCountsUpdate({ ...pendingCounts });
        }, 300);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'rp_comment_counts');
      }
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  } catch (err) {
    console.warn('[CommentsAPI] Firestore counts onSnapshot warning:', err);
    return () => {};
  }
}

/**
 * 3. Submit a new comment with anti-spam check and dual API/Firestore fallback
 */
export async function postCharacterComment(
  characterId: string,
  userName: string,
  commentText: string
): Promise<{ success: boolean; comment?: CharacterComment; message?: string; error?: string }> {
  const trimmedName = userName.trim();
  const trimmedText = commentText.trim();

  if (!trimmedName) {
    return { success: false, message: 'Vui lòng nhập Tên của bạn / Biệt danh!' };
  }
  if (trimmedName.length > 50) {
    return { success: false, message: 'Tên không được vượt quá 50 ký tự!' };
  }
  if (!trimmedText) {
    return { success: false, message: 'Vui lòng nhập Lời nhắn cho chồng!' };
  }
  if (trimmedText.length > 250) {
    return { success: false, message: 'Lời nhắn không được vượt quá 250 ký tự!' };
  }

  // Check 5-second rate limiting
  const remaining = getCommentRateLimitRemaining();
  if (remaining > 0) {
    return {
      success: false,
      error: 'RATE_LIMITED',
      message: `Vui lòng đợi ${remaining} giây trước khi gửi tiếp!`,
    };
  }

  const fingerprint = getDeviceFingerprint();
  const now = Date.now();

  // Try API route first
  try {
    const res = await fetch(`/api/comments/${encodeURIComponent(characterId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName: trimmedName,
        commentText: trimmedText,
        fingerprint,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        recordCommentPostTime();
        return {
          success: true,
          comment: data.comment,
          message: 'Đã gửi lời nhắn thành công!',
        };
      } else {
        return {
          success: false,
          message: data.message || 'Không thể gửi bình luận.',
        };
      }
    }
  } catch (fetchErr) {
    console.warn('[CommentsAPI] API route unavailable, falling back to direct Firestore write:', fetchErr);
  }

  // Direct Firestore write fallback (essential for GitHub Pages and offline resilience)
  try {
    const commentPayload = {
      characterId,
      userName: trimmedName,
      commentText: trimmedText,
      createdAt: now,
    };

    const itemsRef = collection(db, 'rp_comments', characterId, 'items');
    const docRef = await addDoc(itemsRef, commentPayload);

    // Update count
    try {
      const countRef = doc(db, 'rp_comment_counts', characterId);
      const countSnap = await getDoc(countRef);
      if (!countSnap.exists()) {
        await setDoc(countRef, { count: 1 });
      } else {
        await updateDoc(countRef, { count: increment(1) });
      }
    } catch {
      // Ignore count update error
    }

    recordCommentPostTime();

    return {
      success: true,
      comment: {
        id: docRef.id,
        ...commentPayload,
      },
      message: 'Đã gửi lời nhắn thành công!',
    };
  } catch (fsErr) {
    console.error('[CommentsAPI] Direct Firestore write error:', fsErr);
    return {
      success: false,
      message: 'Lỗi gửi bình luận. Vui lòng kiểm tra kết nối mạng và thử lại!',
    };
  }
}
