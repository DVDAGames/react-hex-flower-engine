import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export type AccessMode = "edit" | "readonly" | "anonymous";

interface AccessModeContextType {
  mode: AccessMode;
  canEdit: boolean;
  canShare: boolean;
  canPublish: boolean;
  canCreateEngine: boolean;
  isOwner: (engineOwnerId?: string) => boolean;
}

const AccessModeContext = createContext<AccessModeContextType | undefined>(undefined);

export function AccessModeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const accessMode = useMemo<AccessModeContextType>(() => {
    // Shared link - always readonly for viewers
    if (pathname.startsWith("/s/") || pathname.startsWith("/shared/")) {
      return {
        mode: "readonly",
        canEdit: false,
        canShare: false,
        canPublish: false,
        canCreateEngine: false,
        isOwner: () => false,
      };
    }

    // Public engine from gallery - can run but not edit the original
    if (pathname.startsWith("/e/") || pathname.startsWith("/engine/")) {
      return {
        mode: user ? "edit" : "anonymous",
        canEdit: false, // Can't edit someone else's public engine directly
        canShare: false,
        canPublish: false,
        canCreateEngine: Boolean(user), // Can fork if logged in
        isOwner: () => false,
      };
    }

    // User is logged in - full access to their own engines
    if (user) {
      return {
        mode: "edit",
        canEdit: true,
        canShare: true,
        canPublish: true,
        canCreateEngine: true,
        isOwner: (engineOwnerId?: string) => engineOwnerId === user.id,
      };
    }

    // Anonymous user on main app - can use built-in engines, state in localStorage
    return {
      mode: "anonymous",
      canEdit: false,
      canShare: false,
      canPublish: false,
      canCreateEngine: false,
      isOwner: () => false,
    };
  }, [pathname, user]);

  return <AccessModeContext.Provider value={accessMode}>{children}</AccessModeContext.Provider>;
}

export function useAccessMode() {
  const context = useContext(AccessModeContext);
  if (context === undefined) {
    throw new Error("useAccessMode must be used within an AccessModeProvider");
  }
  return context;
}
