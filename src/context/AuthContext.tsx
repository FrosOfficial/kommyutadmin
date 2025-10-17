import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { authAPI } from '../services/api';

export type UserRole = 'user' | 'developer' | 'manager' | 'ceo';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
          // Wait for role to be fetched before setting loading to false
          await fetchUserRole(user);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        // Only set loading to false after everything is done
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserRole = async (user: User) => {
    try {
      // Method 1: Try to get role from Firebase custom claims (fastest)
      const idTokenResult = await user.getIdTokenResult();
      console.log('Firebase custom claims:', idTokenResult.claims);

      if (idTokenResult.claims.role) {
        const roleFromClaims = idTokenResult.claims.role as UserRole;
        console.log('✓ Role from Firebase claims:', roleFromClaims);
        setUserRole(roleFromClaims);
        return;
      }

      // Method 2: Try to get role from Firestore
      console.log('No custom claims, checking Firestore...');
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Firestore user data:', userData);

          if (userData.role) {
            const roleFromFirestore = userData.role as UserRole;
            console.log('✓ Role from Firestore:', roleFromFirestore);
            setUserRole(roleFromFirestore);
            return;
          }
        } else {
          console.warn('User document not found in Firestore');
        }
      } catch (firestoreError) {
        console.warn('Firestore fetch failed:', firestoreError);
      }

      // Method 3: Fallback to PostgreSQL API
      console.log('Checking PostgreSQL via API...');
      try {
        const response = await authAPI.getProfile(user.uid);
        console.log('API response:', response);

        if (response.success && response.data) {
          const roleFromAPI = response.data.role as UserRole;
          console.log('✓ Role from API:', roleFromAPI);
          setUserRole(roleFromAPI);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed:', apiError);
      }

      // If all methods fail, default to 'user'
      console.warn('⚠ No role found in any source, defaulting to "user"');
      setUserRole('user');

    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await firebaseSignInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email and password:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      user: 0,
      manager: 1,
      ceo: 2,
      developer: 3,
    };
    return (userRole && roleHierarchy[userRole] >= roleHierarchy[role]) || false;
  };

  const value = {
    user,
    userRole,
    loading,
    signInWithGoogle,
    signInWithEmailAndPassword,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};