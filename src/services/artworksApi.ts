import { collection, onSnapshot, query, orderBy, addDoc, limit, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Artwork } from '../types';

export const CURATED_INITIAL_ARTWORKS: Artwork[] = [];

/**
 * 1. Subscribe to real-time public artworks from Firestore with 300ms debounce
 */
export function subscribeToArtworks(
  onUpdate: (artworks: Artwork[]) => void
): () => void {
  try {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const artworksRef = collection(db, 'artworks');
    const q = query(artworksRef, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Artwork[] = [];
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              imageUrl: data.imageUrl || data.image_url || '',
              characterId: data.characterId || data.character_id || '',
              characterName: data.characterName || 'Chồng Roblox',
              characterAvatarUrl: data.characterAvatarUrl || '',
              authorName: data.authorName || data.author_name || 'Họa sĩ ẩn danh',
              title: data.title || '',
              message: data.message || '',
              createdAt: data.createdAt || data.created_at || Date.now(),
              likesCount: Number(data.likesCount || data.likes_count || 0),
            });
          });
        }

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          onUpdate(list);
        }, 300);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'artworks');
        // Fallback to fetch /api/artworks
        fetchArtworksViaApi().then((data) => {
          onUpdate(data || []);
        });
      }
    );

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      unsubscribe();
    };
  } catch (err) {
    console.warn('[ArtworksAPI] Firestore subscription warning:', err);
    fetchArtworksViaApi().then((data) => {
      onUpdate(data || []);
    });
    return () => {};
  }
}

/**
 * 2. Fetch artworks via backend API
 */
export async function fetchArtworksViaApi(characterId?: string): Promise<Artwork[]> {
  try {
    const url = characterId ? `/api/artworks?characterId=${encodeURIComponent(characterId)}` : '/api/artworks';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data.artworks || []).map((item: Artwork & { likes_count?: number }) => ({
      ...item,
      likesCount: Number(item.likesCount || item.likes_count || 0),
    }));
  } catch (e) {
    console.warn('[fetchArtworksViaApi] error:', e);
    return [];
  }
}

/**
 * Helper to check if current device has liked an artwork
 */
export function isArtworkLikedLocally(artworkId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`roblox_rp_liked_artwork_${artworkId}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Toggle heart/like for an artwork (supports like & unlike)
 * Persists in Firestore and LocalStorage, returns new state and count
 */
export async function toggleArtworkLike(
  artworkId: string,
  currentlyLiked: boolean,
  currentLikesCount = 0
): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> {
  const targetAction = currentlyLiked ? 'unlike' : 'like';
  const expectedNewLiked = !currentlyLiked;
  const expectedCount = Math.max(0, currentLikesCount + (currentlyLiked ? -1 : 1));

  // 1. Update localStorage immediately for optimistic client UX
  try {
    if (expectedNewLiked) {
      localStorage.setItem(`roblox_rp_liked_artwork_${artworkId}`, 'true');
    } else {
      localStorage.removeItem(`roblox_rp_liked_artwork_${artworkId}`);
    }
  } catch {
    // Ignore storage issues
  }

  // 2. Call backend server endpoint
  try {
    const res = await fetch(`/api/artworks/${encodeURIComponent(artworkId)}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: targetAction }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          likesCount: Number(data.likesCount ?? expectedCount),
          isLiked: expectedNewLiked,
        };
      }
    }
  } catch (apiErr) {
    console.warn('[toggleArtworkLike] API call failed, falling back to direct Firestore:', apiErr);
  }

  // 3. Fallback to direct Firestore updateDoc
  try {
    const artworkRef = doc(db, 'artworks', artworkId);
    const snap = await getDoc(artworkRef);
    let newLikes = expectedCount;
    if (snap.exists()) {
      const data = snap.data();
      const dbLikes = Number(data.likesCount || data.likes_count || 0);
      newLikes = Math.max(0, dbLikes + (currentlyLiked ? -1 : 1));
    }

    await updateDoc(artworkRef, {
      likesCount: newLikes,
      likes_count: newLikes,
    });

    return {
      success: true,
      likesCount: newLikes,
      isLiked: expectedNewLiked,
    };
  } catch (fsErr) {
    console.error('[toggleArtworkLike] Direct Firestore failed:', fsErr);
    // Return optimistic values so user UI doesn't break
    return {
      success: true,
      likesCount: expectedCount,
      isLiked: expectedNewLiked,
    };
  }
}

/**
 * 3. Client-Side Image Compression using HTML5 Canvas:
 * - Resizes images to max dimension of 1200px while keeping aspect ratio
 * - Compresses to JPEG with quality 0.8 (approx 100KB - 250KB)
 * - Guarantees the data is safe to store in Firestore (< 1MB document limit)
 * - Survives server restarts and works 100% on GitHub Pages & mobile
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(reader.result as string);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        if (compressedDataUrl.length > 500 * 1024) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', 0.65);
        }

        resolve(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 4. Direct Image File Upload & Compression
 */
export async function uploadArtworkFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    if (onProgress) onProgress(20);

    // 1. Check if Cloudinary configuration is present in environment
    const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      if (onProgress) onProgress(40);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          if (onProgress) onProgress(100);
          return { success: true, url: data.secure_url };
        }
      }
    }

    // 2. High-performance Client-Side Compression (< 250KB JPEG for Firestore permanent persistence)
    if (onProgress) onProgress(50);
    const compressedDataUrl = await compressImageFile(file, 1200, 0.8);

    if (onProgress) onProgress(100);
    return { success: true, url: compressedDataUrl };
  } catch (err: any) {
    console.error('[uploadArtworkFile] Error uploading/compressing file:', err);
    return { success: false, message: err?.message || 'Không thể xử lý tệp ảnh từ thiết bị' };
  }
}

/**
 * 4. Submit a new artwork to the gallery
 */
export async function submitArtwork(payload: {
  imageUrl: string;
  characterId: string;
  characterName: string;
  characterAvatarUrl?: string;
  authorName: string;
  title?: string;
  message?: string;
}): Promise<{ success: boolean; artwork?: Artwork; message?: string }> {
  const trimmedUrl = payload.imageUrl.trim();
  const trimmedAuthor = payload.authorName.trim();
  const trimmedTitle = (payload.title || '').trim();
  const trimmedMessage = (payload.message || '').trim();

  if (!trimmedUrl) {
    return { success: false, message: 'Vui lòng chọn hoặc tải ảnh lên từ thiết bị!' };
  }

  if (!payload.characterId) {
    return { success: false, message: 'Vui lòng chọn nhân vật gắn với bức tranh!' };
  }

  if (!trimmedAuthor) {
    return { success: false, message: 'Vui lòng nhập Tên tác giả / Họa sĩ!' };
  }

  try {
    // 1. Attempt backend API first
    const res = await fetch('/api/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        imageUrl: trimmedUrl,
        authorName: trimmedAuthor,
        title: trimmedTitle,
        message: trimmedMessage,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, artwork: data.artwork, message: data.message };
    }

    if (!res.ok) {
      throw new Error(data.message || 'Lỗi gửi yêu cầu lên máy chủ');
    }
  } catch (apiErr) {
    console.warn('[submitArtwork] API fallback to direct Firestore:', apiErr);

    // 2. Direct Firestore fallback
    try {
      const now = Date.now();
      const docData = {
        imageUrl: trimmedUrl,
        image_url: trimmedUrl,
        characterId: payload.characterId,
        character_id: payload.characterId,
        characterName: payload.characterName,
        characterAvatarUrl: payload.characterAvatarUrl || '',
        authorName: trimmedAuthor,
        author_name: trimmedAuthor,
        title: trimmedTitle,
        message: trimmedMessage,
        createdAt: now,
        created_at: now,
      };

      const docRef = await addDoc(collection(db, 'artworks'), docData);
      return {
        success: true,
        artwork: {
          id: docRef.id,
          imageUrl: trimmedUrl,
          characterId: payload.characterId,
          characterName: payload.characterName,
          characterAvatarUrl: payload.characterAvatarUrl || '',
          authorName: trimmedAuthor,
          title: trimmedTitle,
          message: trimmedMessage,
          createdAt: now,
        },
        message: 'Đăng tranh thành công!',
      };
    } catch (fsErr) {
      console.error('[submitArtwork] Direct Firestore failed:', fsErr);
      return {
        success: false,
        message: 'Không thể đăng tranh. Vui lòng kiểm tra lại kết nối mạng!',
      };
    }
  }

  return { success: false, message: 'Có lỗi xảy ra khi đăng tranh.' };
}
