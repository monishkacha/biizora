import { Expense } from '../models/Expense.js';
import { logActivity } from '../services/activityLogger.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ businessId: req.businessId }).sort({ createdAt: -1 });
  res.json({ expenses: expenses.map((e) => e.toPublicJSON()) });
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({
    businessId: req.businessId,
    status: 'paid',
    ...req.body,
  });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'expense.created',
    entityType: 'Expense',
    entityId: expense._id,
    details: `Recorded expense ${expense.title}`,
    ip: req.ip,
  });

  res.status(201).json({ success: true, expense: expense.toPublicJSON() });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
  if (!expense) return res.status(404).json({ error: 'Expense not found' });

  await logActivity({
    businessId: req.businessId,
    userId: req.userId,
    userName: req.user.name,
    action: 'expense.deleted',
    entityType: 'Expense',
    entityId: expense._id,
    details: `Deleted expense ${expense.title}`,
    ip: req.ip,
  });

  res.json({ success: true });
});
