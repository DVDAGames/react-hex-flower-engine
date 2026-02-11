import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { sendMagicLink, verifyMagicLink, getCurrentUser, logout, clearAuthTokens, updateProfile, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: string | null }>;
  verifyToken: (token: string) => Promise<{ error: string | null }>;
  updateUser: (data: {
    displayName?: string;
    avatarIcon?: string | null;
    defaultEngineId?: string | null;
    acceptTerms?: boolean;
    hexNewsletterOptIn?: boolean;
    dvdaNewsletterOptIn?: boolean;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await getCurrentUser();
      if (data && !error) {
        setUser(data);
      } else {
        // Token invalid, clear it
        clearAuthTokens();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signInWithMagicLink = useCallback(async (email: string): Promise<{ error: string | null }> => {
    const { error } = await sendMagicLink(email);

    if (error) {
      return { error };
    }

    return { error: null };
  }, []);

  const verifyToken = useCallback(async (token: string): Promise<{ error: string | null }> => {
    const { data, error } = await verifyMagicLink(token);

    if (error) {
      return { error };
    }

    if (data) {
      setUser(data.user);
    }

    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (data: {
      displayName?: string;
      avatarIcon?: string | null;
      defaultEngineId?: string | null;
      acceptTerms?: boolean;
      hexNewsletterOptIn?: boolean;
      dvdaNewsletterOptIn?: boolean;
    }): Promise<{ error: string | null }> => {
      const { data: updatedUser, error } = await updateProfile(data);

      if (error) {
        return { error };
      }

      if (updatedUser) {
        setUser(updatedUser);
      }

      return { error: null };
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithMagicLink,
        verifyToken,
        updateUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
