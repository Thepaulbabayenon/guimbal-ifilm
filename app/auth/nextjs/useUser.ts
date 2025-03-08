// This file should be in a client-side location, e.g., lib/hooks/useAuth.ts
'use client';

import { useEffect, useState } from "react";

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

// Interfaces for auth hook return with 2FA methods
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

/**
 * Enhanced authentication hook that handles user data fetching, authentication state,
 * and auth-related actions including two-factor authentication
 * 
 * @param options Configuration options for the hook
 * @returns Authentication state and functions
 */
export function useAuth({
  withFullUser = false,
} = {}): UseAuthReturn {
  const [user, setUser] = useState<User | FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is2FARequired, setIs2FARequired] = useState(false);

  // Function to fetch user data with improved error handling
  const fetchUser = async () => {
    setIsLoading(true);

    try {
      // Use the full=true parameter when requested
      const url = withFullUser ? "/api/auth/user?full=true" : "/api/auth/user";
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          // User is not authenticated
          setUser(null);
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to fetch user with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract user from response format
      const userData = data.user || data;
      
      if (userData) {
        // If 2FA is enabled but not verified for this session, set flag
        if (userData.twoFactorEnabled && !userData.twoFactorVerified) {
          setIs2FARequired(true);
        } else {
          setIs2FARequired(false);
        }
        
        // Convert date strings to Date objects if they exist
        if (userData.emailVerified) {
          userData.emailVerified = new Date(userData.emailVerified);
        }
        
        if (userData.createdAt) {
          userData.createdAt = new Date(userData.createdAt);
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user on component mount
  useEffect(() => {
    fetchUser();
  }, [withFullUser]);

  // Sign out function with improved error handling
  const signOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Sign-out failed with status: ${response.status}`);
      }

      setUser(null);
      setIs2FARequired(false);
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Sign-out failed:", error);
      throw error;
    }
  };

  // Get authentication token with improved error handling
  const getToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/token");

      if (!res.ok) {
        throw new Error(`Failed to fetch token with status: ${res.status}`);
      }

      const data = await res.json();
      return data.token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Enable 2FA for user
  const enable2FA = async (): Promise<{ qrCodeUrl: string, secretKey: string, backupCodes: string[] } | null> => {
    try {
      const response = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to enable 2FA with status: ${response.status}`);
      }

      const data = await response.json();
      return {
        qrCodeUrl: data.qrCodeUrl,
        secretKey: data.secretKey,
        backupCodes: data.backupCodes
      };
    } catch (error) {
      console.error("Failed to enable 2FA:", error);
      return null;
    }
  };

  // Verify and activate 2FA after setup
  const verify2FA = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`Failed to verify 2FA with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update user state to reflect 2FA is now enabled
        await fetchUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to verify 2FA:", error);
      return false;
    }
  };

  // Disable 2FA
  const disable2FA = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to disable 2FA with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update user state to reflect 2FA is now disabled
        await fetchUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      return false;
    }
  };

  // Verify 2FA during login process
  const verify2FALogin = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/2fa/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error(`Failed to verify 2FA login with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIs2FARequired(false);
        // Re-fetch user data after successful 2FA verification
        await fetchUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to verify 2FA login:", error);
      return false;
    }
  };

  // Verify 2FA with backup code
  const verify2FAWithBackupCode = async (backupCode: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/2fa/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ backupCode })
      });

      if (!response.ok) {
        throw new Error(`Failed to verify backup code with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setIs2FARequired(false);
        // Re-fetch user data after successful 2FA verification
        await fetchUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to verify backup code:", error);
      return false;
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!response.ok) {
        throw new Error(`Failed to change password with status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Failed to change password:", error);
      return false;
    }
  };

  // Update profile information
  const updateProfile = async (profile: Partial<Omit<FullUser, 'id' | 'role'>>): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update user state to reflect profile changes
        await fetchUser();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    }
  };

  return {
    user,
    isAuthenticated: !!user && !is2FARequired,
    isLoading,
    signOut,
    getToken,
    refetchUser: fetchUser,
    // 2FA methods
    enable2FA,
    verify2FA,
    disable2FA,
    verify2FALogin,
    verify2FAWithBackupCode,
    // 2FA state
    is2FARequired,
    setIs2FARequired,
    // Password management
    changePassword,
    // Profile management
    updateProfile
  };
}

// For backward compatibility, export useUser as an alias to useAuth
export function useUser() {
  const auth = useAuth();
  
  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    refetchUser: auth.refetchUser
  };
}