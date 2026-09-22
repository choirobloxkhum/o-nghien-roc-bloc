import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, addDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig;
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch(e) {
  console.error("Firebase config missing!", e);
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const app = express();
const PORT = 3000;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded public assets if any
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (err) {
    console.warn('Could not create uploads directory:', err);
  }
}
app.use('/uploads', express.static(uploadsDir));

// Direct Device Image Upload Endpoint (Lossless direct storage without AI degradation)
app.post('/api/upload-image', (req, res) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData || typeof fileData !== 'string') {
      return res.status(400).json({ success: false, message: 'Dữ liệu ảnh không hợp lệ' });
    }

    // Match base64 data url
    const match = fileData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (match) {
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      const safeName = `art_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = path.join(uploadsDir, safeName);
      fs.writeFileSync(filePath, buffer);
      
      const fileUrl = `/uploads/${safeName}`;
      return res.json({ success: true, url: fileUrl });
    }

    // If fileData is already a URL or valid string
    if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
      return res.json({ success: true, url: fileData });
    }

    // Fallback: return data URL directly
    return res.json({ success: true, url: fileData });
  } catch (err) {
    console.error('[Upload Error]:', err);
    res.status(500).json({ success: false, message: 'Lỗi lưu trữ ảnh' });
  }
});

// Anti-spam in-memory rate limiting map for comments (5s per client)
const commentRateLimits: Record<string, number> = {};

// ==========================================
// CENTRALIZED DATABASE API ROUTES
// ==========================================

// 1. GET /api/robux - Get all character total Robux counts
app.get('/api/robux', async (req, res) => {
  try {
    const counts: Record<string, number> = {};
    const snapshot = await getDocs(collection(db, 'robux_counts'));
    snapshot.forEach((doc) => {
      counts[doc.id] = doc.data().count || 0;
    });
    res.json({
      success: true,
      counts,
      totalVotes: 0,
      lastUpdated: Date.now(),
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 2. GET /api/robux/device/:fingerprint - Get list of character IDs voted by this device
app.get('/api/robux/device/:fingerprint', async (req, res) => {
  try {
    const { fingerprint } = req.params;
    if (!fingerprint) {
      return res.status(400).json({ success: false, message: 'Missing fingerprint' });
    }
    const dRef = doc(db, 'device_votes', fingerprint);
    const snap = await getDoc(dRef);
    const votedCharacters = snap.exists() ? (snap.data().votedCharacters || []) : [];
    res.json({
      success: true,
      fingerprint,
      votedCharacters,
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 3. POST /api/robux/vote - Upvote +1 Robux with anonymous device fingerprinting
app.post('/api/robux/vote', async (req, res) => {
  try {
    const { characterId, fingerprint } = req.body;
    if (!characterId || typeof characterId !== 'string') {
      return res.status(400).json({ success: false, message: 'characterId is required' });
    }
    if (!fingerprint || typeof fingerprint !== 'string') {
      return res.status(400).json({ success: false, message: 'Device fingerprint is required' });
    }

    // Ensure character document exists
    const charRef = doc(db, 'robux_counts', characterId);
    let charSnap = await getDoc(charRef);
    if (!charSnap.exists()) {
      await setDoc(charRef, { count: 0 });
    }

    const deviceRef = doc(db, 'device_votes', fingerprint);
    const deviceSnap = await getDoc(deviceRef);
    
    let deviceVotes: string[] = [];
    if (deviceSnap.exists()) {
      deviceVotes = deviceSnap.data().votedCharacters || [];
    }

    // ENFORCE SINGLE-VOTE RULE: Check if device has already voted for this character
    if (deviceVotes.includes(characterId)) {
      charSnap = await getDoc(charRef);
      return res.status(200).json({
        success: false,
        alreadyVoted: true,
        error: 'ALREADY_VOTED',
        message: 'Thiết bị này đã thả 1 Robux cho nhân vật này rồi! (Tối đa 1 R$/nhân vật)',
        characterId,
        totalRobux: charSnap.data()?.count || 0,
        votedCharacters: deviceVotes,
      });
    }

    // Process vote
    deviceVotes.push(characterId);
    await setDoc(deviceRef, { votedCharacters: deviceVotes });
    await updateDoc(charRef, { count: increment(1) });
    
    charSnap = await getDoc(charRef);
    
    console.log(`[Vote Success] Device "${fingerprint}" voted for "${characterId}". New total: ${charSnap.data()?.count} R$`);
    res.json({
      success: true,
      alreadyVoted: false,
      characterId,
      totalRobux: charSnap.data()?.count || 1,
      votedCharacters: deviceVotes,
      message: 'Thả 1 Robux thành công (+1 R$)!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 4. POST /api/robux/reset - Reset all characters to 0 Robux and clear device vote history
app.post('/api/robux/reset', async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, 'robux_counts'));
    for (const d of snapshot.docs) {
      await updateDoc(doc(db, 'robux_counts', d.id), { count: 0 });
    }
    const deviceSnapshot = await getDocs(collection(db, 'device_votes'));
    for (const d of deviceSnapshot.docs) {
      await setDoc(doc(db, 'device_votes', d.id), { votedCharacters: [] });
    }
    
    res.json({ success: true, message: 'Đã reset tất cả nhân vật về 0 Robux thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ==========================================
// CHARACTER COMMENTS & REVIEWS API
// ==========================================

// 5. GET /api/comments/counts - Get all comment counts by characterId
app.get('/api/comments/counts', async (req, res) => {
  try {
    const counts: Record<string, number> = {};
    const snapshot = await getDocs(collection(db, 'rp_comment_counts'));
    snapshot.forEach((d) => {
      counts[d.id] = d.data().count || 0;
    });
    res.json({ success: true, counts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 6. GET /api/comments/:characterId - Get comments for a character
app.get('/api/comments/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    if (!characterId) {
      return res.status(400).json({ success: false, message: 'Missing characterId' });
    }

    const itemsRef = collection(db, 'rp_comments', characterId, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    const comments: Array<{
      id: string;
      characterId: string;
      userName: string;
      commentText: string;
      createdAt: number;
      parentId?: string | null;
      replyToUserName?: string | null;
    }> = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const uName = (data.userName || '').toLowerCase().trim();
      const cText = (data.commentText || '').toLowerCase();

      // Delete spoiler comments by em iu
      if (
        uName === 'em iu' ||
        uName.includes('em iu') ||
        uName.includes('em_iu') ||
        uName.includes('emiu') ||
        (characterId === 'char-15-thien' && (uName.includes('em') && (cText.includes('pass') || cText.includes('mật khẩu') || cText.includes('spoil'))))
      ) {
        deleteDoc(doc(db, 'rp_comments', characterId, 'items', docSnap.id)).catch(() => {});
        continue;
      }

      comments.push({
        id: docSnap.id,
        characterId: data.characterId || characterId,
        userName: data.userName || 'Vô danh',
        commentText: data.commentText || '',
        createdAt: data.createdAt || Date.now(),
        parentId: data.parentId || null,
        replyToUserName: data.replyToUserName || null,
      });
    }

    res.json({
      success: true,
      characterId,
      comments,
      totalCount: comments.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 7. POST /api/comments/:characterId - Add new public comment or reply with rate-limiting
app.post('/api/comments/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { userName, commentText, fingerprint, parentId, replyToUserName } = req.body;

    if (!characterId) {
      return res.status(400).json({ success: false, message: 'Missing characterId' });
    }

    const trimmedName = typeof userName === 'string' ? userName.trim() : '';
    const trimmedText = typeof commentText === 'string' ? commentText.trim() : '';
    const validParentId = typeof parentId === 'string' && parentId.trim() ? parentId.trim().slice(0, 128) : null;
    const validReplyTo = typeof replyToUserName === 'string' && replyToUserName.trim() ? replyToUserName.trim().slice(0, 50) : null;

    if (!trimmedName) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Tên của bạn / Biệt danh!' });
    }
    if (trimmedName.length > 50) {
      return res.status(400).json({ success: false, message: 'Tên không được vượt quá 50 ký tự!' });
    }

    if (!trimmedText) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Lời nhắn / Nhận xét!' });
    }
    if (trimmedText.length > 250) {
      return res.status(400).json({ success: false, message: 'Lời nhắn không được vượt quá 250 ký tự!' });
    }

    // Rate limiting: 5 seconds per client IP or fingerprint
    const clientKey = fingerprint || req.ip || 'anonymous-client';
    const now = Date.now();
    const lastTime = commentRateLimits[clientKey] || 0;
    const cooldown = 5000; // 5 seconds

    if (now - lastTime < cooldown) {
      const remainingSeconds = Math.ceil((cooldown - (now - lastTime)) / 1000);
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        remainingSeconds,
        message: `Vui lòng đợi ${remainingSeconds}s trước khi gửi nhận xét tiếp theo!`,
      });
    }

    commentRateLimits[clientKey] = now;

    // Save to Firestore subcollection: /rp_comments/{characterId}/items/{commentId}
    const commentPayload: Record<string, any> = {
      characterId,
      userName: trimmedName,
      commentText: trimmedText,
      createdAt: now,
    };
    if (validParentId) commentPayload.parentId = validParentId;
    if (validReplyTo) commentPayload.replyToUserName = validReplyTo;

    const itemsRef = collection(db, 'rp_comments', characterId, 'items');
    const docRef = await addDoc(itemsRef, commentPayload);

    // Update count document: /rp_comment_counts/{characterId}
    try {
      const countRef = doc(db, 'rp_comment_counts', characterId);
      const countSnap = await getDoc(countRef);
      if (!countSnap.exists()) {
        await setDoc(countRef, { count: 1 });
      } else {
        await updateDoc(countRef, { count: increment(1) });
      }
    } catch (countErr) {
      console.warn('Could not update count document:', countErr);
    }

    console.log(`[New Comment] "${trimmedName}" commented on "${characterId}" (parent: ${validParentId || 'none'}): "${trimmedText.slice(0, 30)}..."`);

    res.json({
      success: true,
      comment: {
        id: docRef.id,
        ...commentPayload,
      },
      message: validParentId ? 'Đã gửi phản hồi thành công! 💬' : 'Gửi nhận xét thành công!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ==========================================
// ART GALLERY (PHÒNG TRANH) API
// ==========================================

// 8. GET /api/artworks - Get list of artworks (optional filter ?characterId=...)
app.get('/api/artworks', async (req, res) => {
  try {
    const { characterId } = req.query;
    const artworksRef = collection(db, 'artworks');
    const q = query(artworksRef, orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);

    let artworks: Array<{
      id: string;
      imageUrl: string;
      characterId: string;
      characterName: string;
      characterAvatarUrl?: string;
      authorName: string;
      title?: string;
      message?: string;
      createdAt: number;
      likesCount: number;
    }> = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      artworks.push({
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

    if (characterId && typeof characterId === 'string') {
      artworks = artworks.filter((item) => item.characterId === characterId);
    }

    res.json({
      success: true,
      artworks,
      totalCount: artworks.length,
    });
  } catch (err) {
    console.error('[Artworks GET Error]:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 9. POST /api/artworks - Submit new artwork
app.post('/api/artworks', async (req, res) => {
  try {
    const {
      imageUrl,
      image_url,
      characterId,
      character_id,
      characterName,
      characterAvatarUrl,
      authorName,
      author_name,
      title,
      message,
    } = req.body;

    const rawUrl = imageUrl || image_url;
    const rawCharId = characterId || character_id;
    const rawAuthor = authorName || author_name;

    const trimmedUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
    const trimmedAuthor = typeof rawAuthor === 'string' ? rawAuthor.trim() : '';
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn hoặc tải ảnh lên!' });
    }

    if (!rawCharId || typeof rawCharId !== 'string') {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn nhân vật gắn với bức tranh!' });
    }

    if (!trimmedAuthor) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập Tên tác giả / Họa sĩ!' });
    }

    if (trimmedAuthor.length > 60) {
      return res.status(400).json({ success: false, message: 'Tên tác giả không được vượt quá 60 ký tự!' });
    }

    const now = Date.now();
    const artworkPayload = {
      imageUrl: trimmedUrl,
      image_url: trimmedUrl,
      characterId: rawCharId.trim(),
      character_id: rawCharId.trim(),
      characterName: typeof characterName === 'string' && characterName.trim() ? characterName.trim() : 'Chồng Roblox',
      characterAvatarUrl: typeof characterAvatarUrl === 'string' ? characterAvatarUrl.trim() : '',
      authorName: trimmedAuthor,
      author_name: trimmedAuthor,
      title: trimmedTitle.slice(0, 120),
      message: trimmedMessage.slice(0, 300),
      createdAt: now,
      created_at: now,
      likesCount: 0,
      likes_count: 0,
    };

    const artworksRef = collection(db, 'artworks');
    const docRef = await addDoc(artworksRef, artworkPayload);

    console.log(`[New Artwork] "${trimmedAuthor}" submitted artwork for "${artworkPayload.characterName}": ${trimmedUrl}`);

    res.json({
      success: true,
      artwork: {
        id: docRef.id,
        imageUrl: trimmedUrl,
        characterId: rawCharId.trim(),
        characterName: artworkPayload.characterName,
        characterAvatarUrl: artworkPayload.characterAvatarUrl,
        authorName: trimmedAuthor,
        title: trimmedTitle.slice(0, 120),
        message: trimmedMessage.slice(0, 300),
        createdAt: now,
        likesCount: 0,
      },
      message: 'Đăng tranh thành công! Tác phẩm đã được lưu vào Phòng Tranh.',
    });
  } catch (err) {
    console.error('[Artworks POST Error]:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 10. POST /api/artworks/:artworkId/like - Like or unlike an artwork
app.post('/api/artworks/:artworkId/like', async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { action } = req.body; // 'like' or 'unlike'
    if (!artworkId) {
      return res.status(400).json({ success: false, message: 'Thiếu mã tác phẩm!' });
    }

    const artworkRef = doc(db, 'artworks', artworkId);
    const artworkSnap = await getDoc(artworkRef);
    if (!artworkSnap.exists()) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tác phẩm này!' });
    }

    const currentData = artworkSnap.data();
    const currentLikes = Number(currentData.likesCount || currentData.likes_count || 0);

    const isUnlike = action === 'unlike';
    const delta = isUnlike ? -1 : 1;
    const newLikesCount = Math.max(0, currentLikes + delta);

    await updateDoc(artworkRef, {
      likesCount: newLikesCount,
      likes_count: newLikesCount,
    });

    console.log(`[Artwork Like] ${artworkId}: ${isUnlike ? '-1' : '+1'} => ${newLikesCount} likes`);

    res.json({
      success: true,
      artworkId,
      likesCount: newLikesCount,
      liked: !isUnlike,
    });
  } catch (err) {
    console.error('[Artwork Like Error]:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// 11. POST /api/artworks/clear-all - Clear all artworks
app.post('/api/artworks/clear-all', async (req, res) => {
  try {
    const artworksRef = collection(db, 'artworks');
    const snapshot = await getDocs(artworksRef);
    let deletedCount = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, 'artworks', docSnap.id));
      deletedCount++;
    }
    console.log(`[Artworks] Cleared ${deletedCount} artworks from Firestore database.`);
    res.json({ success: true, deletedCount, message: `Đã xóa ${deletedCount} bức tranh khỏi phòng tranh.` });
  } catch (err) {
    console.error('[Artworks Clear Error]:', err);
    res.status(500).json({ success: false, error: String(err) });
  }
});

// ==========================================
// 12. COMMAND LIBRARY (KHO LỆNH) API
// ==========================================

// GET /api/commands - Return admin-uploaded commands
app.get('/api/commands', async (req, res) => {
  try {
    const { INITIAL_RP_COMMANDS } = await import('./src/data/initialCommands');
    res.json({
      success: true,
      commands: INITIAL_RP_COMMANDS,
      total: INITIAL_RP_COMMANDS.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});



// ==========================================
// VITE / STATIC SERVING SETUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Roblox RP Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
