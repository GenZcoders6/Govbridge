/**
 * Zustand Auth Store (SIH26129)
 * Manages authentication tokens and user state with local persistence
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("gb_token", token);
          localStorage.setItem("gb_user", JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true, hasHydrated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("gb_token");
          localStorage.removeItem("gb_user");
        }
        set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "govbridge-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
