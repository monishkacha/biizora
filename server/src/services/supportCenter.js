import { SupportAgent } from '../models/SupportAgent.js';

function env(key, fallback = '') {
  return (process.env[key] || fallback).trim();
}

/**
 * Upsert founder / support agents from environment so AnyDesk IDs stay configurable.
 */
export async function ensureSupportAgents() {
  const founders = [
    {
      key: 'founder1',
      name: env('FOUNDER1_NAME', 'Monish Kacha'),
      role: env('FOUNDER1_ROLE', 'Co-Founder & Technical Lead'),
      email: env('FOUNDER1_EMAIL', 'monish@biizora.com'),
      anydeskId: env('FOUNDER1_ANYDESK_ID', '000 000 001'),
      anydeskLink: env('FOUNDER1_ANYDESK_LINK', ''),
      status: env('FOUNDER1_STATUS', 'online').toLowerCase(),
      sortOrder: 1,
      avatar: env(
        'FOUNDER1_AVATAR',
        'https://api.dicebear.com/7.x/initials/svg?seed=Monish%20Kacha&backgroundColor=2f5d50&textColor=faf9f5'
      ),
    },
    {
      key: 'founder2',
      name: env('FOUNDER2_NAME', 'Krish Patel'),
      role: env('FOUNDER2_ROLE', 'Co-Founder'),
      email: env('FOUNDER2_EMAIL', 'krish@biizora.com'),
      anydeskId: env('FOUNDER2_ANYDESK_ID', '000 000 002'),
      anydeskLink: env('FOUNDER2_ANYDESK_LINK', ''),
      status: env('FOUNDER2_STATUS', 'online').toLowerCase(),
      sortOrder: 2,
      avatar: env(
        'FOUNDER2_AVATAR',
        'https://api.dicebear.com/7.x/initials/svg?seed=Krish%20Patel&backgroundColor=2f5d50&textColor=faf9f5'
      ),
    },
  ];

  for (const f of founders) {
    const allowed = ['online', 'offline', 'busy', 'away'];
    const status = allowed.includes(f.status) ? f.status : 'offline';
    const link =
      f.anydeskLink ||
      (f.anydeskId ? `anydesk:${f.anydeskId.replace(/\s+/g, '')}` : '');

    const existing = await SupportAgent.findOne({ email: f.email, isFounder: true });
    if (existing) {
      existing.name = f.name;
      existing.role = f.role;
      existing.anydeskId = f.anydeskId;
      existing.anydeskLink = link;
      existing.status = status;
      existing.avatar = f.avatar || existing.avatar;
      existing.sortOrder = f.sortOrder;
      existing.isActive = true;
      existing.meta = { ...(existing.meta || {}), envKey: f.key };
      await existing.save();
    } else {
      await SupportAgent.create({
        name: f.name,
        role: f.role,
        email: f.email,
        anydeskId: f.anydeskId,
        anydeskLink: link,
        status,
        avatar: f.avatar,
        sortOrder: f.sortOrder,
        isFounder: true,
        isActive: true,
        meta: { envKey: f.key },
      });
    }
  }

  return SupportAgent.find({ isActive: true }).sort({ sortOrder: 1 });
}

export function getSupportCenterConfig() {
  return {
    email: env('SUPPORT_EMAIL', 'support@biizora.com'),
    hours: env('SUPPORT_HOURS', 'Mon–Fri, 10:00 AM – 6:00 PM IST'),
    remoteNote:
      env(
        'SUPPORT_REMOTE_NOTE',
        'Remote support sessions should only be initiated after prior communication through email or scheduled support.'
      ),
    knowledgeBaseStatus: 'coming_soon',
    documentationStatus: 'coming_soon',
    videoTutorialsStatus: 'coming_soon',
    autoCloseDays: Number(env('FEEDBACK_AUTO_CLOSE_DAYS', '7')) || 7,
    priorityResponseDays: Number(env('FEEDBACK_PRIORITY_RESPONSE_DAYS', '15')) || 15,
  };
}
