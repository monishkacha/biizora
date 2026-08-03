import { Feedback, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from '../models/Feedback.js';
import { FeedbackReply } from '../models/FeedbackReply.js';
import { FeedbackAttachment } from '../models/FeedbackAttachment.js';
import { nextSequence } from '../models/Counter.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logActivity } from '../services/activityLogger.js';
import {
  isPremiumSubscriber,
  addReply,
  applyStatusChange,
  stageForStatus,
} from '../services/feedbackService.js';
import { getSupportCenterConfig } from '../services/supportCenter.js';

const MAX_SCREENSHOT_CHARS = 1_800_000; // ~1.3MB base64

function parseScreenshot(screenshot) {
  if (!screenshot) return null;
  if (typeof screenshot !== 'object') return null;
  const { dataUrl, filename, mimeType } = screenshot;
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    const err = new Error('Invalid screenshot payload');
    err.status = 400;
    throw err;
  }
  if (dataUrl.length > MAX_SCREENSHOT_CHARS) {
    const err = new Error('Screenshot too large (max ~1.3MB)');
    err.status = 400;
    throw err;
  }
  return {
    dataUrl,
    filename: filename || 'screenshot.png',
    mimeType: mimeType || 'image/png',
    size: dataUrl.length,
  };
}

export const createFeedback = asyncHandler(async (req, res) => {
  const { name, email, subject, category, message, screenshot, source } = req.body || {};

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Name, email, subject, and message are required' });
  }
  if (!FEEDBACK_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const user = req.user || null;
  const businessHeader = req.headers['x-business-id'];
  const priority = isPremiumSubscriber(user);
  const feedbackCode = await nextSequence('feedback', { pad: 6, prefix: 'BIO-FB-' });

  const feedback = await Feedback.create({
    feedbackId: feedbackCode,
    businessId: businessHeader || undefined,
    userId: user?._id,
    name: name.trim(),
    email: (email || user?.email || '').trim().toLowerCase(),
    subject: subject.trim(),
    category,
    message: message.trim(),
    priority,
    status: 'Submitted',
    currentStage: stageForStatus('Submitted'),
    assignedTo: 'Unassigned',
    source: source || (user ? 'app' : 'landing'),
    subscriptionId: user ? `${user.subscriptionPlan}:${user.subscriptionStatus}` : null,
    timeline: [
      {
        type: 'created',
        label: 'Feedback submitted',
        detail: priority ? 'Marked as premium priority' : 'Standard intake',
        actorType: 'user',
        actorName: name.trim(),
        actorId: user?._id,
        at: new Date(),
      },
    ],
  });

  const shot = parseScreenshot(screenshot);
  let attachment = null;
  if (shot) {
    attachment = await FeedbackAttachment.create({
      feedbackId: feedback._id,
      filename: shot.filename,
      mimeType: shot.mimeType,
      size: shot.size,
      url: shot.dataUrl,
      storage: 'inline',
      uploadedBy: user?._id,
    });
    feedback.timeline.push({
      type: 'note',
      label: 'Screenshot attached',
      detail: shot.filename,
      actorType: 'user',
      actorName: name.trim(),
      at: new Date(),
    });
    await feedback.save();
  }

  if (user && businessHeader) {
    await logActivity({
      businessId: businessHeader,
      userId: user._id,
      userName: user.name,
      action: 'feedback.created',
      entityType: 'Feedback',
      entityId: feedback._id,
      details: `Submitted ${feedback.feedbackId}: ${feedback.subject}`,
      ip: req.ip,
    });
  }

  const { priorityResponseDays } = getSupportCenterConfig();

  res.status(201).json({
    success: true,
    feedback: feedback.toPublicJSON({
      attachments: attachment ? [attachment.toPublicJSON()] : [],
    }),
    priority,
    message: priority
      ? `Premium subscribers receive priority review. We aim to respond within ${priorityResponseDays} days.`
      : 'Thank you — your feedback was received.',
  });
});

export const listMyFeedback = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  const status = req.query.status;
  const sort = req.query.sort === 'oldest' ? 1 : -1;

  const filter = {
    $or: [
      { businessId: req.businessId },
      { userId: req.userId },
    ],
  };

  if (status && FEEDBACK_STATUSES.includes(status)) {
    filter.status = status;
  }
  if (q) {
    filter.$and = [
      {
        $or: [
          { feedbackId: new RegExp(q, 'i') },
          { subject: new RegExp(q, 'i') },
          { category: new RegExp(q, 'i') },
          { assignedTo: new RegExp(q, 'i') },
        ],
      },
    ];
  }

  const items = await Feedback.find(filter).sort({ createdAt: sort }).limit(200);
  res.json({
    feedback: items.map((f) => f.toPublicJSON()),
    statuses: FEEDBACK_STATUSES,
    categories: FEEDBACK_CATEGORIES,
  });
});

export const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

  const owns =
    (feedback.businessId && feedback.businessId.toString() === req.businessId?.toString()) ||
    (feedback.userId && feedback.userId.toString() === req.userId.toString());

  if (!owns) return res.status(403).json({ error: 'Access denied' });

  const [replies, attachments] = await Promise.all([
    FeedbackReply.find({ feedbackId: feedback._id, isInternal: false }).sort({ createdAt: 1 }),
    FeedbackAttachment.find({ feedbackId: feedback._id }).sort({ createdAt: 1 }),
  ]);

  res.json({
    feedback: feedback.toPublicJSON({
      replies: replies.map((r) => r.toPublicJSON()),
      attachments: attachments.map((a) => a.toPublicJSON()),
    }),
  });
});

export const replyAsUser = asyncHandler(async (req, res) => {
  const { body } = req.body || {};
  if (!body?.trim()) return res.status(400).json({ error: 'Reply body is required' });

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

  const owns =
    (feedback.businessId && feedback.businessId.toString() === req.businessId?.toString()) ||
    (feedback.userId && feedback.userId.toString() === req.userId.toString());
  if (!owns) return res.status(403).json({ error: 'Access denied' });

  if (feedback.status === 'Closed') {
    // allow reopen via addReply
  }

  const reply = await addReply(feedback, {
    body: body.trim(),
    authorType: 'user',
    authorName: req.user.name,
    authorUserId: req.userId,
  });

  res.status(201).json({ success: true, reply: reply.toPublicJSON(), feedback: feedback.toPublicJSON() });
});

/** Admin: add Biizora Team reply */
export const replyAsAdmin = asyncHandler(async (req, res) => {
  const { body, isInternal } = req.body || {};
  if (!body?.trim()) return res.status(400).json({ error: 'Reply body is required' });

  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

  const reply = await addReply(feedback, {
    body: body.trim(),
    authorType: 'admin',
    authorName: 'Biizora Team',
    authorUserId: req.userId,
    isInternal: Boolean(isInternal),
  });

  res.status(201).json({ success: true, reply: reply.toPublicJSON(), feedback: feedback.toPublicJSON() });
});

/** Admin: update status / resolution */
export const updateFeedbackStatus = asyncHandler(async (req, res) => {
  const { status, resolutionSummary, assignedTo } = req.body || {};
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) return res.status(404).json({ error: 'Feedback not found' });

  if (assignedTo) {
    feedback.assignedTo = assignedTo;
    feedback.timeline.push({
      type: 'assignment',
      label: `Assigned to ${assignedTo}`,
      actorType: 'admin',
      actorName: req.user.name,
      actorId: req.userId,
      at: new Date(),
    });
    await feedback.save();
  }

  if (status) {
    if (!FEEDBACK_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await applyStatusChange(feedback, status, {
      actorName: 'Biizora Team',
      actorType: 'admin',
      actorId: req.userId,
      resolutionSummary,
    });
  } else if (resolutionSummary) {
    feedback.resolutionSummary = resolutionSummary;
    await feedback.save();
  }

  res.json({ success: true, feedback: feedback.toPublicJSON() });
});

export const listAllFeedbackAdmin = asyncHandler(async (req, res) => {
  const items = await Feedback.find({}).sort({ priority: -1, createdAt: -1 }).limit(500);
  res.json({ feedback: items.map((f) => f.toPublicJSON()) });
});
