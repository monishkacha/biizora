import { Feedback } from '../models/Feedback.js';
import { FeedbackReply } from '../models/FeedbackReply.js';
import { Notification } from '../models/Notification.js';
import { getSupportCenterConfig } from './supportCenter.js';

const STAGE_BY_STATUS = {
  Submitted: 'Intake',
  'Under Review': 'Triage',
  Accepted: 'Backlog',
  Planned: 'Roadmap',
  'In Development': 'Build',
  Resolved: 'Verification',
  Rejected: 'Declined',
  Closed: 'Complete',
};

export function stageForStatus(status) {
  return STAGE_BY_STATUS[status] || status;
}

export function isPremiumSubscriber(user) {
  if (!user) return false;
  return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial';
}

/**
 * Notify user of feedback events. Future-ready for email / push via notifyChannels + meta.
 */
export async function notifyFeedbackEvent({ feedback, title, message, event }) {
  if (!feedback.userId) return;

  if (feedback.notifyChannels?.inApp !== false) {
    await Notification.create({
      businessId: feedback.businessId || undefined,
      userId: feedback.userId,
      title,
      message,
      type: 'feedback',
      meta: {
        feedbackId: feedback.feedbackId,
        feedbackMongoId: feedback._id.toString(),
        event,
        channels: {
          email: Boolean(feedback.notifyChannels?.email),
          push: Boolean(feedback.notifyChannels?.push),
        },
      },
    });
  }

  // Hooks for future email / push providers
  if (feedback.notifyChannels?.email) {
    // await emailProvider.send(...)
  }
  if (feedback.notifyChannels?.push) {
    // await pushProvider.send(...)
  }
}

export async function closeStaleResolvedFeedback() {
  const { autoCloseDays } = getSupportCenterConfig();
  const now = new Date();

  const stale = await Feedback.find({
    status: 'Resolved',
    autoCloseAt: { $lte: now },
  }).limit(100);

  for (const fb of stale) {
    // If user replied after resolve, extend window instead of closing
    if (fb.lastUserReplyAt && fb.resolvedAt && fb.lastUserReplyAt > fb.resolvedAt) {
      fb.autoCloseAt = new Date(fb.lastUserReplyAt.getTime() + autoCloseDays * 86400000);
      await fb.save();
      continue;
    }

    const from = fb.status;
    fb.status = 'Closed';
    fb.closedAt = now;
    fb.currentStage = stageForStatus('Closed');
    fb.timeline.push({
      type: 'closed',
      label: 'Automatically closed',
      detail: `No further replies within ${autoCloseDays} days of resolution.`,
      fromStatus: from,
      toStatus: 'Closed',
      actorType: 'system',
      actorName: 'Biizora System',
      at: now,
    });
    await fb.save();

    await notifyFeedbackEvent({
      feedback: fb,
      title: `Feedback ${fb.feedbackId} closed`,
      message:
        'This feedback has been successfully resolved and closed. Thank you for helping improve Biizora.',
      event: 'auto_closed',
    });
  }

  return stale.length;
}

export async function applyStatusChange(feedback, nextStatus, { actorName, actorType, actorId, resolutionSummary } = {}) {
  const { autoCloseDays } = getSupportCenterConfig();
  const from = feedback.status;
  if (from === nextStatus) return feedback;

  feedback.status = nextStatus;
  feedback.currentStage = stageForStatus(nextStatus);
  feedback.timeline.push({
    type: 'status_change',
    label: `Status → ${nextStatus}`,
    detail: resolutionSummary || '',
    fromStatus: from,
    toStatus: nextStatus,
    actorType: actorType || 'admin',
    actorName: actorName || 'Biizora Team',
    actorId,
    at: new Date(),
  });

  if (nextStatus === 'Resolved') {
    feedback.resolvedAt = new Date();
    if (resolutionSummary) feedback.resolutionSummary = resolutionSummary;
    feedback.autoCloseAt = new Date(Date.now() + autoCloseDays * 86400000);
  }

  if (nextStatus === 'Closed') {
    feedback.closedAt = new Date();
  }

  await feedback.save();

  await notifyFeedbackEvent({
    feedback,
    title: `Feedback ${feedback.feedbackId} updated`,
    message: `Status changed to ${nextStatus}.`,
    event: 'status_change',
  });

  return feedback;
}

export async function addReply(feedback, { body, authorType, authorName, authorUserId, isInternal = false }) {
  const reply = await FeedbackReply.create({
    feedbackId: feedback._id,
    authorType,
    authorName,
    authorUserId,
    body,
    isInternal,
  });

  const now = new Date();
  if (authorType === 'user') {
    feedback.lastUserReplyAt = now;
    if (feedback.status === 'Resolved' && feedback.autoCloseAt) {
      const { autoCloseDays } = getSupportCenterConfig();
      feedback.autoCloseAt = new Date(now.getTime() + autoCloseDays * 86400000);
    }
    // Re-open closed threads on user reply
    if (feedback.status === 'Closed') {
      feedback.status = 'Under Review';
      feedback.currentStage = stageForStatus('Under Review');
      feedback.closedAt = undefined;
    }
  } else if (authorType === 'admin') {
    feedback.lastAdminReplyAt = now;
  }

  feedback.timeline.push({
    type: 'reply',
    label: authorType === 'admin' ? 'Biizora Team replied' : 'You replied',
    detail: body.slice(0, 160),
    actorType,
    actorName,
    actorId: authorUserId,
    at: now,
  });
  await feedback.save();

  if (authorType === 'admin' && !isInternal) {
    await notifyFeedbackEvent({
      feedback,
      title: `New reply on ${feedback.feedbackId}`,
      message: body.slice(0, 180),
      event: 'admin_reply',
    });
  }

  return reply;
}
