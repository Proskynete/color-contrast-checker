"use client";

import { createClient } from "@supabase/supabase-js";

const _url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const _key = process.env.NEXT_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(_url as string, _key as string);
