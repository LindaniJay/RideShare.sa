import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface User {
  uid: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneNumber?: string;
  // Supports roles: Renter, Host, admin
  // Note: Admins are already in Firebase and don't signup
  role: 'Renter' | 'Host' | 'admin' | 'Admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  age?: number;
  driversLicense?: boolean;
  idVerified?: boolean;
  addressVerified?: boolean;
  insuranceVerified?: boolean;
  // Firebase user methods
  getIdToken: () => Promise<string>;
  name?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'Renter' | 'Host';
}

export interface LoginData {
  email: string;
  password: string;
}

class FirebaseAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];

  /**
   * Helper function to serialize user data for Firestore (excludes functions)
   */
  private serializeUserForFirestore(user: User): any {
    const { getIdToken, ...serializableData } = user;
    return serializableData;
  }

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // getUserRole handles all errors gracefully and always returns a user object
          // Wrap in try-catch as extra safety to ensure we never fail
          let userData: User;
          try {
            userData = await this.getUserRole(firebaseUser.uid);
          } catch (getUserRoleError: any) {
            // Even if getUserRole somehow throws, create a default user
            console.warn('getUserRole threw error (unexpected), creating default user:', getUserRoleError);
            userData = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              phone: '',
              phoneNumber: '',
              role: 'Renter',
              approvalStatus: 'pending',
              createdAt: new Date(),
              getIdToken: () => firebaseUser.getIdToken(),
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
            };
          }
          this.currentUser = userData;
        } catch (error) {
          // Ultimate fallback - create minimal user object
          console.warn('Error in auth state listener, creating minimal user:', error);
          try {
            const minimalUser: User = {
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              phone: '',
              phoneNumber: '',
              role: 'Renter',
              approvalStatus: 'pending',
              createdAt: new Date(),
              getIdToken: () => firebaseUser.getIdToken(),
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
            };
            this.currentUser = minimalUser;
          } catch (minimalError) {
            console.error('Error creating minimal user:', minimalError);
            this.currentUser = null;
          }
        }
      } else {
        this.currentUser = null;
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(this.currentUser);
        } catch (listenerError) {
          console.error('Error in auth state listener callback:', listenerError);
        }
      });
    });
  }

  /**
   * Sign up a new user with email, password, and role
   */
  async signupUser(data: SignupData): Promise<User> {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Normalize role to lowercase for consistency
      const normalizedRole = data.role.toLowerCase() as 'renter' | 'host';
      
      // Save user data to Firestore with normalized role
      const userData: User = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        phoneNumber: data.phone || '',
        role: normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1) as 'Renter' | 'Host', // Capitalize for frontend
        approvalStatus: 'pending',
        createdAt: new Date(),
        getIdToken: () => firebaseUser.getIdToken(),
        name: `${data.firstName} ${data.lastName}`
      };
      
      // Store in Firestore with lowercase role for backend consistency
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...this.serializeUserForFirestore(userData),
        role: normalizedRole, // Store lowercase in Firestore
        createdAt: serverTimestamp()
      });
      
      // Register user in backend database
      try {
        // Wait a bit for Firebase to fully initialize the user
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const token = await firebaseUser.getIdToken();
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseToken: token,
            role: normalizedRole, // Already normalized
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          try {
            const errorJson = JSON.parse(errorText);
            console.warn('Failed to register user in backend:', errorJson);
          } catch {
            console.warn('Failed to register user in backend:', errorText);
          }
          // Don't throw here - user is already created in Firebase
          // Backend registration can happen on next login
          // Log for debugging
          console.log('User will be auto-registered on first login attempt');
        } else {
          const result = await response.json();
          if (result.user && result.user.role) {
            // Normalize backend role response - handle admin, renter, host
            const backendRole = result.user.role.toLowerCase();
            
            // Update userData with backend response
            if (backendRole === 'admin') {
              userData.role = 'admin';
            } else if (backendRole === 'host') {
              userData.role = 'Host';
            } else {
              userData.role = 'Renter'; // Default
            }
            
            // Update Firestore with backend role (store lowercase)
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...this.serializeUserForFirestore(userData),
                role: backendRole, // Store lowercase in Firestore
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone || userData.phoneNumber,
                approvalStatus: userData.approvalStatus,
                updatedAt: serverTimestamp()
              }, { merge: true });
            } catch (updateError) {
              console.warn('Failed to update Firestore with backend role:', updateError);
            }
          }
        }
      } catch (error) {
        console.warn('Error registering user in backend (user can still login):', error);
        // Don't throw here - user is already created in Firebase
        // Backend registration will happen on next login (auto-registration)
        console.log('User created in Firebase/Firestore. Backend registration will occur on first login.');
      }
      
      this.currentUser = userData;
      return userData;
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // If email already exists, provide a helpful error message
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign in an existing user
   */
  async loginUser(data: LoginData): Promise<User> {
    try {
      // Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );
      
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore - handle errors gracefully
      let userData: User;
      try {
        userData = await this.getUserRole(firebaseUser.uid);
      } catch (error) {
        console.warn('Failed to get user data from Firestore, checking backend for role:', error);
        // Try to get role from backend first before defaulting
        let defaultRole: 'Renter' | 'Host' | 'admin' = 'Renter';
        try {
          const token = await firebaseUser.getIdToken();
          const { getApiBaseUrl } = await import('../utils/apiConfig');
          const apiUrl = getApiBaseUrl();
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseToken: token })
          });
          if (response.ok) {
            const result = await response.json();
            if (result.user?.role) {
              const backendRole = result.user.role.toLowerCase();
              if (backendRole === 'admin') {
                defaultRole = 'admin';
              } else if (backendRole === 'host') {
                defaultRole = 'Host';
              }
            }
          }
        } catch (backendError) {
          console.warn('Could not fetch role from backend, using default Renter');
        }
        
        // Create default user object if Firestore fails
        userData = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          phone: '',
          phoneNumber: '',
          role: defaultRole,
          approvalStatus: 'pending',
          createdAt: new Date(),
          getIdToken: () => firebaseUser.getIdToken(),
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
        };
        
        // Try to save to Firestore for next time (don't fail if this fails)
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...this.serializeUserForFirestore(userData),
            role: defaultRole === 'admin' ? 'admin' : defaultRole.toLowerCase(), // Store lowercase in Firestore
            createdAt: serverTimestamp()
          });
        } catch (saveError) {
          console.warn('Failed to save user to Firestore:', saveError);
        }
      }
      
      // Ensure user is registered in backend database and get authoritative role
      try {
        const token = await firebaseUser.getIdToken();
        const { getApiBaseUrl } = await import('../utils/apiConfig');
        const apiUrl = getApiBaseUrl();
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseToken: token
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Failed to login user in backend:', errorText);
          // Continue with Firebase auth even if backend fails
        } else {
          const result = await response.json();
          console.log('Backend login response:', { 
            hasUser: !!result.user, 
            role: result.user?.role, 
            resultRole: result.role 
          });
          
          if (result.user && (result.user.role || result.role)) {
            // Normalize backend role response - handle admin, renter, host
            const backendRole = (result.user.role || result.role).toLowerCase();
            console.log('Backend role received:', backendRole);
            
            // Update userData with backend response (backend is authoritative)
            if (backendRole === 'admin') {
              userData.role = 'admin';
              console.log('✅ User role set to admin');
            } else if (backendRole === 'host') {
              userData.role = 'Host';
              console.log('✅ User role set to Host');
            } else {
              userData.role = 'Renter'; // Default
              console.log('✅ User role set to Renter');
            }
            
            // Update Firestore with backend role (store lowercase)
            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                ...this.serializeUserForFirestore(userData),
                role: backendRole, // Store lowercase in Firestore
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone || userData.phoneNumber,
                approvalStatus: userData.approvalStatus,
                updatedAt: serverTimestamp()
              }, { merge: true });
              console.log('✅ Firestore updated with role:', backendRole);
            } catch (updateError) {
              console.warn('Failed to update Firestore with backend data:', updateError);
            }
          } else {
            console.warn('⚠️ Backend response missing role information');
          }
        }
      } catch (error) {
        console.warn('Error logging in user in backend:', error);
        // Continue with Firebase auth even if backend fails
      }
      
      console.log('Final userData role before return:', userData.role);
      
      this.currentUser = userData;
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  /**
   * Sign out the current user
   */
  async logoutUser(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get user role from Firestore
   * 
   * This method:
   * - Waits for Firebase Auth user to be available
   * - Checks if user document exists in Firestore at users/{uid}
   * - Creates default document if missing (with role: 'renter')
   * - Handles all errors gracefully (never throws, always returns a user)
   * - Supports roles: Renter, Host, admin (admins don't signup, already in Firebase)
   * - Returns properly typed User object
   */
  private async getUserRole(uid: string): Promise<User> {
    // Wait for Firebase Auth user to be available
    // Sometimes auth.currentUser might be null immediately after login
    let firebaseUser = auth.currentUser;
    
    // If not available, wait a bit and check again (max 3 attempts)
    if (!firebaseUser) {
      console.log('⚠️ Firebase user not immediately available, waiting...');
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        firebaseUser = auth.currentUser;
        if (firebaseUser) break;
      }
    }
    
    if (!firebaseUser) {
      console.error('❌ No Firebase user found after waiting. UID provided:', uid);
      // Still return a minimal user object instead of throwing
      // This prevents login from completely failing
      return this.createMinimalUser(uid);
    }

    console.log(`🔍 Fetching user data from Firestore for UID: ${uid}`);
    const firestorePath = `users/${uid}`;
    console.log(`📁 Firestore path: ${firestorePath}`);

      // Helper to create a default user object from Firebase user
      // Supports roles: Renter, Host, admin
      // Note: Admins don't signup, they're already in Firebase
      const createDefaultUser = (storedRole?: string): User => {
        // Normalize stored role if provided
        let role: 'Renter' | 'Host' | 'admin' | 'Admin' = 'Renter'; // Default role
        
        if (storedRole) {
          const normalized = storedRole.toLowerCase();
          // Support roles: Renter, Host, admin
          if (normalized === 'admin') {
            role = 'admin';
          } else if (normalized === 'host') {
            role = 'Host';
          } else if (normalized === 'renter' || normalized === 'user') {
            role = 'Renter'; // Default user role
          } else {
            role = 'Renter'; // Fallback to Renter
          }
        }
        
        return {
          uid: firebaseUser!.uid,
          id: firebaseUser!.uid,
          email: firebaseUser!.email || '',
          firstName: firebaseUser!.displayName?.split(' ')[0] || '',
          lastName: firebaseUser!.displayName?.split(' ').slice(1).join(' ') || '',
          phone: '',
          phoneNumber: '',
          role: role,
          approvalStatus: 'pending',
          createdAt: new Date(),
          getIdToken: () => firebaseUser!.getIdToken(),
          name: firebaseUser!.displayName || firebaseUser!.email?.split('@')[0] || 'User'
        };
      };

    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // User document doesn't exist - create a default one
        console.warn(`⚠️ No user data found for UID: ${uid}. Creating default record...`);
        console.log(`📝 Creating user document at: ${firestorePath}`);
        
        const defaultUser = createDefaultUser('renter'); // Default to 'renter' role for new users
        
        // Try to save to Firestore for next time (handle permission errors gracefully)
        try {
          await setDoc(userDocRef, {
            ...this.serializeUserForFirestore(defaultUser),
            role: 'renter', // Store lowercase role in Firestore
            createdAt: serverTimestamp()
          });
          console.log(`✅ Created default user document at ${firestorePath} with role: 'renter'`);
        } catch (saveError: any) {
          const errorCode = saveError.code || saveError.message || '';
          const errorMsg = saveError.message || '';
          
          if (errorCode === 'permission-denied' || errorMsg.includes('permission')) {
            console.warn(`🚫 Firestore permission denied when creating user at ${firestorePath}`);
            console.warn('   → Check Firestore security rules. User can still login.');
            console.warn('   → Required rule: allow write: if request.auth != null && request.auth.uid == userId;');
          } else {
            console.warn(`⚠️ Failed to save default user to Firestore at ${firestorePath}:`, saveError);
          }
          // Don't throw - return default user anyway so login can proceed
        }
        
        return defaultUser;
      }
      
      // Document exists - extract and validate data
      const userData = userDoc.data();
      console.log(`✅ User document found at ${firestorePath}`);
      console.log(`📋 User data:`, { 
        uid: userData.uid || uid, 
        email: userData.email || firebaseUser?.email || 'N/A',
        role: userData.role || 'N/A'
      });
      
      // Normalize role - handle various formats and case variations
      let roleValue = userData.role || 'renter';
      if (typeof roleValue === 'string') {
        const normalized = roleValue.toLowerCase();
        
        // Support roles: Renter, Host, admin
        // Note: Admins don't signup, they're already in Firebase
        if (normalized === 'admin') {
          roleValue = 'admin';
        } else if (normalized === 'host') {
          roleValue = 'Host';
        } else if (normalized === 'renter' || normalized === 'user') {
          roleValue = 'Renter'; // Default user role
        } else {
          console.warn(`⚠️ Unknown role '${roleValue}' for user ${uid}. Defaulting to 'Renter'.`);
          roleValue = 'Renter';
        }
      }
      
      const normalizedRole = roleValue as 'Renter' | 'Host' | 'admin' | 'Admin';
      console.log(`👤 User role normalized to: ${normalizedRole}`);
      
      // Validate that role field exists
      if (!userData.role) {
        console.warn(`⚠️ User ${uid} has no 'role' field in Firestore. Defaulting to 'Renter'.`);
      }
      
      return {
        uid: userData.uid || uid,
        id: userData.uid || uid,
        email: userData.email || firebaseUser?.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || userData.phoneNumber || '',
        phoneNumber: userData.phone || userData.phoneNumber || '',
        role: normalizedRole,
        approvalStatus: userData.approvalStatus || 'pending',
        createdAt: userData.createdAt?.toDate() || new Date(),
        getIdToken: () => firebaseUser!.getIdToken(),
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
              firebaseUser?.displayName || 
              firebaseUser?.email?.split('@')[0] || 
              'User'
      };
    } catch (error: any) {
      // Handle ALL errors gracefully - never throw, always return a user
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code?.toLowerCase() || '';
      
      console.error(`🔥 Error fetching user role from ${firestorePath}:`, error);
      console.error(`   Error code: ${errorCode || 'N/A'}`);
      console.error(`   Error message: ${errorMessage || 'N/A'}`);
      
      if (
        errorCode === 'permission-denied' || 
        errorCode === 'permission_denied' ||
        errorMessage.includes('permission') ||
        errorMessage.includes('insufficient') ||
        errorMessage.includes('missing or insufficient')
      ) {
        console.warn(`🚫 Firestore permission denied for ${firestorePath}`);
        console.warn('   → Returning default user. User can still login.');
        console.warn('   → Required Firestore rule:');
        console.warn('      match /users/{userId} {');
        console.warn('        allow read, write: if request.auth != null && request.auth.uid == userId;');
        console.warn('      }');
        return createDefaultUser('renter');
      }
      
      // For any other error (network, timeout, etc.), return default user
      // This ensures login NEVER fails due to Firestore issues
      console.warn(`⚠️ Failed to fetch from Firestore at ${firestorePath}, using default user object`);
      console.warn('   → Login will proceed with default role: "Renter"');
      return createDefaultUser('renter');
    }
  }

  /**
   * Create a minimal user object when Firebase Auth user is unavailable
   */
  private createMinimalUser(uid: string): User {
    console.warn(`⚠️ Creating minimal user object for UID: ${uid}`);
    return {
      uid: uid,
      id: uid,
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      phoneNumber: '',
      role: 'Renter',
      approvalStatus: 'pending',
      createdAt: new Date(),
      getIdToken: async () => {
        const user = auth.currentUser;
        if (user) {
          return await user.getIdToken();
        }
        throw new Error('No Firebase user available');
      },
      name: 'User'
    };
  }

  /**
   * Add auth state listener
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current user's ID token
   */
  async getCurrentUserToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Use the imported sendPasswordResetEmail from firebase/auth
      const firebaseAuth = await import('firebase/auth');
      await firebaseAuth.sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const errorCode = error.code || error.message;
      throw new Error(this.getPasswordResetErrorMessage(errorCode));
    }
  }

  /**
   * Get password reset error messages
   */
  private getPasswordResetErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many password reset attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'Failed to send password reset email. Please try again.';
    }
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
