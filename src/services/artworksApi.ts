import { collection, onSnapshot, query, orderBy, addDoc, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Artwork } from '../types';

export const CURATED_INITIAL_ARTWORKS: Artwork[] = [];

/**
 * 1. Subscribe to real-time public artworks from Firestore
 */
export function subscribeToArtworks(
  onUpdate: (artworks: Artwork[]) => void
): () => void {
  try {
    const artworksRef = collection(db, 'artworks');
    const q = query(artworksRef, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Artwork[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              imageUrl: data.imageUrl || '',
              characterId: data.characterId || '',
              characterName: data.characterName || 'Chồng Roblox',
              characterAvatarUrl: data.characterAvatarUrl || '',
              authorName: data.authorName || 'Họa sĩ ẩn danh',
              title: data.title || '',
              message: data.message || '',
              createdAt: data.createdAt || Date.now(),
            });
          });
          onUpdate(list);
        } else {
          // Empty collection
          onUpdate([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'artworks');
        // Fallback to fetch /api/artworks
        fetchArtworksViaApi().then((data) => {
          onUpdate(data || []);
        });
      }
    );

    return unsubscribe;
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
    return data.artworks || [];
  } catch (e) {
    console.warn('[fetchArtworksViaApi] error:', e);
    return [];
  }
}

/**
 * 3. Direct Image File Upload (Cloudinary Unsigned Upload + Local Server Lossless Storage fallback)
 * Does NOT route image data through any AI generation models. Preserves original resolution and pixels.
 */
export async function uploadArtworkFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    // 1. Check if Cloudinary configuration is present in environment
    const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      if (onProgress) onProgress(20);
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

    // 2. Direct Lossless Server Upload via /api/upload-image
    if (onProgress) onProgress(40);
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    if (onProgress) onProgress(70);

    try {
      const serverRes = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: dataUrl,
          fileName: file.name,
        }),
      });

      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.success && serverData.url) {
          if (onProgress) onProgress(100);
          return { success: true, url: serverData.url };
        }
      }
    } catch (serverErr) {
      console.warn('[uploadArtworkFile] Server upload fallback to dataUrl:', serverErr);
    }

    // 3. Fallback: Direct Lossless Data URL (always works offline/preview)
    if (onProgress) onProgress(100);
    return { success: true, url: dataUrl };
  } catch (err: any) {
    console.error('[uploadArtworkFile] Error uploading file:', err);
    return { success: false, message: err?.message || 'Không thể tải ảnh lên từ thiết bị' };
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
        characterId: payload.characterId,
        characterName: payload.characterName,
        characterAvatarUrl: payload.characterAvatarUrl || '',
        authorName: trimmedAuthor,
        title: trimmedTitle,
        message: trimmedMessage,
        createdAt: now,
      };

      const docRef = await addDoc(collection(db, 'artworks'), docData);
      return {
        success: true,
        artwork: {
          id: docRef.id,
          ...docData,
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
