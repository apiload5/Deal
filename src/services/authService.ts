import { User, UserRole, KYCStatus } from '../types';
import { GUEST_USER, INITIAL_USERS } from '../data/mockData';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { supabaseService } from '../lib/supabase';
import { firestoreRealtime } from '../lib/firestoreRealtime';
import { compareWithBcrypt } from '../utils/security';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User = GUEST_USER;
  private users: User[] = [...INITIAL_USERS];
  private authListeners: ((user: User) => void)[] = [];

  private constructor() {
    this.loadStoredUser();
    this.initFirebaseAuthListener();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadStoredUser() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('dealfast_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.id !== 'user-guest' && parsed.id !== 'guest' && parsed.role !== 'guest') {
          this.currentUser = parsed;
        }
      }
    } catch (e) {}
  }

  private saveStoredUser(user: User) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dealfast_current_user', JSON.stringify(user));
    } catch (e) {}
  }

  private initFirebaseAuthListener() {
    if (typeof window === 'undefined') return;

    try {
      onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          let keyedProfile: Partial<User> = {};
          try {
            const byId = localStorage.getItem(`dealfast_user_profile_${fbUser.uid}`);
            const byEmail = fbUser.email ? localStorage.getItem(`dealfast_user_profile_${fbUser.email.toLowerCase()}`) : null;
            if (byId) keyedProfile = { ...keyedProfile, ...JSON.parse(byId) };
            if (byEmail) keyedProfile = { ...keyedProfile, ...JSON.parse(byEmail) };
          } catch (e) {}

          const cloudProfile = await supabaseService.getUserProfile(fbUser.uid);
          const realUser: User = {
            ...this.currentUser,
            ...keyedProfile,
            ...cloudProfile,
            id: fbUser.uid,
            name: keyedProfile.name || cloudProfile?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || cloudProfile?.email || '',
            role: (cloudProfile?.role as UserRole) || keyedProfile.role || (this.currentUser?.role as UserRole) || 'user',
            avatar: keyedProfile.avatar || cloudProfile?.avatar || fbUser.photoURL || undefined,
            phone: keyedProfile.phone || cloudProfile?.phone || this.currentUser?.phone || '',
            city: keyedProfile.city || cloudProfile?.city || this.currentUser?.city || 'Islamabad',
            cnic: keyedProfile.cnic || cloudProfile?.cnic || this.currentUser?.cnic || '',
            isVerified: fbUser.emailVerified || true,
            kycStatus: (cloudProfile?.kycStatus as KYCStatus) || keyedProfile.kycStatus || 'verified',
            createdAt: cloudProfile?.createdAt || fbUser.metadata.creationTime || new Date().toISOString()
          };

          this.currentUser = realUser;
          this.saveStoredUser(realUser);
          await supabaseService.upsertUserProfile(realUser).catch(() => {});
          await firestoreRealtime.syncUserProfile(realUser).catch(() => {});
          this.notify(this.currentUser);
        }
      });
    } catch (e) {
      console.warn('Firebase Auth state init notice:', e);
    }
  }

  public subscribe(listener: (user: User) => void): () => void {
    this.authListeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.authListeners = this.authListeners.filter(l => l !== listener);
    };
  }

  private notify(user: User) {
    this.authListeners.forEach(l => l(user));
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    this.saveStoredUser(user);
    supabaseService.upsertUserProfile(user).catch(() => {});
    firestoreRealtime.syncUserProfile(user).catch(() => {});
    this.notify(this.currentUser);
  }

  public async login(email: string, pass: string): Promise<User> {
    // 1. Check cloud supabase first
    try {
      const cloudUser = await supabaseService.getUserProfile(email);
      if (cloudUser) {
        const mappedUser: User = {
          id: cloudUser.id,
          name: cloudUser.name || 'User',
          email: cloudUser.email,
          role: (cloudUser.role as UserRole) || 'user',
          avatar: cloudUser.avatar || '',
          phone: cloudUser.phone || '',
          isVerified: true,
          kycStatus: (cloudUser.kycStatus as KYCStatus) || 'none',
          createdAt: cloudUser.createdAt || new Date().toISOString()
        };
        this.currentUser = mappedUser;
        this.saveStoredUser(mappedUser);
        await firestoreRealtime.syncUserProfile(mappedUser).catch(() => {});
        this.notify(this.currentUser);
        return mappedUser;
      }
    } catch (e) {}

    // 2. Memory check
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const passMatch = (existing as any).password 
        ? compareWithBcrypt(pass, (existing as any).password) || pass === (existing as any).password 
        : true;
      if (!passMatch) {
        throw new Error('Invalid email or password.');
      }
      this.currentUser = existing;
      this.saveStoredUser(existing);
      await supabaseService.upsertUserProfile(existing).catch(() => {});
      await firestoreRealtime.syncUserProfile(existing).catch(() => {});
      this.notify(this.currentUser);
      return existing;
    }

    // Default registration/login for new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'user',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: '+92 300 0000000',
      isVerified: true,
      kycStatus: 'none',
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveStoredUser(newUser);
    await supabaseService.upsertUserProfile(newUser).catch(() => {});
    await firestoreRealtime.syncUserProfile(newUser).catch(() => {});
    this.notify(this.currentUser);
    return newUser;
  }

  public async register(userData: Partial<User> & { password?: string }): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name || 'New User',
      email: userData.email || '',
      role: userData.role || 'user',
      avatar: userData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      phone: userData.phone || '',
      isVerified: true,
      kycStatus: userData.kycStatus || 'none',
      agencyId: userData.agencyId,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveStoredUser(newUser);
    await supabaseService.upsertUserProfile(newUser).catch(() => {});
    await firestoreRealtime.syncUserProfile(newUser).catch(() => {});
    this.notify(this.currentUser);
    return newUser;
  }

  public async signInWithGoogle(): Promise<User> {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const user: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Google User',
        email: fbUser.email || '',
        role: 'user',
        avatar: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        phone: fbUser.phoneNumber || '+92 300 1234567',
        isVerified: true,
        kycStatus: 'none',
        createdAt: new Date().toISOString()
      };
      this.currentUser = user;
      this.saveStoredUser(user);
      await supabaseService.upsertUserProfile(user).catch(() => {});
      await firestoreRealtime.syncUserProfile(user).catch(() => {});
      this.notify(this.currentUser);
      return user;
    } catch (e: any) {
      throw new Error(e.message || 'Google sign in failed');
    }
  }

  public async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (e) {}
    this.currentUser = GUEST_USER;
    this.saveStoredUser(GUEST_USER);
    this.notify(this.currentUser);
  }

  public async updateProfile(data: Partial<User>): Promise<User> {
    this.currentUser = { ...this.currentUser, ...data };
    this.saveStoredUser(this.currentUser);
    await supabaseService.upsertUserProfile(this.currentUser).catch(() => {});
    await firestoreRealtime.syncUserProfile(this.currentUser).catch(() => {});
    this.notify(this.currentUser);
    return this.currentUser;
  }
}

export const authService = AuthService.getInstance();
