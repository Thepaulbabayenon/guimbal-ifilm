'use client';

import { useEffect, useState, useCallback } from "react";

export type FullUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  name: string;
  username?: string;
  twoFactorEnabled: boolean;
  twoFactorVerified?: boolean;
  image?: string;
  emailVerified?: Date | null;
  createdAt?: Date;
};

export type User = {
  id: string;
  role: "admin" | "user";
  name?: string;
  image?: string;
  email?: string;
  twoFactorEnabled: boolean;
};

export interface UseAuthReturn {
  user: User | FullUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
  refetchUser: () => Promise<void>;
  // 2FA methods
  enable2FA: () => Promise<{ qrCodeUrl: string, secretKey: string, backupCodes: string[] } | null>;
  verify2FA: (code: string) => Promise<boolean>;
  disable2FA: () => Promise<boolean>;
  verify2FALogin: (code: string) => Promise<boolean>;
  verify2FAWithBackupCode: (backupCode: string) => Promise<boolean>;
  // Session state
  is2FARequired: boolean;
  setIs2FARequired: (required: boolean) => void;
  // Password management
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  // Profile management
  updateProfile: (profile: Partial<Omit<FullUser, 'id' | 'role'>>) => Promise<boolean>;
}

// Create a singleton pattern for caching API responses
class ApiCache {
  private static instance: ApiCache;
  private cache: Map<string, { data: any, expiry: number }> = new Map();
  private DEFAULT_TTL = 60 * 1000; // 1 minute

  private constructor() {}

  static getInstance() {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (item && item.expiry > Date.now()) {
      return item.data;
    }
    return null;
  }

  set(key: string, data: any, ttl = this.DEFAULT_TTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidateUserData() {
    // Clear user-related cache when auth state changes
    this.invalidate('user');
    this.invalidate('fullUser');
  }
}

/**
 * Enhanced authentication hook with optimized data fetching
 */
export function useAuth({
  withFullUser = false,
} = {}): UseAuthReturn {
  const [user, setUser] = useState<User | FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const apiCache = ApiCache.getInstance();

  // Optimized API request handler with built-in error handling
  const apiRequest = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return { error: 'Unauthorized' };
        }
        throw new Error(`Request failed with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  // Optimized user fetching with caching
  const fetchUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const cacheKey = withFullUser ? 'fullUser' : 'user';
      const cachedUser = apiCache.get(cacheKey);
      
      if (cachedUser) {
        setUser(cachedUser);
        setIsLoading(false);
        
        // Check if 2FA is required
        if (cachedUser?.twoFactorEnabled && !cachedUser?.twoFactorVerified) {
          setIs2FARequired(true);
        } else {
          setIs2FARequired(false);
        }
        
        return;
      }

      const url = withFullUser ? "/api/auth/user?full=true" : "/api/auth/user";
      const data = await apiRequest(url);
      
      if (data.error || !data.user) {
        setUser(null);
        return;
      }
      
      const userData = data.user;
      
      // Handle date conversions
      if (userData.emailVerified) {
        userData.emailVerified = new Date(userData.emailVerified);
      }
      
      if (userData.createdAt) {
        userData.createdAt = new Date(userData.createdAt);
      }
      
      // Update 2FA required state
      if (userData.twoFactorEnabled && !userData.twoFactorVerified) {
        setIs2FARequired(true);
      } else {
        setIs2FARequired(false);
      }
      
      setUser(userData);
      apiCache.set(cacheKey, userData);
    } finally {
      setIsLoading(false);
    }
  }, [withFullUser, apiRequest]);

  // Fetch user on component mount or when full user preference changes
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Sign out with cache invalidation
  const signOut = async () => {
    try {
      await apiRequest("/api/auth/signout", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      setUser(null);
      setIs2FARequired(false);
      apiCache.invalidateUserData();
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign-out failed:", error);
      throw error;
    }
  };

  // Optimized token fetching
  const getToken = async (): Promise<string | null> => {
    const cachedToken = apiCache.get('token');
    if (cachedToken) return cachedToken;

    const data = await apiRequest("/api/auth/token");
    if (data.error || !data.token) return null;
    
    apiCache.set('token', data.token, 30 * 60 * 1000); // Cache for 30 minutes
    return data.token;
  };

  // 2FA Methods - optimized for reduced requests
  const enable2FA = async () => {
    const data = await apiRequest("/api/auth/2fa/enable", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    
    if (data.error) return null;
    
    return {
      qrCodeUrl: data.qrCodeUrl,
      secretKey: data.secretKey,
      backupCodes: data.backupCodes
    };
  };

  const verify2FA = async (code: string): Promise<boolean> => {
    const data = await apiRequest("/api/auth/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    
    if (data.success) {
      apiCache.invalidateUserData();
      await fetchUser();
      return true;
    }
    
    return false;
  };

  const disable2FA = async (): Promise<boolean> => {
    const data = await apiRequest("/api/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    
    if (data.success) {
      apiCache.invalidateUserData();
      await fetchUser();
      return true;
    }
    
    return false;
  };

  const verify2FALogin = async (code: string): Promise<boolean> => {
    const data = await apiRequest("/api/auth/2fa/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    
    if (data.success) {
      setIs2FARequired(false);
      apiCache.invalidateUserData();
      await fetchUser();
      return true;
    }
    
    return false;
  };

  const verify2FAWithBackupCode = async (backupCode: string): Promise<boolean> => {
    const data = await apiRequest("/api/auth/2fa/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupCode })
    });
    
    if (data.success) {
      setIs2FARequired(false);
      apiCache.invalidateUserData();
      await fetchUser();
      return true;
    }
    
    return false;
  };

  // Password and profile management
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const data = await apiRequest("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    return !!data.success;
  };

  const updateProfile = async (profile: Partial<Omit<FullUser, 'id' | 'role'>>): Promise<boolean> => {
    const data = await apiRequest("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    
    if (data.success) {
      apiCache.invalidateUserData();
      await fetchUser();
      return true;
    }
    
    return false;
  };

  return {
    user,
    isAuthenticated: !!user && !is2FARequired,
    isLoading,
    signOut,
    getToken,
    refetchUser: fetchUser,
    enable2FA,
    verify2FA,
    disable2FA,
    verify2FALogin,
    verify2FAWithBackupCode,
    is2FARequired,
    setIs2FARequired,
    changePassword,
    updateProfile
  };
}

// For backward compatibility
export function useUser() {
  const auth = useAuth();
  
  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    refetchUser: auth.refetchUser
  };
}