import { useEffect, useState } from 'react';

type Team = {
  id: string;
  name: string;
  status: string;
  role: string;
  memberCount: number;
};

type Member = {
  userId: string;
  email: string;
  role: string;
};

type Props = {
  isSignedIn: boolean;
  plan: string;
};

export const TeamManager = ({ isSignedIn, plan }: Props) => {
  const [open, setOpen] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'overview' | 'create' | 'invite'>('overview');
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isTeams = plan === 'teams';

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teams');
      const data = await res.json();
      setTeam(data.team ?? null);

      if (data.team) {
        const detailRes = await fetch(`/api/teams/${data.team.id}`);
        const detail = await detailRes.json();
        setMembers(detail.members ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isSignedIn && isTeams) fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const createTeam = async () => {
    if (!teamName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setTeam({ id: data.id, name: data.name, status: data.status, role: 'owner', memberCount: 1 });
        setMembers([]);
        setView('overview');
        setTeamName('');
      } else {
        setError(data.error ?? 'Failed to create team');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !team) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/teams/${team.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`${inviteEmail.trim()} added to the team.`);
        setInviteEmail('');
        setTeam((t) => t ? { ...t, memberCount: t.memberCount + 1 } : t);
        fetchTeam();
      } else {
        const msg: Record<string, string> = {
          team_member_limit_reached: 'Team is full (5 members max).',
          user_not_found: 'No account found with that email.',
          team_frozen: 'Team is frozen and cannot be modified.',
        };
        setError(msg[data.error] ?? data.error ?? 'Failed to invite member');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isSignedIn || !isTeams) return null;

  return (
    <>
      <button
        onClick={() => { setOpen(true); setView('overview'); setError(''); setSuccess(''); }}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>👥</span> Team
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Team</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {loading && <p className="text-sm text-center text-gray-500 py-10">Loading…</p>}

            {!loading && (
              <div className="p-5">
                {/* No team yet */}
                {!team && view === 'overview' && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">You don't have a team yet.</p>
                    <button
                      onClick={() => setView('create')}
                      className="px-4 py-2 text-sm font-semibold bg-[#111827] text-white rounded-lg hover:bg-[#1F2937] transition-colors"
                    >
                      Create a team
                    </button>
                  </div>
                )}

                {/* Create form */}
                {view === 'create' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-700">Team name</p>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && createTeam()}
                      placeholder="e.g. Acme Design"
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827]"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setView('overview'); setError(''); }}
                        className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={createTeam}
                        disabled={submitting || !teamName.trim()}
                        className="flex-1 py-2 text-sm font-semibold bg-[#111827] text-white rounded-lg hover:bg-[#1F2937] disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Creating…' : 'Create team'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Team overview */}
                {team && view === 'overview' && (
                  <div className="flex flex-col gap-4">
                    {/* Team info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{team.name}</p>
                        <p className="text-xs text-gray-400">{team.memberCount}/5 members · {team.role}</p>
                      </div>
                      {team.status === 'frozen' && (
                        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Frozen</span>
                      )}
                    </div>

                    {team.status === 'frozen' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                        Team is frozen due to a subscription change. Data is read-only. Upgrade to reactivate.
                      </div>
                    )}

                    {/* Members list */}
                    <div className="flex flex-col gap-1">
                      {members.map((m) => (
                        <div key={m.userId} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-700 truncate flex-1">{m.email}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                            m.role === 'owner' ? 'bg-[#111827] text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Invite button */}
                    {team.role === 'owner' && team.status !== 'frozen' && team.memberCount < 5 && (
                      <button
                        onClick={() => { setView('invite'); setError(''); setSuccess(''); }}
                        className="w-full py-2 text-sm font-semibold border border-[#E5E7EB] rounded-lg text-[#374151] hover:bg-gray-50 transition-colors"
                      >
                        + Invite member
                      </button>
                    )}

                    {team.memberCount >= 5 && (
                      <p className="text-xs text-gray-400 text-center">Team is full (5/5 members)</p>
                    )}
                  </div>
                )}

                {/* Invite form */}
                {team && view === 'invite' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-medium text-gray-700">Invite by email</p>
                    <p className="text-xs text-gray-400">The user must already have a C3 account.</p>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && inviteMember()}
                      placeholder="colleague@example.com"
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#111827]"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {success && <p className="text-xs text-green-600">{success}</p>}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setView('overview'); setError(''); setSuccess(''); }}
                        className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={inviteMember}
                        disabled={submitting || !inviteEmail.trim()}
                        className="flex-1 py-2 text-sm font-semibold bg-[#111827] text-white rounded-lg hover:bg-[#1F2937] disabled:opacity-50 transition-colors"
                      >
                        {submitting ? 'Inviting…' : 'Send invite'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
