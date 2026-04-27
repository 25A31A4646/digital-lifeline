import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from "react";

import { supabase } from "@/lib/supabaseClient";

export type UserRole = "admin" | "user";

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthResult {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // ✅ ADDED ONLY THIS

  login: (
    email: string,
    password: string
  ) => Promise<AuthResult>;

  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<AuthResult>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx)
    throw new Error(
      "useAuth must be inside AuthProvider"
    );

  return ctx;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] = useState(true); // ✅ ADDED

  // 🔹 Restore session on refresh + listen auth changes
  useEffect(() => {

    const loadUser = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {

        setUser({
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name || "",
          role:
            session.user.user_metadata?.role || "user",
        });

      }

      setLoading(false); // ✅ IMPORTANT FIX

    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {

        if (session?.user) {

          setUser({
            email: session.user.email || "",
            name:
              session.user.user_metadata?.name || "",
            role:
              session.user.user_metadata?.role || "user",
          });

        } else {

          setUser(null);

        }

        setLoading(false); // ✅ IMPORTANT FIX

      }
    );

    return () => {
      subscription.unsubscribe();
    };

  }, []);

  // 🔐 LOGIN (NO LOGIC CHANGE)
  const login = async (
    email: string,
    password: string
  ): Promise<AuthResult> => {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error || !data.user) {

      return {
        success: false,
        message:
          error?.message || "Login failed",
      };

    }

    setUser({
      email: data.user.email || "",
      name:
        data.user.user_metadata?.name || "",
      role:
        data.user.user_metadata?.role || "user",
    });

    return { success: true };

  };

  // 🆕 SIGNUP (NO LOGIC CHANGE)
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthResult> => {

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

    if (error || !data.user) {

      return {
        success: false,
        message:
          error?.message || "Signup failed",
      };

    }

    return { success: true };

  };

  // 🚪 LOGOUT (NO CHANGE)
  const logout =
    useCallback(async () => {

      await supabase.auth.signOut();

      setUser(null);

    }, []);

  return (

    <AuthContext.Provider
      value={{
        user,
        loading, // ✅ ADDED HERE
        login,
        signup,
        logout,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

};