import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const ADMIN_EMAIL = 'hiendichai@gmail.com';

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<User>;
  logout: () => Promise<void>;
  formatAuthError: (error: any) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = isUserAdmin(currentUser?.email);

  // Sync user record to Firestore when authenticated
  const syncUserToFirestore = async (user: User, customName?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const effectiveName = customName || user.displayName || user.email?.split('@')[0] || 'Member';

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: effectiveName,
          photoURL: user.photoURL || '',
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        });
      } else {
        await setDoc(
          userRef,
          {
            lastLoginAt: Date.now(),
            ...(user.photoURL ? { photoURL: user.photoURL } : {}),
            ...(user.displayName ? { displayName: user.displayName } : {}),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('[Auth] Error syncing user to Firestore:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        syncUserToFirestore(user).catch(() => {});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    await syncUserToFirestore(result.user);
    return result.user;
  };

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    await syncUserToFirestore(result.user);
    return result.user;
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const trimmedName = displayName?.trim() || email.split('@')[0];
    if (trimmedName) {
      try {
        await updateProfile(result.user, { displayName: trimmedName });
      } catch (err) {
        console.warn('[Auth] updateProfile error:', err);
      }
    }
    await syncUserToFirestore(result.user, trimmedName);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  const formatAuthError = (error: any): string => {
    if (!error) return 'Đã có lỗi xảy ra.';
    const code = error.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Địa chỉ email không đúng định dạng.';
      case 'auth/user-disabled':
        return 'Tài khoản này đã bị tạm khóa.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không chính xác.';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác. Vui lòng thử lại!';
      case 'auth/email-already-in-use':
        return 'Email này đã được sử dụng. Vui lòng chuyển sang tab Đăng Nhập!';
      case 'auth/weak-password':
        return 'Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự!';
      case 'auth/popup-closed-by-user':
        return 'Cửa sổ đăng nhập Google đã được đóng.';
      case 'auth/cancelled-popup-request':
        return 'Yêu cầu mở cửa sổ bị hủy do thao tác mới.';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra lại đường truyền!';
      case 'auth/operation-not-allowed':
        return 'Phương thức đăng nhập email chưa được bật trên Firebase Console. Vui lòng sử dụng Đăng nhập bằng Google!';
      default:
        return error.message || 'Đã có lỗi xảy ra khi xác thực tài khoản.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        formatAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
