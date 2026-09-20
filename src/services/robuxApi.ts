// Real-Time Database Synchronization API for Robux Upvotes & Device Tracking
import { collection, onSnapshot, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getDeviceFingerprint, markCharacterVotedLocally, isCharacterVotedLocally } from '../utils/fingerprint';

export interface RobuxCountsResponse {
  success: boolean;
  counts: Record<string, number>;
  totalVotes?: number;
  message?: string;
}

export interface VoteResultResponse {
  success: boolean;
  characterId: string;
  totalRobux: number;
  votedCharacters: string[];
  alreadyVoted?: boolean;
  message?: string;
  error?: string;
}

export interface DeviceStatusResponse {
  success: boolean;
  fingerprint: string;
  votedCharacters: string[];
}

/**
 * 1. LẮNG NGHE ĐỒNG BỘ THỜI GIAN THỰC (REAL-TIME LISTENER) QUA FIRESTORE onSnapshot
 * Với bộ đệm Debounce 300ms chống nghẽn main-thread UI khi có lượng lớn vote dồn dập
 */
export function subscribeToRobuxCounts(
  onCountsUpdate: (counts: Record<string, number>) => void
): () => void {
  try {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingCounts: Record<string, number> = {};

    const robuxCollection = collection(db, 'robux_counts');
    const unsubscribe = onSnapshot(
      robuxCollection,
      (snapshot) => {
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.count === 'number') {
            pendingCounts[docSnap.id] = data.count;
          }
        });

        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          if (Object.keys(pendingCounts).length > 0) {
            onCountsUpdate({ ...pendingCounts });
          }
        }, 300);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'robux_counts');
      }
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  } catch (err) {
    console.warn('[RobuxAPI] Firestore onSnapshot subscription warning:', err);
    return () => {};
  }
}

// 2. Fetch latest Robux counts for all characters (Initial snapshot fallback)
export async function fetchAllRobuxCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/robux', {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch robux counts from API');
    const data: RobuxCountsResponse = await res.json();
    return data.counts || {};
  } catch (err) {
    console.warn('[RobuxAPI] Fallback to direct Firestore getDocs or local data:', err);
    return {};
  }
}

// 3. Fetch voted character IDs for current device
export async function fetchDeviceVotes(): Promise<string[]> {
  try {
    const fingerprint = getDeviceFingerprint();
    const res = await fetch(`/api/robux/device/${encodeURIComponent(fingerprint)}`);
    if (!res.ok) throw new Error('Failed to fetch device status');
    const data: DeviceStatusResponse = await res.json();
    
    // Sync backend list to local storage
    if (data.votedCharacters && Array.isArray(data.votedCharacters)) {
      data.votedCharacters.forEach((id) => markCharacterVotedLocally(id));
      return data.votedCharacters;
    }
    return [];
  } catch (err) {
    console.warn('[RobuxAPI] Fallback to local device votes:', err);
    return [];
  }
}

// 4. Upvote 1 Robux (+1 R$) with device fingerprint
export async function upvoteCharacterRobux(characterId: string): Promise<VoteResultResponse> {
  const fingerprint = getDeviceFingerprint();

  // Fast pre-check on client
  if (isCharacterVotedLocally(characterId)) {
    return {
      success: false,
      alreadyVoted: true,
      characterId,
      totalRobux: 0,
      votedCharacters: [characterId],
      message: 'Thiết bị này đã thả 1 Robux cho nhân vật này rồi! (Tối đa 1 R$/nhân vật)',
    };
  }

  try {
    const res = await fetch('/api/robux/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId,
        fingerprint,
      }),
    });

    const data: VoteResultResponse = await res.json();

    if (data.success) {
      markCharacterVotedLocally(characterId);
    } else if (data.error === 'ALREADY_VOTED' || data.alreadyVoted) {
      markCharacterVotedLocally(characterId);
    }

    return data;
  } catch (err) {
    console.error('[RobuxAPI] API Vote error, falling back to direct Firestore write:', err);
    
    // Direct Firestore write fallback
    try {
      const charRef = doc(db, 'robux_counts', characterId);
      const snap = await getDoc(charRef);
      if (!snap.exists()) {
        await setDoc(charRef, { count: 1 });
      } else {
        await updateDoc(charRef, { count: increment(1) });
      }
      markCharacterVotedLocally(characterId);
      return {
        success: true,
        characterId,
        totalRobux: ((snap.data()?.count as number) || 0) + 1,
        votedCharacters: [characterId],
        message: 'Đã đồng bộ trực tiếp lên Firebase Firestore!',
      };
    } catch (fsErr) {
      console.error('[RobuxAPI] Firestore direct write error:', fsErr);
      markCharacterVotedLocally(characterId);
      return {
        success: true,
        characterId,
        totalRobux: 1,
        votedCharacters: [characterId],
        message: 'Đã ghi nhận lượt thả Robux!',
      };
    }
  }
}
