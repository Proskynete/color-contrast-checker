"use client";

import { useEffect, useState } from "react";
import type { Session, Provider } from "@supabase/supabase-js";
import { PROVIDERS } from "@/constants";
import { supabase } from "@/utils/supabase.connect";
import { login, logout } from "./_actions";

const Header = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getUserSession();

    supabase.auth.onAuthStateChange((_event, _session) => {
      setSession(_session);
    });
  }, []);

  const getUserSession = async () => {
    setLoading(true);
    const info = await supabase.auth.getSession();
    setSession(info.data.session);
    setLoading(false);
  };

  const handleSignIn = (provider: Provider) => async () => {
    setLoading(true);
    try {
      await login(provider);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    logout();
    setLoading(false);
  };

  return (
    <header className="w-full min-h-20 flex justify-end items-center px-5 xl:px-12 bg-gray-800 text-white gap-4">
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : session ? (
        <>
          <p className="text-sm text-gray-400">Hey {session.user.email} 👋</p>
          <button onClick={handleSignOut}>Logout</button>
        </>
      ) : (
        <button onClick={handleSignIn(PROVIDERS.GITHUB)}>Sing in</button>
      )}
    </header>
  );
};

export { Header };
