import { createClerkClient } from '@clerk/astro/server';

import { sql } from '../db/client';

type User = { id: string; plan: string; ai_credits_used: number; ai_credits_reset_at: string | null };

export async function getOrCreateUser(clerkId: string): Promise<User | null> {
  const rows = (await sql.query(
    `SELECT id, plan, ai_credits_used, ai_credits_reset_at FROM users WHERE clerk_id = $1`,
    [clerkId],
  )) as User[];

  if (rows.length) return rows[0];

  // User exists in Clerk but not in DB — create them lazily
  try {
    const clerk = createClerkClient({ secretKey: import.meta.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(clerkId);
    const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? '';

    const created = (await sql.query(
      `INSERT INTO users (clerk_id, email) VALUES ($1, $2)
       ON CONFLICT (clerk_id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, plan, ai_credits_used, ai_credits_reset_at`,
      [clerkId, email],
    )) as User[];

    return created[0] ?? null;
  } catch {
    return null;
  }
}
