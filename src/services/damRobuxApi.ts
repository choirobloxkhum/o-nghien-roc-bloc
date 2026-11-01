import { doc, onSnapshot, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserDamRobuxData {
  damRobux: number;
  lastCheckInDate: string;
  unlockedHellChars: string[];
  isCheckedInToday: boolean;
}

export const HELL_CHARACTER_COSTS: Record<string, number> = {
  'char-20-le-minh-khai': 3,       // Lê Minh Khải: 3 Robux "Dăm"
  'char-19-valentin-de-vigny': 5,  // Valentin: 5 Robux "Dăm"
  'char-18-victor-laurent': 3,     // Victor: 3 Robux "Dăm"
  'char-16-hoang-nhat-thien': 5,   // Hoàng Nhất Thiên: 5 Robux "Dăm"
  'char-14-gabriel': 3,            // Gabriel Marias: 3 Robux "Dăm"
  'char-11-lucifer': 5,            // Lucifer: 5 Robux "Dăm"
  'char-12-jaxon': 3,              // Jaxon Petrov: 3 Robux "Dăm"
  'char-13-asmodeus': 5,           // Asmodeus: 5 Robux "Dăm"
  'char-10-belphegor': 5,          // Belphegor: 5 Robux "Dăm"
  'char-2-thetri': 5,              // Trần Thế Trí: 5 Robux "Dăm"
  'char-5-ducson': 3,              // Thiếu Dực Sơn: 3 Robux "Dăm"
  'char-7-james': 3,               // James: 3 Robux "Dăm"
  'char-8-votran': 5,              // Tạ Vô Trần: 5 Robux "Dăm"
  'char-9-nolan': 3,               // Nolan: 3 Robux "Dăm"
};

export function getCharacterHellCost(characterId: string): number {
  return HELL_CHARACTER_COSTS[characterId] || 3;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Real-time subscription to user's Robux "Dăm" data
 */
export function subscribeUserDamRobux(
  uid: string,
  onUpdate: (data: UserDamRobuxData) => void
): () => void {
  if (!uid) {
    onUpdate({
      damRobux: 0,
      lastCheckInDate: '',
      unlockedHellChars: [],
      isCheckedInToday: false,
    });
    return () => {};
  }

  const userDocRef = doc(db, 'users', uid);
  const today = getTodayDateString();

  const unsubscribe = onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const damRobux = typeof data.damRobux === 'number' ? data.damRobux : 0;
        const lastCheckInDate = typeof data.lastCheckInDate === 'string' ? data.lastCheckInDate : '';
        const unlockedHellChars = Array.isArray(data.unlockedHellChars) ? data.unlockedHellChars : [];

        onUpdate({
          damRobux,
          lastCheckInDate,
          unlockedHellChars,
          isCheckedInToday: lastCheckInDate === today,
        });
      } else {
        onUpdate({
          damRobux: 0,
          lastCheckInDate: '',
          unlockedHellChars: [],
          isCheckedInToday: false,
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    }
  );

  return unsubscribe;
}

/**
 * Daily Check-in action: +1 Robux "Dăm"
 */
export async function claimDailyCheckIn(uid: string): Promise<{
  success: boolean;
  message: string;
  newBalance?: number;
}> {
  if (!uid) {
    return { success: false, message: 'Vui lòng đăng nhập tài khoản để điểm danh!' };
  }

  const today = getTodayDateString();
  const userDocRef = doc(db, 'users', uid);

  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      await setDoc(userDocRef, {
        uid,
        damRobux: 1,
        lastCheckInDate: today,
        unlockedHellChars: [],
        createdAt: Date.now(),
      });
      return { success: true, message: 'Thành công! Bạn nhận được +1 Robux "Dăm" điểm danh hôm nay! ✨', newBalance: 1 };
    }

    const data = docSnap.data();
    if (data.lastCheckInDate === today) {
      return { success: false, message: 'Mỗi ngày bạn chỉ được điểm danh 1 lần! Bạn đã nhận 1 Robux "Dăm" hôm nay rồi, vui lòng quay lại vào ngày mai nhé.' };
    }

    const currentBalance = typeof data.damRobux === 'number' ? data.damRobux : 0;
    const newBalance = currentBalance + 1;

    await updateDoc(userDocRef, {
      damRobux: increment(1),
      lastCheckInDate: today,
    });

    return {
      success: true,
      message: 'Thành công! Bạn nhận được +1 Robux "Dăm" điểm danh hôm nay! ✨',
      newBalance,
    };
  } catch (err: any) {
    console.error('[DamRobuxApi] claimDailyCheckIn error:', err);
    return { success: false, message: 'Không thể hoàn tất điểm danh. Vui lòng thử lại!' };
  }
}

/**
 * Unlock a character in Hell Mode using Robux "Dăm"
 */
export async function unlockHellCharacter(
  uid: string,
  characterId: string
): Promise<{
  success: boolean;
  message: string;
  newBalance?: number;
}> {
  if (!uid) {
    return { success: false, message: 'Vui lòng đăng nhập tài khoản để mở khóa!' };
  }

  const cost = getCharacterHellCost(characterId);
  const userDocRef = doc(db, 'users', uid);

  try {
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists()) {
      return { success: false, message: `Bạn chưa có đủ ${cost} Robux "Dăm" để mở khóa!` };
    }

    const data = docSnap.data();
    const currentBalance = typeof data.damRobux === 'number' ? data.damRobux : 0;
    const unlockedList: string[] = Array.isArray(data.unlockedHellChars) ? data.unlockedHellChars : [];

    if (unlockedList.includes(characterId)) {
      return { success: true, message: 'Nhân vật này đã được mở khóa trước đó!' };
    }

    if (currentBalance < cost) {
      return {
        success: false,
        message: `Bạn cần ${cost} Robux "Dăm" để mở khóa nhân vật này! (Hiện có: ${currentBalance} R$ Dăm)`,
      };
    }

    const newBalance = currentBalance - cost;
    const updatedUnlocked = [...unlockedList, characterId];

    await updateDoc(userDocRef, {
      damRobux: newBalance,
      unlockedHellChars: updatedUnlocked,
    });

    return {
      success: true,
      message: `Chúc mừng! Bạn đã dùng ${cost} Robux "Dăm" để mở khóa vĩnh viễn nhân vật này! 🔥`,
      newBalance,
    };
  } catch (err: any) {
    console.error('[DamRobuxApi] unlockHellCharacter error:', err);
    return { success: false, message: 'Không thể mở khóa nhân vật. Vui lòng thử lại!' };
  }
}
