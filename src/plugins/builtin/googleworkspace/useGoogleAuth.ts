/**
 * Google Workspace Auth Hook
 * Handles OAuth2 authentication using chrome.identity API
 */

/// <reference types="chrome"/>

import { useState, useEffect, useCallback } from 'react';

const GOOGLE_AUTH_STORAGE_KEY = 'google_auth_state';

interface GoogleAuthState {
  isAuthenticated: boolean;
  email: string | null;
  token: string | null;
  expiresAt: number | null;
}

interface GoogleAuthError {
  message: string;
}

export function useGoogleAuth() {
  const [authState, setAuthState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    email: null,
    token: null,
    expiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<GoogleAuthError | null>(null);

  // Check if chrome.identity is available
  const hasIdentityAPI = typeof chrome !== 'undefined' && chrome.identity;

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const result = await new Promise<{ [key: string]: any }>((resolve) => {
        chrome.storage.local.get(GOOGLE_AUTH_STORAGE_KEY, resolve);
      });
      const stored = result[GOOGLE_AUTH_STORAGE_KEY] as GoogleAuthState | undefined;

      if (stored && stored.token && stored.expiresAt && Date.now() < stored.expiresAt) {
        setAuthState(stored);
      } else if (stored?.token) {
        // Token exists but might be expired, try to refresh
        try {
          const newToken = await refreshToken(stored.token);
          if (newToken) {
            const newState = { ...stored, token: newToken, expiresAt: Date.now() + 3600000 };
            await new Promise<void>((resolve) => {
              chrome.storage.local.set({ [GOOGLE_AUTH_STORAGE_KEY]: newState }, resolve);
            });
            setAuthState(newState);
          } else {
            // Refresh failed, clear auth
            await new Promise<void>((resolve) => {
              chrome.storage.local.remove(GOOGLE_AUTH_STORAGE_KEY, resolve);
            });
            setAuthState({ isAuthenticated: false, email: null, token: null, expiresAt: null });
          }
        } catch {
          await new Promise<void>((resolve) => {
            chrome.storage.local.remove(GOOGLE_AUTH_STORAGE_KEY, resolve);
          });
          setAuthState({ isAuthenticated: false, email: null, token: null, expiresAt: null });
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (token: string): Promise<string | null> => {
    // For extensions, we need to use chrome.identity.getAuthToken with { interactive: false }
    // to get a fresh token. If the cached token is expired, this should return a new one.
    return new Promise((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (newToken) => {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(newToken || null);
        }
      });
    });
  };

  const signIn = useCallback(async (): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    try {
      // Check if chrome.identity is available
      if (!hasIdentityAPI) {
        throw new Error('Google identity API not available. Please ensure this is running as a Chrome extension.');
      }

      console.log('Starting OAuth flow...');
      console.log('chrome.identity available:', !!chrome.identity);

      // Use chrome.identity to get OAuth token
      // Scopes are defined in manifest.json under oauth2.scopes
      const token = await new Promise<string>((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (t) => {
          console.log('getAuthToken callback:', t, chrome.runtime.lastError);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(t || '');
          }
        });
      });

      console.log('Token received:', token ? 'yes' : 'no');

      if (!token) {
        throw new Error('No token received');
      }

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userInfoResponse.json();

      const newState: GoogleAuthState = {
        isAuthenticated: true,
        email: userInfo.email,
        token,
        expiresAt: Date.now() + 3600000, // Assume 1 hour expiry
      };

      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [GOOGLE_AUTH_STORAGE_KEY]: newState }, resolve);
      });
      setAuthState(newState);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError({ message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (authState.token) {
        // Remove token from Chrome's cache
        await new Promise<void>((resolve) => {
          chrome.identity.removeCachedAuthToken({ token: authState.token! }, () => {
            resolve();
          });
        });
      }
      await new Promise<void>((resolve) => {
        chrome.storage.local.remove(GOOGLE_AUTH_STORAGE_KEY, resolve);
      });
      setAuthState({ isAuthenticated: false, email: null, token: null, expiresAt: null });
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, [authState.token]);

  const makeApiRequest = useCallback(async (url: string): Promise<Response> => {
    if (!authState.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      const newToken = await refreshToken(authState.token);
      if (newToken) {
        const newState = { ...authState, token: newToken, expiresAt: Date.now() + 3600000 };
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({ [GOOGLE_AUTH_STORAGE_KEY]: newState }, resolve);
        });
        setAuthState(newState);

        // Retry request with new token
        return fetch(url, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
      } else {
        // Refresh failed, sign out
        await signOut();
        throw new Error('Session expired');
      }
    }

    return response;
  }, [authState, signOut]);

  return {
    authState,
    isLoading,
    error,
    signIn,
    signOut,
    makeApiRequest,
  };
}
