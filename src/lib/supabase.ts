import { createClient } from "@supabase/supabase-js";

// Supabase configuration - using your selfhosted instance
const supabaseUrl = "https://supabase.nymia.io";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzQ4NTkyNjExLCJleHAiOjIwNjM5NTI2MTF9.kqwSThFga_RLpiI6UN72RSxlDwUzNl25pxuW2I-C2GU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "implicit", // Avoid PKCE as requested
  },
});

// Auth helper functions
export const auth = {
  // Sign in with Google
  signInWithGoogle: async (redirectTo?: string) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo || `https://dev.nymia.ai/auth/callback`,
      },
    });
    return { data, error };
  },

  // Get current session
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Get current user
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Listen for auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password - Step 1: Send reset email
  resetPassword: async (email: string, redirectTo?: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `https://dev.nymia.ai/auth/reset-password`,
    });
    return { data, error };
  },

  // Update password - Step 2: Set new password after reset
  updatePassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  },
};
