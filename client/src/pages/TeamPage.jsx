import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { membersApi } from '../api/client';
import { useBusiness } from '../context/BusinessContext';
import { can } from '../lib/permissions';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Badge, Card, EmptyState, Skeleton } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { UserPlus, Shield, Trash2, Copy } from 'lucide-react';

const ROLE_HELP = {
  Owner: 'Full access including billing and team management',
  Manager: 'Manage operations, members, and settings',
  Accountant: 'Invoices, expenses, and reports',
  Sales: 'Customers and invoices',
  Employee: 'Read-only access to core records',
};

export default function TeamPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { permissions, showToast, role } = useBusiness();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviteToken, setInviteToken] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await membersApi.list();
      setMembers(data.members || []);
      setInvites(data.invites || []);
    } catch (err) {
      showToast(err.message || 'Failed to load team', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const invite = async () => {
    setSaving(true);
    try {
      const data = await membersApi.invite({ email, role: inviteRole });
      setInviteToken(data.invite?.token || '');
      showToast(`Invite sent to ${email}`);
      setEmail('');
      await load();
    } catch (err) {
      showToast(err.message || 'Invite failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      await membersApi.updateRole(memberId, { role: newRole });
      showToast('Role updated');
      load();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const remove = async (memberId) => {
    try {
      await membersApi.remove(memberId);
      showToast('Member removed', 'warning');
      load();
    } catch (err) {
      showToast(err.message || 'Remove failed', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title={isGu ? 'ટીમ અને કર્મચારીઓ' : 'Team'}
        description={isGu ? 'ટીમ સભ્યોને આમંત્રિત કરો અને ભૂમિકાઓ સંચાલિત કરો.' : 'Invite teammates and manage roles across this business.'}
        actions={
          can(permissions, 'members', 'write') ? (
            <Button onClick={() => { setInviteOpen(true); setInviteToken(''); }}>
              <UserPlus className="w-4 h-4" /> {isGu ? '+ સભ્ય ઉમેરો' : 'Invite member'}
            </Button>
          ) : null
        }
      />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : members.length === 0 ? (
        <Card>
          <EmptyState icon={Shield} title={isGu ? 'હજી કોઈ ટીમ સભ્યો નથી' : 'No team members yet'} description={isGu ? 'તમારા પ્રથમ ટીમ સભ્યને આમંત્રિત કરો.' : 'Invite your first teammate to collaborate.'} />
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <Card key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`} alt="" className="w-10 h-10 rounded-full bg-canvas border border-line" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{m.name}</p>
                  <p className="text-xs text-ink-muted truncate">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge>{m.role}</Badge>
                {role === 'Owner' && m.role !== 'Owner' ? (
                  <select
                    className="text-xs border border-line rounded-lg px-2 py-1.5 bg-white"
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                  >
                    {Object.keys(ROLE_HELP).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                ) : null}
                {can(permissions, 'members', 'delete') && m.role !== 'Owner' ? (
                  <Button variant="ghost" size="sm" onClick={() => remove(m.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      {invites.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink mb-3">{isGu ? 'પેન્ડિંગ આમંત્રણો' : 'Pending invites'}</h2>
          <div className="space-y-2">
            {invites.map((i) => (
              <Card key={i.id} className="p-3 flex items-center justify-between text-sm">
                <span className="text-ink">{i.email}</span>
                <Badge tone="warning">{i.role}</Badge>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={isGu ? 'ટીમ સભ્યને આમંત્રિત કરો' : 'Invite team member'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>{isGu ? 'બંધ કરો' : 'Close'}</Button>
            <Button loading={saving} onClick={invite}>{isGu ? 'આમંત્રણ મોકલો' : 'Send invite'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label={isGu ? 'ઈમેઈલ' : 'Email'} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
          <Select label={isGu ? 'ભૂમિકા (રોલ)' : 'Role'} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
            {Object.entries(ROLE_HELP).filter(([r]) => r !== 'Owner').map(([r, help]) => (
              <option key={r} value={r}>{r} — {help}</option>
            ))}
          </Select>
          {inviteToken ? (
            <div className="rounded-xl border border-line bg-canvas p-3">
              <p className="text-xs text-ink-muted mb-2">Invite link token (share manually until email is configured):</p>
              <div className="flex gap-2">
                <code className="text-[11px] break-all flex-1 text-ink">{inviteToken}</code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/register?invite=${inviteToken}`);
                    showToast('Invite link copied');
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
