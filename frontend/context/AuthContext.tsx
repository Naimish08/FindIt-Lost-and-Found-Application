import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { authAPI, tokenManager } from '../services/api';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await tokenManager.getToken();
      if (token) {
        // Try to get user profile
        try {
          const profile = await authAPI.getProfile();
          setUser({
            id: profile.userid?.toString() || '',
            email: profile.email,
            username: profile.username,
          });
        } catch (error) {
          // Token might be invalid, remove it
          console.error('Invalid token:', error);
          await tokenManager.removeToken();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Store the access token
      if (response.session?.access_token) {
        await tokenManager.setToken(response.session.access_token);
      }

      // Set user data
      if (response.user) {
        setUser({
          id: response.user.id,
          email: response.user.email,
          username: response.user.user_metadata?.username,
        });
      }

      // Navigate to protected area
      router.replace('/(protected)/');
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(username, email, password);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // After registration, automatically log in
      await login(email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
