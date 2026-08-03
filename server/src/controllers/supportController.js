import { SupportAgent } from '../models/SupportAgent.js';
import { SupportSession } from '../models/SupportSession.js';
import { SupportRequest } from '../models/SupportRequest.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSupportCenterConfig, ensureSupportAgents } from '../services/supportCenter.js';
import { logActivity } from '../services/activityLogger.js';
import { isPremiumSubscriber } from '../services/feedbackService.js';

export const getSupportCenter = asyncHandler(async (req, res) => {
  await ensureSupportAgents();
  const agents = await SupportAgent.find({ isActive: true, isFounder: true }).sort({ sortOrder: 1 });
  const config = getSupportCenterConfig();

  res.json({
    welcome: 'Need assistance? Our founders are here to help you.',
    founders: agents.map((a) => a.toPublicJSON()),
    config: {
      email: config.email,
      hours: config.hours,
      remoteNote: config.remoteNote,
      options: [
        {
          id: 'email',
          title: 'Email Support',
          description: config.email,
          status: 'available',
          href: `mailto:${config.email}`,
        },
        {
          id: 'hours',
          title: 'Business Support Hours',
          description: config.hours,
          status: 'available',
        },
        {
          id: 'knowledge',
          title: 'Knowledge Base',
          description: 'Guides and how-tos for everyday workflows',
          status: 'coming_soon',
        },
        {
          id: 'docs',
          title: 'Documentation',
          description: 'API and product reference',
          status: 'coming_soon',
        },
        {
          id: 'videos',
          title: 'Video Tutorials',
          description: 'Short walkthroughs for invoicing and cash flow',
          status: 'coming_soon',
        },
      ],
    },
    subscriber: {
      isPremium: isPremiumSubscriber(req.user),
      priorityResponseDays: config.priorityResponseDays,
    },
  });
});

export const requestSupportSession = asyncHandler(async (req, res) => {
  const { agentId, notes, channel } = req.body || {};
  const agent = await SupportAgent.findById(agentId);
  if (!agent || !agent.isActive) {
    return res.status(404).json({ error: 'Support agent not found' });
  }

  const session = await SupportSession.create({
    businessId: req.businessId,
    userId: req.userId,
    agentId: agent._id,
    channel: channel || 'anydesk',
    status: 'requested',
    notes: notes || '',
  });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'support.session_requested',
    entityType: 'SupportSession',
    entityId: session._id,
    details: `Requested ${session.channel} session with ${agent.name}`,
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    session: session.toPublicJSON(),
    agent: agent.toPublicJSON(),
    note: getSupportCenterConfig().remoteNote,
  });
});

export const createSupportRequest = asyncHandler(async (req, res) => {
  const { subject, message, channel } = req.body || {};
  if (!subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Subject and message are required' });
  }

  const ticket = await SupportRequest.create({
    businessId: req.businessId,
    userId: req.userId,
    subject: subject.trim(),
    message: message.trim(),
    channel: channel || 'in_app',
    priority: isPremiumSubscriber(req.user) ? 'high' : 'normal',
  });

  res.status(201).json({ success: true, request: ticket.toPublicJSON() });
});
