import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';

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
app.use(express.json());

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
    }> = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      comments.push({
        id: docSnap.id,
        characterId: data.characterId || characterId,
        userName: data.userName || 'Vô danh',
        commentText: data.commentText || '',
        createdAt: data.createdAt || Date.now(),
      });
    });

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

// 7. POST /api/comments/:characterId - Add new public comment with rate-limiting
app.post('/api/comments/:characterId', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { userName, commentText, fingerprint } = req.body;

    if (!characterId) {
      return res.status(400).json({ success: false, message: 'Missing characterId' });
    }

    const trimmedName = typeof userName === 'string' ? userName.trim() : '';
    const trimmedText = typeof commentText === 'string' ? commentText.trim() : '';

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
    const commentPayload = {
      characterId,
      userName: trimmedName,
      commentText: trimmedText,
      createdAt: now,
    };

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

    console.log(`[New Comment] "${trimmedName}" commented on "${characterId}": "${trimmedText.slice(0, 30)}..."`);

    res.json({
      success: true,
      comment: {
        id: docRef.id,
        ...commentPayload,
      },
      message: 'Gửi nhận xét thành công!',
    });
  } catch (err) {
    console.error(err);
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
