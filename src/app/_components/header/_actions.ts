import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabase.connect";

export const login = async (provider: Provider) => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
