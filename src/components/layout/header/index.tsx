"use client";

import { type Session, type Provider } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase.connect";

import { PROVIDERS } from "../../../config/constants";

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);

  const getUserSession = async () => {
    const session = await supabase.auth.getSession();
    setSession(session.data.session);
  };

  useEffect(() => {
    getUserSession();

    supabase.auth.onAuthStateChange((_event, _session) => {
      setSession(_session);
    });
  }, []);

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: PROVIDERS.GITHUB as Provider,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="w-full flex justify-end text-center py-6 px-5 xl:px-12 bg-gray-800 text-white">
      {session ? (
        <button onClick={handleSignOut}>Logout</button>
      ) : (
        <button onClick={handleSignIn}>Sing in</button>
      )}
    </header>
  );
};

export { Header };
